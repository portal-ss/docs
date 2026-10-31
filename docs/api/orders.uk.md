# Замовлення й слоти

### Отримати каталог {#get-catalog}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/catalog</code></div>

Ціни, наявність і що вам доступно для купівлі. Ціни змінюються — читайте каталог безпосередньо перед купівлею.

Право `read`

Відповідь `200`:

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

| Поле | Опис |
|---|---|
| `max_quantity` | Максимум слотів в одному замовленні |
| `has_active_subscription` | Є активна підписка — потрібна для оптового й командного замовлення |
| `has_active_team` | У команді є активний учасник — потрібен для командного замовлення |
| `exchanges[].exchange` | Код біржі: `bybit`, `mexc`, `kucoin` або `bingx` |
| `services[].service_id` | Товар (біржа й країна) для стандартного й оптового замовлення |
| `services[].price_standard`, `price_wholesale` | Ціна за слот у стандартному й оптовому замовленні |
| `services[].out_of_stock_standard`, `out_of_stock_wholesale` | `true` — за цією ціною зараз не купити |
| `services[].reverify[]` | Реверифікації для цієї країни; `needs_proofs` — потрібні скриншоти |
| `team_regions[].code` | Регіон для командного замовлення |
| `deadline` | Допустимий строк виконання слота в годинах; `choices` — варіанти, які пропонують боти |

