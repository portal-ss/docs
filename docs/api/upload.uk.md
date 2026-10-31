# Завантаження й публікація

### Завантажити акаунти {#post-upload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Завантажує акаунти в порожні слоти замовлення й ставить їх на перевірку у фоні. Доступно, поки замовлення не опубліковано (`PAID`, `SESSION_UPLOADED`).

Право `upload` · потрібен [`Idempotency-Key`](errors.md#idempotency)

| Поле форми | Тип | Обов'язково | Опис |
|---|---|---|---|
| `method` | рядок | так | `adspower` або `manual` |
| `ads_file` | файл | для `adspower` | Експорт ADS Power `.txt`: до 20 МБ, до 200 профілів |
| `proxies` | рядок | для `manual` | Проксі по одному в рядку, у порядку файлів; до 1 МБ |
| `cookie_files` | файл, повторюється | для `manual` | Файл cookies на кожен акаунт: до 8 МБ, разом до 32 МБ |
| `positions` | рядок | ні | Для `manual`: ваші номери акаунтів через кому (`1,3`) для `at` і `upload_position` |
| `replace_all` | так/ні | ні | `true` — очистити всі невзяті слоти й заповнити з файлу |
| `replace_slot_id` | номер | ні | Замінити акаунт одного невзятого слота; у разі відмови залишиться попередній |

Тіло — `multipart/form-data` із заголовком `Content-Length`: загалом до 34 МБ і не більше ніж 200 акаунтів. Формат — [нижче](#format).

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

Відповідь `200`:

```json
{"state": "queued", "staged_slot_ids": ["5120-3562", "5120-3563"]}
```

`staged_slot_ids` — слоти, у які потрапили акаунти, у порядку файлу. Підсумок перевірки — у [`GET /orders/{order_id}/upload`](#get-upload).

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `upload_not_allowed` | Замовлення вже опубліковано |
| 409 | `upload_in_progress` | Ще перевіряється попереднє завантаження цього замовлення |
| 429 | `upload_concurrency_limit` | У вас уже 2 завантаження на перевірці, включно з ботом і вебверсією; `limit`, без `Retry-After` |
| 409 | `too_many_uploads` | Те саме обмеження за одночасних запитів |
| 409 | `nothing_to_upload` | У замовленні немає порожнього слота |
| 422 | `nothing_to_upload` | У файлі немає жодного акаунта |
| 409 | `nothing_to_replace` | Слот із `replace_slot_id` уже взято або замовлення опубліковано |
| 409 | `edit_not_allowed` | Слот із `replace_slot_id` не можна змінити |
| 404 | `order_not_found` | Слота з `replace_slot_id` немає в замовленні |
| 409 | `replace_all_reverify` | `replace_all` у замовленні реверифікації |
| 409 | `replace_account_reverify` | `replace_slot_id` у замовленні реверифікації |
| 422 | [коди розбору](codes.md#upload-codes) | Файл, cookies або проксі не читаються; `at` — номер акаунта, `issues` — усі проблеми |
| 422 | `missing_file` | Немає файлу або проксі для обраного `method` |
| 422 | `invalid_method` | `method` — не `adspower` і не `manual` |
| 422 | `proxy_count_mismatch` | Рядків проксі не стільки, скільки файлів cookies |
| 422 | `empty_file` | Порожній файл; `kind` — який |
| 413 | `upload_too_large` | Запит більший за 34 МБ або cookies разом більші за 32 МБ; `limit` |
| 413 | `file_too_large` | Файл більший за свій ліміт; `kind` — який |
| 413 | `too_many_items` | Понад 200 акаунтів; `limit` |
| 411 | `length_required` | Немає `Content-Length` (тіло частинами) |
| 415 | `unsupported_media_type` | Тіло більше за 64 КБ, але не `multipart/form-data` |
| 400 | — | Пошкоджена форма (поле більше за 1 МБ, забагато полів); текст у `detail` замість коду |
| 503 | `queue_unavailable` | Платформа зайнята, нічого не зроблено; повторіть через `retry_after_seconds` або через кілька секунд |

### Отримати статус завантаження {#get-upload}

<div class="api-endpoint"><span class="api-method api-method--get">GET</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/upload</code></div>

Перебіг і підсумок перевірки останнього завантаження. Опитуйте раз на 3–5 секунд, поки `state` не стане `done` або `failed`.

Право `read`

Відповідь `200`:

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

| Поле | Опис |
|---|---|
| `state` | `idle` — перевірок немає або підсумку понад годину; `queued`, `running`, `done`, `failed` |
| `done`, `total`, `ok` | Перевірено / усього / прийнято |
| `all_filled` | `true` — в усіх слотах замовлення є акаунт, можна [публікувати](#post-publish) |
| `slots[].account_identity` | Акаунт, який знайшла біржа |
| `slots[].error_code` | [Чому акаунт відхилено](codes.md#upload-codes); `null` — прийнято |
| `slots[].conflict_slot_id` | У разі `duplicate_account_other_slot` — слот цього замовлення з тим самим акаунтом |
| `slots[].country`, `slots[].ip` | Країна (ISO-2) та IP виходу проксі |
| `slots[].upload_position` | Номер акаунта: з `positions` або місце в запиті, з 1 |
| `error` | Чому перевірка зупинилася зі станом `failed`: `timeout`, `cancelled`, `probe`, `payload` або `requeue` |
| `deadline_at` | Поки перевірка триває: пізніше за цей момент вона не триватиме |
| `ignored` | Акаунти понад кількість вільних слотів — не збережено |
| `cleared` | Завантаження з `replace_all` уже очистило слоти |

У разі `failed` прийняті акаунти збережено — надішліть решту знову.

### Змінити проксі до публікації {#post-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/proxy</code></div>

Змінює проксі завантаженого, ще не взятого слота до публікації; збережений акаунт перевіряється повторно через новий проксі. Відповідь — до 90 секунд.

Право `upload`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `proxy` | рядок | так | Новий проксі, до 512 символів |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3563/proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.12:8000:login3:pass3"}'
```

Відповідь `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `edit_not_allowed` | Замовлення опубліковано, слот узято або в ньому немає акаунта |
| 422 | `invalid_proxy`, `private_proxy`, `parse_proxy_has_spaces`, `parse_proxy_no_port`, `parse_proxy_non_latin` | Проксі не читається ([коди](codes.md#upload-codes)) |
| 409 | [коди перевірки](codes.md#upload-codes) | Акаунт не пройшов перевірку через новий проксі, наприклад `proxy_broken`, `session_invalid` |
| 409 | `reupload_identity_mismatch` | Біржа показала не той акаунт, що в слоті |
| 409 | `reupload_identity_unavailable` | Акаунт слота невідомий; напишіть у підтримку |
| 409 | `check_in_flight` | Слот зараз перевіряється; повторіть пізніше |
| 409 | `upload_in_progress` | Триває завантаження в це замовлення |
| 429 | `client_exchange_busy` | Уже тривають 3 одночасні перевірки ваших акаунтів; `limit` |
| 504 | `proxy_probe_timeout` | Біржа не відповіла через проксі вчасно |
| 502 | `upload_check_failed` | Акаунт не вдалося перевірити; повторіть пізніше |

### Опублікувати замовлення {#post-publish}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/publish</code></div>

Публікує замовлення: слоти передаються виконавцям, замовлення переходить у `IN_PROGRESS` і починається відлік строку виконання. У кожному слоті мають бути акаунт і проксі. Якщо в [замовлення](orders.md#get-order) `freezes_on_publish: true`, слоти одразу буде заморожено до поновлення підписки.

Право `upload`

Відповідь `200`:

```json
{"status": "published"}
```

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `publish_not_ready` | Замовлення не в статусі `SESSION_UPLOADED`: є порожні слоти або його вже опубліковано, зокрема попереднім запитом |
| 409 | `publish_proxy_required` | У слотів зі списку `slots` немає проксі |
| 409 | `publish_session_required` | У слотах зі списку `slots` немає акаунта |
| 409 | `publish_in_bot` | Замовлення реверифікації — воно публікується саме |

## Формат завантаження {#format}

- `adspower` — один експорт ADS Power без змін: один профіль — один слот, проксі береться з профілю.
- `manual` — у `proxies` по одному проксі в рядку, у `cookie_files` по одному файлу на акаунт: перший рядок — першому файлу. Cookies передаються лише файловими частинами форми, не текстовим полем.
- Формати cookies і проксі — як у [Завантаженні акаунтів](../guide/upload.md); також приймаються `{"cookies": [...]}` (Playwright) і об'єкт `{"ім'я": "значення"}`. З файлу беруться лише cookies біржі замовлення.
- Відхилений акаунт до слота не потрапляє. Надішліть лише відхилені — новим запитом із новим `Idempotency-Key`.
