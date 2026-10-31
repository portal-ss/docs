# Uploading accounts

Each slot needs the exchange account's cookies — an export from a browser that's logged in — and a separate proxy. To start uploading, tap "📤 Upload accounts" on the order card in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) or in the web app.

## Upload methods

### ADS Power

1. In each profile, log in to the exchange account and check that the profile has a proxy set.
2. Close the profiles and export them to `.txt` — the cookies, proxy and user-agent are taken from the file.
3. Send the file: in the bot — "📦 ADS Power (.txt)", in the web app — "ADS Power file".

One profile fills one slot; profiles beyond the free slots are skipped. A file with more than 200 profiles isn't accepted.

### Manually

- In the bot — "📁 Manual (proxies + cookies)": a list of proxies, one per line, then a cookies file (`.json` or `.txt`) for each slot in turn.
- In the web app — "Manual": a proxy line and a cookies text field for each account.

Proxies and cookies are matched in order: the first proxy goes to the first account.

**Cookies:** JSON from an extension (Cookie-Editor: Export → JSON), a `cookies.txt` file in Netscape format, or a `name=value; name2=value2` string; for Bybit, a token like `xxx.yyy.zzz`. A password-protected export, HAR, a screenshot or text from the page won't work.

**Proxies:** `host:port`, `host:port:user:pass`, `user:pass:host:port`, `user:pass@host:port` or `host:port@user:pass`, optionally with an `http://` or `socks5://` scheme. HTTP, HTTPS and SOCKS work. One proxy per line, no spaces; the port is required; Latin characters only. Local addresses (`127.0.0.1`, `192.168.x.x`) aren't accepted.

## Account checks

The platform checks each account on the exchange and reports the result for each one; you can close the web page — the result is kept. While one file is being checked, you can't send another for the same order.

- Some were rejected — send a file with only the rejected ones; accepted slots aren't affected.
- The check was interrupted — send the rest again (in the web app, "Upload remaining").
- "🔁 Start over (reset everything)" in the bot removes every accepted account from the order; "Start over" in the web app clears the slots once the next file is accepted.

### Can the verification start {#can-verify}

When you upload to an initial verification order, the platform asks the exchange whether a verification can start on the account right now. If not, the account is rejected and the slot stays free.

### Why an account is rejected

For each rejected account, the bot and the web app give the reason and what to do. Common cases:

| Reason | What to do |
|---|---|
| The proxy doesn't respond, rejected the login or password, or won't connect | Check the proxy with your provider or send another one |
| The exchange doesn't open through the proxy | Send a proxy from a different provider or city |
| The login has expired or the account isn't logged in | Log in to the account, export the cookies right away and don't log out |
| Wrong cookies: from another exchange, from the wrong tab, with extra sites, password-protected, damaged | Export again on the exchange tab where you're logged in, without a password |
| The account is already uploaded or already verified, or the exchange won't let verification start | Use a different account |
| Attempts used up | Upload again in about a day |
| The exchange didn't respond, the check failed | Send again in a few minutes; if it happens again, contact support |

### Replacing before publishing {#replace}

To replace a slot's account: "✏️ Edit this slot" in the bot, "Edit slot" in the web app (where you can also change just the proxy). If the new account fails its check, the old one stays.

"✏️ Edit all slots" in the bot and "Re-upload all accounts" in the web app refill the order from a new file from scratch; a slot whose account is rejected stays empty.

## Exchange specifics

- **MEXC** — if the main domain doesn't open, log in through `mexc.co` or `mexc.fm`.
- **Bybit** — a cookie login lasts a few days: export the cookies right before uploading.
- **KuCoin** — export from a browser profile that has only ever opened KuCoin.
- **BingX** — you need access to the account's mailbox: after KYC, a code for the [second stage](lifecycle.md#bingx) arrives there. Use accounts where actions are confirmed with the email code only: if BingX also asks for a Google Authenticator code or a phone code, the slot goes to support review.

## Re-uploading {#reupload}

After publishing, a slot's data changes in two cases: the platform asked for it, or the exchange doesn't open through your proxy ([below](#proxy-swap)).

If the login to the account has expired or the proxy has stopped responding, the slot moves to "⚠️ Data update required" and the bot sends a message, plus one reminder after 6 hours with no response. While the slot waits for data, every clock is paused — your [deadline](lifecycle.md#deadline), the executor's time, the MEXC face check, your time for the BingX codes; the slot isn't cancelled and doesn't go to another executor.

1. Tap "🔄 Re-upload" on the slot card or the button in the message. In the web app — "Replace proxy", "Upload cookies again" or "Upload proxy & cookies again".
2. Send what's requested: one proxy as a single line, fresh cookies from **the same account**, or both. From ADS Power — an export with exactly one account.

After the update, the work and the clocks resume from where they stopped; at the BingX second stage, after new cookies the bot asks for a new code.

### The exchange doesn't open through the proxy {#proxy-swap}

If "🔍 Check status" answered "🌐 Your proxy works, but the exchange doesn't open through it…":

1. Tap "🔌 Replace proxy" on the slot card (in the web app, "Replace proxy" under the check's answer).
2. Upload a proxy from a different provider or city (in the bot, via "🔄 Re-upload").

If this comes up while you're re-uploading cookies, send a new proxy at the same step (in the web app, the "Send a new proxy too" switch).
