# Uploading accounts

For the platform to carry out a verification, you need to upload the following to each slot in the order:

- **the account's session** — cookies from a browser that is logged in to the exchange account;
- **a proxy** — a separate one for each account.

The verification runs inside your session: the executor doesn't log in to the account separately and never receives the login details. Uploading works the same way in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) (the "📤 Upload accounts" or "📤 Upload all accounts" button on the order card) and in the web app.

## Upload methods

### ADS Power

If you manage your accounts in ADS Power:

1. Log in to the accounts you need in ADS Power.
2. Close the profiles you're going to export.
3. Export them to `.txt`. The file must contain cookies for every profile; the proxy and user-agent are also taken from the file if they're included.
4. Send the file to the bot ("📦 ADS Power (.txt)") or upload it in the web app ("ADS Power file").

Each profile in the file fills one slot. If the file has more accounts than there are free slots in the order, the extra ones are skipped, and you get a separate message about it. One upload takes at most **200** accounts — for a large order, split the file and send the parts one after another.

### Manually

You provide the proxy and cookies separately for each account:

- in the bot — "📁 Manual (proxy + cookies)": first a list of proxies (one per line), then a cookies file (`.json` or `.txt`) for each slot in turn. The bot checks the proxies right away and shows each one's country. If an account fails its check because of the proxy, you can send a new proxy for that slot as a single line at the cookies step;
- in the web app — "Manual": a card for each account, with a proxy line and a cookies field.

Proxies and cookies are matched in order: the first proxy line goes to the first account, and so on.

**Cookie formats:**

- a JSON array of cookie objects — the standard export from a browser extension;
- a JSON object `{"name": "value"}` or a `{"cookies": [...]}` wrapper;
- a string in Cookie header format: `name=value; name2=value2`;
- a single token like `xxx.yyy.zzz`.

**Proxy formats:**

- `host:port`
- `host:port:user:pass`
- `user:pass@host:port`
- `scheme://[user:pass@]host:port`

You don't have to specify the protocol — the platform detects it automatically. Local and internal addresses (such as `127.0.0.1` or `192.168.x.x`) aren't accepted.

## Account checks

Every upload — by file or manual — is sent as a batch. The platform checks each account on the exchange and reports the result for each one. The check may take a while:

- it runs on the platform's side: in the web app you can close the page and come back later — the result is kept; in the bot, if the check takes long, the result arrives as a separate message;
- if a platform update interrupts the check, it resumes on its own, and accounts already accepted aren't lost. If the check does stop early, you'll see how many accounts were saved — send the rest again (in the web app, "Upload remaining");
- while the platform is checking one file for an order, you can't send another file for the same order — wait for the result.

If some accounts are accepted and others aren't, send a file with only the rejected ones — accepted slots aren't affected. The error list gives each account's position in your file and its ADS Power profile name, so they're easy to find. If you lose track, start from scratch: "🔁 Start over (reset everything)" in the bot, "Start over" in the web app.

!!! warning
    "🔁 Start over (reset everything)" removes every accepted account from the order, and you'll have to redo the whole upload. In the web app, "Start over" clears the slots once the next file is accepted.

### Replacing accounts before publishing

Until the order is published, you can open any slot and replace its account: "✏️ Edit this slot" in the bot, or the "Edit slot" block on the slot card in the web app (where you can also change just the proxy). If the new account fails its check, the slot keeps the old one.

"✏️ Edit all slots" in the bot and "Re-upload all accounts" in the web app start the upload from scratch: once the file is accepted, every slot is cleared and refilled from it in order. A slot whose account fails its check stays empty, and an order with an empty slot can't be published. For publishing, see [Orders](orders.md#publish).

## Can the verification start now {#can-verify}

When you upload an account to an initial verification order, the platform asks the exchange whether a verification can start on that account right now. The account is accepted only if the exchange allows it — including after a rejected attempt, if the exchange allows another one. Otherwise the account is rejected, and the slot stays free for a different account. The reasons for a refusal:

- the account has already passed verification;
- the exchange no longer allows verification on this account;
- the account has used up its daily verification attempts — you can upload it again in about a day;
- a verification is already under review on the account — wait for its result.

What can be known in advance depends on the exchange: KuCoin only reports that an account is already verified, so on KuCoin only such accounts are rejected. There's no such check when you [re-upload](#reupload).

If the exchange stops allowing a verification after the order is published (for example, the account has used up its attempts) and no verification link has been issued to an executor for the slot yet, the slot is cancelled with a full refund, and the notification names the reason.

## Why an account may be rejected

