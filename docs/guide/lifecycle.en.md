# Order execution and deadlines

## How a slot is fulfilled

Once an order is published, each slot goes through its own path: it waits for an executor, the executor takes it and starts the verification on the exchange, the exchange reviews the verification, and the slot is completed. If an attempt fails but the exchange hasn't refused for good, the executor retries on their own — you don't need to do anything.

All you need to do is upload the accounts and publish the order, and later update a slot's data if the platform asks you to.

## Slot statuses {#statuses}

| Status | What it means | What you do |
|---|---|---|
| 📥 Waiting for upload | No account has been uploaded to the slot yet | [Upload an account](upload.md) |
| 📤 Account uploaded | The account was accepted, but the order still has slots without an account | Upload the rest |
| 📤 Ready to publish | Every slot in the order has an account | [Publish the order](orders.md#publish) |
| 🕓 Awaiting executor | The order is published, and the slot is waiting for an executor | — |
| 🔄 In progress | An executor has taken the slot and is completing the verification | — |
| ⏳ Under review | The exchange is reviewing the verification | — |
| 🔄 Attempt failed — the worker is retrying | The attempt didn't succeed, and the executor is trying again | — |
| 📸 Waiting for face check | MEXC: the observation period or an additional face check | — |
| ⚠️ Data update required | A fresh proxy, fresh cookies or both are needed | [Update the data](upload.md#reupload) |
| ✔️ Completed | The verification has passed | — |
| 🚫 Cancelled | The slot is closed; the money for it has usually been refunded | — |

In the web app, statuses appear without icons, sometimes with slightly different wording. Re-verifications use the same statuses; Risk Removal has its own, described on the [Risk Removal on MEXC](risk-removal.md#statuses) page.

The slot card shows the slot's status, deadline and event history and, once the slot is closed, its outcome — for example, "✔️ Passed" or the reason for cancellation (see [Cancellations and refunds](cancel-refunds.md#auto-refunds)).

## MEXC observation period

MEXC often asks for a repeat face check right after the initial verification. That's why a MEXC slot isn't completed as soon as the verification succeeds:

- For **30 minutes**, the platform monitors the account. If the exchange doesn't request a face check, the slot completes automatically.
- If the exchange does request a face check, the executor has **12 hours** to pass it. This costs you nothing. If the executor doesn't make it in time, the slot is cancelled and the money is refunded to your balance.

Throughout this time, the slot shows as "📸 Waiting for face check". You don't need to do anything.

## Fulfillment deadline {#deadline}

The executor has **24 hours** to complete a slot, counted from the moment they take it. Only active time counts: the clock is paused while the slot is waiting for you to update its data, and it doesn't run while the exchange is reviewing the verification. The current deadline is shown on the slot card.

When the time is up, the slot isn't cancelled right away. Instead, the platform checks the result on the exchange:

- the verification has passed — the slot counts as completed;
- it hasn't passed — the slot is cancelled and the money is refunded to your balance;
- the exchange is still reviewing the documents — the slot isn't cancelled until a response comes in.

### Custom deadline

If executors in your countries need more time, you can extend the deadline: "⚙️ Settings" → "⏰ Slot deadline" in the workspace bot, or "Settings" in the web app. You can't set it shorter than the system deadline; to go back to the system value, use "Reset to system default". A custom deadline applies to standard, wholesale and team orders, but not to re-verifications.

## Checking the status

The "🔍 Check status" button on the slot card asks the exchange for the current state of the verification — or, on MEXC during an additional face check, the state of that check. The check works the same way as the executor's: if the exchange confirms success, the slot counts as completed, no matter who tapped the button.

The check is available once the executor has started the verification on the exchange, and during an additional face check on MEXC. It isn't available before the executor starts the verification, while the slot is waiting for a data update, during the 30-minute MEXC observation period, on completed and cancelled slots, or at the Risk Removal stages that the platform tracks itself.

## Notifications

The bot notifies you about key events:

- a slot is waiting for a data update — for one slot or as a summary for several;
- a slot has been completed or cancelled (with the reason and the refund amount);
- a whole order has been completed;
- a top-up has been detected and credited;
- a referral bonus has been credited.

In the web app ("Settings" → notifications), you can turn notifications for slots, orders, top-ups and referral bonuses on or off separately. You can also turn off referral bonus notifications in the workspace bot, in the "🎟️ Referrals" section.
