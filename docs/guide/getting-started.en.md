# Getting started

Your Telegram account is your account on the platform. Open the shop bot [@kyctrade_bot](https://t.me/kyctrade_bot) or the workspace bot [@kycportal_bot](https://t.me/kycportal_bot), send `/start` and choose a language: Russian, Ukrainian or English.

## Quick start

1. Top up your balance in USDT or USDC — [Balance and top-ups](balance.md).
2. Buy a verification: exchange, country, quantity and, optionally, a deadline — [Orders](orders.md).
3. Upload cookies and a proxy for each slot — [Uploading accounts](upload.md).
4. Publish the order — [Publishing](orders.md#publish).
5. Watch for notifications — [Order execution and deadlines](lifecycle.md). ⚠️ on the "📋 My orders" button means an order is waiting for your action, such as a re-upload or the code from the BingX email.

## Settings {#settings}

"⚙️ Settings" in the workspace bot or "Settings" in the web app:

- "🌐 Language" — shared by the bots and the web app; in the shop bot, it's under "👤 Profile".
- "⏱ Worker's time" — how many hours a team member gets per slot, 4 by default — [details](team.md#idle-return).

## Commands

| Command | Bot | What it does |
|---|---|---|
| `/start` | Both | Main menu; closes any dialog you've started |
| `/catalog` | Shop bot | Catalog |
| `/balance` | Shop bot | Balance |
| `/status` | Workspace bot | "📋 My orders" |
| `/browser` | Workspace bot | Sign-in link for the [web app](web.md), same as the "🌐 Open in browser" button |
| `/cancel` | Workspace bot | Leaves the dialog; uploaded accounts stay in the order |

## Support

[@freidbase](https://t.me/freidbase): in the bots, "ℹ️ Info" → "👨‍💻 Help"; in the web app, "Help & Support". Include the order or slot number, which looks like `1234-5678`.
