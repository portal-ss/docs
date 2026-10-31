# FAQ

## Purchase and Orders

??? question "How do I buy a verification?"
    Choose an exchange, a country and a verification type in the bot or in the web app ("Create order"), then confirm the order. The cost is deducted from your internal balance, which you top up in advance with cryptocurrency. You can also place orders through the [API](api/orders.md#post-orders).

??? question "Which exchanges are supported?"
    Currently — Bybit, MEXC, KuCoin, and BingX. The list is being expanded; the current selection is always visible in the catalog in the bot and in the web app.

??? question "The geo I need is not in the catalog — what should I do?"
    It means that country isn't on sale right now. If the country is listed but marked "out of stock", you can tap "🔔 Notify when available" in the bot — the bot will message you when it's back. With a subscription, you can create a team order for any country — for your own team.

??? question "How many accounts can I order at once?"
    Up to 100 per order — in the bot, in the web app and through the API. If you need more, place several orders.

??? question "How does a wholesale order differ from a standard one?"
    A wholesale order is cheaper than a standard one and is available only with an active subscription. If your subscription ends, the wholesale order's slots that no one has taken yet are frozen until you renew, and re-verifying accounts from it costs the standard price. See [Subscription](guide/subscription.md).

??? question "What is a team order?"
    A team order is a mode in which the work is performed by Executors of your own Team, invited by you personally. You choose any geo and set the price per slot yourself; the full amount goes to the Executor. Requires an active subscription and at least one active Team member.

??? question "How do I upload an account to the bot?"
    Each account needs cookies and a proxy. There are two methods: **ADS Power** — one export file (.txt) for all accounts, with the proxies already inside; **manually** — the proxy and cookies of each account, which you extract with a browser extension. You can upload in the bot and in the web app (which also has video guides), as well as through the [API](api/upload.md#post-upload). See [Uploading accounts](guide/upload.md).


## Payment and Balance

??? question "How do I top up the balance?"
    Open the top-up screen in the bot or in the web app (the "Balance" section), choose a network — BEP20 (BSC), Polygon or Arbitrum One — and send USDT or USDC to your address. The funds are credited after the transaction is confirmed on the network. See [Balance and top-ups](guide/balance.md).

??? question "What is the minimum top-up amount?"
    1 USDT or 1 USDC ($1). A transfer below the minimum isn't credited.

??? question "I sent a deposit on the wrong network or in the wrong token — what should I do?"
    Unfortunately, such funds are usually **impossible to recover**. Before sending, always verify the network, token, and address. If the mistake has already occurred — contact support.

??? question "The deposit didn't arrive — what should I do?"
    Check that you sent USDT or USDC on one of the three networks and no less than the minimum, and look in the web app: "Balance" → "History". If everything is right and the funds still haven't been credited, contact support at [@freidbase](https://t.me/freidbase) and send the transaction hash (TxID).

??? question "What is the referral balance?"
    These are credits you receive for inviting other clients. The referral balance can be spent on all Service services.

??? question "In what order are funds debited when paying?"
    First from the referral balance, then from the main one. Refunds are credited back to the original debit sources proportionally.

## Subscriptions

??? question "What does a subscription give me?"
    Access to wholesale prices and the ability to create team orders. The subscription lasts a fixed number of days.

??? question "What happens to my orders if the subscription expires?"
    Slots of wholesale and team orders that no executor has taken yet are frozen: while there is no subscription, they are not offered to executors. Slots already in progress are completed as usual. Frozen slots are not cancelled automatically — once the subscription is renewed, they are offered to executors again.

??? question "Can I extend my subscription in advance?"
    Yes. Purchasing a new subscription while the previous one is still active extends its term.

??? question "Is the subscription fee refundable?"
    No, the subscription purchase **is not refundable**.

## Verification

??? question "How long does verification take?"
    It depends on the availability of executors in the required geo and on the processing speed of the exchange. There are no fixed timeframes — usually from tens of minutes to a few hours. On BingX, there's a second stage after KYC — turning off face login: the slot completes once you've passed on the code from the BingX email and the executor has passed the face check.

??? question "Can I speed it up?"
    The platform doesn't speed up individual slots. What you can do: mark trusted executors with "Prioritize" in the web app — they see your orders in their country first; give the order to your own team; update account data on time and answer the bot's requests (for example, for the BingX code).

??? question "How do I know that the verification has passed?"
    The bot will send a notification when a slot is completed or cancelled (in the web app, you can turn off per-slot notifications and keep only the order result). The status is always visible in the slot card in the bot and in the web app. On BingX, after KYC the bot will first ask for the code from the email — the slot completes after the second stage.

??? question "How do I know something is needed from me?"
    In the workspace bot, ⚠️ appears on the "📋 My orders" button, and the order and slot in question are marked ⚠️ in the lists. In the web app, a "… needs you" warning appears on the "Dashboard", and you can filter slots and orders by "Needs attention". Usually it's one of these: re-upload an account (cookies or proxy), send new deposit screenshots for Risk Removal, send the code from the BingX email, or renew your subscription if slots are frozen.

??? question "The exchange rejected the verification with no option to retry — what next?"
    If the exchange has closed verification on the account ("🚫 KYC no longer available"), the money for the slot is returned to your balance automatically. You can create a new order with a different account.

## BingX: the email code

??? question "Why does BingX need a code from an email?"
    After KYC on BingX, the system turns off face login on the account. For that, BingX sends a code to the account's mailbox, and you need to forward it to the platform. When the code is needed, the workspace bot [@kycportal_bot](https://t.me/kycportal_bot) sends a message with an "🔢 Enter code" button, and in the web app the slot page shows a "Code from the BingX email needed" block (in the slot list — a "code needed" tag). You can send the code in the bot, on the slot page or through the [API](api/slot-actions.md#bingx) — one place is enough. The code is needed only to turn off face login. See [Second stage on BingX](guide/lifecycle.md#bingx).

??? question "Which BingX accounts are best to upload?"
    Ones on which actions are confirmed with the email code only. If BingX asks for a Google Authenticator code or a phone code on top of the email code, the second stage won't finish automatically: you won't be asked for the code, and support will review the slot. See [Uploading accounts](guide/upload.md).

??? question "How much time do I have for the code?"
    You have 1 hour for all the codes of one slot. The clock runs only while the platform is waiting for your code; while the code is being checked, the executor is passing the face check or the slot is waiting for new account data, it's stopped. You can see how much is left on the slot card in the bot and on the slot page in the web app; the bot may send a reminder. If you don't make it, the slot counts as completed, but face login stays on — KYC has passed all the same, so the money for the slot isn't refunded.

??? question "The code has expired, or several emails came — which one do I enter?"
    Always enter the code from the latest BingX email. The code works for about 10 minutes. If it has already expired, tap "Enter code" — the bot or the web app will request a new one from BingX by itself; there's no separate button for that. If the code didn't work, you'll be asked to enter it again; after the third mistake, BingX sends a new email.

??? question "Why am I asked for the code again when I've already sent it?"
    Each new face check attempt needs a fresh code. If the executor needs to pass the face check again, BingX sends a new code when the executor is ready, and the bot asks for it. While you're waiting for the executor, your time isn't used up.

??? question "Several slots are waiting for a code — how do I send the right one?"
    Tap "🔢 Enter code" in the message or on the card of the slot you need — the bot shows which account the code is for. If you just send the digits in the chat, the bot asks you to choose the account.

??? question "How does a BingX slot end?"
    "Face login is off" — the slot is fully completed. "Face login stayed on" — the slot counts as completed, but face login wasn't turned off (for example, the time for the codes ran out). If the executor didn't manage to pass the face check, the slot is cancelled and the money goes back to your balance. If the slot couldn't be completed automatically, support will review it — nothing is needed from you, and you'll be notified of the result.

## Re-verification

??? question "Do you guarantee the completion of re-verification?"
    Executors are notified in advance of the possible need to perform re-verification on the slot they completed; however, the actual performance depends solely on the willingness and availability of the Executor.

??? question "How much does re-verification cost?"
    It depends on how the original order was bought: standard — the retail price; wholesale — the wholesale price (the retail price without an active subscription); team — the price you set yourself (it can't be ordered without a subscription). Risk Removal costs the same in every case — the retail price. The exact amount is shown before you confirm.

??? question "Can I cancel a re-verification?"
    Yes — 24 hours after an executor took the slot (if no one took it — after the order was placed). Time while the slot is waiting for your data or for the exchange's answer doesn't count. If a link has already been issued for the slot, the platform checks the exchange before refunding: if the verification has passed, there is no refund. See [Cancellations and refunds](guide/cancel-refunds.md#reverify).

## API

??? question "Can I work with the platform through the API?"
    Yes: with the API, you can buy orders, upload accounts and keep track of your slots and balance — with the same prices, balance and rules as in the web app. For details, see the [API](api/index.md) section.

??? question "How do I connect the API?"
    API access is free and enabled on request: contact support at [@freidbase](https://t.me/freidbase) or tap "Write to support" in the web app's "API" section. Once it's enabled, you create keys in the web app (the "API" section) and in the workspace bot (an "🔑 API" button appears in the main menu). See [API access](api/index.md#access).

??? question "How do I create a key, and what rights should I give it?"
    "Create key" in the web app or "➕ New key" in the bot. Give the key only the rights it needs: "Read" is always on; "Upload accounts" — upload, proxies, publishing, KYC checks, the BingX code, deposit screenshots; "Money" — purchases, subscription, re-verifications and cancellations with a refund, that is, everything that changes your balance. You can restrict a key to a list of IPs. You can have up to 10 active keys. See [Keys and rights](api/index.md#scopes).

??? question "I lost a key, or it may have leaked — what should I do?"
    A key is shown only once and can't be recovered. Revoke it — "Revoke" in the web app, or the button with the key's name and then "🗑 Revoke" in the bot: the key stops working at once. Then create a new one. If API access is currently switched off, keys aren't shown in the web app or in the bot — to revoke a key, write to support.

## Account Security

??? question "Does the Executor get access to my account?"
    No. Executors do not gain access to uploaded cookies and perform only the operations provided by the Service's interface (initiating verification and checking its status).

??? question "Won't this look suspicious to the exchange?"
    The work is performed inside your own account, using the cookies you provided to the Service — without a separate login to the account from other devices.

## Refunds

??? question "In what cases is a refund possible?"
    You can cancel with a refund yourself: an unpublished order, frozen slots and a re-verification. A published slot is cancelled with a refund by the platform automatically — if the deadline you chose at purchase has passed, or the exchange has closed verification on the account. On BingX, the money is also refunded if the executor didn't manage to pass the face check at the second stage. If the verification has passed through an issued link after all, there is no refund.

??? question "Where do refunded funds go?"
    To the internal balance, to the same debit sources from which the payment was made (proportionally between the main and referral balances).

??? question "Can I withdraw money from the balance back out?"
    The cash balance is intended to pay for the Service's services. For questions about withdrawing funds outside the platform, contact support.
