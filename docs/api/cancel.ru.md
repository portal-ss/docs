# Отмены

Возврат зачисляется на баланс: полная цена слота, в той же пропорции между основным и реферальным балансом, что и оплата. Он приходит в ленту событием `balance` с `balance_event: "refund"` ([события](events.md#events)). Слоты первичной верификации в опубликованном заказе, кроме замороженных, не отменяются: их выполняет исполнитель или закрывает платформа с возвратом ([Отмена и возвраты](../guide/cancel-refunds.md)).

### Отменить неопубликованный заказ {#post-cancel}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel</code></div>

Отменяет неопубликованный заказ целиком; вся сумма сразу возвращается. Заказ реверификации так не отменяется — ответ `404 order_not_found`.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

Ответ `200`:

```json
{"status": "cancelled", "cancelled_slots": 10, "refunded": "100.00", "order_id": "8402-9173"}
```

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `order_not_cancellable` | Заказ опубликован, закрыт или отменять нечего |

### Отменить замороженные слоты {#post-cancel-frozen}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/cancel-frozen</code></div>

Отменяет замороженные слоты заказа — невзятые слоты опубликованного оптового или командного заказа, пока подписка не активна. Слоты, по которым ссылка на верификацию не выдавалась, отменяются с возвратом сразу; остальные — после проверки биржи.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `expected_count` | целое | да | `frozen_slots` − `frozen_checking_slots` из [`GET /orders/{order_id}`](orders.md#get-order) |
| `expected_to_check` | целое | да | `frozen_needs_check` оттуда же |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/cancel-frozen \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"expected_count": 4, "expected_to_check": 1}'
```

Ответ `200`:

```json
{"order_id": "8402-9173", "cancelled": 3, "refunded": "24.00", "checking": 1, "waiting_reupload": 0}
```

| Поле ответа | Описание |
|---|---|
| `cancelled`, `refunded` | Отменено и возвращено сразу |
| `checking` | Ждут проверки биржи: не пройдена — слот отменят и деньги вернут позже, пройдена — слот завершится без возврата |
| `waiting_reupload` | Из `checking` — ждут вашей [повторной загрузки](slot-actions.md#post-reupload); биржу проверят после неё |

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `frozen_cancel_changed` | Числа не совпали с заказом — ничего не отменено, перечитайте заказ |
| 409 | `nothing_to_cancel` | Подписка снова активна, замороженных слотов нет или по всем уже идёт отмена |

### Отменить слот реверификации {#post-cancel-reverify}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/cancel-reverify</code></div>

Отменяет слот реверификации. Можно ли сейчас и когда откроется — поле `cancel` [карточки слота](orders.md#get-slot); обычно отмена открывается через `min_hours` часов после начала текущей попытки.

Право `money` · нужен [`Idempotency-Key`](errors.md#idempotency)

Ответ `200`:

```json
{"status": "cancel_pending", "slot_id": "3307-1185", "refunded": null}
```

| `status` | Что значит |
|---|---|
| `cancelled` | Ссылка по слоту не выдавалась: слот отменён, `refunded` — сумма возврата |
| `cancel_pending` | Ссылка выдавалась: через 10 минут платформа проверит биржу. Не пройдена — слот отменят с возвратом, пройдена — слот завершится без возврата |
| `cancel_checking` | Отмена ждёт ответа биржи, вашей повторной загрузки или ручной проверки |

Итог придёт в ленту: `slot_status` `CANCELLED` с `reason: "client_cancel"` и `balance` с возвратом — или `slot_status` `COMPLETED`.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `reverify_cancel_too_early` | Отмена ещё не открылась; `min_hours` — через сколько часов после начала попытки |
| 409 | `reverify_cancel_needs_reupload` | Слот ждёт [повторной загрузки](slot-actions.md#post-reupload) — сначала она |
| 409 | `reverify_cancel_after_face` | Risk Removal: проверка лица пройдена, отменить может только поддержка |
| 409 | `reverify_cancel_forbidden` | В этом состоянии слотом занимается поддержка |
| 409 | `slot_already_closed` | Слот уже закрыт |
| 409 | `cancel_blocked_admin_review` | Поддержка уже закрывает этот слот — о результате сообщат |
| 404 | `slot_not_found` | В том числе слот не реверификации |
