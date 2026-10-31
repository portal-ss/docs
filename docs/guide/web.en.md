# Web app

[app.kycportal.org](https://app.kycportal.org) — the same orders, balance, team and subscription as in the workspace bot, in a regular browser on your computer or phone.

## Signing in

1. In your private chat with the workspace bot [@kycportal_bot](https://t.me/kycportal_bot), tap "🌐 Open in browser" or send `/browser`.
2. Tap the link you receive — it gets copied — and paste it into your browser. The link works once and is valid for 3 minutes. On a phone, the button under the message opens Telegram's built-in browser, and you'll stay signed in only there.
3. The first time you sign in, check that the account is yours and tap "Continue as …".

A sign-in lasts up to 7 days and ends sooner if you don't open the app for 48 hours; after that, you need a new link. If the link was opened in a browser that's already signed in and you didn't request it, tap "Stay signed in as …".

To sign out: "Settings" → "Session": "Log out" (this browser) or "Log out all devices".

!!! warning
    The sign-in link is issued to you personally — don't forward it.

## Sections

| Section | What's there |
|---|---|
| Dashboard | The catalog with prices and a "Buy" button, balance, subscription, recent orders and a warning if slots are waiting for your action |
| Analytics | Verification success rate, waiting and completion times, failure reasons — by exchange, country and team |
| Create order | "Catalog", "Team" or "Reverification"; after payment, "Upload accounts". See [Orders](orders.md), [Uploading accounts](upload.md), [Re-verifications](reverify.md) |
| Orders | Active and completed orders; the order card has slots, event history, publishing and cancellation |
| Slots | All accounts from all orders; the slot card has the status, deadlines and available actions. The "Needs attention" filter shows slots waiting for you |
| Sellers | "My team" ([Your own team](team.md)) and "Marketplace" — prioritizing and blocking executors ([Executors and order distribution](sellers.md)) |
| Subscription | Plans, buying and renewing — [Subscription](subscription.md) |
| Balance | Top-up address and networks, deposit history — [Balance and top-ups](balance.md) |
| Transactions | All operations: top-ups, payments, refunds, bonuses |
| Affiliate | Referral link and bonuses — [Referral program](referral.md) |
| API | API keys; until access is enabled, a "Write to support" button. See [API: keys](../api/index.md#keys) |
| Help & Support | Video guides, documents, "Chat with support" |
| Settings | Theme, language, which notifications to send to Telegram, [executor's time per slot](team.md#idle-return), signing out |

## The BingX code on the slot page {#bingx-code}

When BingX asks for a code, the slot is tagged "code needed".

1. On the slot page, tap "Enter code".
2. Type the code from the latest BingX email into the "Code from the latest BingX email" field and tap "Send".
3. The result appears in the BingX block, usually within a minute; the page refreshes on its own.

The code works for about 10 minutes. If it has expired, "Enter code" asks BingX for a new email itself — the field appears once the email arrives. The block shows how much of your time is left: "Time left to send the codes: N min". The rules are in [Second stage on BingX](lifecycle.md#bingx).

## Bot or web app

Everything the workspace bot can do is in the web app too. Only in the web app: catalog purchases (in Telegram, through the shop bot [@kyctrade_bot](https://t.me/kyctrade_bot)), analytics, prioritizing and blocking executors, an order's full event history and the full transaction history, choosing notifications by type, and a fulfillment deadline of any whole number of hours from 4 to 72.
