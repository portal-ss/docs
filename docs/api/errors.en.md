# Errors and limits

## Error format {#format}

An error is returned with a 4xx or 5xx status and this body:

```json
{"detail": {"code": "price_changed", "price": "13.00", "total": "65.00",
  "message": "The live price is above the one you sent; nothing was charged. See 'price' and 'total'."}}
```

- `code` — a stable code. Decide what to do based on the HTTP status and `code`.
- `message` — an English sentence for logs. It may change — don't parse it.
- Other fields add details to the code; the tables below list which ones can appear.
- For an unknown code: 4xx — change the request; 5xx — retry later.
- A malformed multipart form (a field over 1 MB, too many fields) gets a `400` response where `detail` is a string without a `code`.

## Common errors {#codes}

Any method can return these. A method's own errors are on its page.

| HTTP | `code` | What it means and what to do |
|---|---|---|
| 401 | `invalid_api_key` | No key, the header isn't `Authorization: Bearer <key>`, or there's no such key |
| 401 | `api_key_revoked` | The key has been revoked — create a new one |
| 403 | `api_not_enabled` | API access is turned off. Your keys are kept and will work again once access is restored. Contact support |
| 403 | `banned` | The account is blocked — contact support |
| 403 | `ip_not_allowed` | The request IP isn't on the key's list |
| 403 | `scope_required` | The key lacks the right named in `scope` — create a key with that right |
| 404 | `order_not_found` | You have no such order. Someone else's order and a nonexistent one get the same response |
| 404 | `slot_not_found` | You have no such slot in this order — on any path with a slot, even if the order number is wrong |
| 404 | `not_found` | No such method |
| 405 | `method_not_allowed` | The method doesn't accept this HTTP verb |
| 411 | `length_required` | A form with a file was sent in chunks — `Content-Length` is required |
| 413 | `payload_too_large` | The body is larger than [allowed](#request-size) |
| 415 | `unsupported_media_type` | A method with files expects `multipart/form-data` |
| 422 | `validation_error` | The request doesn't match the documentation; `field` shows where the first error is: `body.quantity`, `query.limit`, `header.Idempotency-Key`. A request without a required `Idempotency-Key` gets the same response |
| 422 | `invalid_idempotency_key` | `Idempotency-Key` isn't in the right [format](#idempotency) |
| 422 | `idempotency_key_reused` | This `Idempotency-Key` has already been used for a different request — new action, new key |
| 409 | `idempotency_in_progress` | A request with this `Idempotency-Key` is still running — retry in a few seconds with the same key |
| 429 | `rate_limited` | The [limit](#limits) is exceeded — wait `Retry-After` seconds |
| 500 | `internal_error` | A platform failure — retry later; if it keeps happening, contact support |
| 503 | `try_again` | Nothing was done — retry with the same `Idempotency-Key` |
| 503 | `queue_unavailable` | The platform is busy, nothing was done — retry in a few seconds (after `retry_after_seconds`, if it's present) |

## Request limits {#limits}

| Counter | Limit | Methods |
|---|---|---|
| Read | 300 per 60 s | Every `GET` |
| Write | 60 per 60 s | Every `POST`, `PUT`, `DELETE` |
| Lists | 60 per 60 s | `GET /orders`, `/slots`, `/reverify`, `/transactions`, `/team` |
| Feed | 30 per 60 s | `GET /events` |
| Upload | 20 per 60 s | `POST /orders/{order_id}/upload`, `…/slots/{slot_id}/proxy`, `…/reupload`, `…/replace-proxy`, `…/start-proxy-replace`, `POST /reverify/batches` |
| Money | 15 per 60 s | `POST /orders`, `POST /subscription`, `…/cancel`, `…/cancel-frozen`, `…/cancel-reverify`, `POST /reverify/batches/{batch_id}/execute`, `…/retry` |
| Check KYC | 60 per 3600 s | `POST …/check-kyc` |
| New BingX code | 60 per 60 s | `POST …/bingx-code/refresh` |

- Every counter is kept both per key and per account: a request goes through only if neither is exceeded. Ten keys don't give you ten limits.
- A request counts against the general counter (read or write) and against its own counter, if it has one: `GET /orders` counts as one read and one list request.
- The window is fixed: it starts with the first request in the window. Rejected requests count too.
- Over the limit, you get `429 rate_limited` with a `Retry-After` header: the seconds until the window ends.
- After 30 `invalid_api_key` responses within 60 seconds from one IP, all requests from that IP get `429 rate_limited` until the end of the window — even with a valid key.

### Concurrent operations

The refusal lifts once the operation already running finishes. Only `cooldown` comes with `Retry-After`.

| What | How many | Response |
|---|---|---|
| Uploads being checked — across all orders, together with the bot and the web app | 2 per account | `429 upload_concurrency_limit`, `409 too_many_uploads` |
| Checking an upload to one order | 1 | `409 upload_in_progress` |
| Exchange calls for your slots: Check KYC, proxy change, re-upload | 3 | `429 client_exchange_busy` |
| Checking one slot | 1; the next one in 30 s, or 15 s after a failed one | `409 check_in_flight`, `429 cooldown` |
| Purchase | 1 | `409 purchase_in_progress` |
| Checking a bulk re-verification batch | 1 | `409 reverify_validate_in_progress` |
| Launching a bulk re-verification | 1 | `409 reverify_in_progress` |

### Request size {#request-size}

| Request | Limit |
|---|---|
| The JSON body of any method except those below | 64 KB |
| `PUT /reverify/batches/{batch_id}/proofs` | 1 000 000 bytes |
| `POST /orders/{order_id}/upload`, `POST /reverify/batches` | 34 MB; an ADS Power file up to 20 MB; a cookies file up to 8 MB, all of them together up to 32 MB; the `proxies` field up to 1 MB; up to 200 accounts |
| `POST …/slots/{slot_id}/reupload` | 22 MB |
| `POST /risk-proofs/files` | 18 MB |

A body over 64 KB is accepted only by methods with files, and only as `multipart/form-data`.

## Idempotency-Key {#idempotency}

The header is required on nine methods: `POST /orders`, `POST /subscription`, `POST /orders/{order_id}/upload`, `POST /reverify/batches`, `POST /reverify/batches/{batch_id}/execute`, `…/retry`, `POST /orders/{order_id}/cancel`, `…/cancel-frozen`, `POST …/slots/{slot_id}/cancel-reverify`.

- **Format:** 8–64 characters — Latin letters, digits, `-`, `_`. A UUID works.
- **New action — new key.** Use the same key only to retry the same request: the method, path, parameters and body, byte for byte. When retrying, send the saved body instead of rebuilding it.
- **Keys are shared across the account:** the same `Idempotency-Key` from two API keys is one request.
- **A successful response is kept for 24 hours.** A retry gets that same response with an `Idempotent-Replayed: true` header; nothing is executed a second time.
- **Errors aren't remembered:** after a 4xx or 5xx response, a retry with the same key is executed again.
- **Order and subscription purchases** are remembered longer: a retry with the same key won't buy a second time even a day later. So don't use one purchase's key for another purchase.

`POST /risk-proofs/files` has its own optional `X-Upload-Key` header (a UUID): a retry with it within 24 hours returns the same screenshot.
