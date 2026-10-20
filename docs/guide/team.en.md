# Your own team

Your own team is made up of executors you've invited personally. They fulfill your team orders, and you set the price per slot yourself. You can manage your team in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) ("👨‍💻 My team") and in the web app (the "Sellers" screen, "My team" section).

You can build and set up a team without a subscription, but team orders can only be created with an active [subscription](subscription.md). Without a subscription, members don't get new slots of your orders — see [When your subscription ends](#subscription-lapse).

## Invitations

You have a personal invite link: in the workspace bot it's on the "👨‍💻 My team" screen, in the web app it's in the "Invite link" block. An executor opens it in Telegram and lands in the executors' bot. A new executor goes through a short registration there and joins your team right away.

- A team can have up to **100** members, including paused ones.
- The link doesn't expire. You can reissue it ("🔄 New link" in the bot, "New link" in the web app), and the old one stops working immediately.
- If a member you've paused follows the link again, the pause isn't lifted — only you can bring them back.

## Member settings

For each member, you can set:

- **limits** — how many slots they can take from one order and how many they can have in progress at the same time (or no limit). Re-verifications don't count toward the limits;
- **allowed countries** — the countries for which they can take your orders (any country by default).

In the workspace bot, use the "📊 Limits" and "🌍 Countries" buttons on the member's card; in the web app, the "Slot limits" and "Allowed countries" blocks.

## Pausing and removing

- **Pause** ("⏸ Disable" in the bot, "Pause" in the web app) — the member temporarily can't see or take new slots of your team orders. They fulfill the slots they've already taken as usual, and re-verifications of accounts they verified still go to them. A pause can only be lifted manually: "▶️ Enable" in the bot or "Resume" in the web app.
- **Removal** ("🗑 Remove from team") — the member can no longer take your team orders, and the current invite link stops working so they can't rejoin through it. In the bot, a new link appears on the "👨‍💻 My team" screen; in the web app, click "Create link". Slots the member has already taken aren't cancelled — they can finish them.

Re-verifications of accounts verified by a removed member wait for them: only they can do them. While they're off your team, such a re-verification, if nobody has taken it yet, can be cancelled right away, without waiting for the usual period (see [Cancellations and refunds](cancel-refunds.md#reverify)). If you add them back to the team, the waiting re-verifications go to them right away.

## Team orders

A team order is visible only to active members of your team (not paused), subject to their limits and allowed countries. Executors from the shared pool don't see it.

How to create one:

- in the workspace bot — "➕ New order" → "For my team";
- in the web app — "Create order" → "Team".

You choose the exchange and the country — any country, not just those in the catalog — and set the price per slot and the quantity. The full price per slot goes to the executor. When buying, you can optionally set a [slot deadline](lifecycle.md#deadline). You need an active subscription and at least one active team member. If less than a day of your subscription is left, you'll see a warning before buying.

Re-verifications of accounts from team orders are done by the same member who did the first verification — see [Re-verifications](reverify.md).

## Worker's time per slot {#idle-return}

Each time a member takes a slot of a team order, they have a limited amount of time to pass the verification. If they don't make it, the slot goes back to your team's pool and another member can take it. That member can't take this particular slot again, but can take the order's other slots.

- The default is **4 hours**. You can choose 1, 2, 3, 4, 6, 8, 12 or 24 hours, or "No limit".
- The time doesn't run while the slot is waiting for you to update its data or while the exchange is reviewing the verification.
- 30 minutes before the time runs out, the member gets a reminder.
- If the member has already issued a verification link, the platform first waits 10 minutes and checks the exchange: a passed verification counts.
- Returning a slot to the pool doesn't count as a failure for the member.
- A new value applies to slots members take after the change; the time on slots already taken doesn't change.

Where to set it: "⚙️ Settings" → "⏱ Worker's time" in the workspace bot, or "Settings" → "Worker's time per slot" in the web app (for no limit, turn off the "Enabled" switch). With no limit, the slot stays with the member until they complete it or until the slot deadline runs out, if you set one when buying.

This setting applies only to team orders. In standard and wholesale orders, the executor's time is set by the platform — see [Executors and order distribution](sellers.md#worker-time).

## When your subscription ends {#subscription-lapse}

Your team's members and settings are kept. Here's what happens to team orders:

- slots members have already taken are fulfilled as usual — nothing is taken away from executors;
- slots nobody has taken yet are frozen: members don't see them until you renew the subscription. If a member returns a slot to the pool after the subscription has ended (for example, they ran out of time), that slot is frozen too, and the bot will let you know;
- the slot deadline of a frozen slot doesn't run — after renewal, it's moved forward by the time the slot was frozen;
- you can still upload accounts and publish an order without a subscription — the slots will simply wait for renewal;
- frozen slots can be cancelled — see [Frozen slots](cancel-refunds.md#frozen);
- new team orders can't be created without a subscription;
- re-verifications already created are never frozen.

After renewal, frozen slots are offered to your team members again. See [When your subscription ends](subscription.md#expiry) for details.

## Statistics {#stats}

In the web app, on the "Sellers" screen in the "My team" section, you'll see:

- "Members" — active and total;
- "In progress" — how many slots members are working on right now;
- "Success rate" and "Passed" — how many of the team's graded slots passed, as a percentage and as a count;
- for each member — allowed countries, load (slots in progress against their limit), record and status.

The record covers only your team orders, for all time. How graded slots are counted is described in [Executor's record](sellers.md#record).

In the workspace bot, the "👨‍💻 My team" screen shows the total number of members and how many of them are active. Detailed team analytics are available in the web app, in the "Analytics" section.
