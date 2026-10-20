# Order execution and deadlines

## How a slot is fulfilled

Once an order is published, each slot goes through its own path: it waits for an executor, the executor takes it and starts the verification on the exchange, the exchange reviews the verification, and the slot is completed. If an attempt fails but the exchange hasn't refused for good, the executor retries on their own — you don't need to do anything. If the executor doesn't finish within the time they're given, the slot goes back to the queue and another executor takes it (see [Change of executor](#reassign)).

All you need to do is upload the accounts and publish the order, and later update a slot's data if the platform asks you to.

## Slot statuses {#statuses}

| Status in the bot | In the web app | What it means | What you do |
|---|---|---|---|
| 📥 Waiting for upload | Awaiting upload | No account has been uploaded to the slot yet | [Upload an account](upload.md) |
| 📤 Account uploaded | Awaiting upload | The account was accepted, but the order still has empty slots | Upload the rest |
| 📤 Ready to publish | Ready to publish | Every slot in the order has an account | [Publish the order](orders.md#publish) |
| 🕓 Awaiting executor | Waiting for a worker | The order is published, and the slot is waiting for an executor | — |
| Status unchanged, with "🧊 This slot is waiting for renewal…" above the card | Frozen | Your subscription has expired: until you renew, the slot isn't offered to executors | [Renew the subscription or cancel the slot](#frozen) |
| 🔄 In progress | In progress | An executor has taken the slot and is completing the verification | — |
| ⏳ Under review | Verifying | The exchange is reviewing the verification; clocks are paused | — |
| 🔄 Attempt failed — the worker is retrying | Attempt failed | The exchange rejected the attempt, and the executor is trying again | — |
| ⚠️ Data update required | Resubmit required | A fresh proxy, fresh cookies or both are needed; the slot is paused | [Update the data](upload.md#reupload) |
| 📸 Waiting for face check | Waiting for face check | MEXC: the verification has passed, and the platform is waiting to see whether the exchange asks for a face check | — |
| 🔄 In progress | Face check | MEXC has asked for a face check, and the executor is completing it | — |
| ✔️ Completed | Completed | The verification has passed | — |
| 🚫 Cancelled | Cancelled | The slot is closed; the money for it has usually been refunded | — |

Re-verifications use the same statuses; Risk Removal has its own, described on the [Risk Removal on MEXC](risk-removal.md#statuses) page.

The slot card shows the slot's status, its next deadline, its event history and, once the slot is closed, its outcome — for example, "✔️ Passed" or the reason for cancellation (see [Cancellations and refunds](cancel-refunds.md#auto-refunds)).

## Order status {#order-status}

An order's status follows the statuses of its slots:

- before publishing — "📥 Waiting for account upload" or "📤 Ready to publish";
- after publishing — "🔄 In progress", as long as at least one slot is still open;
- once every slot is closed — "✔️ Completed" (all completed), "✔️ Partially completed" (some completed) or "🚫 Cancelled" (none completed).

For a published order, the counters on the order card show where the slots are right now: "🔄 In work", "🕓 Waiting for a worker", "❄️ Frozen", "✔️ Done", "🚫 Cancelled". When a slot moves from one executor to another, the order status doesn't change — only the counters do. If the order had any refunds, the card shows a "💸 Refunded to your balance: $…" line — even while the order is still in progress.

## Fulfillment deadline {#deadline}

You choose a slot's deadline when you buy an initial verification — standard, wholesale or team:

- "No deadline" — the slot is never cancelled for running out of time and waits until it's completed;
- 4, 8, 12, 24, 48 or 72 hours; in the web app, "Other…" lets you enter any whole number of hours from 4 to 72.

The price doesn't depend on your choice. The deadline can't be changed after purchase. Re-verifications and Risk Removal have no deadline.

How the deadline is counted:

- it starts when the order is published, not when an executor takes the slot;
- it belongs to the slot: if the slot passes to another executor, the countdown doesn't restart;
- it stops while the exchange is reviewing the verification ("⏳ Under review"), while the slot is waiting for you to update its data, and while the slot is frozen. After a pause, the deadline moves forward by the length of the pause;
- on MEXC, once the exchange has confirmed the verification, the order deadline no longer applies — from then on, only the [observation period](#mexc-hold) deadlines apply.

The current deadline is shown on the slot card: "⏳ Slot deadline: …" (in the web app, "Verification deadline" with a countdown). While the exchange is reviewing the verification, the card says "⏳ The deadline does not apply: waiting for the exchange's answer."; while the slot is waiting for data, it says "⏸ The deadline is paused — waiting for the session update."

### When the deadline passes

- If no verification link has been issued to an executor yet, the slot is cancelled right away and the money is refunded to your balance.
- If a link has been issued, the executor gets 10 more minutes, after which the platform checks the exchange itself. Meanwhile, the card says "⚠️ The time allowed ran out…". Then:
    - the verification has passed — the slot counts as completed;
    - it hasn't passed — the slot is cancelled and the money is refunded to your balance; the outcome on the card is "⌛ Deadline expired";
    - the exchange is still reviewing the verification — the slot moves to "⏳ Under review" and isn't cancelled until a response comes in;
    - the exchange couldn't be checked because the proxy or session stopped working — the platform asks you to [update the data](upload.md#reupload), and the check runs after that;
    - the exchange didn't respond for another reason — the slot isn't cancelled until a response comes in.

## Change of executor {#reassign}

An executor who takes an initial verification slot gets **4 hours** of their own time for it. That time stops while the exchange is reviewing the verification or the slot is waiting for your data, and nothing the executor does extends it. If they don't make it, the slot goes back to the queue for another executor, and the one who ran out of time can't take that slot again.

While an executor holds the slot, the card shows the moment they have to finish by: "⏳ The worker has until … — otherwise the slot goes back to the pool for another worker." (in the web app, "Back to the pool by … at the latest if the worker doesn't finish"). If your deadline comes first, the card shows that instead.

A slot also goes back to the queue if the executor turns it down or an administrator takes them off it. If the executor ran out of time or turned the slot down after issuing a verification link, the slot doesn't leave at once: the platform waits 10 minutes and checks the exchange — a passed verification counts. For you, a return looks like this: the slot is back to "🕓 Awaiting executor", the order status doesn't change, your deadline carries on from where it was, and nothing is cancelled. A verification passed through the previous executor's link still counts later on. For details, see [Executor's time and returning a slot to the pool](sellers.md#worker-time).

For team orders, you set the executor's time yourself: "⚙️ Settings" → "⏱ Worker's time" in the workspace bot, or "Settings" → "Worker's time per slot" in the web app — 1, 2, 3, 4, 6, 8, 12 or 24 hours, or "No limit" (see [Worker's time per slot](team.md#idle-return)). Re-verifications have no executor's time: a re-verification stays with the executor who did the initial verification.

## MEXC observation period {#mexc-hold}

MEXC often asks for a repeat face check right after the initial verification. That's why a MEXC slot isn't completed as soon as the verification succeeds:

- For **30 minutes**, the platform monitors the account. During this time the slot shows as "📸 Waiting for face check", and the bot sends you a message that KYC has passed. If the exchange doesn't request a face check, the slot completes automatically.
- If the exchange does request a face check, the executor has **12 hours** to pass it. This costs you nothing. Meanwhile, the bot shows the slot as "🔄 In progress", and the web app as "Face check". If the slot is waiting for you to update its data, those 12 hours are paused.
- If the executor doesn't make it in time, the platform checks the exchange: the face check has passed — the slot completes; it hasn't — the slot is cancelled and the money is refunded to your balance.

Once MEXC has confirmed the initial verification, the order deadline and the executor's time no longer apply. You don't need to do anything.

## Frozen slots {#frozen}

Freezing applies only to wholesale and team orders for initial verification. When your [subscription](subscription.md) expires:

- slots of published orders that no executor holds right now are frozen: until you renew, we don't offer them to executors;
- slots already in progress are completed as usual. If such a slot goes back to the queue, it freezes too, and you get a message about it;
- uploading, replacing accounts, re-uploading, checking status and publishing all keep working. You can publish an unpublished order, but its slots are frozen straight away — the order card warns you about this;
- while a slot is frozen, its deadline doesn't run: after you renew, the deadline moves forward by the time the slot was frozen;
- frozen slots are never cancelled on their own — they wait for your renewal as long as it takes.

On the order card, frozen slots are counted under "❄️ Frozen". In the bot, the card of such a slot has "🧊 This slot is waiting for renewal…" above it; in the web app, its status is "Frozen".

What you can do:

- **"Renew subscription"** — the slots are offered to executors again;
- **"Cancel frozen"** on the order card — for slots where no verification link was issued, the money is refunded right away; where one was, the exchange is checked first. For details, see [Cancellations and refunds](cancel-refunds.md#frozen).

Standard orders and re-verifications are never frozen. For how freezing works on team orders, see [When your subscription ends](team.md#subscription-lapse).

## Checking the status {#check-status}

The "🔍 Check status" button on the slot card ("Check status" in the web app) asks the exchange for the current state of the verification — or, on MEXC during an additional face check, the state of that check. The check works the same way as the executor's: if the exchange confirms success, the slot counts as completed, no matter who tapped the button.

The button is there when the slot has an account and a proxy uploaded, and the slot is:

- not yet taken by an executor — including before publishing;
- in progress, with the executor having already started the verification on the exchange;
- under review by the exchange, or after a failed attempt;
- going through an additional face check on MEXC.

It isn't available while an executor has taken the slot but hasn't started the verification yet, while the slot is waiting for a data update, during the 30-minute MEXC observation period, on completed and cancelled slots, or at the Risk Removal stages. You can check the same slot again after 30 seconds at the earliest.

If the check finds a problem with the data on a published order:

- the session has expired or the proxy doesn't respond — the slot moves to "⚠️ Data update required" (see [Re-uploading](upload.md#reupload));
- the proxy works, but the exchange doesn't open through it — you can [replace the proxy yourself](upload.md#proxy-swap).

Before publishing, just replace the slot's data instead.

## Notifications

The bot notifies you about key events:

- a slot is waiting for a data update — for one slot or as a summary for several; if the data hasn't arrived after 6 hours, you get one reminder;
- a MEXC verification has passed and the observation period has started;
- a slot has been completed or cancelled (with the reason and the refund amount);
- a whole order has been completed;
- the check of uploaded accounts has finished, if the bot didn't wait for its result in the dialog;
- your subscription is about to expire or has expired, slots have been frozen, or they're offered to executors again after you renew (see [Subscription](subscription.md));
- a top-up has been detected and credited;
- a referral bonus has been credited.

In the web app ("Settings" → "Notifications"), you can turn "Per slot", "Per order", "Deposits" and "Referral bonuses" notifications on or off separately. Requests to update data and subscription messages always come through, as does the outcome of a cancellation you asked for yourself. You can also turn off referral bonus notifications in the workspace bot, in the "🎟️ Referrals" section.
