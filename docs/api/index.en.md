# Getting started

With the API, you can buy and publish orders, upload accounts to them and track slots — without the bot or the web app.

## Access {#access}

Access is free and enabled on request: contact support at [@freidbase](https://t.me/freidbase). Once it's enabled, a "🔑 API" button appears in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot), and in the web app [app.kycportal.org](https://app.kycportal.org) the "API" section (the "Tools" group) shows a "Create key" button.

## Keys {#keys}

- A key is the string `kp_live_` followed by 43 more characters.
- You can have up to **10** active keys.
- Rights are chosen when the key is created and can't be changed later; for a different set, create a new key ([rights](#scopes)).
- A key can be restricted to a list of up to **20** IPv4 or IPv6 addresses and subnets like `203.0.113.0/24`. An empty list means any IP. If your server also connects to the internet over IPv6, add its IPv6 address too.

!!! warning
    A key is shown once — when it's created. Save it right away. Anyone who has the key controls the account within the key's rights: if you lose it or suspect a leak, revoke it.

### Create a key in the bot

1. In your private chat with [@kycportal_bot](https://t.me/kycportal_bot), tap "🔑 API", then "➕ New key".
2. Send a name for the key — up to 64 characters.
3. Switch on the rights you need — "▫️ Upload accounts", "▫️ Money" — and tap "Continue".
4. Send the IP addresses or subnets separated by commas or spaces — or tap "Any IP".
5. Tap "✅ Create". The key arrives in a separate message; tap it to copy. Save it and tap "✅ I saved it". After 10 minutes, the message deletes itself.

### Create a key in the web app

1. Open the "API" section and tap "Create key".
2. Fill in "Name", select the "Rights" you need and, if needed, "Allowed IPs (optional)". Tap "Create key".
3. Tap "Copy key", then "I saved the key". Once the window is closed, the key can't be shown again.

### Revoke a key

- **In the bot:** "🔑 API" → the key's button "🗑 name …1234" → "🗑 Revoke".
- **In the web app:** "Revoke" next to the key, then "Revoke" in the confirmation window.

Revoking is final and takes effect from the next request. While API access is turned off, keys aren't shown; to revoke a key during that time, ask support.

## Authentication {#auth}

The API base URL is `https://app.kycportal.org/api/v1`; paths in this documentation are relative to it. Pass the key in the `Authorization: Bearer <key>` header of every request.

```bash
curl https://app.kycportal.org/api/v1/ping \
  -H "Authorization: Bearer $KP_API_KEY"
```

Response `200`:

```json
{"client_id": 123456789, "scopes": ["read", "upload"]}
```

`client_id` is your account number (Telegram ID), and `scopes` lists the key's rights. If the key isn't accepted, the response is `401` or `403` ([codes](errors.md#codes)).

## Key rights {#scopes}

| Right | When creating a key | What it allows |
|---|---|---|
| `read` | "Read", every key has it | All read requests, the event feed, the top-up address |
| `upload` | "Upload accounts" | Uploading and replacing accounts and proxies, publishing, re-uploading, Check KYC, the BingX code, deposit screenshots, accounts and screenshots for a bulk re-verification |
| `money` | "Money" | Everything that charges or refunds money: buying orders and subscriptions, launching and retrying a bulk re-verification, cancellations |

Rights are independent: you can grant `money` without `upload` and vice versa. The right a method needs is stated on its page.

## General rules {#conventions}

Field types in method descriptions:

| Type | What it looks like in JSON |
|---|---|
| string | `"adspower"` |
| integer | `42` |
| yes/no | `true` or `false` |
| amount | A string with a decimal point, in US dollars: `"12.50"`. Pass amounts as strings in requests too |
| time | ISO 8601 in UTC: `"2026-10-30T12:00:00Z"`, sometimes with fractions of a second: `"2026-10-30T12:00:00.123456Z"` |
| number | An order, slot or executor number: `"8402-9173"` |
| list | `["read", "upload"]` |
| object | `{"step": "awaiting_code", …}` |

"or `null`" after a type means the field can be `null`.

- Requests and responses are JSON. Methods with files take `multipart/form-data`.
- Every response field is always present; if there's no value, it's `null`.
- New fields and code values are added over time — ignore the ones you don't recognize.
- Pass other IDs (an event's `id`, `batch_id`, a screenshot's `id`) back exactly as you received them.
- Durations are integers; the unit is in the field name: `…_seconds`, `min_hours`, `duration_days`.
- Set the HTTP timeout to at least 120 seconds: methods that reach the exchange through your proxy can take up to a minute and a half to respond.

### Pagination {#pagination}

`GET /orders`, `GET /slots`, `GET /reverify` and `GET /transactions` return paginated lists:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | no | From 1 to 100, default 20 |
| `offset` | integer | no | From 0 to 10 000, default 0 |

```json
{"items": [], "total": 57, "offset": 0, "limit": 20}
```

Newest records come first. For the next page, pass `offset + limit`; continue while `offset` is less than `total`. The `members` field of `GET /team` is paginated the same way.

## Workflow {#flow}

1. Choose a product and a price: [`GET /catalog`](orders.md#get-catalog).
2. Buy an order: [`POST /orders`](orders.md#post-orders).
3. Upload accounts — [`POST /orders/{order_id}/upload`](upload.md#post-upload) — and poll [`GET /orders/{order_id}/upload`](upload.md#get-upload) until the check finishes. Upload the rejected accounts again.
4. Once every slot has an account, publish the order: [`POST /orders/{order_id}/publish`](upload.md#post-publish).
5. Poll the feed [`GET /events`](events.md#get-events) every 10–30 seconds.
6. On `slot_action_required` or `REUPLOAD_REQUIRED`, read the [slot](orders.md#get-slot) and do what `waiting_for_client` says: [BingX code](slot-actions.md#post-bingx-code), [deposit screenshots](slot-actions.md#post-slot-risk-proofs) or [re-upload](slot-actions.md#post-reupload).
