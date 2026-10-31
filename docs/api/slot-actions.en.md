# Slot actions

The `waiting_for_client` field of the [slot card](orders.md#get-slot) shows what the slot needs from you ([values](codes.md#waiting)).

## Re-upload and proxy

A `REUPLOAD_REQUIRED` slot is paused: its deadlines are on hold, and the slot isn't cancelled or passed to another executor. The slot card's `reupload_scope` field says what to send. `reupload` and `replace-proxy` check the account on the exchange through the slot's proxy — the response can take up to a minute and a half.

Check errors common to `reupload` and `replace-proxy`:

| HTTP | `code` | When |
|---|---|---|
| 409 | [check codes](codes.md#upload-codes) | The exchange rejected the account or the proxy, for example `session_invalid`, `proxy_broken`, `exchange_unreachable` |
| 409 | `exchange_transient` | The exchange didn't respond, but the proxy works; nothing has changed — retry |
| 409 | `reupload_scope_changed` | The slot now needs more — read the slot and send what it asks for |
| 409 | `check_in_flight` | Another check is running on the slot — retry in a few seconds |
| 409 | `upload_in_progress` | An upload check is running on the order |
| 429 | `client_exchange_busy` | 3 exchange calls for your slots are already running (`limit`); no `Retry-After` |
| 504 | `proxy_probe_timeout` | The exchange didn't respond through this proxy in time |
| 502 | `upload_check_failed` | A platform failure — retry later |

### Re-upload an account {#post-reupload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/reupload</code></div>

Sends fresh cookies (and, if needed, a new proxy) to a slot with `reupload_scope` `session` or `full`. One account only — the one that was in the slot; the whole request is up to 22 MB.

Right: `upload`

| Form field | Type | Required | Description |
|---|---|---|---|
| `method` | string | yes | `adspower` or `manual` |
| `ads_file` | file | with `adspower` | An ADS Power export with one profile, up to 20 MB; for `full`, with a proxy |
| `cookie_files` | file | with `manual` | A cookies file, up to 8 MB; only the first one is read |
| `proxies` | string | with `full` and `manual` | One proxy line |
| `replace_proxy` | yes/no | no | `true` with `session` — replace the proxy too (the upload is handled as `full`) |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/reupload \
  -H "Authorization: Bearer $KP_API_KEY" \
  -F method=manual \
  -F "proxies=203.0.113.21:8000:login5:pass5" \
  -F cookie_files=@fresh.json
```

Response `200`:

```json
{"status": "ok"}
```

`ok` — the slot carries on from where it stopped. `proxy_broken` or `proxy_missing` — the cookies were accepted, but the saved proxy doesn't work either: the slot now asks for `full`.

| HTTP | `code` | When |
|---|---|---|
| 409 | `reupload_not_allowed` | The slot isn't waiting for a re-upload |
| 409 | `use_replace_proxy` | The slot is waiting only for a proxy — send it to [`replace-proxy`](#post-replace-proxy) |
| 409 | `reupload_identity_mismatch` | The cookies are from a different account |
| 409 | `reupload_identity_unavailable` | This slot can't be updated — contact support |
| 422 | `reupload_single_account` | The ADS Power export has more than one profile |
| 422 | `proxy_missing` | No proxy was passed for `full` |
| 422 | `export_proxy_missing` | For `full`: the ADS Power profile has no proxy |
| 422 | `parse_error` | The ADS Power export has no account |
| 422 | `missing_file`, `invalid_method` | No file for the chosen `method`, or an invalid `method` |
| 422 | [parsing codes](codes.md#upload-codes) | The cookies or proxy can't be read |
| 413 | `file_too_large` | The request is over 22 MB, or a file is over its limit |

### Replace the proxy {#post-replace-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/replace-proxy</code></div>

Sends a new proxy to a slot with `reupload_scope: "proxy"`. The saved cookies are re-checked through the new proxy.

Right: `upload`

| Body field | Type | Required | Description |
|---|---|---|---|
| `proxy` | string | yes | A proxy line, up to 512 characters |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/replace-proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.20:8000:login4:pass4"}'
```

Response `200`:

```json
{"status": "ok"}
```

`ok` — the slot carries on from where it stopped. `session_invalid` or `cookie_jar_too_large` — the proxy was saved, but the cookies don't work either: the slot now asks for `full`; send a [`reupload`](#post-reupload).

| HTTP | `code` | When |
|---|---|---|
| 409 | `proxy_replace_not_allowed` | The slot isn't waiting for a new proxy |
| 422 | [parsing codes](codes.md#upload-codes) | The proxy line can't be read: `invalid_proxy`, `private_proxy`, `parse_proxy_*` |

### Pause a slot to replace its proxy {#post-start-proxy-replace}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/start-proxy-replace</code></div>

Pauses the slot until a new proxy arrives; use it when the proxy works but the exchange doesn't open through it (`check-kyc` returned `409 exchange_unreachable`). The slot becomes `REUPLOAD_REQUIRED` with `reupload_scope: "proxy"` — send the proxy to [`replace-proxy`](#post-replace-proxy). Available for `FREE` slots in a published order and for `IN_PROGRESS` and `VERIFICATION_FAILED` slots.

Right: `upload`

Response `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | When |
|---|---|---|
| 409 | `reupload_required` | The slot is already waiting for a re-upload |
| 409 | `slot_no_session` | The slot has no account |
| 409 | `edit_not_allowed` | The slot is in a different status or the order isn't published — before publishing, use [`POST …/proxy`](upload.md#post-proxy) |

## Status check

### Check the verification status {#post-check-kyc}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/check-kyc</code></div>

Asks the exchange for the slot's verification status; if the exchange confirms success, the slot counts as completed. The `check_kyc_available` field of the [slot card](orders.md#get-slot) shows whether a check is available right now. The response can take up to a minute and a half.

Right: `upload`

Response `200`:

```json
{"action": "pending", "status": "pending", "order_done": false, "verification_type": "INITIAL_KYC"}
```

`action` is what the check did with the slot:

- `result_only` — no executor has the slot yet: the result is only reported, and the slot doesn't change;
- `stale` — the slot changed during the check: read it again;
- `reupload_required` — the proxy or the login doesn't work: the slot is paused and waiting for a [re-upload](#post-reupload); `status` is `proxy_broken`, `proxy_missing`, `session_invalid` or `cookie_jar_too_large`;
- other values (`passed_completed`, `mexc_hold_started`, `wrong_country_cancelled`, `blocked_cancelled` and others) — the outcome for a slot held by an executor; `status` explains it.

`order_done: true` means this check completed the whole order. `verification_type` is what was checked, for example `MEXC_FACE_SECURITY`.

| `status` | What it means |
|---|---|
| `passed` | The verification has passed |
| `mexc_hold` | MEXC: the verification has passed, and the observation period has started |
| `bingx_face_off_started` | BingX: KYC has passed, and the second stage has started — wait for a [code request](#bingx) |
| `bingx_review_held` | BingX: KYC has passed, support will review the slot; nothing is needed from you |
| `risk_face_passed` | Risk Removal: the face check has passed, the appeal comes next |
| `wrong_country` | Passed with a country other than the order's. With `action: "wrong_country_cancelled"`, the slot is cancelled and the money refunded |
| `pending` | The exchange is reviewing the verification |
| `available` | No application yet; for a re-verification — no check is required right now |
| `failed` | The attempt was rejected; another one is possible |
| `face_not_submitted` | The face check is open but not passed yet |
| `blocked` | The exchange doesn't allow verification on the account. With `action: "blocked_cancelled"`, the slot is cancelled and the money refunded; for a re-verification, support decides |
| `already_verified` | With `result_only`: the account had been verified before the upload |
| `stale` | The slot changed during the check |
| `unknown` | The exchange's answer wasn't recognized |

| HTTP | `code` | When |
|---|---|---|
| 409 | `slot_no_session` | The slot has no account |
| 409 | `proxy_missing` | The slot has no proxy |
| 409 | `reupload_required` | The slot is waiting for a [re-upload](#post-reupload) |
| 409 | `no_link_yet` | The executor has taken the slot but hasn't started the verification yet |
| 409 | `check_not_available` | A check isn't available in this status; `status` is the slot status |
| 409 | `check_in_flight` | Another check is running on the slot — retry in a few seconds |
| 429 | `cooldown` | The slot was checked less than 30 seconds ago (15 after a failed check); `seconds` and `Retry-After` say how long to wait |
| 429 | `client_exchange_busy` | 3 exchange calls for your slots are already running (`limit`); no `Retry-After` |
| 409 | `exchange_transient` | The exchange didn't respond, but the proxy works; nothing has changed — retry |
| 409 | `exchange_unreachable` | The proxy works, but the exchange doesn't open through it — [replace the proxy](#post-start-proxy-replace) |
| 409 | `proxy_broken`, `session_invalid`, `cookie_jar_too_large` | The account data doesn't work, but the slot can't be paused — for example, it isn't published or is already closed |
| 409, 502 | `status_check_failed` | The status couldn't be read — retry later |

## BingX code {#bingx}

At the BingX second stage (a `BINGX_FACE_OFF` slot), you need the code from the email BingX sends to the account's mailbox. You have 60 minutes for the codes per slot; the clock runs only while `bingx.client_clock_running: true`. When time runs out, the slot completes with face login left on, and the money isn't refunded ([outcomes](codes.md#bingx-endings)).

1. Wait for a `slot_action_required` event with `action: "bingx_code"`; `reason` says why the code is requested ([values](codes.md#ask-reasons)).
2. Read the [slot](orders.md#get-slot): if `bingx.step: "awaiting_code"`, take the code from the latest email received no earlier than `bingx.code_sent_at`.
3. If `bingx.fresh_code_available: true` (the email is more than 10 minutes old), call [`refresh`](#post-bingx-refresh). You can skip this step: if the code has expired, the platform requests a new email itself.
4. Send the code to [`bingx-code`](#post-bingx-code).
5. Wait for the result in the feed: `slot_notice` with `notice: "bingx_code_accepted"` — the code was accepted; a new request with `reason: "wrong_code"` — send the code from the latest email again.

### Send the BingX code {#post-bingx-code}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code</code></div>

Passes on the code from the BingX email. One code is accepted per code request — the first one, wherever it's sent from: the bot, the web app or the API.

Right: `upload`

| Body field | Type | Required | Description |
|---|---|---|---|
| `code` | string | yes | Up to 32 characters; 4 to 8 digits once spaces are removed |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3562/bingx-code \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "123 456"}'
```

Response `200`:

```json
{"status": "accepted"}
```

`accepted` means the code was taken and sent to BingX, not "the code worked". The outcome arrives in the feed. The API never returns the code.

| HTTP | `code` | When |
|---|---|---|
| 409 | `not_open` | The slot isn't waiting for a code right now: it hasn't been requested yet, the code has already been taken, the slot is waiting for a re-upload or is closed, or it isn't the BingX second stage |
| 422 | `bad_format` | Not 4–8 digits once spaces are removed; nothing has changed |

### Request a new BingX code {#post-bingx-refresh}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code/refresh</code></div>

Checks whether the code in the latest email is still valid and, if needed, asks BingX to send a new one.

Right: `upload`

Response `200`:

```json
{"status": "resent"}
```

`still_fresh` — the code is less than 10 minutes old; send it. `resent` — BingX will send a new email, and a request with `reason: "stale_resent"` will arrive in the feed.

| HTTP | `code` | When |
|---|---|---|
| 409 | `not_open` | No code is expected right now, or your 60 minutes are over |

## Screenshots for Risk Removal

When new deposit screenshots are requested for a Risk Removal slot, a `slot_action_required` event with `action: "risk_proofs"` arrives. Upload each screenshot to [`POST /risk-proofs/files`](#post-risk-proofs-files), then send the set to [`POST …/risk-proofs`](#post-slot-risk-proofs). For what the screenshot must show, see [Risk Removal](../guide/risk-removal.md).

### Upload a deposit screenshot {#post-risk-proofs-files}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files</code></div>

Uploads one deposit screenshot. An unsent screenshot can be used for 23 hours. Optional `X-Upload-Key` header (a UUID): a retry with the same key within 24 hours returns the same `id`.

Right: `upload`

| Form field | Type | Required | Description |
|---|---|---|---|
| `file` | file | yes | JPEG, PNG, WebP or HEIC (detected by content); 10 KB – 18 MB; each side 300–12 000 pixels |

```bash
curl -X POST https://app.kycportal.org/api/v1/risk-proofs/files \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "X-Upload-Key: 6f1d3c1e-0000-4000-8000-000000000001" \
  -F file=@deposit-1.png
```

Response `201`:

```json
{"id": "0b6c2a7e-1111-4222-8333-444455556666", "size_bytes": 184321, "mime": "image/png"}
```

| HTTP | `code` | When |
|---|---|---|
| 422 | `proof_not_an_image` | Not a JPEG, PNG, WebP or HEIC, or there's no `file` part |
| 413 | `proof_too_large` | Larger than 18 MB |
| 422 | `proof_too_small` | Smaller than 10 KB, or the short side is under 300 pixels |
| 422 | `proof_dimensions_absurd` | A side is larger than 12 000 pixels |
| 429 | `proof_quota_exceeded` | 250 screenshots or 500 MB within 24 hours of the first upload (deleted ones count too), or already 120 unsent ones; `retry_after_seconds` |
| 409 | `proofs_upload_in_progress` | The first attempt with this `X-Upload-Key` is still being saved; `retry_after_seconds: 3` |
| 503 | `proofs_storage_busy` | The storage is busy; `retry_after_seconds: 5` |
| 503 | `proofs_storage_unavailable` | The storage is unavailable — retry later |

### Delete a screenshot {#delete-risk-proofs-file}

<div class="api-endpoint"><span class="api-method api-method--delete">DELETE</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files/{file_id}</code></div>

Deletes your own unsent screenshot.

Right: `upload`

Response `204` with no body.

| HTTP | `code` | When |
|---|---|---|
| 404 | `proof_file_not_found` | The screenshot wasn't found, belongs to someone else or has already been sent |

### Submit Risk Removal screenshots {#post-slot-risk-proofs}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/risk-proofs</code></div>

Sends new screenshots for a Risk Removal slot when they've been requested. The set fully replaces the slot's previous screenshots; it's free of charge.

Right: `upload`

| Body field | Type | Required | Description |
|---|---|---|---|
| `deposits` | list | yes | From 1 to 4 screenshots |
| `deposits[].file_id` | string | yes | `id` from [`POST /risk-proofs/files`](#post-risk-proofs-files) |
| `deposits[].source` | string | yes | Where the deposit came from, up to 64 characters; goes into the appeal as is |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/2210-4471/slots/3307-1186/risk-proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"},
                   {"file_id": "9d4e1f20-2222-4333-8444-555566667777", "source": "Trust Wallet"}]}'
```

Response `200`:

```json
{"slot_id": "3307-1186", "status": "RISK_REJECTED", "count": 2}
```

`status` is the slot status, and `count` is how many screenshots the slot now has. After sending, `risk_proofs` disappears from `waiting_for_client`.

| HTTP | `code` | When |
|---|---|---|
| 404 | `proof_file_not_found` | The screenshot wasn't found, belongs to someone else, has already been sent or is older than 23 hours |
| 422 | `proof_source_invalid` | An empty `source` |
| 409 | `risk_proofs_not_requested` | No new screenshots were requested for the slot, or the slot is closed |
| 409 | `risk_proofs_invalid` | The set was rejected |
| 404 | `slot_not_found` | Also returned for a slot that isn't Risk Removal |
