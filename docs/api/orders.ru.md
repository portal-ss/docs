# Заказы и слоты

### Получить каталог {#get-catalog}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/catalog</code></div>

Цены, наличие и что вам доступно для покупки. Цены меняются — читайте каталог прямо перед покупкой.

Право `read`

Ответ `200`:

```json
{
  "max_quantity": 100,
  "has_active_subscription": true,
  "subscription_ends_at": "2026-11-18T10:00:00Z",
  "has_active_team": true,
  "exchanges": [
    {
      "exchange": "mexc",
      "name": "MEXC",
      "services": [
        {
          "service_id": 42,
          "region": "UA",
          "price_standard": "12.50",
          "price_wholesale": "10.00",
          "out_of_stock_standard": false,
          "out_of_stock_wholesale": false,
          "reverify": [
            {"verification_type": "MEXC_FACE_SECURITY", "price_standard": "5.00", "price_wholesale": "4.00", "needs_proofs": false}
          ]
        }
      ]
    }
  ],
  "team_regions": [{"code": "UA", "name": "Ukraine"}],
  "deadline": {"min_hours": 4, "max_hours": 72, "choices": [4, 8, 12, 24, 48, 72]}
}
```

| Поле | Описание |
|---|---|
| `max_quantity` | Максимум слотов в одном заказе |
| `has_active_subscription` | Есть активная подписка — нужна для оптового и командного заказа |
| `has_active_team` | В команде есть активный участник — нужен для командного заказа |
| `exchanges[].exchange` | Код биржи: `bybit`, `mexc`, `kucoin` или `bingx` |
| `services[].service_id` | Товар (биржа и страна) для стандартного и оптового заказа |
| `services[].price_standard`, `price_wholesale` | Цена за слот в стандартном и оптовом заказе |
| `services[].out_of_stock_standard`, `out_of_stock_wholesale` | `true` — по этой цене сейчас не купить |
| `services[].reverify[]` | Реверификации для этой страны; `needs_proofs` — нужны скриншоты |
| `team_regions[].code` | Регион для командного заказа |
| `deadline` | Допустимый срок выполнения слота в часах; `choices` — варианты, которые предлагают боты |

