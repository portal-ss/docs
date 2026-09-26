# Risk Removal on MEXC

**Risk Removal** is a [re-verification](reverify.md) type for MEXC accounts that the exchange has placed under a Risk Control restriction. The platform prepares an appeal, files it with MEXC on your behalf and sees the case through to a result.

## What a Risk Control restriction is

It's a protective measure on MEXC: if the exchange's anti-fraud system considers an account's activity suspicious, it restricts some operations — withdrawals, for example — until the account passes an additional check. Risk Removal is an order to have that restriction lifted.

## Requirements

Like any re-verification, Risk Removal can only be ordered for a MEXC account that was already verified through the platform (see [Which accounts are eligible](reverify.md#eligibility)).

## What you need to provide

- **An active session and proxy** for the account — the same as for a regular [upload](upload.md).
- **Screenshots of the one or two most recent deposits** to this account.

Screenshot requirements:

1. The screenshot shows the transfer record **on the service the deposit was sent from** to MEXC — not on the MEXC side.
2. The coin, amount, date and time, and TxID (transaction hash) are visible on it.
3. Use the most recent deposit. An earlier one will only do if there have been no recent deposits.
4. Send the screenshot **as a file**, without compression: a regular photo in Telegram gets compressed, small text becomes blurry, and MEXC rejects screenshots like that.
5. For each screenshot, say where the deposit came from — for example, Bybit or Trust Wallet. This label goes into the appeal.
6. The second screenshot is optional and is added as a separate step. You don't need more than two.

!!! warning
    MEXC doesn't accept screenshots from blockchain explorers (Etherscan, Tronscan, BscScan or any others) — this is the most common reason for rejection.

## How to order

The steps are the same as for any re-verification (see [How to order](reverify.md#create)), except that before payment the bot or the web app asks for the deposit screenshots. In the workspace bot, Risk Removal is ordered one account at a time; in the web app, you can attach screenshots for several accounts on a single screen.

## What the platform does

After payment, the process runs automatically:

1. The executor who did the account's first verification completes the face check that the exchange requires.
2. The platform prepares the appeal and files it with MEXC.
3. The platform tracks the exchange's decision itself — you don't need to check anything manually.

## Statuses {#statuses}

| Status | What it means |
|---|---|
| ⚙️ Appeal in progress | The appeal is being prepared |
| 📨 Appeal filed with MEXC | The appeal has been sent and is awaiting the exchange's decision |
| 📷 Repeat face check needed | The exchange has asked for another face check, which the executor will complete |
| 🔁 Appeal rejected | MEXC rejected the appeal; work on the request continues |
| ⚠️ Appeal error | The request needs to be filed again; work on it continues |

## If MEXC says no

- **The deposit screenshots were rejected** — you'll be asked to attach new ones to the same order. You don't need to pay again.
- **The appeal was rejected** — the order isn't closed: the platform keeps working on it on its own, filing the appeal again and arranging additional face checks if needed. You don't need to do anything; just wait for the notification with the result.

## Result

- **Restriction lifted** — you'll get a notification that MEXC has approved the request.
- **Restriction lifted with an observation period** — the exchange may approve the request but keep some features restricted until a certain date; after that date, they're lifted automatically. You'll be notified about this too.

## Cancellation {#cancel}

Until the appeal is filed, the usual [re-verification cancellation rules](cancel-refunds.md#reverify) apply. Once the appeal has been filed with MEXC, the order can't be cancelled — it stays in progress until the exchange makes its decision.
