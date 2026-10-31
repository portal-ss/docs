# Risk Removal on MEXC

**Risk Removal** is a [re-verification](reverify.md) that lifts a Risk Control restriction (for example, a withdrawal ban) from a MEXC account. The platform prepares an appeal, files it with MEXC and tracks the decision.

## Requirements

The account must be [eligible for re-verification](reverify.md#eligibility). Before payment, the platform checks it for free and skips it with the reason if: there's no restriction; Advanced KYC isn't completed (complete it in the MEXC app and try again); MEXC requires a provider or documents the platform doesn't work with; the status couldn't be read (try again in a few minutes).

## Deposit screenshots {#proofs}

Besides cookies and a proxy, you need screenshots of the one or two most recent deposits to the account:

1. The transfer record **on the service the deposit was sent from**, not on the MEXC side.
2. One transaction per screenshot, with the coin, amount, date and time, and TxID visible.
3. A deposit from your own wallet (Trust Wallet, MetaMask and the like) — also a screenshot of the wallet address.
4. The most recent deposit; if there were none in the past 90 days, any earlier one.
5. **As a file**, without compression: MEXC rejects compressed photos.
6. For each one, the source: just the name of the service or wallet, for example Bybit. It goes into the appeal as is and must match the screenshot.

At most 4 screenshots per account. Daily uploads are limited, with room for two full batches in the web app; deleted screenshots count too.

!!! warning
    MEXC doesn't accept screenshots from blockchain explorers (Etherscan, Tronscan, BscScan and others) — this is the most common reason for rejection.

## How to order

The same as a [re-verification](reverify.md#create); after the plan, before payment, attach the screenshots:

- **workspace bot**, one account at a time: "📎 Continue — add the screenshot" → screenshot → source → "➕ Add another screenshot" or "✅ That is all" → "✅ Confirm & pay";
- **web app**, up to 50 accounts: "Add screenshots" → screenshots for each account → "Continue to payment". Accounts without screenshots are skipped.

If MEXC requires a face check, the executor of the initial verification passes it. How long the decision takes depends on MEXC.

## Statuses {#statuses}

After the face check, the slot has its own statuses:

| Status | What it means |
|---|---|
| ⚙️ Appeal in progress | The appeal is being prepared |
| 📨 Appeal filed with MEXC | Waiting for MEXC's decision |
| 📷 Repeat face check needed | The executor is passing the face check again |
| 🔁 Appeal rejected | The restriction wasn't lifted; support decides |
| ⚠️ Appeal error | Support is handling the appeal |

## MEXC's decision

- **"✅ The restrictions on your account are lifted!"** — done.
- **"✅ MEXC approved the appeal!"** with a date — until that date, some features stay restricted; after it, the restrictions are lifted on their own.
- **Screenshots rejected** — in the notification, tap "📸 Upload new screenshots" (on the slot card, "📸 New deposit screenshots"; in the web app, "Send screenshots"). The appeal is filed again, free of charge.
- **Appeal rejected** — the money isn't refunded automatically; support decides the next step.

## Cancellation and refunds {#cancel}

- Before the face check has passed — the usual [re-verification cancellation](cancel-refunds.md#reverify) after 24 hours.
- After it — or from the very start, if MEXC doesn't require a face check — you can cancel only through support at [@freidbase](https://t.me/freidbase).
- The restriction is already gone and the face check hasn't started — a full refund ("ℹ️ No check was needed — refunded").
