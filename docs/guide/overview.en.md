# Platform overview

KYC Portal helps you pass verification (KYC) on crypto exchanges. You buy a verification for the exchange and country you need, then give the platform the account's session (cookies) and a proxy. An executor from the order's country completes the verification using a link that the platform generates inside your session. The platform takes care of the rest: assigning slots to executors, checking the result on the exchange, notifications and refunds.

## Supported exchanges

- **Bybit**
- **MEXC**
- **KuCoin**

The catalog shows the available countries and prices for each exchange — in the shop bot and in the web app.

## Where to use the platform

| Where | What for |
|---|---|
| Shop bot [@kyctrade_bot](https://t.me/kyctrade_bot) | Browsing the catalog and buying at standard prices, topping up your balance, your referral link |
| Workspace bot [@kycportal_bot](https://t.me/kycportal_bot) | Uploading accounts, publishing and tracking orders, wholesale and team orders, re-verifications, your team, subscription, settings, signing in to the web app |
| [Web app](web.md) | Everything in the workspace bot, plus catalog purchases, full transaction history, analytics and choosing executors |

Your account, balance, orders and interface language are shared across both bots and the web app: anything you do in one place shows up in the others right away. There's no separate sign-up — your Telegram account is your account.

## Key concepts

- **Order** — a single purchase: an exchange, a country and a verification type, in the quantity you need. See [Orders](orders.md).
- **Slot** — one account within an order. An order for three verifications has three slots; each one is fulfilled independently and has its own status.
- **Executor** (called "Sellers" in the interface) — the person who passes the identity check on the exchange for your slot. Executors have no access to your account's login details. See [Executors and order distribution](sellers.md).
- **Re-verification** — a repeat check of an account that was already verified through the platform. See [Re-verifications](reverify.md).

## How an order works

1. **Top-up.** You top up your internal balance in USDT or USDC — [Balance and top-ups](balance.md).
2. **Purchase.** You choose the exchange, country and quantity, and pay from your balance — [Orders](orders.md).
3. **Upload.** For each slot, you provide the account's session and proxy; the platform checks them on the exchange — [Uploading accounts](upload.md).
4. **Publishing.** Once every slot has an account, you publish the order and it becomes available to executors.
5. **Fulfillment.** An executor takes a slot and completes the verification; you get notifications as the work progresses — [Order execution and deadlines](lifecycle.md).
6. **Result.** The slot either completes successfully or is cancelled, with the money refunded to your balance — [Cancellations and refunds](cancel-refunds.md).
