# Дії зі слотом

Чого слот чекає від вас — поле `waiting_for_client` [картки слота](orders.md#get-slot) ([значення](codes.md#waiting)).

## Повторне завантаження й проксі

Слот `REUPLOAD_REQUIRED` стоїть на паузі: строки зупинено, слот не скасовується й не переходить до іншого виконавця. Що надіслати — поле `reupload_scope` картки слота. `reupload` і `replace-proxy` перевіряють акаунт на біржі через проксі слота — відповідь може тривати до півтори хвилини.

Помилки перевірки, спільні для `reupload` і `replace-proxy`:

| HTTP | `code` | Коли |
|---|---|---|
| 409 | [коди перевірки](codes.md#upload-codes) | Біржа відхилила акаунт або проксі, наприклад `session_invalid`, `proxy_broken`, `exchange_unreachable` |
| 409 | `exchange_transient` | Біржа не відповіла, проксі працює; нічого не змінилося — повторіть |
| 409 | `reupload_scope_changed` | Слоту тепер потрібно більше — прочитайте слот і надішліть те, що він просить |
| 409 | `check_in_flight` | Слот уже проходить іншу перевірку — повторіть через кілька секунд |
| 409 | `upload_in_progress` | У замовленні триває перевірка завантаження |
| 429 | `client_exchange_busy` | Уже тривають 3 звернення до біржі щодо ваших слотів (`limit`); без `Retry-After` |
| 504 | `proxy_probe_timeout` | Біржа не відповіла через цей проксі вчасно |
| 502 | `upload_check_failed` | Збій платформи — повторіть пізніше |

### Повторно завантажити акаунт {#post-reupload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/reupload</code></div>

Надсилає свіжі cookies (і, якщо потрібно, новий проксі) слоту з `reupload_scope` `session` або `full`. Один акаунт — той, що був у слоті; увесь запит — до 22 МБ.

Право `upload`

| Поле форми | Тип | Обов'язково | Опис |
|---|---|---|---|
| `method` | рядок | так | `adspower` або `manual` |
| `ads_file` | файл | для `adspower` | Експорт ADS Power з одним профілем, до 20 МБ; для `full` — із проксі |
| `cookie_files` | файл | для `manual` | Файл cookies, до 8 МБ; читається перший |
| `proxies` | рядок | для `full` і `manual` | Один рядок проксі |
| `replace_proxy` | так/ні | ні | `true` для `session` — замінити також проксі (завантаження пройде як `full`) |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/reupload \
  -H "Authorization: Bearer $KP_API_KEY" \
  -F method=manual \
  -F "proxies=203.0.113.21:8000:login5:pass5" \
  -F cookie_files=@fresh.json
```

Відповідь `200`:

```json
{"status": "ok"}
```

`ok` — слот продовжує роботу з того самого місця. `proxy_broken` або `proxy_missing` — cookies прийнято, але збережений проксі теж не працює: слот тепер просить `full`.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `reupload_not_allowed` | Слот не чекає повторного завантаження |
| 409 | `use_replace_proxy` | Слот чекає лише проксі — надішліть його в [`replace-proxy`](#post-replace-proxy) |
| 409 | `reupload_identity_mismatch` | Cookies іншого акаунта |
| 409 | `reupload_identity_unavailable` | Цей слот оновити не можна — напишіть у підтримку |
| 422 | `reupload_single_account` | В експорті ADS Power більше ніж один профіль |
| 422 | `proxy_missing` | Для `full` не передано проксі |
| 422 | `export_proxy_missing` | Для `full`: у профілі ADS Power немає проксі |
| 422 | `parse_error` | В експорті ADS Power немає акаунта |
| 422 | `missing_file`, `invalid_method` | Немає файлу для обраного `method` або неправильний `method` |
| 422 | [коди розбору](codes.md#upload-codes) | Cookies або проксі не читаються |
| 413 | `file_too_large` | Запит більший за 22 МБ або файл більший за свій ліміт |

### Замінити проксі {#post-replace-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/replace-proxy</code></div>

Надсилає новий проксі слоту з `reupload_scope: "proxy"`. Збережені cookies перевіряються повторно через новий проксі.

Право `upload`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `proxy` | рядок | так | Рядок проксі, до 512 символів |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/replace-proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.20:8000:login4:pass4"}'
```

Відповідь `200`:

```json
{"status": "ok"}
```

`ok` — слот продовжує роботу з того самого місця. `session_invalid` або `cookie_jar_too_large` — проксі збережено, але cookies теж не працюють: слот тепер просить `full`, надішліть [`reupload`](#post-reupload).

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `proxy_replace_not_allowed` | Слот не чекає нового проксі |
| 422 | [коди розбору](codes.md#upload-codes) | Рядок проксі не читається: `invalid_proxy`, `private_proxy`, `parse_proxy_*` |

### Призупинити слот для заміни проксі {#post-start-proxy-replace}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/start-proxy-replace</code></div>

Ставить слот на паузу до нового проксі, коли проксі працює, а біржа через нього не відкривається (`check-kyc` відповів `409 exchange_unreachable`). Слот перейде в `REUPLOAD_REQUIRED` з `reupload_scope: "proxy"` — надішліть проксі в [`replace-proxy`](#post-replace-proxy). Доступно для слота `FREE` в опублікованому замовленні, `IN_PROGRESS` і `VERIFICATION_FAILED`.

Право `upload`

Відповідь `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `reupload_required` | Слот уже чекає повторного завантаження |
| 409 | `slot_no_session` | У слоті немає акаунта |
| 409 | `edit_not_allowed` | Слот в іншому статусі або замовлення не опубліковано — до публікації використайте [`POST …/proxy`](upload.md#post-proxy) |

## Перевірка статусу

### Перевірити статус верифікації {#post-check-kyc}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/check-kyc</code></div>

Запитує в біржі статус верифікації слота; якщо біржа підтверджує успіх, слот зараховується. Чи доступна перевірка зараз — поле `check_kyc_available` [картки слота](orders.md#get-slot). Відповідь може тривати до півтори хвилини.

Право `upload`

Відповідь `200`:

```json
{"action": "pending", "status": "pending", "order_done": false, "verification_type": "INITIAL_KYC"}
```

`action` — що перевірка зробила зі слотом:

- `result_only` — слот ще не у виконавця: результат лише повідомляється, слот не змінюється;
- `stale` — слот змінився під час перевірки: прочитайте його заново;
- `reupload_required` — проксі або вхід не працюють: слот став на паузу й чекає [повторного завантаження](#post-reupload); у `status` — `proxy_broken`, `proxy_missing`, `session_invalid` або `cookie_jar_too_large`;
- решта значень (`passed_completed`, `mexc_hold_started`, `wrong_country_cancelled`, `blocked_cancelled` та інші) — рішення щодо слота у виконавця; що воно означає, показує `status`.

`order_done: true` — ця перевірка завершила все замовлення. `verification_type` — що перевірялося, наприклад `MEXC_FACE_SECURITY`.

| `status` | Що означає |
|---|---|
| `passed` | Верифікацію пройдено |
| `mexc_hold` | MEXC: верифікацію пройдено, почався період спостереження |
| `bingx_face_off_started` | BingX: KYC пройдено, почався другий етап — чекайте [запиту коду](#bingx) |
| `bingx_review_held` | BingX: KYC пройдено, слот перевірить підтримка; від вас нічого не потрібно |
| `risk_face_passed` | Risk Removal: перевірку обличчя пройдено, далі апеляція |
| `wrong_country` | Пройдено з іншою країною, ніж у замовленні. У разі `action: "wrong_country_cancelled"` слот скасовано, гроші повернуто |
| `pending` | Біржа розглядає верифікацію |
| `available` | Заявки ще немає; у реверифікації — перевірка зараз не потрібна |
| `failed` | Спробу відхилено, можлива наступна |
| `face_not_submitted` | Перевірку обличчя відкрито, але ще не пройдено |
| `blocked` | Біржа не допускає верифікацію на акаунті. У разі `action: "blocked_cancelled"` слот скасовано, гроші повернуто; у реверифікації вирішує підтримка |
| `already_verified` | У разі `result_only`: акаунт було верифіковано ще до завантаження |
| `stale` | Слот змінився під час перевірки |
| `unknown` | Відповідь біржі не розпізнано |

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `slot_no_session` | У слоті немає акаунта |
| 409 | `proxy_missing` | У слоті немає проксі |
| 409 | `reupload_required` | Слот чекає [повторного завантаження](#post-reupload) |
| 409 | `no_link_yet` | Виконавець узяв слот, але ще не почав верифікацію |
| 409 | `check_not_available` | У цьому статусі перевірка недоступна; `status` — статус слота |
| 409 | `check_in_flight` | Слот уже проходить іншу перевірку — повторіть через кілька секунд |
| 429 | `cooldown` | Слот перевіряли менше ніж 30 секунд тому (після невдалої перевірки — 15); `seconds` і `Retry-After` — скільки чекати |
| 429 | `client_exchange_busy` | Уже тривають 3 звернення до біржі щодо ваших слотів (`limit`); без `Retry-After` |
| 409 | `exchange_transient` | Біржа не відповіла, проксі працює; нічого не змінилося — повторіть |
| 409 | `exchange_unreachable` | Проксі працює, але біржа через нього не відкривається — [замініть проксі](#post-start-proxy-replace) |
| 409 | `proxy_broken`, `session_invalid`, `cookie_jar_too_large` | Дані не працюють, але слот не можна поставити на паузу — наприклад, його не опубліковано або закрито |
| 409, 502 | `status_check_failed` | Статус прочитати не вдалося — повторіть пізніше |

## Код BingX {#bingx}

На другому етапі BingX (слот `BINGX_FACE_OFF`) потрібен код із листа, який BingX надсилає на пошту акаунта. На коди у вас 60 хвилин на весь слот; час іде, лише поки `bingx.client_clock_running: true`. Час закінчився — слот завершується з увімкненим входом за обличчям, гроші не повертаються ([підсумки](codes.md#bingx-endings)).

1. Дочекайтеся події `slot_action_required` з `action: "bingx_code"`; `reason` — чому просять ([значення](codes.md#ask-reasons)).
2. Прочитайте [слот](orders.md#get-slot): якщо `bingx.step: "awaiting_code"`, візьміть код із найсвіжішого листа, що прийшов не раніше за `bingx.code_sent_at`.
3. Якщо `bingx.fresh_code_available: true` (листу понад 10 хвилин), викличте [`refresh`](#post-bingx-refresh). Цей крок можна пропустити: якщо код сплив, платформа сама попросить новий лист.
4. Надішліть код у [`bingx-code`](#post-bingx-code).
5. Дочекайтеся відповіді в стрічці: `slot_notice` з `notice: "bingx_code_accepted"` — код прийнято; новий запит із `reason: "wrong_code"` — надішліть код із найсвіжішого листа ще раз.

### Надіслати код BingX {#post-bingx-code}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code</code></div>

Передає код із листа BingX. На кожен запит коду приймається один код — перший, хоч би звідки його надіслали: бот, вебверсія чи API.

Право `upload`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `code` | рядок | так | До 32 символів; без пробілів — від 4 до 8 цифр |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3562/bingx-code \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "123 456"}'
```

Відповідь `200`:

```json
{"status": "accepted"}
```

`accepted` — код узято й надіслано в BingX, а не «код підійшов». Підсумок прийде в стрічку. Код ніде не повертається.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `not_open` | Слот зараз не чекає коду: його ще не запитали, код уже взято, слот чекає повторного завантаження, закритий або це не другий етап BingX |
| 422 | `bad_format` | Без пробілів — не 4–8 цифр; нічого не змінилося |

### Запросити новий код BingX {#post-bingx-refresh}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code/refresh</code></div>

Перевіряє, чи діє код в останньому листі, і за потреби просить BingX надіслати новий.

Право `upload`

Відповідь `200`:

```json
{"status": "resent"}
```

`still_fresh` — коду менше ніж 10 хвилин, надсилайте його. `resent` — BingX надішле новий лист; у стрічку прийде запит із `reason: "stale_resent"`.

| HTTP | `code` | Коли |
|---|---|---|
| 409 | `not_open` | Код зараз не чекають або ваші 60 хвилин закінчилися |

## Скриншоти для Risk Removal

Коли для слота Risk Removal запитають нові скриншоти депозиту, прийде подія `slot_action_required` з `action: "risk_proofs"`. Завантажте кожен скриншот у [`POST /risk-proofs/files`](#post-risk-proofs-files), потім надішліть набір у [`POST …/risk-proofs`](#post-slot-risk-proofs). Що має бути на скриншоті — [Risk Removal](../guide/risk-removal.md).

### Завантажити скриншот депозиту {#post-risk-proofs-files}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files</code></div>

Завантажує один скриншот депозиту. Ненадісланий скриншот можна використати протягом 23 годин. Необов'язковий заголовок `X-Upload-Key` (UUID): повтор із тим самим ключем протягом 24 годин поверне той самий `id`.

Право `upload`

| Поле форми | Тип | Обов'язково | Опис |
|---|---|---|---|
| `file` | файл | так | JPEG, PNG, WebP або HEIC (за вмістом); 10 КБ – 18 МБ; кожна сторона 300–12 000 пікселів |

```bash
curl -X POST https://app.kycportal.org/api/v1/risk-proofs/files \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "X-Upload-Key: 6f1d3c1e-0000-4000-8000-000000000001" \
  -F file=@deposit-1.png
```

Відповідь `201`:

```json
{"id": "0b6c2a7e-1111-4222-8333-444455556666", "size_bytes": 184321, "mime": "image/png"}
```

| HTTP | `code` | Коли |
|---|---|---|
| 422 | `proof_not_an_image` | Не JPEG, PNG, WebP або HEIC, або немає частини `file` |
| 413 | `proof_too_large` | Більше за 18 МБ |
| 422 | `proof_too_small` | Менше за 10 КБ або коротка сторона менша за 300 пікселів |
| 422 | `proof_dimensions_absurd` | Сторона більша за 12 000 пікселів |
| 429 | `proof_quota_exceeded` | За 24 години від першого завантаження — 250 скриншотів або 500 МБ (видалені теж враховуються) або вже є 120 ненадісланих; `retry_after_seconds` |
| 409 | `proofs_upload_in_progress` | Перша спроба з цим `X-Upload-Key` ще зберігається; `retry_after_seconds: 3` |
| 503 | `proofs_storage_busy` | Сховище зайняте; `retry_after_seconds: 5` |
| 503 | `proofs_storage_unavailable` | Сховище недоступне — повторіть пізніше |

### Видалити скриншот {#delete-risk-proofs-file}

<div class="api-endpoint"><span class="api-method api-method--delete">DELETE</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files/{file_id}</code></div>

Видаляє ваш ненадісланий скриншот.

Право `upload`

Відповідь `204` без тіла.

| HTTP | `code` | Коли |
|---|---|---|
| 404 | `proof_file_not_found` | Скриншот не знайдено, він чужий або вже надісланий |

### Надіслати скриншоти для Risk Removal {#post-slot-risk-proofs}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/risk-proofs</code></div>

Надсилає нові скриншоти для слота Risk Removal, коли їх запитали. Набір повністю замінює попередні скриншоти слота; платити нічого не потрібно.

Право `upload`

| Поле тіла | Тип | Обов'язково | Опис |
|---|---|---|---|
| `deposits` | список | так | Від 1 до 4 скриншотів |
| `deposits[].file_id` | рядок | так | `id` з [`POST /risk-proofs/files`](#post-risk-proofs-files) |
| `deposits[].source` | рядок | так | Звідки надійшов депозит, до 64 символів; потрапить в апеляцію як є |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/2210-4471/slots/3307-1186/risk-proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"},
                   {"file_id": "9d4e1f20-2222-4333-8444-555566667777", "source": "Trust Wallet"}]}'
```

Відповідь `200`:

```json
{"slot_id": "3307-1186", "status": "RISK_REJECTED", "count": 2}
```

`status` — статус слота, `count` — скільки скриншотів тепер у слота. Після надсилання `risk_proofs` зникає з `waiting_for_client`.

| HTTP | `code` | Коли |
|---|---|---|
| 404 | `proof_file_not_found` | Скриншот не знайдено, він чужий, уже надісланий або старший за 23 години |
| 422 | `proof_source_invalid` | Порожній `source` |
| 409 | `risk_proofs_not_requested` | Нових скриншотів для слота не запитували або слот закрито |
| 409 | `risk_proofs_invalid` | Набір відхилено |
| 404 | `slot_not_found` | Зокрема, якщо це не слот Risk Removal |
