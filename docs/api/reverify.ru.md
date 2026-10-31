# Реверификация

## Слоты реверификации

### Получить слоты реверификации {#get-reverify}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify</code></div>

Список слотов реверификации.

Право `read`

| Параметр | Тип | Обязательно | Описание |
|---|---|---|---|
| `tab` | строка | нет | `active` (по умолчанию) или `finished` |
| `q` | строка | нет | Номер слота или заказа, до 128 символов |
| `limit`, `offset` | целое | нет | [Пагинация](index.md#pagination) |

Ответ `200`:

```json
{
  "items": [
    {"id": "3307-1185", "order_id": "2210-4471", "account_identity": "trader@example.com", "region": "DE", "status": "IN_PROGRESS"}
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

`status` — [статус слота](codes.md#slot-statuses). Полная карточка — [`GET /orders/{order_id}/slots/{slot_id}`](orders.md#get-slot), отмена — [`cancel-reverify`](cancel.md#post-cancel-reverify).

## Массовая реверификация

Реверификация оформляется пакетом: аккаунты одной биржи и одного типа. Проверка аккаунтов и план бесплатны, деньги списываются только при запуске.

1. [`GET /reverify/meta`](#get-reverify-meta) — что можно заказать и почём.
2. [`POST /reverify/batches`](#post-reverify-batches) — загрузите аккаунты со свежими cookies и прокси.
3. Опрашивайте [`GET /reverify/batches/{batch_id}`](#get-reverify-batch) раз в несколько секунд, пока `state` не станет `done` и не появится `plan`.
4. Только при `plan.needs_proofs: true` (Risk Removal): загрузите скриншоты в [`POST /risk-proofs/files`](slot-actions.md#post-risk-proofs-files) и привяжите их через [`PUT …/proofs`](#put-reverify-proofs).
5. Запустите [`POST …/execute`](#post-reverify-execute) с `expected_total` = `plan.total`.
6. Проверьте итог в [`GET …/execution`](#get-reverify-execution); при `retryable: true` устраните причину и вызовите [`POST …/retry`](#post-reverify-retry).

Пакет живёт 1 час с загрузки; у Risk Removal каждое чтение или запись скриншотов продлевает его, но не дольше 12 часов с загрузки. `batch_id` — 12 символов `0-9a-f`. Созданные заказы публикуются сами и закреплены за исполнителем, который делал первичную верификацию; следите за ними в [ленте](events.md#events) и в [`GET /reverify`](#get-reverify).

### Получить варианты реверификации {#get-reverify-meta}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/meta</code></div>

Что можно заказать на каждой бирже и по какой цене для ваших аккаунтов.

Право `read`

Ответ `200`:

```json
{
  "exchanges": [
    {
      "exchange": "mexc",
      "types": [
        {"verification_type": "MEXC_FACE_SECURITY", "needs_proofs": false, "price_from_standard": "4.00", "price_from_wholesale": "3.20"}
      ],
      "eligible": true,
      "regions": [
        {"region": "DE", "prices": [{"verification_type": "MEXC_FACE_SECURITY", "price_standard": "4.00", "price_wholesale": "3.20"}]}
      ]
    }
  ],
  "has_active_subscription": true
}
```

| Поле ответа | Описание |
|---|---|
| `eligible` | Есть ли у вас аккаунт, верифицированный через платформу на этой бирже; без него пакет не создать |
| `types[].needs_proofs` | Перед запуском нужны скриншоты депозитов |
| `types[].price_from_standard`, `price_from_wholesale` | Минимальная цена каталога для аккаунтов из стандартных и из оптовых заказов; сумма или `null` |
| `regions[].prices[]` | Цены для ваших аккаунтов по регионам: `price_standard` — из стандартных заказов, `price_wholesale` — из оптовых при активной подписке; при `eligible: false` список пуст |

### Создать пакет реверификации {#post-reverify-batches}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches</code></div>

Загружает аккаунты в пакет; проверка идёт в фоне. Нужны свежие cookies и прокси — данные исходного заказа не используются. До 120 аккаунтов и не больше, чем у вас верифицированных аккаунтов на бирже: лишние отбрасываются.

Право `upload` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле формы | Тип | Обязательно | Описание |
|---|---|---|---|
| `exchange` | строка | да | `exchange` из `GET /reverify/meta` |
| `verification_type` | строка | да | `verification_type` из `GET /reverify/meta` |
| `method`, `ads_file`, `proxies`, `cookie_files`, `positions` | — | — | Как у [загрузки в заказ](upload.md#post-upload); весь запрос — до 34 МБ |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F method=manual \
  -F exchange=mexc \
  -F verification_type=MEXC_FACE_SECURITY \
  -F "proxies=<proxies.txt" \
  -F cookie_files=@acc1.json \
  -F cookie_files=@acc2.json \
  -F cookie_files=@acc3.json
```

Ответ `202`:

```json
{"batch_id": "a1b2c3d4e5f6", "state": "queued", "staged": 2, "failures": [{"upload_position": 2, "error_code": "proxy_timeout"}]}
```

`state: "no_valid"` — проверять нечего, плана не будет. `failures[]` — аккаунты, не прошедшие проверку прокси; `error_code`: `missing_proxy`, `proxy_broken`, `proxy_auth_rejected`, `proxy_timeout`, `proxy_bad_host` или `proxy_unreachable`. У Risk Removal в план попадает не больше 50 аккаунтов.

| HTTP | `code` | Когда |
|---|---|---|
| 422 | `reverify_invalid_type` | На бирже нет такого типа или у вас нет на ней верифицированного аккаунта |
| 422 | `reverify_type_unavailable` | Тип сейчас нельзя заказать |
| 409 | `reverify_validate_in_progress` | Ещё проверяется другой ваш пакет — дождитесь его |
| 422 | `nothing_to_upload` | В файле нет аккаунтов |
| 503 | `queue_unavailable` | Очередь занята, ничего не сделано — повторите через минуту |
| 4xx | Коды загрузки и [разбора файла](codes.md#upload-codes) | Как у [`POST …/upload`](upload.md#post-upload) |

### Получить пакет и план {#get-reverify-batch}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}</code></div>

Ход проверки аккаунтов и план, когда он готов.

Право `read`

Ответ `200`:

```json
{
  "id": "a1b2c3d4e5f6", "state": "done", "done": 2, "total": 2, "alive": 2, "error": null,
  "plan": {
    "exchange": "mexc",
    "verification_type": "MEXC_FACE_SECURITY",
    "matched": [
      {"index": 0, "upload_position": 1, "source_order_id": "7731-0458", "source_slot_id": "6620-1934",
       "source_class": "standard", "price": "4.00", "downgraded": false, "challenge": "required"}
    ],
    "skipped": [{"index": 1, "upload_position": 3, "reason": "not_required"}],
    "total": "4.00",
    "needs_team_price": false,
    "needs_proofs": false,
    "retry_available": false,
    "retry_deadline": null
  }
}
```

| Поле ответа | Описание |
|---|---|
| `state` | Проверка аккаунтов: `idle`, `queued`, `running`, `done` или `failed`; при `failed` причина — в `error` |
| `alive` | У скольких аккаунтов работают cookies |
| `plan.matched[]` | Аккаунты к заказу. `index` — номер позиции для скриншотов, `upload_position` — место в загрузке (с 1), `source_order_id` и `source_slot_id` — где аккаунт верифицировали |
| `plan.matched[].source_class` | Как куплен исходный заказ: `standard`, `wholesale` или `team` |
| `plan.matched[].price` | Цена позиции; `null` у командной позиции, цену которой задаёте вы |
| `plan.matched[].downgraded` | `true` — оптовый источник посчитан по рознице: нет активной подписки |
| `plan.matched[].challenge` | Требует ли биржа эту проверку сейчас: `required`, `not_required`, `unknown` или `null` |
| `plan.skipped[]` | Пропущенные аккаунты, `reason` — ниже; за них ничего не списывается |
| `plan.total` | Сумма цен позиций, без командных позиций без цены — передайте её в `expected_total` |
| `plan.needs_team_price` | Есть командная позиция без цены: для неё нужна `team_price` |
| `plan.needs_proofs` | Перед запуском нужны скриншоты |
| `plan.retry_available`, `plan.retry_deadline` | Открыт ли [повтор остатка](#post-reverify-retry) и до какого момента |

| `skipped[].reason` | Что значит |
|---|---|
| `no_match` | Нет завершённого слота первичной верификации с этим аккаунтом |
| `session_dead` | Не работают cookies или прокси |
| `not_required` | Биржа сейчас не требует эту проверку |
| `type_unavailable` | Тип недоступен для этого региона |
| `subscription_required` | Командный источник: нужна подписка |
| `team_membership_required` | Командный источник: в команде нет активного участника |
| `already_reverifying` | По аккаунту уже идёт реверификация |
| `account_busy` | Аккаунт занят другим активным заказом |
| `duplicate_in_upload` | Аккаунт повторяется в этой загрузке |
| `not_validated` | Не успели проверить — загрузите ещё раз |
| `advanced_kyc_missing` | На аккаунте не пройден Advanced KYC |
| `provider_unsupported` | MEXC проверяет лицо на этом аккаунте способом, с которым платформа не работает |
| `form_unsupported` | MEXC запрашивает документы, которые платформа пока не подаёт |
| `account_blocked` | Биржа больше не допускает верификацию на этом аккаунте |
| `review_in_progress` | На аккаунте уже идёт проверка — дождитесь результата |
| `exchange_error` | Ошибка на стороне биржи — напишите в поддержку |
| `risk_gate_failed` | Не удалось прочитать статус аккаунта — попробуйте через несколько минут |
| `proofs_missing` | Risk Removal: не добавлены скриншоты депозитов |

| HTTP | `code` | Когда |
|---|---|---|
| 404 | `reverify_expired` | Пакет истёк, чужой или не найден — загрузите аккаунты заново |

### Получить черновик скриншотов {#get-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

Черновик скриншотов пакета Risk Removal. Каждый вызов продлевает жизнь пакета.

Право `upload`

Ответ `200`:

```json
{
  "entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}],
  "expires_at": "2026-10-31T12:40:00Z"
}
```

`expires_at` — когда пакет истечёт.

| HTTP | `code` | Когда |
|---|---|---|
| 404 | `reverify_expired` | Пакет истёк, чужой или не найден |
| 422 | `reverify_type_unavailable` | У этого типа нет шага со скриншотами |

### Сохранить черновик скриншотов {#put-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--put">PUT</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

Заменяет черновик скриншотов целиком: позиция, которой нет в запросе, остаётся без скриншотов. Если хоть одна позиция не прошла проверку, ничего не сохраняется.

Право `upload`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `entries` | список | да | До 120 позиций; тело — до 1 000 000 байт |
| `entries[].index` | целое | да | `index` из `plan.matched`, каждый — один раз |
| `entries[].deposits` | список | да | До 4 скриншотов |
| `entries[].deposits[].file_id` | строка | да | `id` скриншота; один скриншот — только для одного аккаунта |
| `entries[].deposits[].source` | строка | нет | Откуда пришёл депозит, до 64 символов; пока черновик заполняется, можно пустым |

```bash
curl -X PUT https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}]}'
```

Ответ `200` — как у [`GET …/proofs`](#get-reverify-proofs).

| HTTP | `code` | Когда |
|---|---|---|
| 422 | `reverify_invalid_entry` | `index` не из плана или повторяется |
| 404 | `proof_file_not_found` | Скриншот не найден, чужой, уже отправлен или указан дважды |
| 422 | `proof_source_invalid` | Недопустимый `source` |
| 422 | `reverify_type_unavailable` | У этого типа нет шага со скриншотами |
| 404 | `reverify_expired` | Пакет истёк, чужой или не найден |

### Запустить реверификацию {#post-reverify-execute}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execute</code></div>

Заказывает и оплачивает позиции плана — по ценам плана, даже если каталог успел измениться. Нехватка баланса запуск не отклоняет: позиции, на которые не хватило денег, останавливаются как `unpaid`.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `expected_total` | сумма | да | Ровно `plan.total` |
| `include_team` | да/нет | нет | Заказать и командные позиции; по умолчанию `false` |
| `team_price` | сумма или `null` | при `plan.needs_team_price` и `include_team` | Цена каждой командной позиции без цены, сверх `plan.total` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/execute \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Ответ `202`:

```json
{"state": "queued", "ordered": 1, "skipped_without_proofs": 0}
```

`ordered` — сколько позиций запуск попробует заказать. `skipped_without_proofs` — позиции Risk Removal без хотя бы одной пары «скриншот + источник»: пропущены и не оплачиваются.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `plan_total_mismatch` | `expected_total` не равен `plan.total`; ничего не списано — перечитайте пакет |
| 409 | `reverify_expired` | Пакет истёк, завершён или не найден, либо закрылось окно повтора |
| 409 | `proofs_missing` | Risk Removal: не было [`PUT …/proofs`](#put-reverify-proofs) |
| 422 | `team_price_required` | Нужна положительная `team_price` |
| 409 | `reverify_in_progress` | Уже идёт другой ваш запуск |
| 503 | `queue_unavailable` | Очередь занята, ничего не сделано — повторите через минуту |

### Повторить остаток {#post-reverify-retry}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/retry</code></div>

Запускает то, что осталось после прошлого запуска, с тем же решением о командных позициях и той же `team_price`. Окно повтора — до `plan.retry_deadline`: 2 часа с первого запуска, после которого что-то осталось.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `expected_total` | сумма | да | Снова `plan.total` из `GET /reverify/batches/{batch_id}` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/retry \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Ответ `202` — как у [`execute`](#post-reverify-execute). Ошибки — тоже, кроме `team_price_required`; `409 reverify_expired` приходит ещё и когда повторять нечего.

### Получить итог запуска {#get-reverify-execution}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execution</code></div>

Итог запуска.

Право `read`

Ответ `200`:

```json
{
  "state": "done", "done": 3, "total": 3, "published": 2, "failed": 0, "unpaid": 1,
  "skipped_team": 0, "tier_changed": 0, "subscription_required": 0, "team_membership_required": 0,
  "type_unavailable": 0, "skipped_without_proofs": 0, "remaining": 1, "retryable": true, "error": null
}
```

| Поле ответа | Описание |
|---|---|
| `state` | `idle` — запуска не было; `queued`, `running`, `done` или `failed` |
| `published` | Создано и оплачено заказов |
| `failed` | Не удалось создать |
| `unpaid` | Не хватило баланса — можно повторить |
| `skipped_team` | Командные позиции не включены |
| `tier_changed` | Цена изменилась из-за подписки — можно повторить после продления |
| `subscription_required` | Командным позициям нужна подписка — можно повторить после продления |
| `team_membership_required` | В команде нет активного участника — можно повторить после добавления |
| `type_unavailable` | Тип недоступен — повтор не поможет |
| `skipped_without_proofs` | Без скриншотов — загрузите эти аккаунты в новый пакет |
| `remaining` | Сколько позиций осталось |
| `retryable` | Можно вызвать [`retry`](#post-reverify-retry) |
| `error` | Почему запуск остановился, или `null` |
