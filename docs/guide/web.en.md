# Web app

The web app is a browser application with the same data as the workspace bot: your orders, balance, team and subscription. It isn't a Telegram Mini App: it opens in a regular browser on your computer or phone.

## Signing in

1. In the workspace bot [@kycportal_bot](https://t.me/kycportal_bot), tap "🌐 Open in browser" or send `/browser`. This only works in a private chat with the bot.
2. The bot sends you a one-time link. It's valid for a few minutes.
3. Tap the link to copy it, then paste it into the browser you normally use. The button under the message opens the app right away, but on a phone it opens in Telegram's built-in browser — and you'll stay signed in only there.
4. Once you've signed in, the browser remembers you, so you don't need a new link every time.

If you open the link in a browser that's already signed in, the app warns you and lets you choose: "Stay signed in as …" or "Continue with the new link". If you didn't request the link yourself, stay in your current account.

!!! warning
    The sign-in link works only once and is issued to you personally — don't forward it.

To sign out, go to "Settings" → "Session": "Log out" signs you out of the current browser, and "Log out all devices" signs you out everywhere at once. To sign in again, you'll need a new link from the bot.

## Sections

**Dashboard** — an overview: your subscription status, slots waiting for your action, recent orders, your balance, the team card and your referral link.

**Analytics** — metrics for your orders over 7, 30 or 90 days or all time, broken down into "All", "Team" and "Global" (the shared pool): verification success rate, average time waiting for an executor and average time to complete, failure reasons, verification trends, pass rates by exchange and country, and team productivity.

### Verifications

**Create order** — catalog purchases (at the standard or wholesale price), team orders and re-verifications. After payment, the account upload opens right away — using an ADS Power file or manually. See [Orders](orders.md), [Uploading accounts](upload.md) and [Re-verifications](reverify.md).

**Orders** — all your orders, with filters by status, exchange, country, type and period, and search by order or slot number. An order card shows its slots, the full event history and actions: upload, publish, cancel and re-upload.

**Slots** — a single list of all your accounts, regardless of the order they belong to. A slot card shows the status, outcome, deadline and actions: check the status, update the proxy or session, cancel a re-verification. See [Order execution and deadlines](lifecycle.md).

### Team

**Sellers** — two sections: your [team](team.md) and "Marketplace", where you prioritize and block executors (see [Executors and order distribution](sellers.md)).

**Subscription** — buying and renewing, a price comparison and the state of your frozen orders. See [Subscription](subscription.md).

### Money

**Balance** — your deposit address, the minimum amount, networks and deposit history. See [Balance and top-ups](balance.md).

**Transactions** — the full history of operations: top-ups, payments, refunds and bonuses, with filters and a detail card for each operation.

**Affiliate** — your referral link, statistics and bonus history. See [Referral program](referral.md).

### Help and settings

**Help & Support** — video guides (uploading via ADS Power, manual upload and a video walkthrough of the process), the FAQ and terms of use, and a link to support. There's also a "Got an idea?" form for suggestions — you won't get a reply to it.

**Settings** (in the account menu):

- "Appearance" — language and theme: light, dark or system;
- "Slot deadline" — your own fulfillment deadline (see [Custom deadline](lifecycle.md#deadline));
- "Slot auto-return" — for team orders (see [Slot auto-return](team.md#idle-return));
- "Notifications" — separate settings for slots, orders, top-ups and referral bonuses;
- "Session" — sign out of the current browser or all devices.

## Bot or web app

| Feature | Workspace bot | Web app |
|---|---|---|
| Standard orders | Through the shop bot | Yes |
| Wholesale and team orders | Yes | Yes |
| Re-verifications, including Risk Removal | Yes | Yes |
| Uploading accounts and publishing | Yes | Yes |
| Orders and slots — viewing and search | Yes | Yes |
| An order's full event history | — | Yes |
| Balance and top-ups | Yes | Yes |
| Full transaction history | — | Yes |
| Subscription | Yes | Yes |
| Team — invitations and member settings | Yes | Yes |
| Prioritizing and blocking executors | — | Yes |
| Analytics | — | Yes |
| Referral program | Yes | Yes |
| Custom deadline and slot auto-return | Yes | Yes |
| Notification settings by type | Referral only | Yes |
| Interface language | Yes | Yes |
