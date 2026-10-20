# Re-verifications

A re-verification is a repeat check of an account that was already verified through the platform. Exchanges periodically require one for accounts that have already passed: for example, a repeat face check, an identity check before a withdrawal or before creating an API key, or the removal of restrictions. A re-verification is done by the same executor who completed the account's first verification.

## Re-verification types

The types are named after the matching features on the exchange itself, which makes it easier to match a platform screen with the exchange's own screen.

| Exchange | Type | What it is |
|---|---|---|
| MEXC | **Face Security** | A repeat face check requested by the exchange |
| MEXC | **Face Withdraw** | A face check the exchange requests before a withdrawal |
| MEXC | **Face API Key** | A face check the exchange requests before an API key can be created |
| MEXC | **Risk Removal** | Lifting a Risk Control restriction — see [Risk Removal on MEXC](risk-removal.md) |
| Bybit | **Claim Rewards** | Claiming the rewards available on the account |

The available types depend on the exchange and may change; the current list and prices are shown when you place the order.

**Face API Key.** The executor only passes the face check — the platform doesn't create the API key and never sees its details. Once the slot is completed, create the key in MEXC yourself, with the code from your email and your 2FA. Don't put it off: if MEXC asks for a face check again before you've created the key, you'll need a new order.

## Which accounts are eligible {#eligibility}

You can order a re-verification for an account that has a completed and successfully passed initial-verification slot on the platform. In addition:

- the exchange must actually require the chosen check right now — the platform checks this before you pay;
- the account mustn't already have another re-verification in progress or be busy with another active order.

The exception is MEXC: if the initial-verification slot was cancelled because the additional face check wasn't passed within 12 hours, you can only order **Face Withdraw** for that account.

Accounts that aren't eligible are skipped during the check, with the reason shown, and you aren't charged for them.

## How to order {#create}

Re-verifications are ordered in batches: you can upload several accounts at once — up to 120 per batch — and see a plan with prices before you pay. Checking the accounts is free; you're only charged after you confirm.

### In the workspace bot @kycportal_bot

1. Open "🔄 Re-verification" and choose an exchange.
2. Choose a type — it applies to every account in the batch.
3. Send a list of proxies — one per account. Wait for them to be checked and tap "▶️ Continue".
4. Send the cookie files (`.json`) in the same order as the proxies and tap "✅ I've sent all files".
5. Wait for the sessions to be checked and review the plan: the accounts, the price of each one and the total.
6. Tap "✅ Confirm & pay".

### In the web app

"Create order" → "Reverification": choose the exchange and type → upload the accounts the same way as in a regular [upload](upload.md) — an ADS Power file or manually → "Check accounts" → review the plan → "Create N · $…".

If your balance didn't cover every account, the paid ones go into work straight away. For the rest, top up your balance and tap "🔄 Retry remaining" ("Retry remaining" in the web app) within 2 hours; after that you'll need to upload the accounts again.

For Risk Removal, you'll also need to provide deposit screenshots before paying — see [Risk Removal on MEXC](risk-removal.md).

## Price

The price depends on the country and on how the **original order** for the account was bought, as well as on whether you have an active [subscription](subscription.md):

| Original order | Active subscription | No subscription |
|---|---|---|
| Standard | Retail price | Retail price |
| Wholesale | Wholesale price | Retail price, with an offer to renew your subscription |
| Team | You set the price per slot | Can't be ordered until you renew your subscription |

For accounts from team orders, you enter one price per slot for all such accounts in the batch — it goes to the executor in full.

**Risk Removal** costs the same for everyone — the retail price, however the original order was bought. For accounts from team orders, an active subscription is still required.

The exact amount is always shown in the plan before you pay.

## Who fulfills it

The slot is assigned straight to the executor who did the account's first verification and isn't shown to any other executor. If the executor is slow to start, the platform sends them a reminder. A re-verification never goes back to the shared pool under any circumstances — the slot stays with that executor until it's completed or cancelled.

If that executor isn't available, the slot isn't handed to anyone else. In a team order, if the executor is no longer on your team, you can cancel the slot right away or add the executor back to your team — the slot then goes back to them (see [Cancelling a re-verification](cancel-refunds.md#reverify)). In other cases, support handles such a slot.

## Statuses and timing

A re-verification has the same statuses as a regular slot (see [Slot statuses](lifecycle.md#statuses)); Risk Removal has its own. In the workspace bot, re-verifications are grouped under "📋 My orders" → "Re-KYC".

Unlike an initial verification, a re-verification has no fulfillment deadline. Instead, you can request a cancellation after 24 hours — the rules are described in [Cancelling a re-verification](cancel-refunds.md#reverify).

Re-verifications are never frozen when a subscription ends: each one is a separate, paid order that is fulfilled regardless of your subscription status.

## How a re-verification ends {#outcomes}

- **The check passes** — the slot is completed and you get a notification. For Risk Removal, the slot is completed once MEXC approves the appeal; for Face API Key, create the key yourself after that.
- **ℹ️ No check was needed — refunded** — by the time the executor took up the slot, the exchange no longer required this check, and no link had been issued for the slot yet. If a link had already been issued, the slot counts as completed.
- **🚫 Wrong country verified** — the exchange confirmed the check with a different country; the slot is cancelled with a full refund.
- **The exchange refuses the check** (for example, it blocks the account) — the re-verification isn't closed and isn't refunded automatically: the slot stays with the executor, and support decides what happens to it.
- **Cancellation** — by you (see [Cancelling a re-verification](cancel-refunds.md#reverify)) or by support.

When a re-verification is cancelled, you get a "❌ Re-verification cancelled" notification with the reason and, if there was a refund, the amount. If you cancelled the slot and it closed right away, the result is shown on screen.
