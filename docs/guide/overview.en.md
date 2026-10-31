# Platform overview

KYC Portal verifies (KYC) your accounts on crypto exchanges. You buy a verification for the exchange and country you need and hand over the account's cookies and proxy. An executor from that country passes the identity check through a link created inside the account; they never get the login details.

Exchanges: **Bybit**, **MEXC**, **KuCoin**, **BingX**. Countries and prices are in the catalog.

On MEXC and BingX, there's a second stage after KYC — [MEXC](lifecycle.md#mexc-hold), [BingX](lifecycle.md#bingx). On BingX, it requires you to forward the code from the BingX email.

## Where to work

| Where | What for |
|---|---|
| Shop bot [@kyctrade_bot](https://t.me/kyctrade_bot) | Buying at standard prices, top-ups, referral link |
| Workspace bot [@kycportal_bot](https://t.me/kycportal_bot) | Uploading accounts, order progress, wholesale and team orders, re-verifications, team, subscription, BingX code |
| [Web app](web.md) | Everything in the workspace bot, plus the catalog, full transaction history, analytics and choosing executors |
| [API](../api/index.md) | The same actions with a key; connected free of charge through support |

Your balance, orders and language are shared by the bots and the web app.

## Terms

- **Slot** — one account in an order, with its own status.
- **Executor** ("Sellers" in the interface) — the person who passes the identity check for your slot.
- **Re-verification** — a repeat check of an account verified through the platform.
