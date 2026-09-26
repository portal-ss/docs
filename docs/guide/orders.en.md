# Orders

## Orders and slots

An **order** is a single purchase: an exchange, a country and a number of verifications. A **slot** is one account within an order: an order for five verifications has five slots. Slots are fulfilled independently of each other — one may already be completed while another is still waiting for an executor. The order's status is derived from the statuses of its slots.

An order and each of its slots have their own number, which looks like `1234-5678`. Use it to find an order or when you contact support.

## Order types

| Type | Price | Fulfilled by | Requirement |
|---|---|---|---|
| **Standard** | Retail, from the catalog | Platform executors from the order's country | — |
| **Wholesale** | Discounted, from the catalog | Platform executors from the order's country | An active [subscription](subscription.md) |
| **Team** | You set it; the full amount goes to the executor | Only members of [your team](team.md) | An active subscription and at least one active team member |
| **Re-verification** | Under the re-verification pricing rules | The executor who did the account's first verification | The account was already verified through the platform |

Standard and wholesale orders are the same catalog product at two different prices. How to order a re-verification is covered on the [Re-verifications](reverify.md) page.

## Where to place an order

| Type | Shop bot | Workspace bot | Web app |
|---|---|---|---|
| Standard | Yes | The button takes you to the shop bot | Yes |
| Wholesale | — | Yes | Yes |
| Team | — | Yes | Yes |
| Re-verification | — | Yes | Yes |

### Shop bot @kyctrade_bot

1. Open "🛍 Catalog", choose an exchange, then a country.
2. Check the product card: the price per slot, a description and, where available, a guide and the working hours of executors in that country (outside those hours, there may be delays).
3. Tap "🛒 Buy", enter the quantity and confirm. The number of slots in a single order is limited.
4. The payment is deducted from your balance right away. If you don't have enough funds, the bot will offer to top up your balance.
5. The bot shows the order number and an "📤 Upload accounts" button, which opens the upload in the workspace bot.

If a product is temporarily unavailable, the card shows "⛔️ Currently out of stock". Tap "🔔 Notify when available", and the bot will let you know when you can place the order.

### Workspace bot @kycportal_bot

"➕ New order" offers three options: "Wholesale", "Standard" (takes you to the shop bot) and "For my team". For a team order, you choose the exchange and any country, then set the price per slot and the quantity — see [Your own team](team.md) for details. Re-verifications are ordered through "🔄 Re-verification".

### Web app

1. Open "Create order" and choose a mode: catalog (standard or wholesale price — the switch appears when you have an active subscription), "Team" or re-verification.
2. Choose the exchange and country, and enter the quantity and, for a team order, the price per slot.
3. Review the summary — quantity, total and your balance after payment — and pay.
4. The account upload opens right after payment.

## Publishing {#publish}

After payment, the order waits for you to upload accounts (see [Uploading accounts](upload.md)). Executors can't see the order until you publish it:

1. Upload a session and proxy to every slot in the order. You can't publish part of an order, and a slot without a proxy will stop the order from being published.
2. The order status changes to "📤 Ready to publish". Until you publish, you can open any slot and replace its account.
3. Tap "✅ Publish now" and confirm with "🚀 Confirm & publish" (in the web app, "Publish order").

Once the order is published, you can't change a slot's session or proxy. You can only update the data when the platform itself asks for it on a specific slot (see [Re-uploading](upload.md#reupload)). An unpublished order can be cancelled as a whole with a full refund — see [Cancellations and refunds](cancel-refunds.md).

## Where to see your orders

- **Workspace bot** — "📋 My orders": the "Active", "Completed" and "Re-KYC" (re-verifications) tabs, plus "🔍 Search" by order number, slot number or the account's full email address. An order card shows its slots and the available actions; a slot card shows its status, deadline and event history.
- **Web app** — "Orders", with filters by status, exchange, country, type and period, and "Slots", a single list of every account across all your orders. In the web app, each order has a full event history.
- **Shop bot** — "👤 Profile" → "📋 My Orders": a short list of your purchases.

## Order statuses

| Status | What it means |
|---|---|
| 📥 Waiting for account upload | The order is paid; upload accounts to its slots |
| 📤 Ready to publish | All accounts are uploaded, and the order is waiting to be published |
| 🕓 In pool | The order is published, and its slots are waiting for executors |
| 🔄 Partially in progress | Executors have taken some of the slots; the rest are still waiting |
| 🔄 In progress | Executors are working on the slots |
| ✔️ Completed | All slots are done |
| ✔️ Partially completed | The order is closed, but some of its slots were cancelled |
| 🚫 Cancelled | The order is closed |
| 💸 Refunded | The order was cancelled and the money returned to your balance |

The web app and the shop bot show the same statuses without icons, sometimes with slightly different wording. Statuses of individual slots are described on the [Order execution and deadlines](lifecycle.md#statuses) page.
