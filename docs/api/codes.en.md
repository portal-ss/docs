# Statuses and codes

## Slot statuses {#slot-statuses}

The slot's `status` field and the `slot_status` event.

| Value | What it means |
|---|---|
| `FREE` | Nobody has taken the slot: it's empty, has an account uploaded or is waiting for an executor after publishing |
| `IN_PROGRESS` | An executor has taken the slot and is completing the verification |
| `PENDING` | The exchange is reviewing the verification; deadlines are paused |
| `VERIFICATION_FAILED` | The exchange rejected the attempt, and the executor is retrying |
| `REUPLOAD_REQUIRED` | A fresh proxy, fresh cookies or both are needed; the slot is paused — [re-upload](slot-actions.md#post-reupload) |
| `MEXC_HOLD` | MEXC: the verification has passed, and the platform is waiting to see whether the exchange asks for a face check |
| `MEXC_FACE_REQUIRED` | MEXC has asked for a face check, and the executor is passing it at no extra charge |
| `BINGX_FACE_OFF` | BingX: KYC has passed, and the second stage is under way — turning off face login |
| `BINGX_REVIEW` | BingX: KYC has passed, but the slot couldn't be completed automatically; support is reviewing it |
| `RISK_AWAITING_DOCUMENT` | Risk Removal: the appeal is being prepared |
| `RISK_SUBMITTED` | Risk Removal: the appeal has been filed with MEXC |
| `RISK_FACE_EXPIRED` | Risk Removal: the face check has to be passed again; the same executor does it |
| `RISK_REJECTED` | Risk Removal: MEXC closed the appeal without lifting the restriction; support decides on the next steps |
| `RISK_ERROR` | Risk Removal: there's a problem with the appeal, and support is handling it |
| `COMPLETED` | The slot is completed |
| `CANCELLED` | The slot is closed; the reason is in [`close_reason`](#close-reasons) |

## Order statuses {#order-statuses}

The order's `status` field, the slot's `order_status` and the `order_status` event.

| Value | What it means |
|---|---|
| `PAID` | Paid, waiting for accounts to be uploaded |
| `SESSION_UPLOADED` | Every slot has an account, and the order is waiting to be published |
| `IN_PROGRESS` | Published; not all slots are closed yet |
| `COMPLETED` | All slots are completed |
| `PARTIAL_COMPLETED` | All slots are closed: some completed, some cancelled |
| `CANCELLED` | All slots are closed, none completed |

Very old orders may have the obsolete values `ACCESS_GRANTED`, `IN_POOL`, `PARTIAL`, `REFUNDED`, `MANUAL`.

## Verification outcome {#verification-results}

The slot's `verification_result` field. Values differ in letter case — compare the strings exactly as they are.

| Value | What it means |
|---|---|
| `passed` | Passed |
| `pending` | The exchange is still reviewing |
| `wrong_country` | Wrong country |
| `blocked` | The exchange doesn't allow verification on the account |
| `kyc_already_done` | The account had already been verified |
| `no_challenge_required` | No check was required |
| `admin_cancelled` | Cancelled by support |
| `DEADLINE_EXPIRED` | The deadline expired |
| `ACCOUNT_UNSERVABLE` | The exchange doesn't accept this account |
| `CLIENT_CANCELLED` | Cancelled by you |
| `failed`, `SUBSCRIPTION_LAPSED` | Obsolete, found only on old slots |

## What the slot needs from you {#waiting}

The slot's `waiting_for_client` field is a list. It's non-empty for exactly the slots that `GET /slots?attention=true` returns.

| Value | When | What to do |
|---|---|---|
| `reupload` | The slot is in `REUPLOAD_REQUIRED` status | Send what `reupload_scope` says (below) |
| `risk_proofs` | New deposit screenshots are needed for Risk Removal | [Send the screenshots](slot-actions.md#post-slot-risk-proofs) |
| `bingx_code` | A `BINGX_FACE_OFF` slot is waiting for the code from the BingX email | [Send the code](slot-actions.md#post-bingx-code) |

`reupload` and `risk_proofs` can be present at the same time. A slot waiting for a re-upload waits only for that — even if it was asking for a BingX code before.

The `reupload_scope` field — what to send on a re-upload:

| Value | What to send | Method |
|---|---|---|
| `proxy` | A new proxy | [`replace-proxy`](slot-actions.md#post-replace-proxy) |
| `session` | Fresh cookies from the same account | [`reupload`](slot-actions.md#post-reupload) |
| `full` | Both cookies and a proxy | [`reupload`](slot-actions.md#post-reupload) |

## What needs to be done {#actions}

The `action` field of the `slot_action_required` event.

| Value | What it means | What to do |
|---|---|---|
| `bingx_code` | BingX has emailed the account a code for the second stage | [Send the code](slot-actions.md#post-bingx-code) |
| `risk_proofs` | New deposit screenshots are needed for Risk Removal | [Send the screenshots](slot-actions.md#post-slot-risk-proofs) |

## Request reasons {#ask-reasons}

The `reason` field of the `slot_action_required` event and the slot's `bingx.code_ask_reason`. For any code request, send the code from the latest BingX email.

| Value | What it means |
|---|---|
| `first` | The first request: KYC has passed, and BingX has just sent the code |
| `new_code_sent` | BingX sent the code again |
| `wrong_code` | The code you sent didn't work — check it and send it again |
| `wrong_code_resent` | The code didn't work again, and BingX sent a new email — check every digit |
| `worker_ready` | The executor is ready to pass the face check again, and BingX sent a new code |
| `stale_resent` | The previous code expired (it works for about 10 minutes), and BingX sent a new one |
| `requested` | Only with `action: "risk_proofs"`: new screenshots have been requested |

`bingx.code_ask_reason` is filled in only when `bingx.step` = `awaiting_code`, and it's never `requested`. If the request opened after your time for the codes had already run out, it's `null`.

## Why the slot was cancelled {#close-reasons}

The slot's `close_reason` field and the `reason` of a `slot_status` event with status `CANCELLED`. On open and completed slots, and on slots closed before reasons were introduced, it's `null`.

| Value | What it means |
|---|---|
| `wrong_country` | The document's country didn't match the order's country, or the account had already been verified in another country before work started |
| `blocked` | The exchange no longer allows verification on this account |
| `already_verified` | The account had already been verified |
| `no_check_required` | Re-verification: the exchange didn't request the check it was ordered for |
| `slot_deadline` | The fulfillment deadline chosen at purchase has passed |
| `face_deadline` | MEXC: the additional face check wasn't passed in time |
| `bingx_face_off_failed` | BingX, second stage: the executor didn't pass the repeat face check in time |
| `client_cancel` | You cancelled it yourself |
| `admin_cancel` | Support cancelled the slot |
| `exchange_review_in_flight` | The exchange is already reviewing another application for this account. If it doesn't pass, the account can be uploaded to a new order |
| `exchange_attempts_spent` | The account has used up today's verification attempts on the exchange. The account can be uploaded to a new order in about a day |

## Deadline kinds {#deadline-kinds}

The `kind` field in the slot's `deadlines`. Deadlines are sorted by `at`, earliest first.

| Value | What it means |
|---|---|
| `slot_deadline` | The fulfillment deadline chosen at purchase |
| `budget` | If the executor doesn't finish, the slot goes back to the pool no later than this moment ([executor's time](../guide/sellers.md#worker-time)) |
| `mexc_hold` | MEXC: the end of the observation window after KYC |
| `mexc_face` | MEXC: the deadline for the additional face check |
| `close_request` | The slot will be closed at `at`; the reason is in `reason` (below) |
| `client_cancel` | When your re-verification cancellation will be checked |

`close_request` and `client_cancel` disappear from the list once their time has passed. Other deadlines may stay briefly after their `at`.

## Why a cancellation is scheduled {#deadline-reasons}

The `reason` field in the slot's `deadlines`; only for `kind: "close_request"`, `null` for the others.

| Value | What it means |
|---|---|
| `admin_cancel` | Support scheduled the cancellation |
| `slot_deadline` | The slot's fulfillment deadline has passed |
| `face_deadline` | The MEXC face check deadline has passed |

## BingX second-stage steps {#bingx-steps}

The `bingx.step` field. The `bingx` object is present on a BingX slot from the second stage on; on other slots it's `null`.

| Value | What it means |
|---|---|
| `requesting_code` | The platform is asking BingX to email the code |
| `awaiting_code` | Waiting for your code — [send it](slot-actions.md#post-bingx-code); your time is running |
| `checking_code` | The code is being checked, usually within a minute |
| `face_in_progress` | The code was accepted, and the executor is passing the face check |
| `switching_off` | The face check has passed, and the platform is turning off face login |
| `waiting_for_worker` | The executor's attempt failed; when they're ready, BingX will send a new code |
| `under_review` | The slot is with support (status `BINGX_REVIEW`) |
| `done` | The second stage is over; the outcome is in `face_login` or `close_reason` |

While the slot is waiting for a re-upload, `step` doesn't change, your time is paused, and no code is accepted.

## BingX second-stage outcome {#bingx-endings}

The `reason` field of a `slot_status` event with status `COMPLETED` on a BingX slot, and the `bingx.face_login` field.

| `reason` | `bingx.face_login` | What it means |
|---|---|---|
| `bingx_face_login_off` | `off` | KYC has passed, and face login is turned off |
| `bingx_face_login_left_on` | `left_on` | KYC has passed, but face login stayed on — for example, your time for the codes ran out |
| `bingx_face_login_unknown` | `unknown` | Support completed the slot; the platform didn't check whether face login is off |

`face_login` is `null` while the second stage is under way, and on a cancelled slot. A slot completed before the second stage has neither a `bingx` object nor a `reason` in the event.

## Notices {#notices}

The `notice` field of `slot_notice` and `order_notice` events.

| Value | Event | What it means |
|---|---|---|
| `bingx_code_accepted` | `slot_notice` | BingX accepted your code. The code may be needed again later |
| `slot_frozen` | `slot_notice` | The slot came back from the executor into a frozen order: it isn't offered to executors until you renew your subscription or cancel the slot |
| `order_frozen` | `order_notice` | The subscription has ended: the order's untaken slots are frozen; slots in progress will be finished |
| `order_unfrozen` | `order_notice` | The subscription has been renewed: the frozen slots are offered to executors again |

## Balance changes {#balance-events}

The `balance_event` field of the `balance` event.

| Value | What it means |
|---|---|
| `deposit` | A top-up has been credited |
| `spend` | A charge: an order, a subscription or a re-verification |
| `refund` | A refund to your balance |
| `referral_accrual` | A referral bonus |
| `manual_adjustment` | A balance adjustment by support |
| `legacy_opening` | An opening balance from the move to the current accounting system; only on long-standing accounts |

## Upload codes {#upload-codes}

### The file can't be read

A `422` response (`413` for `too_many_items`) to an account upload, a re-upload or a bulk re-verification account upload. `at` is the account number (yours from `positions`, or the profile's number in the ADS Power file), `profile` is the profile name, and `detail` gives details. If there are several problems, `issues` lists them all, and the response itself repeats the first one.

| `code` | What it means |
|---|---|
| `parse_too_large` | The file is too large for one account's cookies (an ADS Power file — over 20 MB) |
| `parse_too_many_cookies` | Cookies from many sites, while only the exchange's cookies are needed |
| `parse_cookie_value_too_long` | Doesn't look like a regular cookies export |
| `cookie_jar_too_large` | Cookies from many sites — the exchange will reject such a request |
| `no_platform_cookies` | The file has no cookies for the exchange you need |
| `parse_unrecognized_format` | Not cookies: a screenshot or text from a page |
| `parse_empty_adspower` | The ADS Power file has no profiles at all |
| `too_many_items` | More than 200 profiles or proxy lines (`limit`) |
| `parse_block_missing_cookie` | An ADS Power profile has no cookies — it isn't logged in |
| `parse_no_proxies` | No proxy lines at all |
| `invalid_proxy` | The proxy can't be read, or its scheme isn't supported |
| `private_proxy` | A local or internal address, not a proxy |
| `parse_not_a_text_file` | Not a text file |
| `parse_encrypted_export` | A password-protected Cookie-Editor export |
| `parse_har_file` | A recording of network requests (HAR), not cookies |
| `parse_broken_json` | The cookies are damaged: the text is cut off or has extra characters |
| `parse_unsupported_cookie_export` | This cookies format can't be read (for example, a cURL command) |
| `parse_multiple_accounts_in_one_file` | Cookies from several accounts in one file |
| `parse_adspower_file` | An ADS Power export where one account's cookies file is expected — use `method=adspower` |
| `parse_empty_cookies` | The export is empty |
| `parse_wrong_exchange` | Cookies from a different exchange; `detail` says which |
| `parse_wrong_site` | Cookies from a different site; `detail` is the domain |
| `parse_not_logged_in` | The cookies aren't logged in to the account (MEXC, Bybit); `detail` may name the domain where you are logged in |
| `parse_not_an_adspower_file` | This isn't an ADS Power export; `detail`: `cookies` — it's a cookies file, `proxies` — it's a proxy list |
| `parse_export_without_cookies` | No profile has cookies |
| `parse_block_has_two_profiles` | Two profiles merged into one — the separator line is missing. Export again and don't edit the file |
| `parse_unsupported_proxy_type` | The proxy type in the profile isn't supported: HTTP, HTTPS or SOCKS is required |
| `parse_proxy_has_spaces` | The proxy line has extra text or two proxies |
| `parse_proxy_no_port` | The proxy port is missing |
| `parse_proxy_non_latin` | The proxy has non-Latin letters |

### The account failed the check

The `error_code` field of accounts in [`GET /orders/{order_id}/upload`](upload.md#get-upload). The same codes are returned in a `409` response to a proxy change or a re-upload, except that "no proxy" is `proxy_missing` there, not `missing_proxy`. A rejected account doesn't go into the slot.

| `code` | What it means | What to do |
|---|---|---|
| `proxy_auth_rejected` | The proxy rejected the login or password | Check them with your proxy provider |
| `proxy_timeout` | The proxy isn't responding — for example, it isn't paid for or is turned off | Check the proxy or send another one |
| `proxy_bad_host` | The proxy address wasn't found | Check the address |
| `proxy_unreachable` | Couldn't connect to the proxy | Check the port and the type (HTTP or SOCKS5) |
| `proxy_broken` | The proxy doesn't work | Send another proxy |
| `missing_proxy` | The account has no proxy (for example, an ADS Power profile without a proxy) | Provide a proxy; in ADS Power, add it to the profile and export again |
| `exchange_unreachable` | The proxy works, but the exchange doesn't open through it | Use a proxy from a different provider or city |
| `session_invalid` | The exchange doesn't accept these cookies for the account — the login has expired | Log in again, export the cookies right away and don't log out |
| `session_not_logged_in` | The cookies aren't logged in to the account (happens on KuCoin) | Log in, export the cookies and don't log out |
| `cookie_jar_too_large` | The export has cookies from many sites | Export the cookies on the exchange's tab only |
| `identity_mismatch` | This isn't the same account as the one already in the slot | Upload the same account |
| `duplicate_account_other_slot` | The account is already in another slot of this order; `conflict_slot_id` names the slot | Use a different account |
| `duplicate_account_other_order`, `duplicate_account` | The account is already uploaded to another order | Use a different account |
| `already_verified` | The account has already passed verification on the exchange | Use a different account |
| `verification_blocked` | The exchange no longer allows verification on this account | Use a different account |
| `verification_attempts_spent` | The account has run out of verification attempts for today | Upload it again in about a day, or use a different one |
| `verification_in_review` | The exchange is already reviewing an application for this account | Wait for the outcome, or use a different account |
| `exchange_refused_unclear` | The exchange won't let the verification start, and the reason is unknown | Use a different account; if you need this one in particular, contact support |
| `exchange_unreadable` | The exchange didn't respond | Upload the account again in a few minutes |
| `slot_unavailable` | While the check was running, the slot was taken by an executor or closed; nothing has changed | Retry if needed |
| `slot_busy` | The slot is being checked right now | Retry in a minute |
| `unknown_error` | The check didn't complete | Retry in a few minutes; if it happens again, contact support |