| Reason | What happened | What to do |
|---|---|---|
| Proxy not working | The proxy doesn't respond | Replace it with a working proxy |
| Exchange unreachable through the proxy | The proxy works, but the provider's network blocks the exchange | Use a proxy from a different provider or city |
| No proxy | No proxy was provided for the account | Add a proxy |
| Session problem | The cookies are invalid, or the exchange rejected them; with ADS Power, the profile may have been exported before the login was saved | Log in to the account again and export fresh cookies |
| No cookies for this exchange | The file has no cookies for the exchange you need — probably a different profile was exported | Export the profile that's logged in to this exchange |
| Too many cookies | The browser profile has collected cookies from unrelated sites | Export a profile that has only this exchange open |
| Account already uploaded | This account is already in another slot of this order, or in another active order | Use a different account, or find where it's already uploaded (in the web app, under "Slots") |
| Different account | On a re-upload, the session belongs to a different account than the one in the slot | Upload a session from the same account |
| Already verified | The account has already passed verification on the exchange and can't pass it again | Upload a different account |
| Verification blocked | The exchange no longer allows verification on this account | Upload a different account |
| Attempts used up | The account has used up its daily verification attempts on the exchange | Try again in about a day, or upload a different account |
| Verification already under review | A verification is already under review on the account | Wait for its result, or upload a different account |
| Slot taken or closed | The slot's state changed while the check was running; nothing was changed | Try again if needed |
| Exchange didn't respond | The proxy and cookies are fine, but the exchange didn't respond | Try again in a few minutes |
| Check failed | The check didn't complete | Send the same file again in a few minutes; if it happens again, contact support |

## Exchange specifics

- **MEXC** — if the exchange's main domain doesn't open for you, log in through an alternative domain (for example, `mexc.fm`). The platform detects which domain the cookies came from and works through that domain.
- **Bybit** — sessions only last a limited time, so export the cookies right before uploading.
- **KuCoin** — browser profiles pick up unrelated cookies especially easily. Use a dedicated profile that has only ever opened KuCoin.

## Re-uploading {#reupload}

Once the order is published, you can't change a slot's account or proxy. The exceptions are when the platform itself asks for fresh data, and when you replace a proxy the exchange doesn't open through ([see below](#proxy-swap)).

### When the platform asks for data

The platform works with the account only through your session and your proxy. If it turns out the session has expired or the proxy has stopped responding, the slot moves to "⚠️ Data update required", and the bot sends you a message — for a single slot or as a summary for several. If the data still hasn't arrived after **6 hours**, you get one reminder. These messages can't be turned off in the notification settings.

Before asking for a new proxy, the platform checks whether the proxy works at all. If the proxy works and only the exchange won't open, no new data is requested.

### While the slot is waiting

The slot is paused:

- no clock runs: not your [deadline](lifecycle.md#deadline), not the executor's time, and not the MEXC face-check deadline;
- the slot isn't cancelled and doesn't move to another executor automatically;
- you can't check the slot's status. Cancelling a re-verification becomes available after the update, and cancelling a frozen slot that already had a verification link issued waits for the update — only then does the platform check the exchange.

If you had an open request to cancel a re-verification and the pause dropped it, the data-update message says so — you can send the request again after the update.

### What to upload

Upload exactly what's requested. In the bot, tap "🔄 Re-upload" on the slot card or the button in the message itself ("↩️ Update proxy", "↩️ Re-upload session", "↩️ Update slot"), then choose a method — ADS Power or manual.

| What's needed | In the bot | In the web app |
|---|---|---|
| Proxy | One new proxy | "Replace proxy" |
| Cookies | Fresh cookies; the saved proxy stays | "Re-upload cookies" |
| Proxy and cookies | A new proxy and a fresh session | "Re-upload proxy & cookies" |

Re-upload requirements:

- the session must be from **the same account** that was in the slot — a session from a different account will be rejected;
- you update one slot at a time: one proxy (a list of several lines isn't accepted), and for ADS Power uploads, an export with exactly one account;
- the bot handles one upload at a time: if you start updating another slot, the previous upload is cancelled, and the bot tells you so.

If the slot came to need more while you were getting the data ready — for example, you sent a new proxy and it turned out the session had expired too — the slot asks for both the proxy and the cookies. Send them together.

Once the update succeeds, work on the slot resumes immediately, from where it stopped: the slot returns to its previous status, and its clocks to the time they had left before the pause. If the slot was left without an executor during the pause, it goes back to the queue for executors.

### The exchange doesn't open through your proxy {#proxy-swap}

Sometimes the proxy works, but the provider's network blocks the exchange. If "🔍 Check status" answered "🌐 Your proxy works, but the exchange doesn't open through it…", you can replace the proxy yourself: "🔌 Replace proxy" on the slot card (in the web app, "Replace proxy" under the check's answer). The slot pauses until the new proxy arrives — tap "🔄 Re-upload" and send the proxy.

If the same thing comes up while re-uploading cookies, the bot offers to take a new proxy too, and the web app shows a "Send a new proxy too" switch.

## Tips

- Keep a separate browser profile for each exchange, and close the ADS Power profile before exporting it.
- Don't use the same proxy for two different accounts.
- Export cookies shortly before uploading, especially for Bybit.
- Don't upload an account that has already passed the verification you're ordering, or one that already has a verification under review.
