# Аккаунт и баланс

### Проверить ключ {#get-ping}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/ping</code></div>

Проверяет ключ и показывает его права.

Право `read`

Ответ `200`:

```json
{"client_id": 123456789, "scopes": ["read", "upload"]}
```

`client_id` — ваш Telegram ID, `scopes` — [права ключа](index.md#scopes).

### Получить аккаунт {#get-me}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/me</code></div>

Аккаунт и баланс.

Право `read`

Ответ `200`:

```json
{"client_id": 123456789, "username": "ivan_kyc", "first_name": "Иван", "language": "ru",
 "balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40"}
```

| Поле | Описание |
|---|---|
| `username`, `first_name` | Имя пользователя и имя в Telegram или `null` |
| `language` | Язык интерфейса: `ru`, `uk` или `en` |
| `balance` | Весь баланс: `cash_balance` + `referral_balance` |
| `cash_balance` | Основной баланс |
| `referral_balance` | Реферальный баланс |

### Получить баланс {#get-balance}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/balance</code></div>

Баланс и последние 10 пополнений, новые первыми.

Право `read`

Ответ `200`:

```json
{"balance": "152.40", "cash_balance": "140.00", "referral_balance": "12.40", "deposits_enabled": true,
 "deposits": [{"chain": "bsc", "currency": "USDT", "amount_usd": "100.00", "status": "credited",
   "tx_hash": "0x8c2f4a91d3e6b7058a1c9e2d4f6b8a0c1e3d5f7a9b2c4e6d8f0a1b3c5d7e9f21",
   "detected_at": "2026-10-28T09:14:03Z"}]}
```

| Поле | Описание |
|---|---|
| `deposits_enabled` | `false` — пополнения сейчас приостановлены |
| `deposits[].status` | `pending` — перевод замечен и ждёт подтверждений сети; `credited` — зачислен |
| `deposits[].detected_at` | Когда перевод замечен |

### Получить историю операций {#get-transactions}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/transactions</code></div>

История операций по балансу, новые первыми.

Право `read`

| Параметр | Тип | Обязательно | Описание |
|---|---|---|---|
| `type` | строка | нет | `all` (по умолчанию), `deposits`, `payments`, `refunds` или `bonuses` |
| `limit`, `offset` | целое | нет | [Страница](index.md#pagination) |

Ответ `200`:

```json
{"items": [{"type": "payment", "amount": "62.50", "cash_delta": "-50.10", "referral_delta": "-12.40",
  "order_id": "8402-9173", "comment": null, "created_at": "2026-10-30T09:00:00Z"}],
 "total": 57, "offset": 0, "limit": 20}
```

| Поле | Описание |
|---|---|
| `type` | `deposit`, `custom_deposit` — пополнение; `payment` — оплата заказа; `subscription` — оплата подписки; `refund` — возврат; `referral_bonus`, `achievement_bonus` — бонус; `adjustment` — корректировка |
| `amount` | Сумма без знака |
| `cash_delta`, `referral_delta` | Изменение основного и реферального баланса со знаком (минус — списание); `null`, если разбивки нет |
| `order_id` | Заказ операции или `null` |

### Получить адрес для пополнения {#post-deposit-address}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/deposit-address</code></div>

Выдаёт ваш адрес для пополнения в выбранной сети. Адрес у сети постоянный: повторный запрос вернёт тот же.

Право `read`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `chain` | строка | да | `bsc`, `polygon` или `arbitrum` |

```bash
curl -X POST https://app.kycportal.org/api/v1/deposit-address \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain": "bsc"}'
```

Ответ `200`:

```json
{"address": "0x4f3a9c1e7b2d8a6f0e5c3b1a9d7e5f3c1a8b6d4e", "chain": "bsc", "min_usd": "1.00", "confirmations": 8}
```

| Поле | Описание |
|---|---|
| `address` | Адрес для перевода USDT или USDC в этой сети |
| `min_usd` | Минимальная сумма пополнения |
| `confirmations` | Подтверждений сети до зачисления: bsc — 8, polygon — 30, arbitrum — 20 |

Зачисление видно в [`GET /balance`](#get-balance), а в [ленте](events.md#get-events) приходит событие `balance`.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `deposits_paused` | Пополнения приостановлены |
| 409 | `crypto_unavailable` | Адрес сейчас выдать нельзя; повторите позже |

### Получить подписку и тарифы {#get-subscription}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

Текущая подписка и тарифы.

Право `read`

Ответ `200`:

```json
{"current": {"plan_id": 2, "plan_name": "30 дней", "started_at": "2026-10-19T10:00:00Z",
   "expires_at": "2026-11-18T10:00:00Z", "days_left": 18},
 "expired": null,
 "plans": [{"plan_id": 1, "name": "7 дней", "price": "10.00", "duration_days": 7},
   {"plan_id": 2, "name": "30 дней", "price": "30.00", "duration_days": 30}]}
```

| Поле | Описание |
|---|---|
| `current` | Активная подписка или `null` |
| `expired` | Последняя закончившаяся подписка или `null`: `plan_id`, `plan_name`, `expired_at`, `days_since`, `frozen_orders` и `frozen_slots` — сколько заказов и слотов заморожено |
| `plans[].plan_id` | Тариф для [`POST /subscription`](#post-subscription) |

### Купить подписку {#post-subscription}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/subscription</code></div>

Покупает подписку и списывает её цену с баланса; активная подписка продлевается на срок тарифа от даты окончания. Оплата подписки не возвращается.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `plan_id` | целое | да | Из [`GET /subscription`](#get-subscription) |
| `expected_price` | сумма | да | Больше нуля, до 2 знаков. Ниже текущей цены — отказ, иначе списывается текущая |

```bash
curl -X POST https://app.kycportal.org/api/v1/subscription \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"plan_id": 2, "expected_price": "30.00"}'
```

Ответ `200`:

```json
{"plan_id": 2, "plan_name": "30 дней", "expires_at": "2026-12-18T10:00:00Z", "days_left": 48, "unfrozen_slots": 0}
```

`unfrozen_slots` — сколько замороженных слотов покупка снова отдала исполнителям.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `price_changed` | Цена выросла, ничего не списано; `price` и `total` — текущие |
| 409 | `insufficient_balance` | Не хватает баланса |
| 409 | `service_unavailable` | Тариф не продаётся |
| 409 | `purchase_in_progress` | Идёт другая ваша покупка подписки; повторите через несколько секунд |

### Получить реферальную программу {#get-referral}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/referral</code></div>

Реферальная программа: ссылка, проценты и заработок.

Право `read`

Ответ `200`:

```json
{"code": "123456789", "share_url": "https://t.me/kycportal_bot?start=ref_123456789",
 "order_bonus_percent": "10", "subscription_bonus_percent": "10",
 "total_earned": "48.20", "earned_orders": "36.20", "earned_subscriptions": "12.00",
 "referral_count": 14, "active_referral_count": 5, "notifications_enabled": true}
```

| Поле | Описание |
|---|---|
| `order_bonus_percent`, `subscription_bonus_percent` | Ваш процент с заказов и подписок приглашённых (строка) |
| `total_earned` | Заработано всего: `earned_orders` + `earned_subscriptions` |
| `active_referral_count` | Приглашённые, которые уже принесли бонус |
| `notifications_enabled` | Включены ли уведомления о бонусах |

### Получить команду {#get-team}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/team</code></div>

Ваша команда исполнителей и страница её участников. Ссылки-приглашения в ответе нет.

Право `read`

| Параметр | Тип | Обязательно | Описание |
|---|---|---|---|
| `limit`, `offset` | целое | нет | [Страница](index.md#pagination) участников |

Ответ `200`:

```json
{"stats": {"members_total": 3, "members_active": 2, "active_slots": 4, "graded": 40, "passed": 36},
 "limits": {"max_slots_per_order": 10, "max_active_slots": 20},
 "members": {"items": [{"id": "3310-7742", "worker_id": "7731-0045", "username": "worker_anna",
   "is_active": true, "max_slots_per_order": 5, "max_active_slots": null, "allowed_countries": ["UA", "KZ"],
   "joined_at": "2026-09-02T08:00:00Z", "active_slots": 2, "graded": 25, "passed": 23, "success_rate": 0.92}],
  "total": 3, "offset": 0, "limit": 20}}
```

| Поле | Описание |
|---|---|
| `graded`, `passed` | Попыток с итогом / из них успешных |
| `limits` | Наибольшие лимиты, которые можно задать участнику; `0` — без ограничения |
| `members.items[].id` | Номер участия в команде |
| `members.items[].max_slots_per_order`, `max_active_slots` | Лимиты участника; `null` — без ограничения |
| `members.items[].success_rate` | Доля успешных попыток от 0 до 1; `null`, если итогов ещё нет |

### Получить ссылки платформы {#get-info}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/info</code></div>

Ссылки платформы: поддержка, документация, FAQ, условия, видео и инструкции по загрузке. Любая ссылка может быть `null`.

Право `read`

Ответ `200`:

```json
{"help_url": "https://t.me/freidbase", "docs_url": "https://portal-ss.github.io/docs/",
 "faq_url": "https://portal-ss.github.io/docs/faq/", "terms_url": "https://portal-ss.github.io/docs/terms/",
 "video_guide_url": null, "upload_guide_adspower_url": null, "upload_guide_manual_url": null}
```
