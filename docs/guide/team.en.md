# Your own team

Executors you've invited yourself fulfill your team orders. Manage them in "👨‍💻 My team" in the workspace bot or "Sellers" → "My team" in the web app. You can build a team without a subscription, but team orders need a [subscription](subscription.md).

## Invitations

Send the executor your invite link: in the bot, it's on the "👨‍💻 My team" screen; in the web app, in the "Invite link" block. They register in the executors' bot and join your team right away. A team can have up to **100** members, including paused ones. The link doesn't expire; "🔄 New link" ("New link" in the web app) turns off the old one.

## Members

| Action | Bot / web app | What happens |
|---|---|---|
| Limits | "📊 Limits" / "Slot limits" | How many slots they can take from one order and hold at once; re-verifications don't count |
| Countries | "🌍 Countries" / "Allowed countries" | Which countries they take orders for; any by default |
| Pause | "⏸ Disable" / "Pause" | Takes no new slots; keeps working on slots already taken and on re-verifications. Only you can lift the pause: "▶️ Enable" / "Resume" |
| Removal | "🗑 Remove from team" | Takes no new slots; finishes the slots already taken. The invite link is turned off: in the bot, a new one appears on its own; in the web app, use "Create link" |

Re-verifications of a removed member's accounts wait for them to rejoin the team; one that hasn't been taken yet can be [cancelled right away](cancel-refunds.md#reverify).

## Team orders {#orders}

To create an order: "➕ New order" → "For my team" in the bot or "Create order" → "Team" in the web app. Set the exchange, any country, the price per slot and the quantity (up to 100); a [fulfillment deadline](lifecycle.md#deadline) is optional. You need a subscription and at least one active member.

The full price per slot goes to the executor. Only active members with matching limits and countries see the order.

## Executor's time per slot {#idle-return}

How much of their own time a member has for a team order slot they've taken: 1, 2, 3, 4, 6, 8, 12 or 24 hours, or no limit; the default is **4 hours**. If they don't make it, the slot goes back to the team's pool under the [general rules](sellers.md#worker-time). With no limit, the slot stays with the member until it's fulfilled or the fulfillment deadline passes.

To change it: "⚙️ Settings" → "⏱ Worker's time" in the bot or "Settings" → "Worker's time per slot" in the web app (for no limit, turn off "Enabled"). A new value applies to slots taken after the change.

## When your subscription ends {#subscription-lapse}

Your team and settings are kept. New team orders can't be created, and untaken slots are [frozen](lifecycle.md#frozen) until you renew.

## Statistics {#stats}

In the web app, under "Sellers" → "My team": the success rate of the team and of each member on team orders. For how it's counted, see [Executor's record](sellers.md#record).
