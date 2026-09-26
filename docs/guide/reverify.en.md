# Re-verifications

A re-verification is a repeat check of an account that was already verified through the platform. Exchanges periodically require one for accounts that have already passed: for example, a repeat face check, an identity check before a withdrawal, or the removal of restrictions. A re-verification is done by the same executor who completed the account's first verification.

## Re-verification types

The types are named after the matching features on the exchange itself, which makes it easier to match a platform screen with the exchange's own screen.

| Exchange | Type | What it is |
|---|---|---|
| MEXC | **Face Security** | A repeat face check requested by the exchange |
| MEXC | **Face Withdraw** | A face check the exchange requests before a withdrawal |
| MEXC | **Risk Removal** | Lifting a Risk Control restriction — see [Risk Removal on MEXC](risk-removal.md) |
| Bybit | **Claim Rewards** | Claiming the rewards available on the account |

The available types depend on the exchange and may change; the current list and prices are shown when you place the order.

## Which accounts are eligible {#eligibility}

You can order a re-verification for an account that has a completed and successfully passed slot on the platform.

The exception is MEXC: if the initial-verification slot was cancelled because the additional face check wasn't passed within 12 hours, you can only order **Face Withdraw** for that account.

Accounts with no matching slot are skipped during upload, and the reason is shown.

## How to order {#create}

Re-verifications are ordered in batches: you can upload several accounts at once and see a plan with prices before you pay.

### In the workspace bot @kycportal_bot

1. Open "🔄 Re-verification" and choose an exchange.
2. Choose a type — it applies to every account in the batch.
3. Upload the sessions the same way as in a regular [upload](upload.md): proxies first, then cookies.
4. Wait for the sessions and proxies to be checked.
5. Review the plan: the accounts, the price of each one and the total.
6. Tap "✅ Confirm & pay".

### In the web app

"Create order" → re-verification: choose the exchange and type → upload the accounts → review the plan with prices → pay. The web app can handle more accounts in one go than the bot.

For Risk Removal, you'll also need to provide deposit screenshots before paying — see [Risk Removal on MEXC](risk-removal.md).

## Price

The price depends on how the **original order** for the account was bought and on whether you have an active [subscription](subscription.md):

| Original order | Active subscription | No subscription |
|---|---|---|
| Standard | Retail price | Retail price |
| Wholesale | Wholesale price | Retail price, with an offer to renew your subscription |
| Team | You set the price per slot | Can't be ordered until you renew your subscription |

The exact amount is always shown in the plan before you pay.

## Who fulfills it

The slot is assigned straight to the executor who did the account's first verification and isn't shown to any other executor. If the executor is slow to start, the platform sends them a reminder. A re-verification never goes back to the shared pool under any circumstances — the slot stays with that executor until it's completed or cancelled.

## Statuses and timing

A re-verification has the same statuses as a regular slot (see [Slot statuses](lifecycle.md#statuses)); Risk Removal has its own. In the workspace bot, re-verifications are grouped under "📋 My orders" → "Re-KYC".

Unlike an initial verification, a re-verification has no fulfillment deadline. Instead, you can request a cancellation after 24 hours — the rules are described in [Cancelling a re-verification](cancel-refunds.md#reverify).

Re-verifications are never frozen when a subscription ends: each one is a separate, paid order that is fulfilled regardless of your subscription status.
