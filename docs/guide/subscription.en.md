# Subscription

A subscription for a fixed period unlocks wholesale prices on catalog verifications and [team orders](team.md#orders). It affects the price and availability of [re-verifications](reverify.md) for accounts from wholesale and team orders. There's no limit on the number of orders.

Plans differ only in duration. Durations and prices are in "💳 Subscription" in the workspace bot and in "Subscription" in the web app.

## Buying and renewing

- Workspace bot: "💳 Subscription" → "📋 Plans" (with an active subscription, "➕ Extend subscription"; after it ends, "➕ Renew") → plan → "✅ Subscribe" → confirm.
- Web app: "Subscription" → "Plans" → "Buy" or "Extend" → "Confirm & pay".

The payment is deducted from your balance and isn't refunded. Renewing an active subscription adds days to the current term; after it ends, the new term runs from the moment you pay.

## When your subscription ends {#expiry}

Reminders come to the workspace bot 3 days and 24 hours in advance; in the web app, during the last 3 days, a strip with a "Renew" button appears at the top. When the subscription ends, you get "🚫 Your subscription has ended":

- you can't buy new wholesale or team orders;
- slots of those orders that no executor holds are [frozen](lifecycle.md#frozen) — they aren't offered to executors; slots already taken are fulfilled as usual;
- after renewal, frozen slots are offered to executors again right away. If you don't want to renew, [cancel them](cancel-refunds.md#frozen) on the order card.
