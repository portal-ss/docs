# Web app

The web app is a browser application with the same data as the workspace bot: your orders, balance, team and subscription. It isn't a Telegram Mini App: it opens in a regular browser on your computer or phone.

## Signing in

1. In the workspace bot [@kycportal_bot](https://t.me/kycportal_bot), tap "🌐 Open in browser" or send `/browser`. This only works in a private chat with the bot.
2. The bot sends you a one-time link. It's valid for 3 minutes.
3. Tap the link to copy it, then paste it into the browser you normally use. The button under the message opens the app right away, but on a phone it opens in Telegram's built-in browser — and you'll stay signed in only there.
4. The first time you sign in on a browser, the app shows which account you've signed in to. Check that it's yours and tap "Continue as …"; if it isn't your account, tap "Sign out".
5. Once you've signed in, the browser remembers you, so you don't need a new link every time. A sign-in lasts up to 7 days, and ends sooner if you don't open the app for 48 hours. After that, you'll need a new link from the bot.

If you open the link in a browser that's already signed in, the app warns you and lets you choose: "Stay signed in as …" or "Continue with the new link". If you didn't request the link yourself, stay in your current account.

!!! warning
    The sign-in link works only once and is issued to you personally — don't forward it.

To sign out, use "Log out" in the account menu or go to "Settings" → "Session": "Log out" signs you out of the current browser, and "Log out all devices" signs you out everywhere at once. To sign in again, you'll need a new link from the bot.

## Sections

**Dashboard** — the verification catalog: exchanges, countries and prices, with a "Buy" button (with an active subscription, it shows wholesale prices). Alongside it: your subscription status, a warning when slots are waiting for your action (a re-upload, a proxy or new screenshots), recent orders, your balance with "Top up" and "Transactions" buttons, key figures (slots in progress and waiting for an executor, verifications done, spend over 30 days) and your referral link.

**Analytics** — metrics for your orders over 7, 30 or 90 days or all time, broken down into "All", "Team" and "Global" (the shared pool): verification success rate, average time waiting for an executor and average time to complete, failure reasons, verification trends, pass rates by exchange and country, and team productivity.

### Verifications

**Create order** — three modes: "Catalog" (an exchange and a country at catalog prices; with an active subscription you choose the wholesale or the standard price), "Team" and "Reverification". For catalog and team orders you can set a slot deadline: "No deadline", a preset from 4 to 72 hours, or "Other…" — any whole number of hours within that range. The deadline can't be changed after purchase — see [Fulfillment deadline](lifecycle.md#deadline). After payment, the "Upload accounts" button opens the upload — using an ADS Power file or manually. See [Orders](orders.md), [Uploading accounts](upload.md) and [Re-verifications](reverify.md).

**Orders** — all your orders, with filters by status, exchange, country, type and period, and search by order or slot number. An order card shows its slots, the full event history and actions: uploading and re-uploading accounts, publishing, cancelling an unpublished order, and — when slots are frozen — renewing the subscription or cancelling those slots.

**Slots** — a single list of all your accounts, regardless of the order they belong to. A slot card shows the status, outcome, time left and the actions available at that moment: check the status, replace the proxy or update the session, send new deposit screenshots for Risk Removal, cancel a re-verification and, on a completed slot, "Create a re-verification". See [Order execution and deadlines](lifecycle.md).

### Team

**Sellers** — two sections: "My team" (see [Your own team](team.md)) and "Marketplace", where you prioritize and block executors (see [Executors and order distribution](sellers.md)).

**Subscription** — buying and renewing and a price comparison; after a subscription ends, how many slots are waiting for the renewal. See [Subscription](subscription.md).

### Money

**Balance** — your deposit address, the minimum amount, networks and deposit history. See [Balance and top-ups](balance.md).

**Transactions** — the full history of operations: top-ups, payments, refunds and bonuses, with filters and a detail card for each operation.

**Affiliate** — your referral link, statistics and bonus history. See [Referral program](referral.md).

### Help and settings

**Help & Support** — video guides ("Uploading from ADS Power", "Manual upload", "Video guide"), documents ("Documentation", "FAQ", "Terms of Use") and a "Chat with support" button. There's also a "Got an idea?" form for suggestions — you won't get a reply to it.

**Settings** (in the account menu):

- "Account" — which Telegram account you're signed in with;
- "Appearance" — theme (light, dark or system) and language;
- "Notifications" — which notifications to push to Telegram: "Per slot", "Per order", "Deposits" and "Referral bonuses", each on its own;
- "Worker's time per slot" — for team orders: from 1 to 24 hours or no limit (see [Getting started](getting-started.md#settings) and [Your own team](team.md#idle-return));
- "Session" — sign out of the current browser or all devices.

## Bot or web app

| Feature | Workspace bot | Web app |
|---|---|---|
| Standard orders | Through the shop bot | Yes |
| Wholesale and team orders | Yes | Yes |
| Slot deadline at purchase | Presets: 4, 8, 12, 24, 48 or 72 h | Presets or any whole number of hours from 4 to 72 |
| Re-verifications, including Risk Removal | Yes | Yes |
| Uploading accounts and publishing | Yes | Yes |
| Orders and slots — viewing and search | Yes | Yes |
| An order's full event history | — | Yes |
| Balance and top-ups | Yes | Yes |
| Full transaction history | — | Yes |
| Subscription | Yes | Yes |
| Team — invitations and member settings | Yes | Yes |
| Worker's time per slot | Yes | Yes |
| Prioritizing and blocking executors | — | Yes |
| Analytics | — | Yes |
| Referral program | Yes | Yes |
| Notification settings by type | Referral only | Yes |
| Interface language | Yes | Yes |
