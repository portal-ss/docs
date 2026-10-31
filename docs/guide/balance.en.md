# Balance and top-ups

All purchases are paid from your balance in US dollars. The **main** balance holds your top-ups and can't be withdrawn. The **referral** balance holds bonuses for people you've invited ([withdrawal](referral.md#withdraw)); it's spent first when you pay.

## Topping up

1. Open the top-up screen: "👤 Profile" → "💳 Top up balance" in the shop bot, "💵 Balance (…$)" → "💳 Top up balance" in the workspace bot, or "Balance" in the web app.
2. Choose a network: **BEP20 (BSC)**, **Polygon** or **Arbitrum One**.
3. Copy the address from the screen before every transfer: the address may change.
4. Send **USDT** or **USDC**, at least **1**. A smaller amount isn't credited.
5. Wait for the "✅ Credited … to your balance" notification. 1 USDT or USDC = $1.

| Network | Confirmations |
|---|---|
| BEP20 (BSC) | 8 |
| Polygon | 30 |
| Arbitrum One | 20 |

!!! warning
    A different token or a different network means the money is lost for good. Double-check the token, network and address.

Notifications go to the bot where you last opened the address; if that was the web app, to the workspace bot. Turn them off in the web app: "Settings" → "Notifications" → "Deposits".

## If your deposit hasn't arrived

1. Check the token, network and amount.
2. Find the deposit in the web app: "Balance" → "History". It appears there even before it's credited.
3. If everything is correct but the money hasn't been credited, contact [@freidbase](https://t.me/freidbase) and include the transaction hash (TxID).

The full transaction history is in the web app, in the "Transactions" section. Your balance and top-up address are also available [in the API](../api/account.md#get-balance).
