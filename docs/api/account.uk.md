# Акаунт і баланс

### Перевірити ключ {#get-ping}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/ping</code></div>

Перевіряє ключ і показує його права.

Право `read`

Відповідь `200`:

```json
{"client_id": 123456789, "scopes": ["read", "upload"]}
```

`client_id` — ваш Telegram ID, `scopes` — [права ключа](index.md#scopes).

### Отримати акаунт {#get-me}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/me</code></div>

Акаунт і баланс.

Право `read`

Відповідь `200`:

```json
{"client_id": 123456789, "username": "ivan_kyc", "first_name": "Иван", "language": "ru",
 "balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40"}
```

| Поле | Опис |
|---|---|
| `username`, `first_name` | Ім'я користувача та ім'я в Telegram або `null` |
| `language` | Мова інтерфейсу: `ru`, `uk` або `en` |
| `balance` | Увесь баланс: `cash_balance` + `referral_balance` |
| `cash_balance` | Основний баланс |
| `referral_balance` | Реферальний баланс |

### Отримати баланс {#get-balance}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/balance</code></div>

Баланс і останні 10 поповнень, нові першими.

Право `read`

Відповідь `200`:

```json
{"balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40", "deposits_enabled": true,
 "deposits": [{"chain": "bsc", "currency": "USDT", "amount_usd": "100.00", "status": "credited",
   "tx_hash": "0x8c2f4a91d3e6b7058a1c9e2d4f6b8a0c1e3d5f7a9b2c4e6d8f0a1b3c5d7e9f21",
   "detected_at": "2026-10-28T09:14:03Z"}]}
```

| Поле | Опис |
|---|---|
| `deposits_enabled` | `false` — поповнення зараз призупинено |
| `deposits[].status` | `pending` — переказ виявлено, він чекає підтверджень мережі; `credited` — зараховано |
| `deposits[].detected_at` | Коли переказ виявлено |

### Отримати історію операцій {#get-transactions}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/transactions</code></div>

Історія операцій із балансом, нові першими.

Право `read`

| Параметр | Тип | Обов'язково | Опис |
|---|---|---|---|
| `type` | рядок | ні | `all` (за замовчуванням), `deposits`, `payments`, `refunds` або `bonuses` |
| `limit`, `offset` | ціле | ні | [Сторінка](index.md#pagination) |

Відповідь `200`:

```json
{"items": [{"type": "payment", "amount": "62.50", "cash_delta": "-50.10", "referral_delta": "-12.40",
  "order_id": "8402-9173", "comment": null, "created_at": "2026-10-30T09:00:00Z"}],
 "total": 57, "offset": 0, "limit": 20}
```

| Поле | Опис |
|---|---|
| `type` | `deposit`, `custom_deposit` — поповнення; `payment` — оплата замовлення; `subscription` — оплата підписки; `refund` — повернення; `referral_bonus`, `achievement_bonus` — бонус; `adjustment` — коригування |
| `amount` | Сума без знака |
| `cash_delta`, `referral_delta` | Зміна основного й реферального балансу зі знаком (мінус — списання); `null`, якщо розбивки немає |
| `order_id` | Замовлення, до якого належить операція, або `null` |

### Отримати адресу для поповнення {#post-deposit-address}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/deposit-address</code></div>

Видає вашу адресу для поповнення в обраній мережі. Адреса в кожній мережі постійна: повторний запит поверне ту саму.

Право `read`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `chain` | рядок | так | `bsc`, `polygon` або `arbitrum` |

```bash
curl -X POST https://app.kycportal.org/api/v1/deposit-address \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain": "bsc"}'
```

Відповідь `200`:

```json
{"address": "0x4f3a9c1e7b2d8a6f0e5c3b1a9d7e5f3c1a8b6d4e", "chain": "bsc", "min_usd": "1.00", "confirmations": 8}
```

| Поле | Опис |
|---|---|
| `address` | Адреса для переказу USDT або USDC у цій мережі |
| `min_usd` | Мінімальна сума поповнення |
| `confirmations` | Скільки підтверджень мережі потрібно до зарахування: bsc — 8, polygon — 30, arbitrum — 20 |

Зарахування видно в [`GET /balance`](#get-balance), а в [стрічку](events.md#get-events) приходить подія `balance`.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `deposits_paused` | Поповнення призупинено |
| 409 | `crypto_unavailable` | Адресу зараз видати не можна; повторіть пізніше |

### Отримати підписку й тарифи {#get-subscription}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

Поточна підписка й тарифи.

Право `read`

Відповідь `200`:

```json
{"current": {"plan_id": 2, "plan_name": "30 дней", "started_at": "2026-10-19T10:00:00Z",
   "expires_at": "2026-11-18T10:00:00Z", "days_left": 18},
 "expired": null,
 "plans": [{"plan_id": 1, "name": "7 дней", "price": "10.00", "duration_days": 7},
   {"plan_id": 2, "name": "30 дней", "price": "30.00", "duration_days": 30}]}
```

| Поле | Опис |
|---|---|
| `current` | Активна підписка або `null` |
| `expired` | Остання підписка, що закінчилася, або `null`: `plan_id`, `plan_name`, `expired_at`, `days_since`, `frozen_orders` і `frozen_slots` — скільки замовлень і слотів заморожено |
| `plans[].plan_id` | Тариф для [`POST /subscription`](#post-subscription) |

### Купити підписку {#post-subscription}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

Купує підписку та списує її ціну з балансу; активна підписка продовжується на строк тарифу від дати закінчення. Оплата підписки не повертається.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `plan_id` | ціле | так | З [`GET /subscription`](#get-subscription) |
| `expected_price` | сума | так | Більша за нуль, до 2 знаків після крапки. Нижча за поточну ціну — відмова, інакше списується поточна |

```bash
curl -X POST https://app.kycportal.org/api/v1/subscription \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 2, "expected_price": "30.00"}'
```

Відповідь `200`:

```json
{"plan_id": 2, "plan_name": "30 дней", "expires_at": "2026-12-18T10:00:00Z", "days_left": 48, "unfrozen_slots": 0}
```

`unfrozen_slots` — скільки заморожених слотів купівля знову віддала виконавцям.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `price_changed` | Ціна зросла, нічого не списано; `price` і `total` — поточні |
| 409 | `insufficient_balance` | Бракує балансу |
| 409 | `service_unavailable` | Тариф не продається |
| 409 | `purchase_in_progress` | Триває інша ваша купівля підписки; повторіть через кілька секунд |

### Отримати реферальну програму {#get-referral}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/referral</code></div>

Реферальна програма: посилання, відсотки й заробіток.

Право `read`

Відповідь `200`:

```json
{"code": "123456789", "share_url": "https://t.me/kycportal_bot?start=ref_123456789",
 "order_bonus_percent": "10", "subscription_bonus_percent": "10",
 "total_earned": "48.20", "earned_orders": "36.20", "earned_subscriptions": "12.00",
 "referral_count": 14, "active_referral_count": 5, "notifications_enabled": true}
```

| Поле | Опис |
|---|---|
| `order_bonus_percent`, `subscription_bonus_percent` | Ваш відсоток із замовлень і підписок запрошених (рядок) |
| `total_earned` | Зароблено загалом: `earned_orders` + `earned_subscriptions` |
| `active_referral_count` | Запрошені, які вже принесли бонус |
| `notifications_enabled` | Чи ввімкнено сповіщення про бонуси |

### Отримати команду {#get-team}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/team</code></div>

Ваша команда виконавців і сторінка її учасників. Посилання-запрошення у відповіді немає.

Право `read`

| Параметр | Тип | Обов'язково | Опис |
|---|---|---|---|
| `limit`, `offset` | ціле | ні | [Сторінка](index.md#pagination) учасників |

Відповідь `200`:

```json
{"stats": {"members_total": 3, "members_active": 2, "active_slots": 4, "graded": 40, "passed": 36},
 "limits": {"max_slots_per_order": 10, "max_active_slots": 20},
 "members": {"items": [{"id": "3310-7742", "worker_id": "7731-0045", "username": "worker_anna",
   "is_active": true, "max_slots_per_order": 5, "max_active_slots": null, "allowed_countries": ["UA", "KZ"],
   "joined_at": "2026-09-02T08:00:00Z", "active_slots": 2, "graded": 25, "passed": 23, "success_rate": 0.92}],
  "total": 3, "offset": 0, "limit": 20}}
```

| Поле | Опис |
|---|---|
| `graded`, `passed` | Спроб із підсумком / з них успішних |
| `limits` | Найбільші ліміти, які можна задати учаснику; `0` — без обмеження |
| `members.items[].id` | Номер участі в команді |
| `members.items[].max_slots_per_order`, `max_active_slots` | Ліміти учасника; `null` — без обмеження |
| `members.items[].success_rate` | Частка успішних спроб від 0 до 1; `null`, якщо підсумків ще немає |

### Отримати посилання платформи {#get-info}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/info</code></div>

Посилання платформи: підтримка, документація, FAQ, умови, відео та інструкції із завантаження. Будь-яке посилання може бути `null`.

Право `read`

Відповідь `200`:

```json
{"help_url": "https://t.me/freidbase", "docs_url": "https://portal-ss.github.io/docs/",
 "faq_url": "https://portal-ss.github.io/docs/faq/", "terms_url": "https://portal-ss.github.io/docs/terms/",
 "video_guide_url": null, "upload_guide_adspower_url": null, "upload_guide_manual_url": null}
```
