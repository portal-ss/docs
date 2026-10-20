# Executors and order distribution

The verifications on the exchange are carried out by real people: executors (called "Sellers" in the interface). An executor passes the identity check through a link that the platform generates inside your session. Executors don't have your account's login details.

You can see who is working on a slot in its card: "👨‍💻 Executor: #…" in the workspace bot and "Worker" in the web app. The executor appears under the same number in the ["Marketplace"](#priority-block) section.

## Confirmed country

When an executor registers, the platform compares the country of their phone number with their actual location. If the two match, the executor gets a confirmed country. As a result, your orders go first to people who are actually in the order's country, which improves the account's chances of passing future re-verifications.

## How an order finds an executor

Standard and wholesale orders go first to local executors whose confirmed country matches the order:

1. First, the order is shown to your **priority** executors from that country.
2. Then it's shown to all executors whose confirmed country matches the order.

A slot that [returns to the pool](#worker-time) goes through the same order again.

Executors you've blocked don't see your standard and wholesale orders.

Team orders are visible only to members of [your team](team.md). A re-verification goes only to the executor who did the account's first verification (see [Re-verifications](reverify.md)).

## Executor's time and returning a slot to the pool {#worker-time}

When an executor takes an initial verification slot, they have **4 hours** of their own time to pass it. The time doesn't run while the slot is waiting for you to update its data or while the exchange is reviewing the verification. For team orders, you set this time yourself — see [Worker's time per slot](team.md#idle-return).

The slot card shows the time by which the executor has to finish: "⏳ The worker has until …" in the workspace bot, "Back to the pool by … at the latest" in the web app. If the [slot deadline](lifecycle.md#deadline) comes first, the card shows that instead.

A slot goes back to the pool if the executor runs out of time or gives the slot up themselves:

- if they've already issued a verification link, the slot doesn't leave right away: the platform waits 10 minutes and checks the exchange — a passed verification counts;
- after it's returned, the slot waits for an executor again; the previous executor can't take this particular slot again, but can take the order's other slots;
- you don't pay anything extra, and the slot deadline, if you set one, doesn't start over;
- if the account still passes through the link the previous executor issued, the slot goes back to them and counts as completed.

You can't swap the executor on a taken slot yourself: if they don't make it in time, the slot goes back to the pool on its own.

Re-verifications don't go back to the pool: they have no such time limit, and only the executor assigned to the account can do them.

## If an executor doesn't succeed

If the exchange rejects an attempt, the executor retries on the same slot — nothing is needed from you. If the exchange gives a final refusal on the executor's attempt (for example, the document's country doesn't match the order's country), the slot is closed with a full refund — see [Automatic refunds](cancel-refunds.md#auto-refunds). Such a case counts as a failure for the executor.

## Quality control

The platform monitors how well executors handle re-verifications. If an executor's re-verification success rate drops below the acceptable level, they automatically stop receiving new orders from the shared pool. This doesn't affect slots they've already taken, re-verifications assigned to them or team orders — you manage your own team yourself.

## Priority and blocking {#priority-block}

In the web app, the "Sellers" screen has a "Marketplace" section. It lists executors who have taken slots of your standard and wholesale orders in the last 90 days, plus everyone you've already prioritized or blocked — even if they haven't worked for you in a long time. Members of your team aren't shown here. You can filter the list: "All", "Priority", "Blocked".

| Action | What it does |
|---|---|
| "Prioritize" | The executor sees your future orders in their confirmed country first. Available only for executors with a confirmed country |
| "Remove" | Removes the priority |
| "Block" | The executor no longer sees your standard and wholesale orders. Slots they've already taken, team orders and re-verifications of accounts they verified aren't affected |
| "Unblock" | Removes the block |

An executor can be either prioritized or blocked, not both.

!!! note
    Priority and blocking are available only in the [web app](web.md).

## Executor's record {#record}

For each executor, you see only your own history with them, for all time: how many of your graded slots they passed and what share that is — for example, "12/13" and "92%". The platform doesn't show an overall executor rating.

Only finished slots are graded: those that passed and those closed through the executor's fault. Slots still in progress, slots returned to the pool, slots the executor gave up and closures that weren't their fault — for example, a slot deadline that ran out shortly after they took the slot — don't count. Until there are graded slots, the record shows "no slots yet".

The "Marketplace" counts all your orders except team orders; the "My team" section counts only team orders (see [Team statistics](team.md#stats)).
