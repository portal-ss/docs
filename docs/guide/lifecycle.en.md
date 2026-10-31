# Order execution and deadlines

Once the order is published, a slot waits for an executor, the executor completes the verification, the exchange reviews it, and the slot is completed. The executor retries a rejected attempt on their own. If they run out of time, the slot passes to another executor, and your deadline carries on from where it was ([Executor's time](sellers.md#worker-time)).

## Slot statuses {#statuses}

| Status | What it means |
|---|---|
| 📥 Waiting for upload | No account has been [uploaded](upload.md) |
| 📤 Account uploaded | The account is accepted; the order still has empty slots |
| 📤 Ready to publish | All slots are filled — [publish the order](orders.md#publish) |
| 🕓 Awaiting executor | The slot is waiting for an executor |
| 🔄 In progress | The executor is completing the verification or, on MEXC, a face check (in the web app, "Face check") |
| ⏳ Under review (in the web app, "Verifying") | The exchange is reviewing the verification; deadlines are paused |
| 🔄 Attempt failed — the worker is retrying | The exchange rejected the attempt |
| ⚠️ Data update required (in the web app, "Resubmit required") | The slot is paused — [update the data](upload.md#reupload) |
| 📸 Waiting for face check | MEXC: [observation period](#mexc-hold) |
| 📸 KYC passed · turning off face login | BingX: [second stage](#bingx) — send the code when the bot asks |
| 🔎 KYC passed · under support review | BingX: support is reviewing the slot |
| ✔️ Completed | The verification has passed |
| 🚫 Cancelled | The slot is closed; the reason and refund are on the card |

A [frozen slot](#frozen) has "🧊 This slot is waiting for renewal…" above its card; in the web app, its status is "Frozen". Risk Removal has its own statuses — [Risk Removal on MEXC](risk-removal.md#statuses).

## Fulfillment deadline {#deadline}

You choose the deadline when you buy — [options](orders.md#deadline). Re-verifications and Risk Removal have no deadline.

- The deadline runs from the moment the order is published and doesn't restart when the slot passes to another executor.
- While the exchange is reviewing the verification, or the slot is waiting for your data or is frozen, the deadline is paused and then extended by the length of the pause.
- On MEXC and BingX, once KYC is confirmed, the deadline no longer applies: from then on, the [MEXC observation period](#mexc-hold) and the [second stage on BingX](#bingx) apply.

The deadline is shown on the slot card: "⏳ Slot deadline: …"; in the web app, "Verification deadline".

When the deadline passes:

- no verification link has been issued to an executor yet — the slot is cancelled right away, and the money returns to your balance;
- a link has been issued — 10 minutes later, the platform checks the exchange. The verification has passed — the slot is completed; it hasn't — the slot is cancelled with a refund ("⌛ Deadline expired"). Until the exchange answers, the slot isn't cancelled; if the check needs fresh data, the platform asks you to [update it](upload.md#reupload).

## Checking the status {#check-status}

"🔍 Check status" on the slot card ("Check status" in the web app) asks the exchange for the verification status. If the exchange confirms success, the slot counts as completed. You can check again after 30 seconds.

If the check finds a problem: the login has expired or the proxy doesn't respond — the slot asks for a [re-upload](upload.md#reupload); the proxy works, but the exchange doesn't open through it — [replace the proxy](upload.md#proxy-swap).

## MEXC observation period {#mexc-hold}

MEXC often asks for a repeat face check right after verification, so the slot isn't completed right away:

1. For **30 minutes**, the slot shows "📸 Waiting for face check". If the exchange doesn't request a face check, the slot completes on its own.
2. If it does, the executor has **12 hours** to pass it. It costs you nothing.
3. If the executor doesn't make it, the platform checks the exchange: the face check has passed — the slot is completed; it hasn't — the slot is cancelled with a refund.

From the moment KYC is confirmed, the order deadline and the executor's time no longer apply. Nothing is needed from you.

## Second stage on BingX {#bingx}

Once BingX has confirmed KYC, the system turns off face login on the account. This requires the code BingX emails to the account and one more face check, which the same executor passes. The slot's status is "📸 KYC passed · turning off face login"; the order deadline no longer applies, and the slot doesn't pass to another executor. If face login is already off, no code is needed.

### How to send the code

1. Wait for the bot's message "KYC passed. One step left: turning off face login…" with an "🔢 Enter code" button (in the web app, the slot gets a "code needed" tag).
2. Find the latest BingX email with the code in the account's mailbox.
3. Send the code in one of these places:
    - in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) — "🔢 Enter code", then the code in one message, digits only;
    - in the web app — on the slot page, "Enter code", the "Code from the latest BingX email" field, "Send" ([details](web.md#bingx-code));
    - through the API — [BingX code](../api/slot-actions.md#post-bingx-code).
4. The bot replies "Code accepted". After that, the executor passes the face check — nothing is needed from you.

The code works for about 10 minutes. If it has expired, tap "🔢 Enter code" again: the system asks BingX for a new email itself. If it's rejected, check it against the latest email and send it again; after the third wrong code, BingX sends a new email. If the executor needs another face check, the bot asks for a new code.

### Time

| Whose | How much | When it runs |
|---|---|---|
| Yours — for the codes | **1 hour** for the whole slot | Only while the system is waiting for your code; doesn't restart with a new code |
| The executor's — for the face check | **2 hours** | Only on their turn |

While the slot is waiting for a re-upload, both clocks are paused. The time left is shown on the slot card and in every request for a code. Your clock runs from the moment the email is sent, even if the bot's message didn't reach you: don't block the workspace bot, and keep an eye on the account's mailbox.

### How the second stage ends

| Outcome | Money |
|---|---|
| The code is accepted, face login is off | The slot is completed |
| Your hour ran out: "The time to send the codes (1 hour) ran out…" | The slot is completed — KYC has passed, but face login stayed on. The money isn't refunded |
| The executor didn't pass the face check within 2 hours | The platform checks BingX: passed — the slot is completed; not passed — it's cancelled, and the full price goes back to your balance |
| "🔎 KYC passed · under support review" — the system can't complete the slot on its own (for example, BingX also asks for a Google Authenticator code or a phone code) | Support will complete or cancel the slot; whether the money is refunded on cancellation is up to support |

There are no re-verifications for BingX.

## Frozen slots {#frozen}

When your [subscription](subscription.md#expiry) ends, slots of published wholesale and team orders that no executor holds right now are frozen: they aren't offered to executors until you renew.

- Slots already in progress are finished as usual; if such a slot goes back to the queue, it freezes too.
- A frozen slot's deadline is paused; after renewal, it's extended by the time the slot spent frozen.
- Frozen slots aren't cancelled on their own.

Renew the subscription, and the slots go to executors again. Or tap "Cancel frozen" on the order card — [how the refund works](cancel-refunds.md#frozen). Standard orders and re-verifications aren't frozen.
