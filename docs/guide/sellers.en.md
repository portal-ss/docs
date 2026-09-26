# Executors and order distribution

The verifications on the exchange are carried out by real people: executors (called "Sellers" in the interface). An executor passes the identity check through a link that the platform generates inside your session. Executors don't have your account's login details.

## Confirmed country

When an executor registers, the platform compares the country of their phone number with their actual location. If the two match, the executor gets a confirmed country. As a result, your orders are fulfilled by people who are actually in the order's country, which improves the account's chances of passing future re-verifications.

## How an order finds an executor

Standard and wholesale orders are distributed among local executors whose confirmed country matches the order:

1. First, the order is shown to your **priority** executors from that country.
2. Then it's shown to all executors whose confirmed country matches the order.

Executors you've blocked don't see your orders.

Team orders are visible only to members of [your team](team.md). A re-verification goes only to the executor who did the account's first verification (see [Re-verifications](reverify.md)).

## Quality control

The platform monitors how well executors handle re-verifications. If an executor's re-verification success rate drops below the acceptable level, they automatically stop receiving new orders from the shared pool. This doesn't affect slots they've already taken or re-verifications assigned to them.

## Priority and blocking

In the web app, the "Sellers" screen has a "Marketplace" section. It lists executors who have recently fulfilled your orders, along with those you've already prioritized or blocked. For each executor, you see only your own history with them — how many slots they've completed and what share of them passed. The platform doesn't show an overall executor rating.

| Action | What it does |
|---|---|
| "Prioritize" | The executor sees your future orders in their confirmed country first. Available only for executors with a confirmed country |
| "Remove" | Removes the priority |
| "Block" | The executor no longer sees your orders from the shared pool. Slots they've already taken and team orders aren't affected |
| "Unblock" | Removes the block |

!!! note
    Priority and blocking are available only in the [web app](web.md).
