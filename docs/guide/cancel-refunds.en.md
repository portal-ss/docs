# Cancellations and refunds

All refunds go to your internal balance, split between the main and referral balance in the same proportion as the original payment. Money can't be withdrawn from the platform (see [Balance and top-ups](balance.md)).

The main rule: before refunding anything, the platform checks the actual result on the exchange. If it turns out the verification has already passed, the slot counts as completed and there's no refund.

## What you can cancel yourself

| What | When | Refund |
|---|---|---|
| An unpublished order | Before publishing | In full, right away |
| Frozen slots | Your subscription has expired and the slots haven't started | Right away, or after an exchange check |
| A re-verification | After 24 hours (see below) | After an exchange check, if the verification hasn't passed |

You can't cancel initial-verification slots in a published order yourself: they're either fulfilled or closed by the platform with an automatic refund (see [below](#auto-refunds)).

### Unpublished order

Until an order is published, you can cancel it as a whole: "🗑 Cancel order" → "✅ Yes, cancel the order" in the workspace bot, or the same button on the order card in the web app. The full amount goes back to your balance right away. This also works for an order with frozen slots. Re-verifications can't be cancelled this way — they have their own rules.

### Frozen slots {#frozen}

When your [subscription](subscription.md#expiry) expires, wholesale and team order slots that haven't started yet are frozen. You can cancel them with "🗑 Cancel … and refund …" → "✅ Yes, cancel":

- for slots where no verification link has been issued to an executor yet, the money is refunded right away;
- if a link has already been issued for a slot, the platform checks the exchange first and refunds the money if the verification hasn't passed. If the exchange can't be checked, the slot goes to an additional review, and you'll be notified of the result.

Cancelled slots won't come back when you renew your subscription. If you neither renew your subscription nor cancel the slots within **6 hours** of it ending, the platform cancels them itself, under the same refund rules.

### Re-verification {#reverify}

The "❌ Cancel re-verification" button on the slot card becomes available:

- **24 hours** after the executor took the slot;
- if no executor ever took the slot, 24 hours after the order was created.

This timer is paused while the exchange is reviewing the verification. The slot card shows when cancellation becomes available.

What happens after you confirm:

- **The executor hasn't started the check yet** — the slot is cancelled and the money is refunded right away.
- **The executor's check is active** — cancellation takes up to **10 minutes**. If the verification passes during that time, the slot counts as completed. If not, it's cancelled with a refund.
- **A link was issued for the slot earlier** — the platform checks the status on the exchange: if it hasn't passed, you get a refund; if it has, the slot is completed.
- **The exchange couldn't be checked** — the cancellation doesn't go through, or it goes to an additional review; the platform may ask you to update the slot's data. You'll be notified of the result.

You can't cancel a re-verification while the slot is waiting for a data update ("⚠️ Data update required") — upload a new session first. Once an appeal has been filed with MEXC, a Risk Removal can't be cancelled (see [Risk Removal on MEXC](risk-removal.md#cancel)).

## Automatic refunds {#auto-refunds}

The platform cancels a slot and refunds the money on its own if:

| Outcome on the slot card | What happened |
|---|---|
| ⌛ Deadline expired | The executor missed the [deadline](lifecycle.md#deadline), and the exchange check didn't confirm the verification |
| 🚫 Wrong country verified | The exchange confirmed the verification with a different country from the one in the order |
| 🚫 KYC no longer available | The exchange has closed verification for this account |
| ⚠️ Cancelled — the exchange won't verify this account | The account is blocked or already verified under a different country |
| ⏸ Cancelled — subscription not renewed | A frozen slot was cancelled 6 hours after the subscription ended |
| ℹ️ No check was needed | The exchange didn't request the check that the re-verification was ordered for |
| ↩️ Cancelled by you | You cancelled a re-verification or a frozen slot |

In addition, on MEXC an initial-verification slot is cancelled with a refund if the executor doesn't pass the additional face check within 12 hours (see [MEXC observation period](lifecycle.md)).

If a cancellation affects a slot for which a link has already been issued, the refund goes through only after an exchange check — just as with a manual cancellation.
