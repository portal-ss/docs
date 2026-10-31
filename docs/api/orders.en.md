# Orders and slots

### Get the catalog {#get-catalog}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/catalog</code></div>

Prices, availability and what you can buy. Prices change — read the catalog right before buying.

Right: `read`

Response `200`:

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

| Field | Description |
|---|---|
| `max_quantity` | The maximum number of slots in one order |
| `has_active_subscription` | Whether you have an active subscription — required for wholesale and team orders |
| `has_active_team` | Whether your team has an active member — required for a team order |
| `exchanges[].exchange` | Exchange code: `bybit`, `mexc`, `kucoin` or `bingx` |
| `services[].service_id` | The product (exchange and country) for standard and wholesale orders |
| `services[].price_standard`, `price_wholesale` | Price per slot in a standard and a wholesale order |
| `services[].out_of_stock_standard`, `out_of_stock_wholesale` | `true` — can't be bought at this price right now |
| `services[].reverify[]` | Re-verifications for this country; `needs_proofs` — screenshots are needed |
| `team_regions[].code` | A region for a team order |
| `deadline` | The allowed slot fulfillment deadline, in hours; `choices` — the options the bots offer |

### Buy an order {#post-orders}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Buys an order and charges the full amount right away: first from the referral balance, then from the main one. The order's slots start out empty — next, [upload accounts](upload.md#post-upload).

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

