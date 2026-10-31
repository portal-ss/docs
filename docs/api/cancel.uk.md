# Скасування

Повернення зараховується на баланс: повна ціна слота, у тій самій пропорції між основним і реферальним балансом, що й оплата. Воно приходить у стрічку подією `balance` з `balance_event: "refund"` ([події](events.md#events)). Слоти первинної верифікації в опублікованому замовленні, крім заморожених, не скасовуються: їх виконує виконавець або закриває платформа з поверненням ([Скасування та повернення](../guide/cancel-refunds.md)).

### Скасувати неопубліковане замовлення {#post-cancel}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel</code></div>

Скасовує неопубліковане замовлення цілком; уся сума одразу повертається. Замовлення реверифікації так не скасовується — відповідь `404 order_not_found`.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

Відповідь `200`:

```json
{"status": "cancelled", "cancelled_slots": 10, "refunded": "100.00", "order_id": "8402-9173"}
```

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `order_not_cancellable` | Замовлення опубліковано, закрито або скасовувати нічого |

### Скасувати заморожені слоти {#post-cancel-frozen}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel-frozen</code></div>

Скасовує заморожені слоти замовлення — невзяті слоти опублікованого оптового або командного замовлення, поки підписка не активна. Слоти, для яких посилання на верифікацію не видавалося, скасовуються з поверненням одразу; решта — після перевірки біржі.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `expected_count` | ціле | так | `frozen_slots` − `frozen_checking_slots` з [`GET /orders/{order_id}`](orders.md#get-order) |
| `expected_to_check` | ціле | так | `frozen_needs_check` звідти ж |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/cancel-frozen \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_count": 4, "expected_to_check": 1}'
```

Відповідь `200`:

```json
{"order_id": "8402-9173", "cancelled": 3, "refunded": "24.00", "checking": 1, "waiting_reupload": 0}
```

| Поле відповіді | Опис |
|---|---|
| `cancelled`, `refunded` | Скасовано й повернено одразу |
| `checking` | Чекають перевірки біржі: верифікацію не пройдено — слот скасують і гроші повернуть пізніше, пройдено — слот завершиться без повернення |
| `waiting_reupload` | Із `checking` — чекають вашого [повторного завантаження](slot-actions.md#post-reupload); біржу перевірять після нього |

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `frozen_cancel_changed` | Числа не збіглися із замовленням — нічого не скасовано, перечитайте замовлення |
| 409 | `nothing_to_cancel` | Підписка знову активна, заморожених слотів немає або для всіх уже триває скасування |

### Скасувати слот реверифікації {#post-cancel-reverify}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/cancel-reverify</code></div>

Скасовує слот реверифікації. Чи можна зараз і коли відкриється — поле `cancel` [картки слота](orders.md#get-slot); зазвичай скасування відкривається через `min_hours` годин після початку поточної спроби.

Право `money` · потрібен [`Idempotency-Key`](errors.md#idempotency)

Відповідь `200`:

```json
{"status": "cancel_pending", "slot_id": "3307-1185", "refunded": null}
```

| `status` | Що означає |
|---|---|
| `cancelled` | Посилання для слота не видавалося: слот скасовано, `refunded` — сума повернення |
| `cancel_pending` | Посилання видавалося: через 10 хвилин платформа перевірить біржу. Верифікацію не пройдено — слот скасують із поверненням, пройдено — слот завершиться без повернення |
| `cancel_checking` | Скасування чекає відповіді біржі, вашого повторного завантаження або ручної перевірки |

Підсумок прийде в стрічку: `slot_status` `CANCELLED` з `reason: "client_cancel"` і `balance` з поверненням — або `slot_status` `COMPLETED`.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `reverify_cancel_too_early` | Скасування ще не відкрилося; `min_hours` — через скільки годин після початку спроби |
| 409 | `reverify_cancel_needs_reupload` | Слот чекає [повторного завантаження](slot-actions.md#post-reupload) — спершу воно |
| 409 | `reverify_cancel_after_face` | Risk Removal: перевірку обличчя пройдено, скасувати може лише підтримка |
| 409 | `reverify_cancel_forbidden` | У цьому стані слотом займається підтримка |
| 409 | `slot_already_closed` | Слот уже закрито |
| 409 | `cancel_blocked_admin_review` | Підтримка вже закриває цей слот — про результат повідомлять |
| 404 | `slot_not_found` | Зокрема, якщо це не слот реверифікації |
