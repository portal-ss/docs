# Cancellations

A refund is credited to your balance: the full slot price, split between the main and referral balance in the same proportion as the payment. It arrives in the feed as a `balance` event with `balance_event: "refund"` ([events](events.md#events)). Initial-verification slots in a published order, except frozen ones, can't be cancelled: an executor fulfills them, or the platform closes them with a refund ([Cancellations and refunds](../guide/cancel-refunds.md)).

### Cancel an unpublished order {#post-cancel}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel</code></div>

Cancels an unpublished order as a whole; the full amount is refunded right away. A re-verification order can't be cancelled this way — the response is `404 order_not_found`.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

Response `200`:

```json
{"status": "cancelled", "cancelled_slots": 10, "refunded": "100.00", "order_id": "8402-9173"}
```

| HTTP | `code` | When |
|---|---|---|
| 409 | `order_not_cancellable` | The order is published or closed, or there's nothing to cancel |

### Cancel frozen slots {#post-cancel-frozen}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel-frozen</code></div>

Cancels the order's frozen slots — the untaken slots of a published wholesale or team order while the subscription isn't active. Slots for which no verification link was issued are cancelled with an immediate refund; the rest, after the exchange is checked.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

| Body field | Type | Required | Description |
|---|---|---|---|
| `expected_count` | integer | yes | `frozen_slots` − `frozen_checking_slots` from [`GET /orders/{order_id}`](orders.md#get-order) |
| `expected_to_check` | integer | yes | `frozen_needs_check` from the same response |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/cancel-frozen \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_count": 4, "expected_to_check": 1}'
```

Response `200`:

```json
{"order_id": "8402-9173", "cancelled": 3, "refunded": "24.00", "checking": 1, "waiting_reupload": 0}
```

| Response field | Description |
|---|---|
| `cancelled`, `refunded` | Cancelled and refunded right away |
| `checking` | Waiting for an exchange check: not passed — the slot is cancelled and the money refunded later; passed — the slot completes without a refund |
| `waiting_reupload` | The part of `checking` that is waiting for your [re-upload](slot-actions.md#post-reupload); the exchange is checked after it |

| HTTP | `code` | When |
|---|---|---|
| 409 | `frozen_cancel_changed` | The numbers didn't match the order — nothing was cancelled; re-read the order |
| 409 | `nothing_to_cancel` | The subscription is active again, there are no frozen slots, or all of them are already being cancelled |

### Cancel a re-verification slot {#post-cancel-reverify}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/cancel-reverify</code></div>

Cancels a re-verification slot. The `cancel` field of the [slot card](orders.md#get-slot) shows whether you can cancel right now and when cancellation opens; it usually opens `min_hours` hours after the current attempt started.

Right: `money` · [`Idempotency-Key`](errors.md#idempotency) required

Response `200`:

```json
{"status": "cancel_pending", "slot_id": "3307-1185", "refunded": null}
```

| `status` | What it means |
|---|---|
| `cancelled` | No link was issued for the slot: the slot is cancelled, `refunded` is the refund amount |
| `cancel_pending` | A link was issued: the platform will check the exchange in 10 minutes. Not passed — the slot is cancelled with a refund; passed — the slot completes without a refund |
| `cancel_checking` | The cancellation is waiting for the exchange's answer, your re-upload or a manual review |

The outcome arrives in the feed: `slot_status` `CANCELLED` with `reason: "client_cancel"` and a `balance` event with the refund — or `slot_status` `COMPLETED`.

| HTTP | `code` | When |
|---|---|---|
| 409 | `reverify_cancel_too_early` | Cancellation hasn't opened yet; `min_hours` is how many hours after the attempt starts it opens |
| 409 | `reverify_cancel_needs_reupload` | The slot is waiting for a [re-upload](slot-actions.md#post-reupload) — do that first |
| 409 | `reverify_cancel_after_face` | Risk Removal: the face check has passed, only support can cancel |
| 409 | `reverify_cancel_forbidden` | In this state, support is handling the slot |
| 409 | `slot_already_closed` | The slot is already closed |
| 409 | `cancel_blocked_admin_review` | Support is already closing this slot — you'll be notified of the outcome |
| 404 | `slot_not_found` | Also returned for a slot that isn't a re-verification |
