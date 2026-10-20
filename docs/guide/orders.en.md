# Orders

## Orders and slots

An **order** is a single purchase: an exchange, a country and a number of verifications. A **slot** is one account within an order: an order for five verifications has five slots. Slots are fulfilled independently of each other — one may already be completed while another is still waiting for an executor. The order's status is derived from the statuses of its slots (see [Order statuses](#statuses)).

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
2. Check the product card: the price per slot, a description and, where available, a guide, the working hours of executors in that country (outside those hours, there may be delays) and the prices of re-verifications for that country.
3. Tap "🛒 Buy" and enter the quantity. The number of slots in a single order is limited.
4. On the confirmation screen, check the total and your balance, optionally choose a [slot deadline](#deadline), and tap "✅ Confirm".
5. The payment is deducted from your balance right away. If you don't have enough funds, the bot replies "Insufficient balance." — [top up your balance](balance.md) and try again. If the price has changed in the meantime, the bot shows the new total and asks you to confirm again.
6. The bot shows the order number and an "📤 Upload accounts" button, which opens the upload in the workspace bot.

If a product is temporarily unavailable, the card shows "⛔️ Currently out of stock". Tap "🔔 Notify when available", and the bot will let you know when you can place the order.

### Workspace bot @kycportal_bot

"➕ New order" offers three options: "Wholesale", "Standard" (takes you to the shop bot) and "For my team".

- **Wholesale** — choose the exchange and country, tap "🛒 Buy", enter the quantity and confirm. Without an active subscription, the product card shows "💳 Get a subscription" instead of "🛒 Buy".
- **For my team** — choose the exchange and any country, then set the price per slot and the quantity; see [Your own team](team.md) for details.

You can choose a [slot deadline](#deadline) on the confirmation screen of wholesale and team orders too. If your subscription ends in less than 24 hours, the bot warns you: slots that no executor has taken by then will stop being offered to executors until you renew (see [When your subscription ends](subscription.md#expiry)). It's only a warning — you can still place the order.

Re-verifications are ordered through "🔄 Re-verification".

### Web app

1. Open "Create order" and choose a mode: "Catalog", "Team" or "Reverification". In the catalog, with an active subscription you can choose the price — "Standard" or "Wholesale"; without one, the subscription price is shown next to the standard price.
2. Choose the exchange and country, and enter the quantity and, for a team order, the price per slot. Optionally set a "Slot deadline" (see [below](#deadline)).
3. Review the summary — quantity, total and your balance after payment — then tap "Pay" and confirm. If you don't have enough funds, the web app shows how much you're short and offers to top up. If your subscription ends in less than 24 hours, you'll see the same warning as in the bot.
4. After payment, a screen with the new order opens, with "Upload accounts" and "View order" buttons.

## Slot deadline {#deadline}

When you buy a standard, wholesale or team order, you can set a deadline by which each slot must pass verification:

- in the bots — with the buttons on the confirmation screen: "No deadline", "4 h", "8 h", "12 h", "24 h", "48 h" or "72 h";
- in the web app — in the "Slot deadline" step: the same options, or "Other…" for any whole number of hours from 4 to 72.

The deadline counts from the moment the order is published and is the same for all its slots. You can't change it after purchase, and it doesn't affect the price. If verification hasn't passed by the deadline, the slot is cancelled and the money returns to your balance. Without a deadline, a slot is never cancelled for running out of time. For how the deadline runs, see [Order execution and deadlines](lifecycle.md#deadline).

## Publishing {#publish}

After payment, the order waits for you to upload accounts (see [Uploading accounts](upload.md)). Executors can't see the order until you publish it:

1. Upload a session and proxy to every slot in the order. You can't publish part of an order: a slot without an account or without a proxy will stop the order from being published.
2. The order status changes to "📤 Ready to publish". Until you publish, you can open any slot and replace its account.
3. Tap "✅ Publish now" and confirm with "🚀 Confirm & publish" (in the web app, "Publish order" → "Publish").

If your subscription has already ended, you can still publish a wholesale or team order, but its slots will be frozen right away until you renew — the order card warns you about this with "🧊 Subscription expired — once published, the slots stay frozen until it is renewed." (see [When your subscription ends](subscription.md#expiry)).

Once the order is published, you can't change a slot's session or proxy at will. You can update the data when the platform itself asks for it on a specific slot, and replace the proxy when a check shows that the proxy works but the exchange doesn't open through it — the slot card then shows "🔌 Replace proxy" (see [Re-uploading](upload.md#reupload)). An unpublished order can be cancelled as a whole with a full refund — see [Cancellations and refunds](cancel-refunds.md).

## Where to see your orders

- **Workspace bot** — "📋 My orders": the "Active", "Completed" and "Re-KYC" (re-verifications) tabs, plus "🔍 Search" by order number, slot number or the account's full email address. An order card shows its status, slot counters (see [below](#statuses)), the refunded amount if there was a refund, its slots and the available actions; a slot card shows its status, deadline and event history.
- **Web app** — "Orders": the "Active" and "Completed" tabs, search by order or slot number, filters by status, exchange, country, type and period, and a "Needs attention" view — orders with slots waiting for you to update their data. "Slots" is a single list of every account across all your orders, searchable by slot number, order number or the full account. In the web app, each order has a full event history.
- **Shop bot** — "👤 Profile" → "📋 My Orders": a short list of your purchases.

## Order statuses {#statuses}

An order's status shows only its overall stage:

| Status | What it means |
|---|---|
| 📥 Waiting for account upload | The order is paid, but not every slot has an account yet |
| 📤 Ready to publish | Every slot has an account, and the order is waiting to be published |
| 🔄 In progress | The order is published, and not all of its slots are closed yet |
| ✔️ Completed | All slots are done |
| ✔️ Partially completed | All slots are closed: some were done, some were cancelled |
| 🚫 Cancelled | All slots are closed and none was done |

While an order is "🔄 In progress", its status doesn't change when executors take slots or slots go back to the pool. The counters on the order card show where each slot is right now:

- "🔄 In work: N" — slots an executor is working on;
- "🕓 Waiting for a worker: N" — slots nobody has taken at the moment;
- "❄️ Frozen: N" — slots waiting for you to renew your [subscription](subscription.md#expiry);
- "✔️ Done: N" and "🚫 Cancelled: N".

There's no separate status for a refund. If money came back for the order — for a cancelled order or just for some of its slots — the card shows a "💸 Refunded to your balance: $…" line.

The web app shows the same statuses and counters without icons; the shop bot shows statuses with its own icons, sometimes with slightly different wording. Statuses of individual slots are described on the [Order execution and deadlines](lifecycle.md#statuses) page.
