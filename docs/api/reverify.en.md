# Re-verification

## Re-verification slots

### List re-verification slots {#get-reverify}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify</code></div>

A list of re-verification slots.

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `tab` | string | no | `active` (default) or `finished` |
| `q` | string | no | A slot or order number, up to 128 characters |
| `limit`, `offset` | integer | no | [Pagination](index.md#pagination) |

Response `200`:

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

`status` is the [slot status](codes.md#slot-statuses). For the full card, see [`GET /orders/{order_id}/slots/{slot_id}`](orders.md#get-slot); to cancel, use [`cancel-reverify`](cancel.md#post-cancel-reverify).

## Bulk re-verification

Re-verifications are ordered in batches: accounts of one exchange and one type. The account check and the plan are free; money is charged only at launch.

1. [`GET /reverify/meta`](#get-reverify-meta) — what can be ordered and at what price.
2. [`POST /reverify/batches`](#post-reverify-batches) — upload accounts with fresh cookies and proxies.
3. Poll [`GET /reverify/batches/{batch_id}`](#get-reverify-batch) every few seconds until `state` becomes `done` and `plan` appears.
4. Only if `plan.needs_proofs: true` (Risk Removal): upload screenshots to [`POST /risk-proofs/files`](slot-actions.md#post-risk-proofs-files) and attach them via [`PUT …/proofs`](#put-reverify-proofs).
5. Launch [`POST …/execute`](#post-reverify-execute) with `expected_total` = `plan.total`.
6. Check the outcome in [`GET …/execution`](#get-reverify-execution); if `retryable: true`, fix the cause and call [`POST …/retry`](#post-reverify-retry).

A batch lives for 1 hour after the upload; for Risk Removal, every read or write of the screenshots extends it, up to 12 hours after the upload. `batch_id` is 12 characters of `0-9a-f`. The created orders are published automatically and assigned to the executor who did the initial verification; follow them in the [feed](events.md#events) and in [`GET /reverify`](#get-reverify).

### Get re-verification options {#get-reverify-meta}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/meta</code></div>

What can be ordered on each exchange, and at what price for your accounts.

Right: `read`

Response `200`:

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

| Response field | Description |
|---|---|
| `eligible` | Whether you have an account verified through the platform on this exchange; without one, a batch can't be created |
| `types[].needs_proofs` | Deposit screenshots are needed before launch |
| `types[].price_from_standard`, `price_from_wholesale` | The lowest catalog price for accounts from standard and from wholesale orders; an amount or `null` |
| `regions[].prices[]` | Prices for your accounts by region: `price_standard` — from standard orders, `price_wholesale` — from wholesale orders with an active subscription; with `eligible: false`, the list is empty |

### Create a re-verification batch {#post-reverify-batches}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches</code></div>

Uploads accounts to a batch; the check runs in the background. Fresh cookies and proxies are needed — the original order's data isn't used. Up to 120 accounts, and no more than the number of verified accounts you have on the exchange: the extra ones are dropped.

Right: `upload` · [`Idempotency-Key`](errors.md#idempotency) required

| Form field | Type | Required | Description |
|---|---|---|---|
| `exchange` | string | yes | `exchange` from `GET /reverify/meta` |
| `verification_type` | string | yes | `verification_type` from `GET /reverify/meta` |
| `method`, `ads_file`, `proxies`, `cookie_files`, `positions` | — | — | Same as for [uploading to an order](upload.md#post-upload); the whole request is up to 34 MB |

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

Response `202`:

```json
{"batch_id": "a1b2c3d4e5f6", "state": "queued", "staged": 2, "failures": [{"upload_position": 2, "error_code": "proxy_timeout"}]}
```

`state: "no_valid"` — there's nothing to check, and there will be no plan. `failures[]` — accounts that failed the proxy check; `error_code`: `missing_proxy`, `proxy_broken`, `proxy_auth_rejected`, `proxy_timeout`, `proxy_bad_host` or `proxy_unreachable`. For Risk Removal, no more than 50 accounts go into the plan.

| HTTP | `code` | When |
|---|---|---|
| 422 | `reverify_invalid_type` | The exchange has no such type, or you have no verified account on it |
| 422 | `reverify_type_unavailable` | The type can't be ordered right now |
| 409 | `reverify_validate_in_progress` | Another batch of yours is still being checked — wait for it |
| 422 | `nothing_to_upload` | The file has no accounts |
| 503 | `queue_unavailable` | The queue is busy, nothing was done — retry in a minute |
| 4xx | Upload and [file parsing](codes.md#upload-codes) codes | Same as for [`POST …/upload`](upload.md#post-upload) |

### Get a batch and its plan {#get-reverify-batch}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}</code></div>

Progress of the account check, and the plan once it's ready.

Right: `read`

Response `200`:

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

| Response field | Description |
|---|---|
| `state` | The account check: `idle`, `queued`, `running`, `done` or `failed`; with `failed`, the reason is in `error` |
| `alive` | How many accounts have working cookies |
| `plan.matched[]` | Accounts to order. `index` — the item number for screenshots, `upload_position` — the position in the upload (from 1), `source_order_id` and `source_slot_id` — where the account was verified |
| `plan.matched[].source_class` | How the original order was bought: `standard`, `wholesale` or `team` |
| `plan.matched[].price` | The item's price; `null` for a team item whose price you set |
| `plan.matched[].downgraded` | `true` — a wholesale source was priced at retail: there's no active subscription |
| `plan.matched[].challenge` | Whether the exchange requires this check right now: `required`, `not_required`, `unknown` or `null` |
| `plan.skipped[]` | Skipped accounts (see `reason` below); nothing is charged for them |
| `plan.total` | The sum of the item prices, excluding team items without a price — pass it as `expected_total` |
| `plan.needs_team_price` | There's a team item without a price: it needs a `team_price` |
| `plan.needs_proofs` | Screenshots are needed before launch |
| `plan.retry_available`, `plan.retry_deadline` | Whether [retrying the rest](#post-reverify-retry) is available, and until when |

| `skipped[].reason` | What it means |
|---|---|
| `no_match` | There's no completed initial-verification slot with this account |
| `session_dead` | The cookies or proxy don't work |
| `not_required` | The exchange doesn't require this check right now |
| `type_unavailable` | The type isn't available for this region |
| `subscription_required` | The source is a team order: a subscription is required |
| `team_membership_required` | The source is a team order: your team has no active member |
| `already_reverifying` | A re-verification is already under way on the account |
| `account_busy` | The account is busy with another active order |
| `duplicate_in_upload` | The account is repeated in this upload |
| `not_validated` | The account wasn't checked in time — upload it again |
| `advanced_kyc_missing` | Advanced KYC hasn't been passed on the account |
| `provider_unsupported` | MEXC uses a face check method on this account that the platform doesn't support |
| `form_unsupported` | MEXC asks for documents that the platform doesn't submit yet |
| `account_blocked` | The exchange no longer allows verification on this account |
| `review_in_progress` | A check is already under way on the account — wait for the result |
| `exchange_error` | An error on the exchange's side — contact support |
| `risk_gate_failed` | The account status couldn't be read — try again in a few minutes |
| `proofs_missing` | Risk Removal: deposit screenshots haven't been added |

| HTTP | `code` | When |
|---|---|---|
| 404 | `reverify_expired` | The batch has expired, belongs to someone else or wasn't found — upload the accounts again |

### Get the screenshot draft {#get-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

The screenshot draft of a Risk Removal batch. Every call extends the batch's lifetime.

Right: `upload`

Response `200`:

```json
{
  "entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}],
  "expires_at": "2026-10-31T12:40:00Z"
}
```

`expires_at` is when the batch expires.

| HTTP | `code` | When |
|---|---|---|
| 404 | `reverify_expired` | The batch has expired, belongs to someone else or wasn't found |
| 422 | `reverify_type_unavailable` | This type has no screenshot step |

### Save the screenshot draft {#put-reverify-proofs}

<div class="api-endpoint"><span class="api-method api-method--put">PUT</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/proofs</code></div>

Replaces the screenshot draft as a whole: an item not in the request is left without screenshots. If even one item fails validation, nothing is saved.

Right: `upload`

| Body field | Type | Required | Description |
|---|---|---|---|
| `entries` | list | yes | Up to 120 items; the body is up to 1 000 000 bytes |
| `entries[].index` | integer | yes | `index` from `plan.matched`, each only once |
| `entries[].deposits` | list | yes | Up to 4 screenshots |
| `entries[].deposits[].file_id` | string | yes | The screenshot's `id`; a screenshot can be used for one account only |
| `entries[].deposits[].source` | string | no | Where the deposit came from, up to 64 characters; may be empty while the draft is being filled in |

```bash
curl -X PUT https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"entries": [{"index": 0, "deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"}]}]}'
```

Response `200` — same as for [`GET …/proofs`](#get-reverify-proofs).

| HTTP | `code` | When |
|---|---|---|
| 422 | `reverify_invalid_entry` | The `index` isn't from the plan or is repeated |
| 404 | `proof_file_not_found` | The screenshot wasn't found, belongs to someone else, has already been sent or is listed twice |
| 422 | `proof_source_invalid` | An invalid `source` |
| 422 | `reverify_type_unavailable` | This type has no screenshot step |
| 404 | `reverify_expired` | The batch has expired, belongs to someone else or wasn't found |

### Launch the re-verification {#post-reverify-execute}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execute</code></div>

Orders and pays for the plan items — at the plan prices, even if the catalog has changed in the meantime. An insufficient balance doesn't block the launch: items the balance can't cover stop as `unpaid`.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

| Body field | Type | Required | Description |
|---|---|---|---|
| `expected_total` | amount | yes | Exactly `plan.total` |
| `include_team` | yes/no | no | Order the team items too; default `false` |
| `team_price` | amount or `null` | with `plan.needs_team_price` and `include_team` | The price for each unpriced team item, on top of `plan.total` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/execute \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Response `202`:

```json
{"state": "queued", "ordered": 1, "skipped_without_proofs": 0}
```

`ordered` is how many items the launch will try to order. `skipped_without_proofs` is the number of Risk Removal items without at least one "screenshot + source" pair; they're skipped and not charged.

| HTTP | `code` | When |
|---|---|---|
| 409 | `plan_total_mismatch` | `expected_total` doesn't equal `plan.total`; nothing was charged — re-read the batch |
| 409 | `reverify_expired` | The batch has expired, is finished or wasn't found, or the retry window has closed |
| 409 | `proofs_missing` | Risk Removal: there was no [`PUT …/proofs`](#put-reverify-proofs) |
| 422 | `team_price_required` | A positive `team_price` is required |
| 409 | `reverify_in_progress` | Another launch of yours is already running |
| 503 | `queue_unavailable` | The queue is busy, nothing was done — retry in a minute |

### Retry the remainder {#post-reverify-retry}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/retry</code></div>

Launches what's left after the previous launch, with the same decision on team items and the same `team_price`. The retry window lasts until `plan.retry_deadline`: 2 hours after the first launch that left items remaining.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

| Body field | Type | Required | Description |
|---|---|---|---|
| `expected_total` | amount | yes | Again, `plan.total` from `GET /reverify/batches/{batch_id}` |

```bash
curl -X POST https://app.kycportal.org/api/v1/reverify/batches/a1b2c3d4e5f6/retry \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_total": "4.00"}'
```

Response `202` — same as for [`execute`](#post-reverify-execute). The errors are the same too, except `team_price_required`; `409 reverify_expired` is also returned when there's nothing to retry.

### Get the launch result {#get-reverify-execution}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/reverify/batches/{batch_id}/execution</code></div>

The launch outcome.

Right: `read`

Response `200`:

```json
{
  "state": "done", "done": 3, "total": 3, "published": 2, "failed": 0, "unpaid": 1,
  "skipped_team": 0, "tier_changed": 0, "subscription_required": 0, "team_membership_required": 0,
  "type_unavailable": 0, "skipped_without_proofs": 0, "remaining": 1, "retryable": true, "error": null
}
```

| Response field | Description |
|---|---|
| `state` | `idle` — there was no launch; `queued`, `running`, `done` or `failed` |
| `published` | Orders created and paid for |
| `failed` | Failed to create |
| `unpaid` | Not enough balance — can be retried |
| `skipped_team` | Team items not included |
| `tier_changed` | The price changed because of the subscription — can be retried after renewal |
| `subscription_required` | Team items need a subscription — can be retried after renewal |
| `team_membership_required` | Your team has no active member — can be retried after adding one |
| `type_unavailable` | The type is unavailable — a retry won't help |
| `skipped_without_proofs` | No screenshots — upload these accounts in a new batch |
| `remaining` | How many items are left |
| `retryable` | You can call [`retry`](#post-reverify-retry) |
| `error` | Why the launch stopped, or `null` |
