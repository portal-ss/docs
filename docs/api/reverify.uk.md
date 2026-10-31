# Реверифікація

## Слоти реверифікації

### Отримати слоти реверифікації {#get-reverify}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify</code></div>

Список слотів реверифікації.

Право `read`

| Параметр | Тип | Обов'язково | Опис |
|---|---|---|---|
| `tab` | рядок | ні | `active` (за замовчуванням) або `finished` |
| `q` | рядок | ні | Номер слота або замовлення, до 128 символів |
| `limit`, `offset` | ціле | ні | [Пагінація](index.md#pagination) |

Відповідь `200`:

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

`status` — [статус слота](codes.md#slot-statuses). Повна картка — [`GET /orders/{order_id}/slots/{slot_id}`](orders.md#get-slot), скасування — [`cancel-reverify`](cancel.md#post-cancel-reverify).

## Масова реверифікація

Реверифікація оформлюється пакетом: акаунти однієї біржі й одного типу. Перевірка акаунтів і план безкоштовні, гроші списуються лише під час запуску.

1. [`GET /reverify/meta`](#get-reverify-meta) — що можна замовити й за якою ціною.
2. [`POST /reverify/batches`](#post-reverify-batches) — завантажте акаунти зі свіжими cookies і проксі.
3. Опитуйте [`GET /reverify/batches/{batch_id}`](#get-reverify-batch) раз на кілька секунд, поки `state` не стане `done` і не з'явиться `plan`.
4. Лише якщо `plan.needs_proofs: true` (Risk Removal): завантажте скриншоти в [`POST /risk-proofs/files`](slot-actions.md#post-risk-proofs-files) і прив'яжіть їх через [`PUT …/proofs`](#put-reverify-proofs).
5. Запустіть [`POST …/execute`](#post-reverify-execute) з `expected_total` = `plan.total`.
6. Перевірте підсумок у [`GET …/execution`](#get-reverify-execution); якщо `retryable: true`, усуньте причину й викличте [`POST …/retry`](#post-reverify-retry).

Пакет діє 1 годину від завантаження; у Risk Removal кожне читання або запис скриншотів продовжує його дію, але не довше ніж до 12 годин від завантаження. `batch_id` — 12 символів `0-9a-f`. Створені замовлення публікуються самі й закріплені за виконавцем, який робив первинну верифікацію; стежте за ними в [стрічці](events.md#events) і в [`GET /reverify`](#get-reverify).

### Отримати варіанти реверифікації {#get-reverify-meta}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/meta</code></div>

Що можна замовити на кожній біржі й за якою ціною для ваших акаунтів.

Право `read`

Відповідь `200`:

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

| Поле відповіді | Опис |
|---|---|
| `eligible` | Чи є у вас акаунт, верифікований через платформу на цій біржі; без нього пакет не створити |
| `types[].needs_proofs` | Перед запуском потрібні скриншоти депозитів |
| `types[].price_from_standard`, `price_from_wholesale` | Мінімальна ціна каталогу для акаунтів зі стандартних і з оптових замовлень; сума або `null` |
| `regions[].prices[]` | Ціни для ваших акаунтів за регіонами: `price_standard` — зі стандартних замовлень, `price_wholesale` — з оптових за активної підписки; якщо `eligible: false`, список порожній |

### Створити пакет реверифікації {#post-reverify-batches}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches</code></div>

Завантажує акаунти в пакет; перевірка йде у фоні. Потрібні свіжі cookies і проксі — дані початкового замовлення не використовуються. До 120 акаунтів і не більше, ніж у вас верифікованих акаунтів на біржі: зайві відкидаються.

Право `upload` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле форми | Тип | Обов'язково | Опис |
|---|---|---|---|
| `exchange` | рядок | так | `exchange` з `GET /reverify/meta` |
| `verification_type` | рядок | так | `verification_type` з `GET /reverify/meta` |
| `method`, `ads_file`, `proxies`, `cookie_files`, `positions` | — | — | Як у [завантаженні в замовлення](upload.md#post-upload); увесь запит — до 34 МБ |

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

Відповідь `202`:

```json
{"batch_id": "a1b2c3d4e5f6", "state": "queued", "staged": 2, "failures": [{"upload_position": 2, "error_code": "proxy_timeout"}]}
```

`state: "no_valid"` — перевіряти нічого, плану не буде. `failures[]` — акаунти, які не пройшли перевірку проксі; `error_code`: `missing_proxy`, `proxy_broken`, `proxy_auth_rejected`, `proxy_timeout`, `proxy_bad_host` або `proxy_unreachable`. У Risk Removal до плану потрапляє не більше ніж 50 акаунтів.

| HTTP | `code` | Коли |
|---|---|---|
| 422 | `reverify_invalid_type` | На біржі немає такого типу або у вас немає на ній верифікованого акаунта |
| 422 | `reverify_type_unavailable` | Тип зараз не можна замовити |
| 409 | `reverify_validate_in_progress` | Ще перевіряється інший ваш пакет — дочекайтеся його |
| 422 | `nothing_to_upload` | У файлі немає акаунтів |
| 503 | `queue_unavailable` | Черга зайнята, нічого не зроблено — повторіть через хвилину |
| 4xx | Коди завантаження й [розбору файлу](codes.md#upload-codes) | Як у [`POST …/upload`](upload.md#post-upload) |

### Отримати пакет і план {#get-reverify-batch}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}</code></div>

Перебіг перевірки акаунтів і план, коли він готовий.

Право `read`

Відповідь `200`:

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

| Поле відповіді | Опис |
|---|---|
| `state` | Перевірка акаунтів: `idle`, `queued`, `running`, `done` або `failed`; у разі `failed` причина — в `error` |
| `alive` | У скількох акаунтів працюють cookies |
| `plan.matched[]` | Акаунти до замовлення. `index` — номер позиції для скриншотів, `upload_position` — місце в завантаженні (з 1), `source_order_id` і `source_slot_id` — де акаунт верифікували |
| `plan.matched[].source_class` | Як куплено початкове замовлення: `standard`, `wholesale` або `team` |
| `plan.matched[].price` | Ціна позиції; `null` у командної позиції, ціну якої задаєте ви |
| `plan.matched[].downgraded` | `true` — оптове джерело пораховано за роздрібною ціною: немає активної підписки |
| `plan.matched[].challenge` | Чи вимагає біржа цю перевірку зараз: `required`, `not_required`, `unknown` або `null` |
| `plan.skipped[]` | Пропущені акаунти, `reason` — нижче; за них нічого не списується |
| `plan.total` | Сума цін позицій, не враховуючи командних позицій без ціни, — передайте її в `expected_total` |
| `plan.needs_team_price` | Є командна позиція без ціни: для неї потрібна `team_price` |
| `plan.needs_proofs` | Перед запуском потрібні скриншоти |
| `plan.retry_available`, `plan.retry_deadline` | Чи відкрито [повтор залишку](#post-reverify-retry) і до якого моменту |

| `skipped[].reason` | Що означає |
|---|---|
| `no_match` | Немає завершеного слота первинної верифікації з цим акаунтом |
| `session_dead` | Не працюють cookies або проксі |
| `not_required` | Біржа зараз не вимагає цієї перевірки |
| `type_unavailable` | Тип недоступний для цього регіону |
| `subscription_required` | Командне джерело: потрібна підписка |
| `team_membership_required` | Командне джерело: у команді немає активного учасника |
| `already_reverifying` | Для акаунта вже триває реверифікація |
| `account_busy` | Акаунт зайнятий іншим активним замовленням |
| `duplicate_in_upload` | Акаунт повторюється в цьому завантаженні |
| `not_validated` | Не встигли перевірити — завантажте ще раз |
| `advanced_kyc_missing` | На акаунті не пройдено Advanced KYC |
| `provider_unsupported` | MEXC перевіряє обличчя на цьому акаунті способом, з яким платформа не працює |
| `form_unsupported` | MEXC запитує документи, які платформа поки не подає |
| `account_blocked` | Біржа більше не допускає верифікацію на цьому акаунті |
| `review_in_progress` | На акаунті вже триває перевірка — дочекайтеся результату |
| `exchange_error` | Помилка на боці біржі — напишіть у підтримку |
| `risk_gate_failed` | Не вдалося прочитати статус акаунта — спробуйте через кілька хвилин |
| `proofs_missing` | Risk Removal: не додано скриншоти депозитів |

| HTTP | `code` | Коли |
|---|---|---|
| 404 | `reverify_expired` | Строк дії пакета сплив, пакет чужий або його не знайдено — завантажте акаунти заново |

### Отримати чернетку скриншотів {#get-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

Чернетка скриншотів пакета Risk Removal. Кожен виклик продовжує строк дії пакета.

Право `upload`

Відповідь `200`:

```json
{
  "entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}],
  "expires_at": "2026-10-31T12:40:00Z"
}
```

`expires_at` — коли спливе строк дії пакета.

| HTTP | `code` | Коли |
|---|---|---|
| 404 | `reverify_expired` | Строк дії пакета сплив, пакет чужий або його не знайдено |
| 422 | `reverify_type_unavailable` | У цього типу немає кроку зі скриншотами |

### Зберегти чернетку скриншотів {#put-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--put">PUT</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

Замінює чернетку скриншотів цілком: позиція, якої немає в запиті, залишається без скриншотів. Якщо хоч одна позиція не пройшла перевірку, нічого не зберігається.

Право `upload`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `entries` | список | так | До 120 позицій; тіло — до 1 000 000 байт |
| `entries[].index` | ціле | так | `index` з `plan.matched`, кожен — один раз |
| `entries[].deposits` | список | так | До 4 скриншотів |
| `entries[].deposits[].file_id` | рядок | так | `id` скриншота; один скриншот — лише для одного акаунта |
| `entries[].deposits[].source` | рядок | ні | Звідки надійшов депозит, до 64 символів; поки чернетка заповнюється, може бути порожнім |

```bash
curl -X PUT https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}]}'
```

Відповідь `200` — як у [`GET …/proofs`](#get-reverify-proofs).

| HTTP | `code` | Коли |
|---|---|---|
| 422 | `reverify_invalid_entry` | `index` не з плану або повторюється |
| 404 | `proof_file_not_found` | Скриншот не знайдено, він чужий, уже надісланий або вказаний двічі |
| 422 | `proof_source_invalid` | Неприпустимий `source` |
| 422 | `reverify_type_unavailable` | У цього типу немає кроку зі скриншотами |
| 404 | `reverify_expired` | Строк дії пакета сплив, пакет чужий або його не знайдено |

### Запустити реверифікацію {#post-reverify-execute}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execute</code></div>

Замовляє й оплачує позиції плану — за цінами плану, навіть якщо каталог устиг змінитися. Брак коштів запуск не відхиляє: позиції, на які не вистачило грошей, зупиняються як `unpaid`.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `expected_total` | сума | так | Рівно `plan.total` |
| `include_team` | так/ні | ні | Замовити й командні позиції; за замовчуванням `false` |
| `team_price` | сума або `null` | якщо `plan.needs_team_price` і `include_team` | Ціна кожної командної позиції без ціни, понад `plan.total` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/execute \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Відповідь `202`:

```json
{"state": "queued", "ordered": 1, "skipped_without_proofs": 0}
```

`ordered` — скільки позицій запуск спробує замовити. `skipped_without_proofs` — позиції Risk Removal, у яких немає жодної пари «скриншот + джерело»: їх пропущено й не оплачено.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `plan_total_mismatch` | `expected_total` не дорівнює `plan.total`; нічого не списано — перечитайте пакет |
| 409 | `reverify_expired` | Строк дії пакета сплив, пакет завершено або не знайдено, або закрилося вікно повтору |
| 409 | `proofs_missing` | Risk Removal: не було [`PUT …/proofs`](#put-reverify-proofs) |
| 422 | `team_price_required` | Потрібна додатна `team_price` |
| 409 | `reverify_in_progress` | Уже триває інший ваш запуск |
| 503 | `queue_unavailable` | Черга зайнята, нічого не зроблено — повторіть через хвилину |

### Повторити залишок {#post-reverify-retry}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/retry</code></div>

Запускає те, що залишилося після попереднього запуску, з тим самим рішенням щодо командних позицій і тією самою `team_price`. Вікно повтору — до `plan.retry_deadline`: 2 години від першого запуску, після якого щось залишилося.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `expected_total` | сума | так | Знову `plan.total` з `GET /reverify/batches/{batch_id}` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/retry \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Відповідь `202` — як у [`execute`](#post-reverify-execute). Помилки — теж, крім `team_price_required`; `409 reverify_expired` приходить ще й тоді, коли повторювати нічого.

### Отримати підсумок запуску {#get-reverify-execution}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execution</code></div>

Підсумок запуску.

Право `read`

Відповідь `200`:

```json
{
  "state": "done", "done": 3, "total": 3, "published": 2, "failed": 0, "unpaid": 1,
  "skipped_team": 0, "tier_changed": 0, "subscription_required": 0, "team_membership_required": 0,
  "type_unavailable": 0, "skipped_without_proofs": 0, "remaining": 1, "retryable": true, "error": null
}
```

| Поле відповіді | Опис |
|---|---|
| `state` | `idle` — запуску не було; `queued`, `running`, `done` або `failed` |
| `published` | Створено й оплачено замовлень |
| `failed` | Не вдалося створити |
| `unpaid` | Забракло балансу — можна повторити |
| `skipped_team` | Командні позиції не включено |
| `tier_changed` | Ціна змінилася через підписку — можна повторити після поновлення |
| `subscription_required` | Командним позиціям потрібна підписка — можна повторити після поновлення |
| `team_membership_required` | У команді немає активного учасника — можна повторити після додавання |
| `type_unavailable` | Тип недоступний — повтор не допоможе |
| `skipped_without_proofs` | Без скриншотів — завантажте ці акаунти в новий пакет |
| `remaining` | Скільки позицій залишилося |
| `retryable` | Можна викликати [`retry`](#post-reverify-retry) |
| `error` | Чому запуск зупинився, або `null` |
