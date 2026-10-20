# Cancellations and refunds

All refunds go to your internal balance, split between the main and referral balance in the same proportion as the original payment. Money can't be withdrawn from the platform (see [Balance and top-ups](balance.md)).

A refund is always the full price of the slot — there are no partial refunds. Subscription payments are not refunded.

The main rule: if a verification link has already been issued to an executor for a slot, the platform checks the actual result on the exchange before refunding anything. If the verification has passed, the slot counts as completed and there's no refund. If it hasn't, the money is refunded. If the exchange is still reviewing the verification or its answer is unclear, nothing is refunded automatically: the slot waits for the exchange's answer or for a manual review. If no link was ever issued, there's nothing to check — the money is refunded right away.

## What you can cancel yourself

| What | When | Refund |
|---|---|---|
| An unpublished order | Before publishing | In full, right away |
| Frozen slots | Your subscription has expired and no executor is working on the slot | Right away, or after an exchange check |
| A re-verification | After 24 hours (see below) | Right away, or after an exchange check |

You can't cancel initial-verification slots in a published order yourself: they're either fulfilled or closed by the platform with an automatic refund (see [below](#auto-refunds)).

### Unpublished order

Until an order is published, you can cancel it as a whole: "🗑 Cancel order" → "✅ Yes, cancel the order" in the workspace bot, or "Cancel order · refund $…" → "Yes, cancel the order" on the order card in the web app. The full amount goes back to your balance right away. Re-verifications can't be cancelled this way — they have their own rules.

### Frozen slots {#frozen}

When your [subscription](subscription.md#expiry) expires, the slots of published wholesale and team orders that no executor is currently working on are frozen: while you have no subscription, they aren't offered to executors. Frozen slots are never cancelled on their own — they wait for a renewal for as long as it takes.

You can cancel them on the order card: "Cancel frozen" → "Yes, cancel" — in the workspace bot and in the web app. Before you confirm, the card shows how much comes back right away and how many slots need an exchange check first:

- if no verification link was ever issued for a slot, it's cancelled and the money is refunded right away;
- if a link has already been issued, the platform checks the exchange first: not passed — the money is refunded; already passed — the slot is completed and its money isn't refunded. If the exchange is still reviewing the verification or can't be checked, the slot waits for the exchange's answer or for a manual review — you'll be notified of the result;
- if such a slot is waiting for a data update, the exchange is checked once you renew access to the account.

Cancelled slots won't come back when you renew your subscription. A cancellation you've already requested stays in force after a renewal too.

### Re-verification {#reverify}

The "❌ Cancel re-verification" button on the slot card ("Cancel re-verification" in the web app) works **24 hours** after the current attempt started — from the moment the slot went to the executor. That usually happens right after payment. If the slot was never assigned to an executor, it's 24 hours after the order was placed.

Time while the exchange is reviewing the verification or the slot is waiting for a data update doesn't count towards these 24 hours. The slot card shows when cancellation becomes available; in the workspace bot the button is shown from the start, and tapping it early tells you how long is left.

The exception is a team order: if the executor the re-verification is pinned to is no longer on your team and isn't working on the slot right now, you can cancel the slot right away. Add the executor back to your team and the slot becomes available to them again.

What happens after you confirm:

- **No link was ever issued for the slot** — the slot is cancelled and the money is refunded right away.
- **A link was issued** (now or earlier) — the cancellation is accepted, and **10 minutes** later the platform checks the exchange. Not passed — the slot is cancelled with a refund. Passed — the slot is completed with no refund, and you'll get a "ℹ️ Cancellation not applied" notification. The slot card shows when the check will run.
- **The exchange is still reviewing the verification** — the cancellation waits for its answer; if the verification doesn't pass, the money comes back.
- **The exchange couldn't be checked** — if the proxy is down or the session has expired, the bot asks you to update exactly that; otherwise the cancellation goes to a manual review. You'll be notified of the result.
- **An administrator is already closing the slot** — no separate cancellation is needed; you'll be told the result.

If the account's data needs updating while a cancellation is in progress, the cancellation waits for the update. If the message asking you to update the data says your cancel request was dropped, you can send it again once the data is updated.

You can't cancel a re-verification yourself:

- while the slot is waiting for a data update ("⚠️ Data update required") — upload a new session first;
- for Risk Removal — once the first face check has passed, or at all if MEXC doesn't require a face check for that account. Only support can cancel such a slot (see [Risk Removal on MEXC](risk-removal.md#cancel)).

## Automatic refunds {#auto-refunds}

The platform closes a slot with a full refund on its own if:

| Outcome on the slot card | What happened |
|---|---|
| ⌛ Deadline expired | The [fulfillment deadline](lifecycle.md#deadline) you chose for the order has passed, and the exchange check didn't confirm the verification. A MEXC slot is closed the same way if the additional face check isn't passed within 12 hours (see [MEXC observation period](lifecycle.md#mexc-hold)) |
| 🚫 Wrong country verified | The exchange confirmed the verification with a different country from the one in the order |
| 🚫 KYC no longer available | The exchange has closed verification for this account |
| ⚠️ Already verified before | The account turned out to be verified already, and no link had been issued for the slot yet |
| ⚠️ Cancelled — the exchange won't verify this account … | Work on the slot hadn't started, and the exchange won't let a verification begin: the account is blocked or already verified under a different country, its daily attempt limit is used up, or another check is already in progress on it |
| ℹ️ No check was needed — refunded | The exchange didn't request the check that the re-verification was ordered for, and no link had been issued for the slot yet |

If the deadline passes and a link has already been issued for the slot, it's closed only after an exchange check — just as with a manual cancellation. While the exchange is reviewing the verification, the slot isn't cancelled.

The platform closes a re-verification on its own in only two of the cases in the table: wrong country and "no check was needed". An exchange refusal (for example, a blocked account) doesn't close a re-verification and doesn't refund it automatically — support decides what happens to such a slot.

Other cancellation outcomes on the slot card:

- **↩️ Cancelled by you — refunded** — you cancelled an order before publishing, a frozen slot or a re-verification.
- **🚫 Cancelled by an administrator** — support cancelled the slot. Support decides whether to refund it; if there's a refund, the amount is in the notification.

## Where to see a refund {#refund-visible}

- **Workspace bot notification.** When a slot is cancelled, you get a notification with the reason; if money came back, it includes the line "💵 …$ has been returned to your balance." ("💵 Refunded: …$" for a re-verification). If nothing was refunded, there's no money line.
- **Order card.** The line "💸 Refunded to your balance: $…" ("Refunded to your balance: $…" in the web app) shows how much has come back for the order in total.
- **Order summary.** The notification about a finished order shows "💰 Paid" and "💵 Refunded".
- **Transaction history.** In the web app, under "Transactions", a refund appears as a "Refund" transaction; you can filter them with "Refunds".
