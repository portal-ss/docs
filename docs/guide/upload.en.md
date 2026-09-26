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

Each profile in the file fills one slot. If the file has more accounts than there are free slots in the order, the extra ones are skipped, and you get a separate message about it. While the platform is checking one file for an order, you can't send another file for the same order — wait for the result.

### Manually

You provide the proxy and cookies separately for each account:

- in the bot — "📁 Manual (proxy + cookies)": first a list of proxies (one per line), then a cookies file (`.json` or `.txt`) for each slot in turn;
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

Every upload — by file or manual — is sent as a batch. The platform checks each account on the exchange and reports the result for each one. The check may take a while: you can wait or come back later.

If some accounts are accepted and others aren't, fix the rejected ones and resend only those — accepted slots aren't affected. If you need to start from scratch, the bot has "🔁 Start over (reset everything)".

!!! warning
    "🔁 Start over (reset everything)" removes every accepted account from the order, and you'll have to redo the whole upload.

Until the order is published, you can open any slot and replace its account — or, in the bot, replace all of them at once with "✏️ Edit all slots". For publishing, see [Orders](orders.md#publish).

## Why an account may be rejected

| Reason | What happened | What to do |
|---|---|---|
| Proxy not working | The proxy doesn't respond | Replace it with a working proxy |
| Session problem | The cookies are invalid, or the exchange rejected them | Log in to the account again and export fresh cookies |
| Too many cookies | The browser profile has collected cookies from unrelated sites | Export a profile that has only this exchange open |
| Different account | The session belongs to a different account than the one already in the slot | Upload a session from the same account |
| Account already uploaded | This account is already in another slot of this order, or in another order | Use a different account, or find where it's already uploaded |
| No proxy | No proxy was provided for the account | Add a proxy |
| Slot frozen | Your subscription has expired | Renew your [subscription](subscription.md) |
| Slot taken or closed | The slot's state changed while the check was running; nothing was changed | Try again if needed |
| Already verified | The account has already passed verification on the exchange and can't pass it again | Upload a different account |
| Exchange unreachable through the proxy | The proxy works, but the exchange itself can't be reached through it | Try a different proxy |
| Exchange didn't respond | The proxy and cookies are fine, but the exchange didn't respond | Try again in a few minutes |
| Check failed | A general check error | Update the proxy and session, and try again |

## Exchange specifics

- **MEXC** — if the exchange's main domain doesn't open for you, log in through an alternative domain (for example, `mexc.fm`). The platform detects which domain the cookies came from and works through that domain.
- **Bybit** — sessions only last a limited time, so export the cookies right before uploading.
- **KuCoin** — browser profiles pick up unrelated cookies especially easily. Use a dedicated profile that has only ever opened KuCoin.

## Re-uploading {#reupload}

Sometimes, after the order is published, the platform needs fresh data for a slot: the session has expired, the proxy has stopped responding, or the exchange took too long to respond through your proxy. The slot moves to "⚠️ Data update required", and you get a notification — for a single slot or as a summary for several. While the slot is waiting for new data, its deadline is paused.

Upload exactly what's requested:

| What's needed | How to update |
|---|---|
| Proxy | "🔌 Update proxy" — one new proxy |
| Cookies | "🔄 Re-upload" — no need to change the saved proxy |
| Proxy and cookies | "🔄 Re-upload" — a new proxy and a fresh session |

Re-upload requirements:

- the session must be from **the same account** that was in the slot — a session from a different account will be rejected;
- you update one slot at a time: one proxy, and for ADS Power uploads, a file with exactly one account.

Once the update succeeds, work on the slot resumes immediately. You can't cancel the slot until its data is updated.

## Tips

- Keep a separate browser profile for each exchange, and close the ADS Power profile before exporting it.
- Don't use the same proxy for two different accounts.
- Export cookies shortly before uploading, especially for Bybit.
- Don't upload an account that has already passed the verification you're ordering.
