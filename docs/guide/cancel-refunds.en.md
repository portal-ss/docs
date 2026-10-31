# Cancellations and refunds

A refund is always the full price of the slot — to your platform balance, split between the main and referral balance in the same proportion as the payment. Subscription payments aren't refunded.

**The main rule.** If a verification link has already been issued to an executor, the platform checks the exchange first: passed — no refund; not passed — the money is refunded; the exchange is still reviewing or the answer is unclear — the slot waits for its answer or a manual review. If no link was issued, the money is refunded right away.

You can cancel an unpublished order, frozen slots and a re-verification yourself. A published initial verification slot is either fulfilled or closed with an [automatic refund](#auto-refunds).

## Unpublished order

On the order card: "🗑 Cancel order" → "✅ Yes, cancel the order" (in the web app, "Cancel order · refund $…" → "Yes, cancel the order"). The full amount goes back to your balance right away.

## Frozen slots {#frozen}

On the order card: "Cancel frozen" → "Yes, cancel". The card shows in advance how much comes back right away; a slot waiting for a data update is checked after the [re-upload](upload.md#reupload). Cancelled slots don't come back when you renew your subscription.

## Re-verification {#reverify}

On the slot card: "❌ Cancel re-verification" → "✅ Yes, cancel" (in the web app, "Cancel re-verification" → "Confirm cancel"). Cancelling is available **24 hours** after the slot went to the executor (if it never did, after the order was placed); the clock is paused while the exchange is reviewing the verification or the slot is waiting for data. In a team order — right away, if the executor has left the team and isn't working on the slot.

After you confirm, the main rule applies; if a link was issued, the exchange is checked **10 minutes** later. If the bot asks you to update the proxy or cookies, the cancellation waits for the [re-upload](upload.md#reupload); if it says the cancel request was dropped, send it again after the update.

You can't cancel it yourself while the slot is waiting for a data update, or for Risk Removal once the face check has passed ([Risk Removal: cancellation](risk-removal.md#cancel)).

## BingX: second stage {#bingx}

What happens to your money at the [second stage](lifecycle.md#bingx), after KYC is confirmed:

- face login is turned off, or your hour for the codes ran out — the slot is completed, no refund;
- the executor didn't pass the face check within their time — the platform checks BingX; not passed — a full refund;
- the slot is under support review — support will complete or cancel it and decide whether to refund.

## Automatic refunds {#auto-refunds}

The platform closes an initial verification slot with a full refund on its own:

| Outcome on the slot card | When |
|---|---|
| ⌛ Deadline expired | The [fulfillment deadline](lifecycle.md#deadline) has passed, and the exchange didn't confirm the verification; on MEXC — the face check wasn't passed within 12 hours ([observation period](lifecycle.md#mexc-hold)); on BingX — see [second stage](#bingx) |
| 🚫 Wrong country verified | The exchange confirmed the verification with a different country |
| 🚫 KYC no longer available | The exchange closed verification for the account |
| ⚠️ Already verified before | No link had been issued yet |
| ⚠️ Cancelled — the exchange won't verify this account … | Work hadn't started, and the exchange won't let it begin: a block, a different country, the daily attempt limit or a check already in progress |

For re-verifications, see [How a re-verification ends](reverify.md#outcomes). If support cancelled the slot, support decides on the refund.

## Where to see a refund {#refund-visible}

In the bot notification ("💵 …$ has been returned to your balance"), on the order card ("💸 Refunded to your balance: $…") and in the web app: "Transactions" → "Refunds".
