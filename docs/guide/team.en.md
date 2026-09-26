# Your own team

Your own team is made up of executors you've invited personally. They fulfill your team orders, and you set the price per slot yourself. You can manage your team in the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) ("👨‍💻 My team") and in the web app (the "Sellers" screen).

You can build and set up a team without a subscription, but team orders can only be created with an active [subscription](subscription.md). Without a subscription, team members don't see your orders.

## Invitations

You have a personal invite link: an executor opens it in Telegram and joins your team.

- A team can have up to **100** members.
- You can reissue the link, and the old one stops working immediately.
- If a member you've paused follows the link again, the pause isn't lifted — only you can bring them back.

## Member settings

For each member, you can set:

- **limits** — how many slots they can take from one order and how many they can have in progress at the same time (or no limit);
- **allowed countries** — the countries for which they can take your orders (any country by default).

## Pausing and removing

- **Pause** — the member temporarily can't see or take your team orders. Slots they've already taken are fulfilled as usual. A pause can only be lifted manually.
- **Removal** — the member can no longer take your orders, and the current invite link stops working so they can't rejoin through it. Slots they're already working on aren't cancelled.

## Team orders

A team order is visible only to members of your team, subject to their limits and allowed countries. Executors from the shared pool don't see it.

How to create one:

- in the workspace bot — "➕ New order" → "For my team";
- in the web app — "Create order" → "Team".

You choose the exchange and the country — any country, not just those in the catalog — and set the price per slot and the quantity. The full price per slot goes to the executor. You need an active subscription and at least one active team member.

## Slot auto-return {#idle-return}

If a member takes a team slot and then makes no progress on it for a long time, the platform can return the slot to the pool so that another member can take it:

1. after the first timer runs out, the member gets a warning;
2. after the second timer runs out, the slot goes back to your team's pool.

You can adjust the timers or turn the feature off: "⚙️ Settings" → "🔄 Slot auto-return" in the workspace bot, or "Settings" → "Slot auto-return" in the web app. When auto-return is off, the slot stays with the member until it's completed or the [slot deadline](lifecycle.md#deadline) runs out. This setting applies only to team orders.

## Statistics

The team page shows the number of active members, the number of slots in progress, the share of slots passed successfully and the total number completed, across the whole team. Detailed team analytics are available in the web app, in the "Analytics" section.