### Купить заказ {#post-orders}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Покупает заказ и сразу списывает всю сумму: сначала с реферального баланса, потом с основного. Слоты заказа пустые — дальше [загрузите аккаунты](upload.md#post-upload).

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `type` | строка | да | `standard`, `wholesale` или `team` |
| `quantity` | целое | да | От 1 до 100 |
| `service_id` | целое | для `standard`, `wholesale` | Товар из [`GET /catalog`](#get-catalog) |
| `expected_price_per_slot` | сумма | для `standard`, `wholesale` | До 2 знаков. Ниже текущей цены — отказ, иначе списывается текущая |
| `exchange` | строка | для `team` | `bybit`, `mexc`, `kucoin` или `bingx` |
| `region` | строка | для `team` | Код из `team_regions` каталога |
| `team_price` | сумма | для `team` | Ваша цена за слот: больше нуля, до 2 знаков |
| `deadline_hours` | целое | нет | [Срок выполнения](../guide/lifecycle.md#deadline) слота от публикации, 4–72 часа; без поля — без срока |

Командный заказ стоит `team_price × quantity`.

```bash
curl -X POST https://app.kycportal.org/api/v1/orders \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"type": "standard", "service_id": 42, "quantity": 5, "expected_price_per_slot": "12.50", "deadline_hours": 24}'
```

Ответ `201`:

```json
{"order_id": "8402-9173", "total": "62.50"}
```

`total` — сколько списано.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `price_changed` | Цена выросла, ничего не списано; `price` и `total` — текущие |
| 409 | `insufficient_balance` | Не хватает баланса |
| 409 | `purchase_in_progress` | Идёт другая ваша покупка; повторите через несколько секунд |
| 409 | `service_unavailable` | Товара нет в продаже или в наличии |
| 403 | `subscription_required` | Оптовый или командный заказ без активной подписки |
| 403 | `team_membership_required` | Командный заказ, а активных участников в команде нет |

### Получить список заказов {#get-orders}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Ваши заказы, новые первыми. Заказов реверификации здесь нет — их слоты в [`GET /reverify`](reverify.md#get-reverify).

Право `read`

| Параметр | Тип | Обязательно | Описание |
|---|---|---|---|
| `tab` | строка | нет | `active` (по умолчанию): `PAID`, `SESSION_UPLOADED`, `IN_PROGRESS`; `completed` — остальные |
| `status` | строка | нет | [Статус заказа](codes.md#order-statuses) внутри вкладки; статус другой вкладки не учитывается |
| `q` | строка | нет | Номер заказа или его слота, до 128 символов |
| `attention` | да/нет | нет | `true` — заказы с замороженным слотом или слотом, ждущим вас; только `active` |
| `limit`, `offset` | целое | нет | [Страница](index.md#pagination) |

Ответ `200`:

```json
{"items": [{
  "id": "8402-9173",
  "exchange": "mexc",
  "verification_type": "INITIAL_KYC",
  "region": "UA",
  "status": "IN_PROGRESS",
  "price_per_slot": "12.50",
  "created_at": "2026-10-30T09:00:00Z",
  "total_slots": 5,
  "completed_slots": 2,
  "in_progress_slots": 1,
  "failed_slots": 0,
  "reupload_slots": 1,
  "free_slots": 1,
  "cancelled_slots": 0,
  "is_reverify": false,
  "is_frozen": false,
  "frozen_total_slots": 0,
  "frozen_slots": 0,
  "refunded": null,
  "slot_counts": {"in_work": 2, "waiting": 1, "frozen": 0, "done": 2}
}], "total": 1, "offset": 0, "limit": 20}
```

| Поле | Описание |
|---|---|
| `verification_type` | `INITIAL_KYC` — первичная верификация; иначе тип реверификации, например `MEXC_FACE_SECURITY` |
| `status` | [Статус заказа](codes.md#order-statuses) |
| `in_progress_slots` | В работе, включая проверку биржей, повтор попытки и шаги после KYC |
| `failed_slots` | Слоты Risk Removal с отклонённой апелляцией |
| `reupload_slots` | Ждут вашей повторной загрузки |
| `free_slots` | Никем не взяты |
| `is_frozen` | Подписка не активна, и в заказе есть замороженный слот |
| `frozen_total_slots` | Замороженных слотов всего |
| `frozen_slots` | Из них — без чужой заявки на закрытие: их затронет [отмена замороженных](cancel.md#post-cancel-frozen) |
| `refunded` | Сколько всего вернулось на баланс по заказу; `null` — ничего |
| `slot_counts` | `in_work` — в работе, `waiting` — никто не взял, `frozen`, `done`; отменённые не входят |

### Получить заказ {#get-order}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}</code></div>

Карточка заказа. Работает и для заказа реверификации.

Право `read`

Ответ `200` — все поля заказа из [`GET /orders`](#get-orders) и ещё:

```json
{
  "is_wholesale": false,
  "is_team_order": false,
  "published_at": "2026-10-30T09:30:00Z",
  "source_order_id": null,
  "free_empty_slots": 0,
  "free_loaded_slots": 1,
  "missing_proxy_slots": 0,
  "missing_proxy_slot_ids": [],
  "frozen_checking_slots": 0,
  "frozen_cancel_pending_slots": 0,
  "frozen_checking_reupload_slots": 0,
  "frozen_needs_check": 0,
  "frozen_refund": "0.00",
  "frozen_refund_now": "0.00",
  "freezes_on_publish": false,
  "history": [
    {"status_from": null, "status_to": "PAID", "actor": "client", "at": "2026-10-30T09:00:00Z"},
    {"status_from": "PAID", "status_to": "SESSION_UPLOADED", "actor": "client", "at": "2026-10-30T09:20:11Z"},
    {"status_from": "SESSION_UPLOADED", "status_to": "IN_PROGRESS", "actor": "client", "at": "2026-10-30T09:30:00Z"}
  ]
}
```

| Поле | Описание |
|---|---|
| `source_order_id` | У реверификации — заказ, который она повторяет |
| `free_empty_slots` | Свободные слоты без аккаунта |
| `free_loaded_slots` | Свободные слоты с загруженным аккаунтом |
| `missing_proxy_slots`, `missing_proxy_slot_ids` | Слоты с аккаунтом, но без прокси (номера — первые из них); публикация откажет |
| `frozen_checking_slots` | Из `frozen_slots`: ваши отмены замороженных, которые ждут проверки биржи |
| `frozen_cancel_pending_slots` | Ваши незавершённые отмены замороженных, в том числе после продления подписки |
| `frozen_checking_reupload_slots` | Из них — ждут вашей повторной загрузки |
| `frozen_needs_check` | Сколько слотов отмена замороженных сначала проверит на бирже |
| `frozen_refund` | Сколько вернёт отмена замороженных, если ни один слот не окажется выполненным |
| `frozen_refund_now` | Из этого — сколько вернётся сразу |
| `freezes_on_publish` | Подписка не активна: после публикации слоты сразу замёрзнут |
| `history[]` | История статусов; `actor` — `client`, `worker`, `system` или `admin` |

### Получить список слотов {#get-slots}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/slots</code></div>

Слоты всех ваших заказов, включая реверификации, новые первыми.

Право `read`

| Параметр | Тип | Обязательно | Описание |
|---|---|---|---|
| `tab` | строка | нет | `all` (по умолчанию), `active` или `completed` (`COMPLETED`, `CANCELLED`) |
| `status` | строка | нет | [Статус слота](codes.md#slot-statuses) внутри вкладки; статус другой вкладки не учитывается |
| `q` | строка | нет | Номер слота, номер заказа (все его слоты) или аккаунт целиком |
| `attention` | да/нет | нет | `true` — только слоты, которые ждут вас (непустой `waiting_for_client`) |
| `limit`, `offset` | целое | нет | [Страница](index.md#pagination) |

Ответ `200`:

```json
{"items": [{
  "id": "5120-3562",
  "order_id": "8402-9173",
  "account_identity": "user1@example.com",
  "exchange": "mexc",
  "region": "UA",
  "verification_type": "INITIAL_KYC",
  "is_reverify": false,
  "status": "REUPLOAD_REQUIRED",
  "order_status": "IN_PROGRESS",
  "has_session": true,
  "verification_result": null,
  "created_at": "2026-10-30T09:00:00Z",
  "completed_at": null,
  "is_frozen": false,
  "risk_proofs_requested_at": null,
  "waiting_for_client": ["reupload"]
}], "total": 1, "offset": 0, "limit": 20}
```

Поля — как в [карточке слота](#get-slot).

### Получить слот {#get-slot}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}</code></div>

Карточка слота: статус, сроки и что слот ждёт от вас.

Право `read`

Ответ `200` (слот BingX на втором этапе):

```json
{
  "id": "5120-3562",
  "order_id": "8402-9173",
  "order_status": "IN_PROGRESS",
  "exchange": "bingx",
  "region": "UA",
  "verification_type": "INITIAL_KYC",
  "price_per_slot": "12.50",
  "is_reverify": false,
  "slot_number": 1,
  "total_slots": 5,
  "status": "BINGX_FACE_OFF",
  "verification_result": null,
  "account_identity": "user1@example.com",
  "account_uid": "1384920577",
  "session_format": "manual",
  "adspower_profile_name": null,
  "has_session": true,
  "has_proxy": true,
  "reupload_scope": null,
  "retry_count": 0,
  "worker_id": "7731-0045",
  "created_at": "2026-10-30T09:00:00Z",
  "claimed_at": "2026-10-30T10:12:40Z",
  "first_claimed_at": "2026-10-30T10:12:40Z",
  "completed_at": null,
  "verified_first_name": null,
  "verified_last_name": null,
  "verified_country": null,
  "mexc_hold_started_at": null,
  "mexc_face_deadline_at": null,
  "clocks_paused": false,
  "check_kyc_available": false,
  "is_frozen": false,
  "order_is_frozen": false,
  "close_request_open": false,
  "risk_proofs_requested_at": null,
  "waiting_for_client": ["bingx_code"],
  "close_reason": null,
  "bingx": {
    "step": "awaiting_code",
    "code_ask_reason": "first",
    "code_sent_at": "2026-10-30T11:02:15Z",
    "client_time_left_seconds": 3240,
    "client_clock_running": true,
    "client_deadline_at": "2026-10-30T12:02:15Z",
    "fresh_code_available": false,
    "face_login": null
  },
  "cancel": {
    "available": false, "unavailable_reason": null, "open_reason": null, "min_hours": null,
    "opens_at": null, "paused_left_seconds": null, "pending": false, "checking": false, "operator_hold": false
  },
  "source_slot_id": null,
  "source_order_id": null,
  "deadlines": [{"kind": "slot_deadline", "at": "2026-10-31T09:30:00Z", "reason": null}],
  "history": [
    {"status_from": "FREE", "status_to": "IN_PROGRESS", "actor": "worker", "at": "2026-10-30T10:12:40Z"},
    {"status_from": "IN_PROGRESS", "status_to": "BINGX_FACE_OFF", "actor": "system", "at": "2026-10-30T11:01:58Z"}
  ]
}
```

| Поле | Описание |
|---|---|
| `slot_number`, `total_slots` | Слот N из M в заказе |
| `status` | [Статус слота](codes.md#slot-statuses) |
| `verification_result` | [Итог верификации](codes.md#verification-results) или `null` |
| `account_identity`, `account_uid` | Логин аккаунта и UID на бирже |
| `session_format` | Как загружен аккаунт: `manual` или `adspower` |
| `reupload_scope` | Что прислать при [повторной загрузке](slot-actions.md#post-reupload): `proxy`, `session` (cookies) или `full` |
| `retry_count` | Сколько попыток уже отклонено |
| `worker_id` | Текущий исполнитель или `null` |
| `claimed_at`, `first_claimed_at` | Когда слот взял текущий исполнитель / когда его взяли впервые |
| `verified_first_name`, `verified_last_name`, `verified_country` | Кто верифицирован; только у выполненного слота |
| `mexc_hold_started_at`, `mexc_face_deadline_at` | MEXC: начало наблюдения после KYC и срок проверки лица |
| `clocks_paused` | Все сроки слота стоят: он ждёт вашей повторной загрузки или ответа биржи |
| `check_kyc_available` | Можно ли сейчас [проверить статус](slot-actions.md#post-check-kyc) |
| `is_frozen`, `order_is_frozen` | Заморожен слот / его заказ |
| `close_request_open` | Запланировано закрытие слота; когда — в `deadlines` |
| `risk_proofs_requested_at` | Когда запрошены новые скриншоты Risk Removal |
| `waiting_for_client` | [Что слот ждёт от вас](codes.md#waiting); пустой список — ничего |
| `close_reason` | [Почему слот отменён](codes.md#close-reasons) |
| `source_slot_id`, `source_order_id` | У реверификации — слот и заказ, которые она повторяет |
| `deadlines[]` | Сроки по возрастанию `at`: `kind` — [вид](codes.md#deadline-kinds), `reason` — [причина](codes.md#deadline-reasons) у `close_request` |
| `history[]` | История статусов; `actor` — `client`, `worker`, `system` или `admin` |

`bingx` — у слота BingX со второго этапа, у остальных `null`:

| Поле | Описание |
|---|---|
| `step` | [Шаг второго этапа](codes.md#bingx-steps) |
| `code_ask_reason` | При `awaiting_code`: [почему просят код](codes.md#ask-reasons) |
| `code_sent_at` | При `awaiting_code`: когда BingX отправил нужное письмо |
| `client_time_left_seconds` | Остаток ваших 60 минут на коды; вышло — слот завершится с включённым входом по лицу |
| `client_clock_running` | Идёт ли ваше время сейчас |
| `client_deadline_at` | Когда ваше время закончится |
| `fresh_code_available` | Коду больше 10 минут: можно [запросить новое письмо](slot-actions.md#post-bingx-refresh) |
| `face_login` | Итог у выполненного слота: [`off`, `left_on` или `unknown`](codes.md#bingx-endings) |

`cancel` — можно ли [отменить реверификацию](cancel.md#post-cancel-reverify); у остальных слотов всё `false` и `null`:

| Поле | Описание |
|---|---|
| `available` | Отменить можно сейчас |
| `unavailable_reason` | Почему нельзя: `too_early`, `pending`, `needs_reupload`, `face_passed` или `forbidden_status` |
| `open_reason` | `worker_left_team` — отмена открылась раньше срока |
| `min_hours` | При `too_early`: через сколько часов от начала попытки откроется отмена |
| `opens_at` | Когда откроется; `null`, пока таймер на паузе |
| `paused_left_seconds` | Остаток таймера, пока он на паузе |
| `pending`, `checking`, `operator_hold` | Ваша отмена принята / ждёт ответа биржи / ждёт ручной проверки |
