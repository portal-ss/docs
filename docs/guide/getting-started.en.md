# Getting started

## First launch

You don't need to register — your Telegram account is your account. Open the shop bot [@kyctrade_bot](https://t.me/kyctrade_bot) or the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) and send `/start`. On first launch, the bot asks you to choose a language: Russian, Ukrainian or English. The language is shared by both bots and the web app. You can change it in the shop bot ("👤 Profile" → "🌐 Language"), in the workspace bot ("⚙️ Settings" → "🌐 Language") or in the web app's "Settings".

!!! note
    If you came through a referral link, you're linked to the person who invited you when you first start the bot. See [Referral program](referral.md).

## Quick start

1. Top up your balance in USDT or USDC — [Balance and top-ups](balance.md).
2. Buy a verification from the catalog in the shop bot or the web app. When you buy, you can set a slot deadline or leave the order without one — [Orders](orders.md).
3. Upload a session and proxy for each slot — [Uploading accounts](upload.md).
4. Publish the order and wait for notifications about the result — [Order execution and deadlines](lifecycle.md).

## Shop bot @kyctrade_bot

The service's storefront. Main menu:

- "🛍 Catalog" — choose an exchange and a country, view the product card and buy.
- "👤 Profile" — your balance, referral link and summary, plus "📋 My Orders", "💳 Top up balance", "🌐 Language" and "💸 Withdraw referral balance".
- "ℹ️ Info" — "👨‍💻 Help", "🤝 Cooperation", "📖 Documentation", "⭐ Reviews" and "📘 Terms of Use".

## Workspace bot @kycportal_bot

Your workspace: this is where you upload accounts and track progress. Main menu:

| Button | What's inside |
|---|---|
| "➕ New order" | Wholesale, standard or team order — [Orders](orders.md) |
| "💵 Balance" | Main and referral balance, top-ups — [Balance and top-ups](balance.md) |
| "💳 Subscription" | Plans and renewal — [Subscription](subscription.md) |
| "📋 My orders" | Active and completed orders, re-verifications, search — [Orders](orders.md) |
| "🔄 Re-verification" | Order a repeat check — [Re-verifications](reverify.md) |
| "👨‍💻 My team" | Your own executors — [Your own team](team.md) |
| "🎟️ Referrals" | Referral link and earnings — [Referral program](referral.md) |
| "ℹ️ Info" | Help, documentation, FAQ, video guide, terms of use |
| "⚙️ Settings" | Language and the worker's time for team orders — [details](#settings) |
| "🌐 Open in browser" | Sign in to the [web app](web.md) |

The balance button shows your current balance.

### Settings {#settings}

"⚙️ Settings" shows the current values right away. There are two items:

- "🌐 Language" — the interface language.
- "⏱ Worker's time" — team orders only: how many hours of their own time a team member gets for each slot they take. The options are 1, 2, 3, 4, 6, 8, 12 or 24 hours, or "No limit"; the default is 4 hours. The time stops while the slot is waiting for you or the exchange. If the member runs out of time, the slot goes back to the pool, and that member can't take this particular slot again. See [Your own team](team.md#idle-return).

The slot deadline isn't a setting: you choose it when you buy each order — see [Fulfillment deadline](lifecycle.md#deadline).

## Commands

Besides the menu buttons, the bots understand these commands:

| Command | Bot | What it does |
|---|---|---|
| `/start` | Both | Opens the main menu and closes any dialog you've started |
| `/catalog` | Shop bot | Opens the catalog |
| `/balance` | Shop bot | Shows your current balance |
| `/status` | Workspace bot | Opens "📋 My orders" |
| `/browser` | Workspace bot | Sends a sign-in link for the [web app](web.md) |
| `/cancel` | Workspace bot | Leaves the current dialog, such as an upload. Accounts you've already uploaded stay in the order |

## Web app

Everything in the workspace bot is also available in a browser — plus catalog purchases, full transaction history, analytics and choosing executors. To sign in, tap "🌐 Open in browser" in the workspace bot or send `/browser`, and the bot will send you a one-time link. See [Web app](web.md).

## Support

If you need help, contact support at [@freidbase](https://t.me/freidbase). In the bots, you can reach support with the "👨‍💻 Help" button in the "ℹ️ Info" section; in the web app, use the "Chat with support" button in "Help & Support". If your question is about a specific order or slot, include its number, which looks like `1234-5678`.
