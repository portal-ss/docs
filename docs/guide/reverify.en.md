# Re-verifications

A re-verification is a repeat check of an account already verified through the platform, when the exchange requires one again. It's done by the executor of the initial verification.

## Types

- **MEXC:** Face Security — a repeat face check; Face Withdraw — before a withdrawal; Face API Key — before creating an API key; [Risk Removal](risk-removal.md) — lifting a Risk Control restriction.
- **Bybit:** Claim Rewards — claiming rewards on the account.

After Face API Key, create the key in MEXC yourself without delay: if MEXC asks for a face check again, you'll need a new order.

## Which accounts are eligible {#eligibility}

The account passed its initial verification through the platform, the exchange currently requires the chosen check, and the account has no other re-verification or active order. On MEXC, if the initial slot was cancelled because the face check wasn't passed within 12 hours, only Face Withdraw is available.

The platform checks this for free before payment; ineligible accounts are skipped with the reason and aren't charged.

## How to order {#create}

Up to 120 accounts at a time, each with fresh cookies and a proxy.

Workspace bot:

1. "🔄 Re-verification" → exchange → type.
2. Send the proxies, one per account, and tap "▶️ Continue".
3. Send the cookie files (`.json`) in the same order and tap "✅ I've sent all files".
4. Review the plan with prices and tap "✅ Confirm & pay".

Web app: "Create order" → "Reverification" → exchange and type → [accounts](upload.md) → "Check accounts" → "Create N · $…".

If your balance doesn't cover everything, work starts on the paid accounts, and you can pay for the rest with "🔄 Retry remaining" within 2 hours. Risk Removal also needs [deposit screenshots](risk-removal.md#proofs).

## Price

It depends on how the original order was bought:

- standard — the retail price;
- wholesale — the wholesale price with an active [subscription](subscription.md), otherwise retail;
- team — your price per slot, the same for the whole batch, which goes to the executor in full; an active subscription is required.

Risk Removal costs the retail price for everyone; accounts from team orders still need a subscription. The exact amount is in the plan before payment.

## Executor and timing

The slot is assigned to the executor of the initial verification and isn't passed to anyone else. If the executor has left your team, [cancel the slot](cancel-refunds.md#reverify) or add the executor back to the team.

There's no fulfillment deadline: after 24 hours, you can request a [cancellation](cancel-refunds.md#reverify). Re-verifications aren't frozen when a subscription ends.

## How a re-verification ends {#outcomes}

- **Passed** — the slot is completed.
- **"ℹ️ No check was needed — refunded"** — the exchange no longer requires the check, and no link was issued. If one was, the slot is completed.
- **"🚫 Wrong country verified"** — a full refund.
- **The exchange refused**, for example, it blocked the account — the slot isn't closed, there's no automatic refund, and support decides.
