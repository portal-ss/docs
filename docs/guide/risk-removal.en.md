# Risk Removal on MEXC

**Risk Removal** is a [re-verification](reverify.md) type for MEXC accounts that the exchange has placed under a Risk Control restriction. The platform prepares an appeal, files it with MEXC on your behalf and tracks the exchange's decision.

## What a Risk Control restriction is

It's a protective measure on MEXC: if the exchange's anti-fraud system considers an account's activity suspicious, it restricts some operations — withdrawals, for example — until the account passes an additional check. Risk Removal is an order to have that restriction lifted.

## Requirements

Like any re-verification, Risk Removal can only be ordered for a MEXC account that was already verified through the platform (see [Which accounts are eligible](reverify.md#eligibility)).

Before you pay, the platform checks each account for free and skips it with the reason shown — for example, if:

- the account has no restriction — there's nothing to lift;
- Advanced KYC isn't completed on the account — finish it in the MEXC app and try again;
- MEXC checks faces on this account through a provider the platform doesn't work with;
- MEXC asks for documents on this account that the platform can't file yet;
- the account's status couldn't be read — try again in a few minutes.

## What you need to provide

- **An active session and proxy** for the account — the same as when ordering any [re-verification](reverify.md#create).
- **Screenshots of the one or two most recent deposits** to this account.

Everything else MEXC asks for in the appeal, the platform prepares itself.

Screenshot requirements:

1. The screenshot shows the transfer record **on the service the deposit was sent from** to MEXC — not on the MEXC side.
2. One screenshot, one transaction. The coin, amount, date and time, and TxID (transaction hash) are visible on it.
3. If the deposit came from your own wallet (Trust Wallet, MetaMask and the like), MEXC needs two screenshots for it: the transaction and your wallet address.
4. Use the most recent deposit. If there were no deposits in the past 90 days, an earlier one will do.
5. Send the screenshot **as a file**, without compression: a regular photo in Telegram gets compressed, small text becomes blurry, and MEXC rejects screenshots like that.
6. For each screenshot, say where the deposit came from — just the name of the service or wallet, for example Bybit or Trust Wallet. It goes into the appeal verbatim and must match the screenshot.
7. One deposit is enough. A second deposit (MEXC accepts proof of the last 1–2) and wallet-address screenshots are added as separate steps — no more than 4 screenshots per account in total.

!!! warning
    MEXC doesn't accept screenshots from blockchain explorers (Etherscan, Tronscan, BscScan or any others) — this is the most common reason for rejection.

## How to order

The steps are the same as for any re-verification (see [How to order](reverify.md#create)), except that after the plan, before payment, the bot or the web app asks for the deposit screenshots.

- **In the workspace bot**, Risk Removal is ordered one account at a time. After the plan, tap "📎 Continue — add the screenshot", send the screenshot and write where the deposit came from. Then tap "➕ Add another screenshot" or "✅ That is all", review the summary and tap "✅ Confirm & pay".
- **In the web app**, you can order up to 50 accounts at once: at the "Add screenshots" step, attach screenshots for each account and tap "Continue to payment". Accounts without screenshots are skipped, not ordered.

## What the platform does

After payment, the process runs automatically:

1. If MEXC requires a face check for the appeal, the executor who did the account's first verification completes it. If it doesn't, this step is skipped.
2. The platform prepares the appeal and files it with MEXC.
3. The platform tracks the exchange's decision itself — you don't need to check anything manually. How long the decision takes depends on MEXC.

If the session expires or the proxy stops working in the meantime, the bot asks you to update the data (see [Re-uploading](upload.md#reupload)).

## Statuses {#statuses}

While the executor is doing the face check, the slot shows the regular [statuses](lifecycle.md#statuses). After that, it has its own:

| Status | What it means |
|---|---|
| ⚙️ Appeal in progress | The appeal is being prepared. Nothing is needed from you |
| 📨 Appeal filed with MEXC | The appeal has been sent and is awaiting the exchange's decision |
| 📷 Repeat face check needed | The face check has to be passed again — the same executor does it. Nothing is needed from you |
| 🔁 Appeal rejected | MEXC closed the appeal without lifting the restriction. Support decides the next steps |
| ⚠️ Appeal error | Something went wrong with the appeal, and support is handling it. Nothing is needed from you |

## If MEXC says no

- **The deposit screenshots were rejected** — you'll get a notification with an "📸 Upload new screenshots" button; the slot card in the bot shows a "📸 New deposit screenshots" button, and the web app shows a "New deposit screenshots needed" block with a "Send screenshots" button. The new screenshots fully replace the old ones, and the appeal is filed again. You don't need to pay again.
- **The appeal was rejected** — the status is "🔁 Appeal rejected". The order isn't closed on its own, and the money isn't refunded automatically. Support decides what to do next — file the appeal again, redo the face check or ask for new screenshots; if anything is needed from you, you'll get a notification. Sometimes MEXC lifts the restriction even after a rejection — support then closes the slot as completed.

## Result

- **Restriction lifted** — you'll get a "✅ The restrictions on your account are lifted!" notification.
- **Restriction lifted with an observation period** — the exchange may approve the request but keep some features restricted until a certain date; after that date, they're lifted automatically. You'll get a "✅ MEXC approved the appeal!" notification with that date.
- **Slot closed as completed by support** — you'll get a notification that an administrator closed the slot as completed.

## Cancellation and refunds {#cancel}

Risk Removal has no fulfillment deadline, and a refusal from MEXC doesn't cancel the order or refund it automatically.

- Until the executor has passed the first face check, the usual [re-verification cancellation rules](cancel-refunds.md#reverify) apply: you can cancel after 24 hours.
- Once the first face check has passed, you can't cancel the order yourself — the cancel button disappears, and in the web app the slot card says: "This can no longer be cancelled here: the face check has passed and support is handling the slot now. To cancel it, contact support."
- If MEXC doesn't require a face check for the account, you can't cancel the order yourself at all — support handles such a slot from the start. To cancel it, contact support.

If the executor hasn't started the face check yet and the account no longer has the restriction, the slot is closed with a full refund ("ℹ️ No check was needed — refunded"). Once a face check has been done or the appeal has been filed, nothing is refunded automatically — support decides what happens to the slot.
