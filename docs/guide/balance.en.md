# Balance and top-ups

Everything on the platform — verifications, re-verifications and subscriptions — is paid for from an internal balance in US dollars. You can't pay for an order directly by card or with crypto: you top up your balance first, and payments are then deducted from it.

## What your balance is made of

- **Main** — your crypto top-ups.
- **Referral** — bonuses for clients you've invited (see [Referral program](referral.md)).

When you pay, referral funds are spent first, then main funds. If an order or slot is cancelled, the money goes back to your balance in the same proportion it was charged (see [Cancellations and refunds](cancel-refunds.md)).

You can't withdraw your main balance — it's meant for paying for the platform's services. For withdrawing your referral balance, see [Referral program](referral.md#withdraw).

## How to top up

1. Open the top-up screen:
    - in the shop bot — "👤 Profile" → "💳 Top up balance";
    - in the workspace bot — "💵 Balance" → "💳 Top up balance";
    - in the web app — the "Balance" section.
2. Choose a network: **BEP20 (BSC)**, **Polygon** or **Arbitrum One**.
3. Copy the address. It's assigned to you on the selected network, so you can send every top-up to the same address.
4. Send **USDT** or **USDC** on the selected network to that address. The minimum top-up is **1 USDT/USDC**; transfers below the minimum aren't credited.
5. Once the transaction appears on the network, you'll get a "💸 Deposit detected" notification.
6. After the required number of network confirmations, a second notification arrives: "✅ Credited … to your balance".

!!! warning
    Only USDT and USDC on the networks listed above are accepted. Any other token, or a transfer on a different network, will be lost for good. Before sending, double-check the token, the network and the address.

Top-ups are occasionally paused for a short time. When that happens, the bot shows "⚠️ Deposits are temporarily paused." instead of the network choice. Try again later.

## If your deposit hasn't arrived

If you've sent the funds but the notifications never came, contact support at [@freidbase](https://t.me/freidbase) and include the transaction hash (TxID).

## Where to see your balance and transactions

- **Workspace bot** — "💵 Balance": your main, referral and total balance.
- **Shop bot** — "👤 Profile": your balance, and "📋 My Orders" with amounts.
- **Web app** — the "Balance" section with your deposit history, and the "Transactions" section with the full history of operations (top-ups, payments, refunds, bonuses) and filters. The full history is only available in the web app.
