# Orders

An **order** is a single purchase: an exchange, a country and a number of verifications. A **slot** is one account in an order; slots are fulfilled independently. An order and a slot each have a number like `1234-5678` — use it to search for an order and when you contact support.

## Order types

| Type | Price | Fulfilled by | Requirement | Where to buy |
|---|---|---|---|---|
| **Standard** | Retail | Platform executors from the order's country | — | Shop bot, web app |
| **Wholesale** | Discounted | Platform executors from the order's country | [Subscription](subscription.md) | Workspace bot, web app |
| **Team** | You set it; the full amount goes to the executor | Only [your team](team.md) | Subscription and an active team member | Workspace bot, web app |
| **Re-verification** | See [Re-verifications](reverify.md) | Whoever did the first verification | The account was verified through the platform | Workspace bot, web app |

## How to buy

1. Open the catalog: in the shop bot [@kyctrade_bot](https://t.me/kyctrade_bot) — "🛍 Catalog"; in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) — "➕ New order" → "Wholesale" or "For my team"; in the web app — "Create order".
2. Choose the exchange and country and, for a team order, the price per slot.
3. Enter the quantity (in the bot, after "🛒 Buy"): no more than 100 per order.
4. Optionally choose a [deadline](#deadline) and confirm: "✅ Confirm" in the bot, "Pay" in the web app. The amount is deducted from your balance right away.
5. Tap "📤 Upload accounts" and [upload the accounts](upload.md).

- "Insufficient balance." — [top up your balance](balance.md) and try again.
- The price has changed — confirm the new amount.
- "⛔️ Currently out of stock" — tap "🔔 Notify when available".
- Less than 24 hours left on your subscription — you'll see a warning, but you can still buy; for what happens to the slots, see [When your subscription ends](subscription.md#expiry).

On BingX, after KYC you'll need to forward the code from the BingX email — [Second stage on BingX](lifecycle.md#bingx).

## Slot deadline {#deadline}

When you buy a standard, wholesale or team order, you can set a deadline by which each slot must pass verification: "No deadline", "4 h", "8 h", "12 h", "24 h", "48 h" or "72 h"; in the web app, "Other…" allows any whole number of hours from 4 to 72.

The deadline is the same for all slots in the order, doesn't affect the price and can't be changed after purchase. If verification hasn't passed by the deadline, the slot is cancelled and the money returns to your balance. For how the deadline runs, see [Fulfillment deadline](lifecycle.md#deadline).

## Publishing {#publish}

Executors can't see an order until you publish it.

1. [Upload](upload.md) cookies and a proxy to every slot — you can't publish part of an order. The order moves to "📤 Ready to publish".
2. Tap "✅ Publish now" → "🚀 Confirm & publish" (in the web app, "Publish order" → "Publish").

Before publishing, you can [replace](upload.md#replace) a slot's account or [cancel](cancel-refunds.md) the order with a full refund. After publishing, a slot's data changes only when the platform asks for it or the exchange doesn't open through your proxy — [Re-uploading](upload.md#reupload).

Without a subscription, a wholesale or team order can still be published, but its slots are [frozen](lifecycle.md#frozen) right away until you renew.

## Where to see your orders {#statuses}

In the workspace bot — "📋 My orders", with search by order number, slot number or the account's full email; ⚠️ on an order's line means it's waiting for your action. In the web app — "Orders" and "Slots" ([Web app](web.md)).

Order status: "📥 Waiting for account upload" → "📤 Ready to publish" → "🔄 In progress" → "✔️ Completed", "✔️ Partially completed" (some slots cancelled) or "🚫 Cancelled" (none fulfilled). The "💸 Refunded to your balance: $…" line on the order card shows how much has come back for the order. For slot statuses, see [Slot statuses](lifecycle.md#statuses).
