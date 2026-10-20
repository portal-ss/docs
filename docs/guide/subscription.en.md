# Subscription

A subscription is paid access for a fixed period that unlocks wholesale prices and team orders.

## What a subscription gives you

- **Wholesale prices** — on the same catalog verifications, lower than the standard prices.
- **Team orders** — orders for [your team](team.md): any country and your own price per slot, all of which goes to the executor.

There's no limit on the number of orders: while your subscription is active, you can create as many wholesale and team orders as you like. Your subscription also affects [re-verifications](reverify.md) of accounts from wholesale and team orders: without one, re-verifying an account from a wholesale order costs the standard price, and re-verifying one from a team order isn't available.

## Plans

The current plans, with their durations and prices, are shown in the workspace bot under "💳 Subscription" and in the web app under "Subscription". The plans differ only in duration — the access is the same.

## How to buy or renew

- **Workspace bot** — "💳 Subscription", then the plans button: "📋 Plans" if you've never had a subscription, "➕ Extend subscription" if it's active, or "➕ Renew" if it has expired. Choose a plan, tap "✅ Subscribe", check the confirmation card (plan, duration, price, balance, end date) and confirm.
- **Web app** — the "Subscription" section: choose a plan under "Plans" ("Buy" or "Extend") and tap "Confirm & pay".

The payment is deducted from your balance. If you buy a plan while your current subscription is still active, the days are **added to your current term**. If your subscription has already expired, the new term starts from the moment you pay. Subscription purchases are non-refundable.

## When your subscription ends {#expiry}

Before your subscription ends, the workspace bot sends you two reminders: **3 days** and **24 hours** in advance. In the web app, during the last 3 days, a "Your subscription ends in …" strip with a "Renew" button appears at the top of the screen.

If your subscription ends in less than **24 hours**, the bot and the web app warn you about it when you buy a wholesale or team order. It's only a warning — you can still place the order.

When the subscription ends, you get a "🚫 Your subscription has ended" notification. You can't buy new wholesale or team orders until you renew. Here's what happens to the orders you've already bought:

- **Slots an executor has already taken** are fulfilled as usual.
- **Slots of published wholesale and team orders that nobody has taken** are frozen: until you renew, the platform doesn't offer them to executors. If an executor hands a slot back after your subscription has ended, that slot is frozen too, and you get a separate notification about it.
- **Unpublished orders** aren't frozen. But if you publish one without a subscription, its slots are frozen right away — the order card warns you about this.

Freezing only stops the slots from being offered to executors; everything else works as usual: you can upload accounts, update slot data when the platform asks for it and publish the order. Frozen slots are never cancelled on their own — they wait until you renew or cancel them. If the order has a [slot deadline](orders.md#deadline), it doesn't run while a slot is frozen: after renewal, it's moved forward by the time the slot spent frozen.

You can see how many slots are frozen on the subscription screen and on the order card (the "❄️ Frozen: N" line). With frozen slots, you can:

- **renew your subscription** — in the "💳 Subscription" section or with the "Renew subscription" button on the order card. Frozen slots are offered to executors again right away, and the bot tells you how many;
- **cancel them** — with the "Cancel frozen" button on the order card; see [Frozen slots](cancel-refunds.md#frozen) for how the refund works. Cancelled slots don't come back after renewal.

Freezing doesn't apply to:

- **standard orders** — they don't depend on a subscription;
- **re-verifications** — they're never frozen, even if the original order was a wholesale or team order.
