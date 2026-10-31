# Event feed

### Get events {#get-events}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/events</code></div>

Returns events for your orders, slots and balance that came after the cursor.

Right: `read`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `cursor` | string | no | The cursor from the previous response; without it, the feed starts from now |

Response `200`:

```json
{
  "events": [
    {"id": "3f9c2a7b1e0d4c58a6b2f1e9d0c7a4b3", "at": "2026-10-30T11:40:02Z", "kind": "slot_action_required",
     "order_id": "8402-9173", "slot_id": "5120-3562", "status": "BINGX_FACE_OFF",
     "balance_event": null, "cash_delta": null, "referral_delta": null,
     "action": "bingx_code", "reason": "first", "notice": null},
    {"id": "a1b2c3d4e5f60718293a4b5c6d7e8f90", "at": "2026-10-30T11:42:10Z", "kind": "balance",
     "order_id": "8402-9173", "slot_id": null, "status": null,
     "balance_event": "refund", "cash_delta": "8.00", "referral_delta": "0.00",
     "action": null, "reason": null, "notice": null}
  ],
  "cursor": "gAAAAABn…",
  "has_more": false
}
```

| Event field | Description |
|---|---|
| `id` | The event ID; use it to filter out duplicates |
| `kind` | [Event kind](#events) |
| `order_id` | For `balance`, set only if the balance change relates to your order |
| `status` | For `order_status` and `slot_status` — the new status ([slot](codes.md#slot-statuses), [order](codes.md#order-statuses)); for a request or notice — the status at that moment |
| `balance_event` | `balance` only: the [kind of change](codes.md#balance-events) |
| `cash_delta`, `referral_delta` | `balance` only: the change in the main and referral balance; negative means a charge |
| `action` | `slot_action_required` only: [what to do](codes.md#actions) |
| `reason` | For a request — [the request reason](codes.md#ask-reasons); for `CANCELLED` — [why the slot was closed](codes.md#close-reasons); for `COMPLETED` on a BingX slot — [the second-stage outcome](codes.md#bingx-endings). `null` on old events |
| `notice` | `slot_notice` and `order_notice` only: [what the notice is about](codes.md#notices) |

| HTTP | `code` | When |
|---|---|---|
| 410 | `cursor_expired` | The cursor is older than 7 days |
| 422 | `invalid_cursor` | The cursor wasn't issued by this API |

## Cursor {#cursor}

- The first request has no cursor: you get an empty `events` list, a fresh `cursor` and `has_more: false`. What happened earlier is in the order and slot lists.
- After that, send the `cursor` from the latest response. Save it so you can continue from the same place after a restart.
- `has_more: true` means only part of the events was returned: request again right away. Such a batch may contain fewer events than usual, or even none.
- A cursor is valid for 7 days and is renewed by regular polling, even when there are no events.
- On `410 cursor_expired` and `422 invalid_cursor`, re-read the lists and start the feed without a cursor.
- Don't parse or build the cursor yourself.

## Delivery

Every event is delivered at least once and may be delivered again.

- Every request also returns the events from the 60 seconds before the previous request, so events recorded with a delay aren't lost. Skip events with an `id` you've already seen — keeping the `id`s for 10 minutes is enough.
- Rarely, after platform maintenance, recent events arrive again under new `id`s. So read the slot before acting: if it's no longer waiting for anything, do nothing.
- Within one response, events are sorted by `at`, but a delayed event may arrive after a newer one. For the current state, read the slot or order.

## Event kinds {#events}

| `kind` | When it arrives |
|---|---|
| `order_status` | An order's status changed |
| `slot_status` | A slot's status changed. `REUPLOAD_REQUIRED` — the slot is waiting for a [re-upload](slot-actions.md#post-reupload); for `CANCELLED`, the reason is in `reason`, and the refund arrives as a separate `balance` event |
| `balance` | A balance change: a top-up, a charge, a refund, a referral bonus, an adjustment |
| `slot_action_required` | The slot is waiting for your action, even if its status didn't change: read the [slot](orders.md#get-slot) and respond according to `action` |
| `slot_notice` | A notice about a slot without a status change |
| `order_notice` | A notice about an order without a status change |

- A BingX slot was waiting for a code and then needed a re-upload. If only the proxy is replaced, a new `slot_action_required` arrives with the same reason. After new cookies, the second stage starts over, and the request arrives with a new BingX email.
- Every `order_frozen` is later followed by an `order_unfrozen` if the order is still open when the subscription is renewed. `order_unfrozen` may also arrive without an `order_frozen`.

## Polling loop

1. At startup, get a cursor — `GET /events` with no parameters — then read `GET /slots?attention=true` and respond to what the slots are waiting for. The first request with this cursor replays the last 60 seconds, so nothing gets lost in between.
2. Every 10–30 seconds, call `GET /events?cursor=…`; if `has_more: true`, call again right away.
3. Handle the events with a new `id` and save the new cursor.
4. `410` or `422` — go back to step 1. `429` — wait `Retry-After` and retry with the same cursor. A network failure or `5xx` — retry with the same cursor in 10–30 seconds. `401` or `403` — stop: the key is revoked, access is turned off or the IP isn't on the key's list.
