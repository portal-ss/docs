# Account and balance

### Check the key {#get-ping}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/ping</code></div>

Checks the key and shows its rights.

Right: `read`

Response `200`:

```json
{"client_id": 123456789, "scopes": ["read", "upload"]}
```

`client_id` is your Telegram ID, and `scopes` lists the [key's rights](index.md#scopes).

### Get your account {#get-me}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/me</code></div>

Your account and balance.

Right: `read`

Response `200`:

```json
{"client_id": 123456789, "username": "ivan_kyc", "first_name": "Иван", "language": "ru",
 "balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40"}
```

| Field | Description |
|---|---|
| `username`, `first_name` | Telegram username and first name, or `null` |
| `language` | Interface language: `ru`, `uk` or `en` |
| `balance` | The whole balance: `cash_balance` + `referral_balance` |
| `cash_balance` | Main balance |
| `referral_balance` | Referral balance |

### Get the balance {#get-balance}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/balance</code></div>

Balance and the last 10 top-ups, newest first.

Right: `read`

Response `200`:

```json
{"balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40", "deposits_enabled": true,
 "deposits": [{"chain": "bsc", "currency": "USDT", "amount_usd": "100.00", "status": "credited",
   "tx_hash": "0x8c2f4a91d3e6b7058a1c9e2d4f6b8a0c1e3d5f7a9b2c4e6d8f0a1b3c5d7e9f21",
   "detected_at": "2026-10-28T09:14:03Z"}]}
```

| Field | Description |
|---|---|
| `deposits_enabled` | `false` — top-ups are paused right now |
| `deposits[].status` | `pending` — the transfer has been detected and is waiting for network confirmations; `credited` — credited |
| `deposits[].detected_at` | When the transfer was detected |

### List transactions {#get-transactions}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/transactions</code></div>

Balance transaction history, newest first.

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | no | `all` (default), `deposits`, `payments`, `refunds` or `bonuses` |
| `limit`, `offset` | integer | no | [Page](index.md#pagination) |

Response `200`:

```json
{"items": [{"type": "payment", "amount": "62.50", "cash_delta": "-50.10", "referral_delta": "-12.40",
  "order_id": "8402-9173", "comment": null, "created_at": "2026-10-30T09:00:00Z"}],
 "total": 57, "offset": 0, "limit": 20}
```

| Field | Description |
|---|---|
| `type` | `deposit`, `custom_deposit` — a top-up; `payment` — an order payment; `subscription` — a subscription payment; `refund` — a refund; `referral_bonus`, `achievement_bonus` — a bonus; `adjustment` — an adjustment |
| `amount` | The amount without a sign |
| `cash_delta`, `referral_delta` | The signed change in the main and referral balance (negative means a charge); `null` if there's no breakdown |
| `order_id` | The order the transaction relates to, or `null` |

### Get a deposit address {#post-deposit-address}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/deposit-address</code></div>

Issues your top-up address on the chosen network. The address for a network is permanent: a repeat request returns the same one.

Right: `read`

| Body field | Type | Required | Description |
|---|---|---|---|
| `chain` | string | yes | `bsc`, `polygon` or `arbitrum` |

```bash
curl -X POST https://app.kycportal.org/api/v1/deposit-address \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain": "bsc"}'
```

Response `200`:

```json
{"address": "0x4f3a9c1e7b2d8a6f0e5c3b1a9d7e5f3c1a8b6d4e", "chain": "bsc", "min_usd": "1.00", "confirmations": 8}
```

| Field | Description |
|---|---|
| `address` | The address for sending USDT or USDC on this network |
| `min_usd` | The minimum top-up amount |
| `confirmations` | Network confirmations before crediting: bsc — 8, polygon — 30, arbitrum — 20 |

Once a deposit is credited, it shows up in [`GET /balance`](#get-balance), and a `balance` event arrives in the [feed](events.md#get-events).

| HTTP | `code` | When |
|---|---|---|
| 409 | `deposits_paused` | Top-ups are paused |
| 409 | `crypto_unavailable` | An address can't be issued right now; retry later |

### Get the subscription and plans {#get-subscription}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

The current subscription and plans.

Right: `read`

Response `200`:

```json
{"current": {"plan_id": 2, "plan_name": "30 дней", "started_at": "2026-10-19T10:00:00Z",
   "expires_at": "2026-11-18T10:00:00Z", "days_left": 18},
 "expired": null,
 "plans": [{"plan_id": 1, "name": "7 дней", "price": "10.00", "duration_days": 7},
   {"plan_id": 2, "name": "30 дней", "price": "30.00", "duration_days": 30}]}
```

| Field | Description |
|---|---|
| `current` | The active subscription, or `null` |
| `expired` | The last subscription that ended, or `null`: `plan_id`, `plan_name`, `expired_at`, `days_since`, `frozen_orders` and `frozen_slots` — how many orders and slots are frozen |
| `plans[].plan_id` | The plan for [`POST /subscription`](#post-subscription) |

### Buy a subscription {#post-subscription}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

Buys a subscription and charges its price to your balance; an active subscription is extended by the plan's term from its end date. Subscription payments are non-refundable.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

| Body field | Type | Required | Description |
|---|---|---|---|
| `plan_id` | integer | yes | From [`GET /subscription`](#get-subscription) |
| `expected_price` | amount | yes | Greater than zero, up to 2 decimal places. If it's below the current price, the request is refused; otherwise the current price is charged |

```bash
curl -X POST https://app.kycportal.org/api/v1/subscription \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 2, "expected_price": "30.00"}'
```

Response `200`:

```json
{"plan_id": 2, "plan_name": "30 дней", "expires_at": "2026-12-18T10:00:00Z", "days_left": 48, "unfrozen_slots": 0}
```

`unfrozen_slots` is how many frozen slots the purchase released to executors again.

| HTTP | `code` | When |
|---|---|---|
| 409 | `price_changed` | The price went up, nothing was charged; `price` and `total` are the current values |
| 409 | `insufficient_balance` | Not enough balance |
| 409 | `service_unavailable` | The plan isn't on sale |
| 409 | `purchase_in_progress` | Another subscription purchase of yours is in progress; retry in a few seconds |

### Get the referral program {#get-referral}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/referral</code></div>

The referral program: link, percentages and earnings.

Right: `read`

Response `200`:

```json
{"code": "123456789", "share_url": "https://t.me/kycportal_bot?start=ref_123456789",
 "order_bonus_percent": "10", "subscription_bonus_percent": "10",
 "total_earned": "48.20", "earned_orders": "36.20", "earned_subscriptions": "12.00",
 "referral_count": 14, "active_referral_count": 5, "notifications_enabled": true}
```

| Field | Description |
|---|---|
| `order_bonus_percent`, `subscription_bonus_percent` | Your percentage of your referrals' orders and subscriptions (a string) |
| `total_earned` | Earned in total: `earned_orders` + `earned_subscriptions` |
| `active_referral_count` | Referrals who have already earned you a bonus |
| `notifications_enabled` | Whether bonus notifications are on |

### Get the team {#get-team}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/team</code></div>

Your team of executors and a page of its members. The response doesn't include the invite link.

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit`, `offset` | integer | no | [Page](index.md#pagination) of members |

Response `200`:

```json
{"stats": {"members_total": 3, "members_active": 2, "active_slots": 4, "graded": 40, "passed": 36},
 "limits": {"max_slots_per_order": 10, "max_active_slots": 20},
 "members": {"items": [{"id": "3310-7742", "worker_id": "7731-0045", "username": "worker_anna",
   "is_active": true, "max_slots_per_order": 5, "max_active_slots": null, "allowed_countries": ["UA", "KZ"],
   "joined_at": "2026-09-02T08:00:00Z", "active_slots": 2, "graded": 25, "passed": 23, "success_rate": 0.92}],
  "total": 3, "offset": 0, "limit": 20}}
```

| Field | Description |
|---|---|
| `graded`, `passed` | Attempts with an outcome / how many of them succeeded |
| `limits` | The highest limits you can set for a member; `0` — no limit |
| `members.items[].id` | The team membership number |
| `members.items[].max_slots_per_order`, `max_active_slots` | The member's limits; `null` — no limit |
| `members.items[].success_rate` | The share of successful attempts, from 0 to 1; `null` if there are no outcomes yet |

### Get platform links {#get-info}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/info</code></div>

Platform links: support, documentation, FAQ, terms, video and upload guides. Any link can be `null`.

Right: `read`

Response `200`:

```json
{"help_url": "https://t.me/freidbase", "docs_url": "https://portal-ss.github.io/docs/",
 "faq_url": "https://portal-ss.github.io/docs/faq/", "terms_url": "https://portal-ss.github.io/docs/terms/",
 "video_guide_url": null, "upload_guide_adspower_url": null, "upload_guide_manual_url": null}
```
