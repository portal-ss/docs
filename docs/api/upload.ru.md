# Загрузка и публикация

### Загрузить аккаунты {#post-upload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Загружает аккаунты в пустые слоты заказа и ставит их на проверку в фоне. Доступно, пока заказ не опубликован (`PAID`, `SESSION_UPLOADED`).

Право `upload` · нужен [`Idempotency-Key`](errors.md#idempotency)

| Поле формы | Тип | Обязательно | Описание |
|---|---|---|---|
| `method` | строка | да | `adspower` или `manual` |
| `ads_file` | файл | при `adspower` | Экспорт ADS Power `.txt`: до 20 МБ, до 200 профилей |
| `proxies` | строка | при `manual` | Прокси по одному в строке, в порядке файлов; до 1 МБ |
| `cookie_files` | файл, повторяется | при `manual` | Файл cookies на аккаунт: до 8 МБ, вместе до 32 МБ |
| `positions` | строка | нет | При `manual`: ваши номера аккаунтов через запятую (`1,3`) для `at` и `upload_position` |
| `replace_all` | да/нет | нет | `true` — очистить все невзятые слоты и заполнить из файла |
| `replace_slot_id` | номер | нет | Заменить аккаунт одного невзятого слота; при отказе останется прежний |

Тело — `multipart/form-data` с заголовком `Content-Length`: всего до 34 МБ и не больше 200 аккаунтов. Формат — [ниже](#format).

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/upload \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Idempotency-Key: $(uuidgen)" \
  -F method=manual \
  -F "proxies=<proxies.txt" \
  -F cookie_files=@acc1.json \
  -F cookie_files=@acc2.json
```

Для ADS Power: `-F method=adspower -F ads_file=@export.txt`.

Ответ `200`:

```json
{"state": "queued", "staged_slot_ids": ["5120-3562", "5120-3563"]}
```

`staged_slot_ids` — слоты, в которые пошли аккаунты, в порядке файла. Итог проверки — в [`GET /orders/{order_id}/upload`](#get-upload).

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `upload_not_allowed` | Заказ уже опубликован |
| 409 | `upload_in_progress` | Ещё проверяется прошлая загрузка этого заказа |
| 429 | `upload_concurrency_limit` | У вас уже 2 загрузки в проверке, считая бот и веб-версию; `limit`, без `Retry-After` |
| 409 | `too_many_uploads` | То же ограничение при одновременных запросах |
| 409 | `nothing_to_upload` | В заказе нет пустого слота |
| 422 | `nothing_to_upload` | В файле нет ни одного аккаунта |
| 409 | `nothing_to_replace` | Слот из `replace_slot_id` уже взят или заказ опубликован |
| 409 | `edit_not_allowed` | Слот из `replace_slot_id` нельзя изменить |
| 404 | `order_not_found` | Слота из `replace_slot_id` нет в заказе |
| 409 | `replace_all_reverify` | `replace_all` в заказе реверификации |
| 409 | `replace_account_reverify` | `replace_slot_id` в заказе реверификации |
| 422 | [коды разбора](codes.md#upload-codes) | Файл, cookies или прокси не читаются; `at` — номер аккаунта, `issues` — все проблемы |
| 422 | `missing_file` | Нет файла или прокси для выбранного `method` |
| 422 | `invalid_method` | `method` — не `adspower` и не `manual` |
| 422 | `proxy_count_mismatch` | Строк прокси не столько, сколько файлов cookies |
| 422 | `empty_file` | Пустой файл; `kind` — какой |
| 413 | `upload_too_large` | Запрос больше 34 МБ или cookies вместе больше 32 МБ; `limit` |
| 413 | `file_too_large` | Файл больше своего лимита; `kind` — какой |
| 413 | `too_many_items` | Больше 200 аккаунтов; `limit` |
| 411 | `length_required` | Нет `Content-Length` (тело частями) |
| 415 | `unsupported_media_type` | Тело больше 64 КБ, но не `multipart/form-data` |
| 400 | — | Повреждённая форма (поле больше 1 МБ, слишком много полей); текст в `detail` вместо кода |
| 503 | `queue_unavailable` | Платформа занята, ничего не сделано; повторите через `retry_after_seconds` или несколько секунд |

### Получить статус загрузки {#get-upload}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Ход и итог проверки последней загрузки. Опрашивайте раз в 3–5 секунд, пока `state` не станет `done` или `failed`.

Право `read`

Ответ `200`:

```json
{
  "state": "done",
  "done": 2,
  "total": 2,
  "ok": 1,
  "all_filled": false,
  "slots": [
    {"slot_id": "5120-3562", "ok": true, "account_identity": "user1@example.com", "error_code": null,
     "conflict_slot_id": null, "country": "UA", "ip": "203.0.113.10", "upload_position": 1, "adspower_profile_name": null},
    {"slot_id": "5120-3563", "ok": false, "account_identity": null, "error_code": "proxy_timeout",
     "conflict_slot_id": null, "country": null, "ip": null, "upload_position": 2, "adspower_profile_name": null}
  ],
  "error": null,
  "deadline_at": null,
  "ignored": 0,
  "cleared": false
}
```

| Поле | Описание |
|---|---|
| `state` | `idle` — проверок нет или итогу больше часа; `queued`, `running`, `done`, `failed` |
| `done`, `total`, `ok` | Проверено / всего / принято |
| `all_filled` | `true` — во всех слотах заказа есть аккаунт, можно [публиковать](#post-publish) |
| `slots[].account_identity` | Аккаунт, который нашла биржа |
| `slots[].error_code` | [Почему аккаунт отклонён](codes.md#upload-codes); `null` — принят |
| `slots[].conflict_slot_id` | При `duplicate_account_other_slot` — слот этого заказа с тем же аккаунтом |
| `slots[].country`, `slots[].ip` | Страна (ISO-2) и IP выхода прокси |
| `slots[].upload_position` | Номер аккаунта: из `positions` или место в запросе, с 1 |
| `error` | Почему проверка `failed` остановилась: `timeout`, `cancelled`, `probe`, `payload` или `requeue` |
| `deadline_at` | Пока проверка идёт: позже этого момента она не продлится |
| `ignored` | Аккаунты сверх свободных слотов — не сохранены |
| `cleared` | Загрузка с `replace_all` уже очистила слоты |

При `failed` принятые аккаунты сохранены — пришлите остальные снова.

### Сменить прокси до публикации {#post-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/proxy</code></div>

Меняет прокси загруженного, ещё не взятого слота до публикации; сохранённый аккаунт перепроверяется через новый прокси. Ответ — до 90 секунд.

Право `upload`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `proxy` | строка | да | Новый прокси, до 512 символов |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3563/proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.12:8000:login3:pass3"}'
```

Ответ `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `edit_not_allowed` | Заказ опубликован, слот взят или в нём нет аккаунта |
| 422 | `invalid_proxy`, `private_proxy`, `parse_proxy_has_spaces`, `parse_proxy_no_port`, `parse_proxy_non_latin` | Прокси не читается ([коды](codes.md#upload-codes)) |
| 409 | [коды проверки](codes.md#upload-codes) | Аккаунт не прошёл проверку через новый прокси, например `proxy_broken`, `session_invalid` |
| 409 | `reupload_identity_mismatch` | Биржа показала не тот аккаунт, что в слоте |
| 409 | `reupload_identity_unavailable` | Аккаунт слота неизвестен; напишите в поддержку |
| 409 | `check_in_flight` | Слот сейчас проверяется; повторите позже |
| 409 | `upload_in_progress` | Идёт загрузка в этот заказ |
| 429 | `client_exchange_busy` | Уже 3 проверки ваших аккаунтов идут одновременно; `limit` |
| 504 | `proxy_probe_timeout` | Биржа не ответила через прокси вовремя |
| 502 | `upload_check_failed` | Аккаунт не удалось проверить; повторите позже |

### Опубликовать заказ {#post-publish}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/publish</code></div>

Публикует заказ: слоты уходят исполнителям, заказ переходит в `IN_PROGRESS`, а срок выполнения начинает идти. В каждом слоте должны быть аккаунт и прокси. Если у [заказа](orders.md#get-order) `freezes_on_publish: true`, слоты сразу замёрзнут до продления подписки.

Право `upload`

Ответ `200`:

```json
{"status": "published"}
```

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `publish_not_ready` | Заказ не `SESSION_UPLOADED`: есть пустые слоты или он уже опубликован, в том числе прошлым запросом |
| 409 | `publish_proxy_required` | У слотов из списка `slots` нет прокси |
| 409 | `publish_session_required` | В слотах из списка `slots` нет аккаунта |
| 409 | `publish_in_bot` | Заказ реверификации — он публикуется сам |

## Формат загрузки {#format}

- `adspower` — один экспорт ADS Power без правок: один профиль — один слот, прокси берётся из профиля.
- `manual` — в `proxies` по прокси в строке, в `cookie_files` по файлу на аккаунт: первая строка — первому файлу. Cookies передаются только файловыми частями, не текстовым полем.
- Форматы cookies и прокси — как в [Загрузке аккаунтов](../guide/upload.md); ещё принимаются `{"cookies": [...]}` (Playwright) и объект `{"имя": "значение"}`. Из файла берутся только cookies биржи заказа.
- Отклонённый аккаунт в слот не попадает. Пришлите только отклонённые — новым запросом с новым `Idempotency-Key`.
