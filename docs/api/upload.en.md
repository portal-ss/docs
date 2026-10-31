# Uploading and publishing

### Upload accounts {#post-upload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Uploads accounts to the order's empty slots and queues them for a background check. Available until the order is published (`PAID`, `SESSION_UPLOADED`).

Right: `upload` · [`Idempotency-Key`](errors.md#idempotency) required

| Form field | Type | Required | Description |
|---|---|---|---|
| `method` | string | yes | `adspower` or `manual` |
| `ads_file` | file | with `adspower` | An ADS Power `.txt` export: up to 20 MB, up to 200 profiles |
| `proxies` | string | with `manual` | Proxies, one per line, in the order of the files; up to 1 MB |
| `cookie_files` | file, repeated | with `manual` | One cookies file per account: up to 8 MB, up to 32 MB in total |
| `positions` | string | no | With `manual`: your account numbers, comma-separated (`1,3`), for `at` and `upload_position` |
| `replace_all` | yes/no | no | `true` — clear all untaken slots and fill them from the file |
| `replace_slot_id` | number | no | Replace the account in one untaken slot; if the new one is rejected, the old one stays |

The body is `multipart/form-data` with a `Content-Length` header: up to 34 MB in total and no more than 200 accounts. The format is [below](#format).

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/upload \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F method=manual \
  -F "proxies=<proxies.txt" \
  -F cookie_files=@acc1.json \
  -F cookie_files=@acc2.json
```

For ADS Power: `-F method=adspower -F ads_file=@export.txt`.

Response `200`:

```json
{"state": "queued", "staged_slot_ids": ["5120-3562", "5120-3563"]}
```

`staged_slot_ids` are the slots the accounts went into, in file order. The check result is in [`GET /orders/{order_id}/upload`](#get-upload).

| HTTP | `code` | When |
|---|---|---|
| 409 | `upload_not_allowed` | The order is already published |
| 409 | `upload_in_progress` | The previous upload to this order is still being checked |
| 429 | `upload_concurrency_limit` | You already have 2 uploads being checked, counting the bot and the web app; `limit`, no `Retry-After` |
| 409 | `too_many_uploads` | The same limit, hit by concurrent requests |
| 409 | `nothing_to_upload` | The order has no empty slot |
| 422 | `nothing_to_upload` | The file has no accounts |
| 409 | `nothing_to_replace` | The slot from `replace_slot_id` is already taken, or the order is published |
| 409 | `edit_not_allowed` | The slot from `replace_slot_id` can't be changed |
| 404 | `order_not_found` | The slot from `replace_slot_id` isn't in the order |
| 409 | `replace_all_reverify` | `replace_all` on a re-verification order |
| 409 | `replace_account_reverify` | `replace_slot_id` on a re-verification order |
| 422 | [parsing codes](codes.md#upload-codes) | The file, cookies or proxy can't be read; `at` is the account number, `issues` lists all the problems |
| 422 | `missing_file` | No file or proxies for the chosen `method` |
| 422 | `invalid_method` | `method` is neither `adspower` nor `manual` |
| 422 | `proxy_count_mismatch` | The number of proxy lines doesn't match the number of cookies files |
| 422 | `empty_file` | An empty file; `kind` says which |
| 413 | `upload_too_large` | The request is over 34 MB, or the cookies together are over 32 MB; `limit` |
| 413 | `file_too_large` | A file is over its limit; `kind` says which |
| 413 | `too_many_items` | More than 200 accounts; `limit` |
| 411 | `length_required` | No `Content-Length` (a chunked body) |
| 415 | `unsupported_media_type` | The body is over 64 KB but isn't `multipart/form-data` |
| 400 | — | A malformed form (a field over 1 MB, too many fields); `detail` holds text instead of a code |
| 503 | `queue_unavailable` | The platform is busy, nothing was done; retry after `retry_after_seconds` or in a few seconds |

### Get the upload status {#get-upload}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Progress and result of the latest upload check. Poll every 3–5 seconds until `state` becomes `done` or `failed`.

Right: `read`

Response `200`:

```json
{
  "state": "done",
  "done": 2,
  "total": 2,
  "ok": 1,
  "all_filled": false,
  "slots": [
    {"slot_id": "5120-3562", "ok": true, "account_identity": "user1@example.com", "error_code": null,
     "conflict_slot_id": null, "country": "UA", "ip": "203.0.113.10", "upload_position": 1, "adspower_profile_name": null},
    {"slot_id": "5120-3563", "ok": false, "account_identity": null, "error_code": "proxy_timeout",
     "conflict_slot_id": null, "country": null, "ip": null, "upload_position": 2, "adspower_profile_name": null}
  ],
  "error": null,
  "deadline_at": null,
  "ignored": 0,
  "cleared": false
}
```

| Field | Description |
|---|---|
| `state` | `idle` — no checks, or the outcome is more than an hour old; `queued`, `running`, `done`, `failed` |
| `done`, `total`, `ok` | Checked / total / accepted |
| `all_filled` | `true` — every slot in the order has an account, and the order can be [published](#post-publish) |
| `slots[].account_identity` | The account the exchange found |
| `slots[].error_code` | [Why the account was rejected](codes.md#upload-codes); `null` — accepted |
| `slots[].conflict_slot_id` | With `duplicate_account_other_slot` — the slot in this order that has the same account |
| `slots[].country`, `slots[].ip` | The proxy's exit country (ISO-2) and IP |
| `slots[].upload_position` | The account number: from `positions`, or its position in the request, from 1 |
| `error` | Why a `failed` check stopped: `timeout`, `cancelled`, `probe`, `payload` or `requeue` |
| `deadline_at` | While the check is running: the check won't run past this time |
| `ignored` | Accounts beyond the free slots; they aren't saved |
| `cleared` | An upload with `replace_all` has already cleared the slots |

If `failed`, the accepted accounts are kept — send the rest again.

### Change a proxy before publishing {#post-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/proxy</code></div>

Changes the proxy of an uploaded slot that hasn't been taken yet, before publishing; the saved account is re-checked through the new proxy. The response can take up to 90 seconds.

Right: `upload`

| Body field | Type | Required | Description |
|---|---|---|---|
| `proxy` | string | yes | The new proxy, up to 512 characters |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3563/proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.12:8000:login3:pass3"}'
```

Response `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | When |
|---|---|---|
| 409 | `edit_not_allowed` | The order is published, the slot is taken, or it has no account |
| 422 | `invalid_proxy`, `private_proxy`, `parse_proxy_has_spaces`, `parse_proxy_no_port`, `parse_proxy_non_latin` | The proxy can't be read ([codes](codes.md#upload-codes)) |
| 409 | [check codes](codes.md#upload-codes) | The account failed the check through the new proxy, for example `proxy_broken`, `session_invalid` |
| 409 | `reupload_identity_mismatch` | The exchange showed a different account from the one in the slot |
| 409 | `reupload_identity_unavailable` | The slot's account is unknown; contact support |
| 409 | `check_in_flight` | The slot is being checked right now; retry later |
| 409 | `upload_in_progress` | An upload to this order is in progress |
| 429 | `client_exchange_busy` | 3 checks of your accounts are already running at once; `limit` |
| 504 | `proxy_probe_timeout` | The exchange didn't respond through the proxy in time |
| 502 | `upload_check_failed` | The account couldn't be checked; retry later |

### Publish an order {#post-publish}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/publish</code></div>

Publishes the order: the slots go to executors, the order moves to `IN_PROGRESS`, and the fulfillment deadline starts running. Every slot must have an account and a proxy. If the [order](orders.md#get-order) has `freezes_on_publish: true`, the slots freeze right away until the subscription is renewed.

Right: `upload`

Response `200`:

```json
{"status": "published"}
```

| HTTP | `code` | When |
|---|---|---|
| 409 | `publish_not_ready` | The order isn't `SESSION_UPLOADED`: it has empty slots or is already published, including by a previous request |
| 409 | `publish_proxy_required` | The slots listed in `slots` have no proxy |
| 409 | `publish_session_required` | The slots listed in `slots` have no account |
| 409 | `publish_in_bot` | A re-verification order — it's published automatically |

## Upload format {#format}

- `adspower` — one unedited ADS Power export: one profile fills one slot, and the proxy is taken from the profile.
- `manual` — `proxies` holds one proxy per line, `cookie_files` one file per account: the first line goes to the first file. Cookies are sent only as file parts, not as a text field.
- Cookie and proxy formats are the same as in [Uploading accounts](../guide/upload.md); `{"cookies": [...]}` (Playwright) and a `{"name": "value"}` object are also accepted. Only the cookies of the order's exchange are taken from the file.
- A rejected account doesn't go into the slot. Send only the rejected ones — in a new request with a new `Idempotency-Key`.
