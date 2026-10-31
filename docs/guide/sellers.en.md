# Executors and order distribution

## Who gets an order

Standard and wholesale orders go to executors whose confirmed country is the order's country — their phone number's country matched their actual location. In order of priority:

1. your [priority](#priority-block) executors from that country;
2. all executors with the order's country confirmed.

Executors you've blocked don't see these orders. Team orders are visible only to [your team](team.md), and a re-verification only to the executor of the account's first verification.

## Executor's time and returning a slot to the pool {#worker-time}

An executor has **4 hours** of their own time for an initial verification slot; in team orders, [as much as you set](team.md#idle-return). The time doesn't run while the slot is waiting for you or the exchange. The cut-off is on the slot card ("⏳ The worker has until …").

If the executor runs out of time or gives the slot up, it goes back to the pool:

- if a verification link has already been issued, the platform waits 10 minutes and checks the exchange; a passed verification counts;
- the previous executor can't take this slot again;
- you don't pay extra, and the [fulfillment deadline](lifecycle.md#deadline) doesn't restart;
- if the account later passes through the previous executor's link, the slot counts for them.

You can't change the executor manually. Re-verifications don't go back to the pool. On MEXC after KYC and at the BingX second stage, the slot stays with the same executor — [MEXC](lifecycle.md#mexc-hold), [BingX](lifecycle.md#bingx).

## Priority and blocking {#priority-block}

Web app only: "Sellers" → "Marketplace". It lists executors who took your standard and wholesale orders in the last 90 days, plus everyone you've already prioritized or blocked.

| Button | What it does |
|---|---|
| "Prioritize" | The executor sees your orders in their confirmed country first |
| "Block" | The executor doesn't see your standard and wholesale orders. Slots they've already taken, team orders and re-verifications of their accounts aren't affected |
| "Remove" / "Unblock" | Removes the priority / the block |

## Executor's record {#record}

For each executor, you see only your own history with them: how many graded slots they passed, for example "12/13" and "92%". Graded slots are those passed and those closed through the executor's fault; slots in progress, returns to the pool, slots given up and closures that weren't their fault don't count. "Marketplace" counts all orders except team orders; "My team" counts only team orders.