### Купити замовлення {#post-orders}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Купує замовлення й одразу списує всю суму: спочатку з реферального балансу, потім з основного. Слоти замовлення порожні — далі [завантажте акаунти](upload.md#post-upload).

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `type` | рядок | так | `standard`, `wholesale` або `team` |
| `quantity` | ціле | так | Від 1 до 100 |
| `service_id` | ціле | для `standard`, `wholesale` | Товар із [`GET /catalog`](#get-catalog) |
| `expected_price_per_slot` | сума | для `standard`, `wholesale` | До 2 знаків після крапки. Нижча за поточну ціну — відмова, інакше списується поточна |
| `exchange` | рядок | для `team` | `bybit`, `mexc`, `kucoin` або `bingx` |
| `region` | рядок | для `team` | Код із `team_regions` каталогу |
| `team_price` | сума | для `team` | Ваша ціна за слот: більша за нуль, до 2 знаків після крапки |
| `deadline_hours` | ціле | ні | [Строк виконання](../guide/lifecycle.md#deadline) слота від публікації, 4–72 години; без поля — без строку |

Командне замовлення коштує `team_price × quantity`.

```bash
curl -X POST https://app.kycportal.org/api/v1/orders \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"type": "standard", "service_id": 42, "quantity": 5, "expected_price_per_slot": "12.50", "deadline_hours": 24}'
```

Відповідь `201`:

```json
{"order_id": "8402-9173", "total": "62.50"}
```

`total` — скільки списано.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `price_changed` | Ціна зросла, нічого не списано; `price` і `total` — поточні |
| 409 | `insufficient_balance` | Бракує балансу |
| 409 | `purchase_in_progress` | Триває інша ваша купівля; повторіть через кілька секунд |
| 409 | `service_unavailable` | Товару немає в продажу або в наявності |
| 403 | `subscription_required` | Оптове або командне замовлення без активної підписки |
| 403 | `team_membership_required` | Командне замовлення, а активних учасників у команді немає |

### Отримати список замовлень {#get-orders}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Ваші замовлення, нові першими. Замовлень реверифікації тут немає — їхні слоти в [`GET /reverify`](reverify.md#get-reverify).

Право `read`

| Параметр | Тип | Обов'язково | Опис |
|---|---|---|---|
| `tab` | рядок | ні | `active` (за замовчуванням): `PAID`, `SESSION_UPLOADED`, `IN_PROGRESS`; `completed` — решта |
| `status` | рядок | ні | [Статус замовлення](codes.md#order-statuses) всередині вкладки; статус іншої вкладки не враховується |
| `q` | рядок | ні | Номер замовлення або його слота, до 128 символів |
| `attention` | так/ні | ні | `true` — замовлення із замороженим слотом або слотом, який чекає на вас; лише `active` |
| `limit`, `offset` | ціле | ні | [Сторінка](index.md#pagination) |

Відповідь `200`:

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

| Поле | Опис |
|---|---|
| `verification_type` | `INITIAL_KYC` — первинна верифікація; інакше тип реверифікації, наприклад `MEXC_FACE_SECURITY` |
| `status` | [Статус замовлення](codes.md#order-statuses) |
| `in_progress_slots` | У роботі, зокрема перевірка біржею, повтор спроби й кроки після KYC |
| `failed_slots` | Слоти Risk Removal з відхиленою апеляцією |
| `reupload_slots` | Чекають вашого повторного завантаження |
| `free_slots` | Ніхто не взяв |
| `is_frozen` | Підписка не активна, і в замовленні є заморожений слот |
| `frozen_total_slots` | Заморожених слотів усього |
| `frozen_slots` | З них — без чужої заявки на закриття: їх стосується [скасування заморожених](cancel.md#post-cancel-frozen) |
| `refunded` | Скільки загалом повернулося на баланс за замовленням; `null` — нічого |
| `slot_counts` | `in_work` — у роботі, `waiting` — ніхто не взяв, `frozen`, `done`; скасовані не входять |

### Отримати замовлення {#get-order}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}</code></div>

Картка замовлення. Працює й для замовлення реверифікації.

Право `read`

Відповідь `200` — усі поля замовлення з [`GET /orders`](#get-orders), а також:

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

| Поле | Опис |
|---|---|
| `source_order_id` | У реверифікації — замовлення, яке вона повторює |
| `free_empty_slots` | Вільні слоти без акаунта |
| `free_loaded_slots` | Вільні слоти із завантаженим акаунтом |
| `missing_proxy_slots`, `missing_proxy_slot_ids` | Слоти з акаунтом, але без проксі (номери — перші з них); публікація не пройде |
| `frozen_checking_slots` | Із `frozen_slots`: ваші скасування заморожених, які чекають перевірки біржі |
| `frozen_cancel_pending_slots` | Ваші незавершені скасування заморожених, зокрема після поновлення підписки |
| `frozen_checking_reupload_slots` | З них — чекають вашого повторного завантаження |
| `frozen_needs_check` | Скільки слотів скасування заморожених спершу перевірить на біржі |
| `frozen_refund` | Скільки поверне скасування заморожених, якщо жоден слот не виявиться виконаним |
| `frozen_refund_now` | З цього — скільки повернеться одразу |
| `freezes_on_publish` | Підписка не активна: після публікації слоти одразу буде заморожено |
| `history[]` | Історія статусів; `actor` — `client`, `worker`, `system` або `admin` |

### Отримати список слотів {#get-slots}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/slots</code></div>

Слоти всіх ваших замовлень, зокрема реверифікацій, нові першими.

Право `read`

| Параметр | Тип | Обов'язково | Опис |
|---|---|---|---|
| `tab` | рядок | ні | `all` (за замовчуванням), `active` або `completed` (`COMPLETED`, `CANCELLED`) |
| `status` | рядок | ні | [Статус слота](codes.md#slot-statuses) всередині вкладки; статус іншої вкладки не враховується |
| `q` | рядок | ні | Номер слота, номер замовлення (усі його слоти) або акаунт повністю |
| `attention` | так/ні | ні | `true` — лише слоти, які чекають на вас (непорожній `waiting_for_client`) |
| `limit`, `offset` | ціле | ні | [Сторінка](index.md#pagination) |

Відповідь `200`:

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

Поля — як у [картці слота](#get-slot).

### Отримати слот {#get-slot}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}</code></div>

Картка слота: статус, строки й чого слот чекає від вас.

Право `read`

Відповідь `200` (слот BingX на другому етапі):

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

| Поле | Опис |
|---|---|
| `slot_number`, `total_slots` | Слот N із M у замовленні |
| `status` | [Статус слота](codes.md#slot-statuses) |
| `verification_result` | [Підсумок верифікації](codes.md#verification-results) або `null` |
| `account_identity`, `account_uid` | Логін акаунта й UID на біржі |
| `session_format` | Як завантажено акаунт: `manual` або `adspower` |
| `reupload_scope` | Що надіслати під час [повторного завантаження](slot-actions.md#post-reupload): `proxy`, `session` (cookies) або `full` |
| `retry_count` | Скільки спроб уже відхилено |
| `worker_id` | Поточний виконавець або `null` |
| `claimed_at`, `first_claimed_at` | Коли слот узяв поточний виконавець / коли його взяли вперше |
| `verified_first_name`, `verified_last_name`, `verified_country` | Хто пройшов верифікацію; лише у виконаного слота |
| `mexc_hold_started_at`, `mexc_face_deadline_at` | MEXC: початок спостереження після KYC і строк перевірки обличчя |
| `clocks_paused` | Відлік усіх строків слота зупинено: слот чекає вашого повторного завантаження або відповіді біржі |
| `check_kyc_available` | Чи можна зараз [перевірити статус](slot-actions.md#post-check-kyc) |
| `is_frozen`, `order_is_frozen` | Заморожено слот / його замовлення |
| `close_request_open` | Заплановано закриття слота; коли — у `deadlines` |
| `risk_proofs_requested_at` | Коли запитано нові скриншоти Risk Removal |
| `waiting_for_client` | [Чого слот чекає від вас](codes.md#waiting); порожній список — нічого |
| `close_reason` | [Чому слот скасовано](codes.md#close-reasons) |
| `source_slot_id`, `source_order_id` | У реверифікації — слот і замовлення, які вона повторює |
| `deadlines[]` | Строки за зростанням `at`: `kind` — [вид](codes.md#deadline-kinds), `reason` — [причина](codes.md#deadline-reasons) у `close_request` |
| `history[]` | Історія статусів; `actor` — `client`, `worker`, `system` або `admin` |

`bingx` — у слота BingX із другого етапу, в інших `null`:

| Поле | Опис |
|---|---|
| `step` | [Крок другого етапу](codes.md#bingx-steps) |
| `code_ask_reason` | На кроці `awaiting_code`: [чому просять код](codes.md#ask-reasons) |
| `code_sent_at` | На кроці `awaiting_code`: коли BingX надіслав потрібний лист |
| `client_time_left_seconds` | Залишок ваших 60 хвилин на коди; час закінчився — слот завершиться з увімкненим входом за обличчям |
| `client_clock_running` | Чи йде ваш час зараз |
| `client_deadline_at` | Коли ваш час закінчиться |
| `fresh_code_available` | Коду понад 10 хвилин: можна [запросити новий лист](slot-actions.md#post-bingx-refresh) |
| `face_login` | Підсумок у виконаного слота: [`off`, `left_on` або `unknown`](codes.md#bingx-endings) |

`cancel` — чи можна [скасувати реверифікацію](cancel.md#post-cancel-reverify); в інших слотів усе `false` і `null`:

| Поле | Опис |
|---|---|
| `available` | Скасувати можна зараз |
| `unavailable_reason` | Чому не можна: `too_early`, `pending`, `needs_reupload`, `face_passed` або `forbidden_status` |
| `open_reason` | `worker_left_team` — скасування відкрилося достроково |
| `min_hours` | Якщо `too_early`: через скільки годин від початку спроби відкриється скасування |
| `opens_at` | Коли відкриється; `null`, поки таймер на паузі |
| `paused_left_seconds` | Залишок таймера, поки він на паузі |
| `pending`, `checking`, `operator_hold` | Ваше скасування прийнято / чекає відповіді біржі / чекає ручної перевірки |