| Body field | Type | Required | Description |
|---|---|---|---|
| `type` | string | yes | `standard`, `wholesale` or `team` |
| `quantity` | integer | yes | From 1 to 100 |
| `service_id` | integer | for `standard`, `wholesale` | A product from [`GET /catalog`](#get-catalog) |
| `expected_price_per_slot` | amount | for `standard`, `wholesale` | Up to 2 decimal places. If it's below the current price, the request is refused; otherwise the current price is charged |
| `exchange` | string | for `team` | `bybit`, `mexc`, `kucoin` or `bingx` |
| `region` | string | for `team` | A code from the catalog's `team_regions` |
| `team_price` | amount | for `team` | Your price per slot: greater than zero, up to 2 decimal places |
| `deadline_hours` | integer | no | The slot's [fulfillment deadline](../guide/lifecycle.md#deadline) from publishing, 4–72 hours; omit it for no deadline |

A team order costs `team_price × quantity`.

```bash
curl -X POST https://app.kycportal.org/api/v1/orders \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"type": "standard", "service_id": 42, "quantity": 5, "expected_price_per_slot": "12.50", "deadline_hours": 24}'
```

Response `201`:

```json
{"order_id": "8402-9173", "total": "62.50"}
```

`total` is how much was charged.

| HTTP | `code` | When |
|---|---|---|
| 409 | `price_changed` | The price went up, nothing was charged; `price` and `total` are the current values |
| 409 | `insufficient_balance` | Not enough balance |
| 409 | `purchase_in_progress` | Another purchase of yours is in progress; retry in a few seconds |
| 409 | `service_unavailable` | The product isn't on sale or is out of stock |
| 403 | `subscription_required` | A wholesale or team order without an active subscription |
| 403 | `team_membership_required` | A team order, but your team has no active members |

### List orders {#get-orders}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders</code></div>

Your orders, newest first. Re-verification orders aren't listed here — their slots are in [`GET /reverify`](reverify.md#get-reverify).

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `tab` | string | no | `active` (default): `PAID`, `SESSION_UPLOADED`, `IN_PROGRESS`; `completed` — the rest |
| `status` | string | no | An [order status](codes.md#order-statuses) within the tab; a status from the other tab is ignored |
| `q` | string | no | An order number or the number of one of its slots, up to 128 characters |
| `attention` | yes/no | no | `true` — orders with a frozen slot or a slot waiting for you; only with `active` |
| `limit`, `offset` | integer | no | [Page](index.md#pagination) |

Response `200`:

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

| Field | Description |
|---|---|
| `verification_type` | `INITIAL_KYC` — initial verification; otherwise a re-verification type, for example `MEXC_FACE_SECURITY` |
| `status` | [Order status](codes.md#order-statuses) |
| `in_progress_slots` | In progress, including exchange review, attempt retries and the post-KYC steps |
| `failed_slots` | Risk Removal slots with a rejected appeal |
| `reupload_slots` | Waiting for your re-upload |
| `free_slots` | Not taken by anyone |
| `is_frozen` | The subscription isn't active, and the order has a frozen slot |
| `frozen_total_slots` | Frozen slots in total |
| `frozen_slots` | Of these, the ones without a close request from anyone else: [cancelling frozen slots](cancel.md#post-cancel-frozen) will affect them |
| `refunded` | How much has been refunded to your balance for the order in total; `null` — nothing |
| `slot_counts` | `in_work` — in progress, `waiting` — nobody has taken them, `frozen`, `done`; cancelled slots aren't counted |

### Get an order {#get-order}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}</code></div>

The order card. Also works for a re-verification order.

Right: `read`

Response `200` — all the order fields from [`GET /orders`](#get-orders), plus:

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

| Field | Description |
|---|---|
| `source_order_id` | For a re-verification — the order it repeats |
| `free_empty_slots` | Free slots without an account |
| `free_loaded_slots` | Free slots with an uploaded account |
| `missing_proxy_slots`, `missing_proxy_slot_ids` | Slots with an account but no proxy (numbers of the first few); publishing will be refused |
| `frozen_checking_slots` | Of `frozen_slots`: your frozen-slot cancellations waiting for an exchange check |
| `frozen_cancel_pending_slots` | Your unfinished frozen-slot cancellations, including after a subscription renewal |
| `frozen_checking_reupload_slots` | Of these, the ones waiting for your re-upload |
| `frozen_needs_check` | How many slots a frozen-slot cancellation will check on the exchange first |
| `frozen_refund` | How much a frozen-slot cancellation will refund if none of the slots turns out to be completed |
| `frozen_refund_now` | Of that, how much is refunded right away |
| `freezes_on_publish` | The subscription isn't active: after publishing, the slots will freeze right away |
| `history[]` | Status history; `actor` — `client`, `worker`, `system` or `admin` |

### List slots {#get-slots}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/slots</code></div>

Slots of all your orders, including re-verifications, newest first.

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `tab` | string | no | `all` (default), `active` or `completed` (`COMPLETED`, `CANCELLED`) |
| `status` | string | no | A [slot status](codes.md#slot-statuses) within the tab; a status from the other tab is ignored |
| `q` | string | no | A slot number, an order number (all its slots) or a full account login |
| `attention` | yes/no | no | `true` — only slots waiting for you (a non-empty `waiting_for_client`) |
| `limit`, `offset` | integer | no | [Page](index.md#pagination) |

Response `200`:

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

The fields are the same as in the [slot card](#get-slot).

### Get a slot {#get-slot}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}</code></div>

The slot card: status, deadlines and what the slot needs from you.

Right: `read`

Response `200` (a BingX slot at the second stage):

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

| Field | Description |
|---|---|
| `slot_number`, `total_slots` | Slot N of M in the order |
| `status` | [Slot status](codes.md#slot-statuses) |
| `verification_result` | [Verification outcome](codes.md#verification-results) or `null` |
| `account_identity`, `account_uid` | The account login and its UID on the exchange |
| `session_format` | How the account was uploaded: `manual` or `adspower` |
| `reupload_scope` | What to send on a [re-upload](slot-actions.md#post-reupload): `proxy`, `session` (cookies) or `full` |
| `retry_count` | How many attempts have already been rejected |
| `worker_id` | The current executor, or `null` |
| `claimed_at`, `first_claimed_at` | When the current executor took the slot / when it was first taken |
| `verified_first_name`, `verified_last_name`, `verified_country` | Who was verified; only on a completed slot |
| `mexc_hold_started_at`, `mexc_face_deadline_at` | MEXC: the start of the post-KYC observation period and the face check deadline |
| `clocks_paused` | All the slot's deadlines are paused: it's waiting for your re-upload or for the exchange's answer |
| `check_kyc_available` | Whether you can [check the status](slot-actions.md#post-check-kyc) right now |
| `is_frozen`, `order_is_frozen` | The slot / its order is frozen |
| `close_request_open` | The slot is scheduled to close; the time is in `deadlines` |
| `risk_proofs_requested_at` | When new Risk Removal screenshots were requested |
| `waiting_for_client` | [What the slot needs from you](codes.md#waiting); an empty list means nothing |
| `close_reason` | [Why the slot was cancelled](codes.md#close-reasons) |
| `source_slot_id`, `source_order_id` | For a re-verification — the slot and order it repeats |
| `deadlines[]` | Deadlines sorted by `at`: `kind` — the [kind](codes.md#deadline-kinds), `reason` — the [reason](codes.md#deadline-reasons) for `close_request` |
| `history[]` | Status history; `actor` — `client`, `worker`, `system` or `admin` |

`bingx` — on a BingX slot from the second stage on; `null` on others:

| Field | Description |
|---|---|
| `step` | [Second-stage step](codes.md#bingx-steps) |
| `code_ask_reason` | With `awaiting_code`: [why the code is requested](codes.md#ask-reasons) |
| `code_sent_at` | With `awaiting_code`: when BingX sent the relevant email |
| `client_time_left_seconds` | What's left of your 60 minutes for codes; once it runs out, the slot completes with face login left on |
| `client_clock_running` | Whether your time is running right now |
| `client_deadline_at` | When your time runs out |
| `fresh_code_available` | The code is older than 10 minutes: you can [request a new email](slot-actions.md#post-bingx-refresh) |
| `face_login` | The outcome on a completed slot: [`off`, `left_on` or `unknown`](codes.md#bingx-endings) |

`cancel` — whether you can [cancel the re-verification](cancel.md#post-cancel-reverify); on other slots, all fields are `false` or `null`:

| Field | Description |
|---|---|
| `available` | Cancellation is available right now |
| `unavailable_reason` | Why it isn't available: `too_early`, `pending`, `needs_reupload`, `face_passed` or `forbidden_status` |
| `open_reason` | `worker_left_team` — cancellation opened earlier than usual |
| `min_hours` | With `too_early`: how many hours after the attempt starts cancellation opens |
| `opens_at` | When it opens; `null` while the timer is paused |
| `paused_left_seconds` | What's left on the timer while it's paused |
| `pending`, `checking`, `operator_hold` | Your cancellation has been accepted / is waiting for the exchange's answer / is waiting for a manual review |
