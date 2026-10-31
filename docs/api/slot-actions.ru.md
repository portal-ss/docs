# Действия со слотом

Что слот ждёт от вас — поле `waiting_for_client` [карточки слота](orders.md#get-slot) ([значения](codes.md#waiting)).

## Повторная загрузка и прокси

Слот `REUPLOAD_REQUIRED` стоит на паузе: сроки не идут, слот не отменяется и не уходит к другому исполнителю. Что прислать — поле `reupload_scope` карточки слота. `reupload` и `replace-proxy` проверяют аккаунт на бирже через прокси слота — ответ может занять до полутора минут.

Ошибки проверки, общие для `reupload` и `replace-proxy`:

| HTTP | `code` | Когда |
|---|---|---|
| 409 | [коды проверки](codes.md#upload-codes) | Биржа отклонила аккаунт или прокси, например `session_invalid`, `proxy_broken`, `exchange_unreachable` |
| 409 | `exchange_transient` | Биржа не ответила, прокси работает; ничего не изменилось — повторите |
| 409 | `reupload_scope_changed` | Слоту теперь нужно больше — прочитайте слот и пришлите, что он просит |
| 409 | `check_in_flight` | По слоту идёт другая проверка — повторите через несколько секунд |
| 409 | `upload_in_progress` | По заказу идёт проверка загрузки |
| 429 | `client_exchange_busy` | Уже идут 3 обращения к бирже по вашим слотам (`limit`); без `Retry-After` |
| 504 | `proxy_probe_timeout` | Биржа не ответила через этот прокси вовремя |
| 502 | `upload_check_failed` | Сбой платформы — повторите позже |

### Загрузить аккаунт повторно {#post-reupload}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/reupload</code></div>

Присылает свежие cookies (и, если нужно, новый прокси) слоту с `reupload_scope` `session` или `full`. Один аккаунт — тот, что был в слоте; весь запрос — до 22 МБ.

Право `upload`

| Поле формы | Тип | Обязательно | Описание |
|---|---|---|---|
| `method` | строка | да | `adspower` или `manual` |
| `ads_file` | файл | при `adspower` | Экспорт ADS Power с одним профилем, до 20 МБ; при `full` — с прокси |
| `cookie_files` | файл | при `manual` | Файл cookies, до 8 МБ; читается первый |
| `proxies` | строка | при `full` и `manual` | Одна строка прокси |
| `replace_proxy` | да/нет | нет | `true` при `session` — заменить и прокси (загрузка пройдёт как `full`) |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/reupload \
  -H "Authorization: Bearer $KP_API_KEY" \
  -F method=manual \
  -F "proxies=203.0.113.21:8000:login5:pass5" \
  -F cookie_files=@fresh.json
```

Ответ `200`:

```json
{"status": "ok"}
```

`ok` — слот продолжает работу с того же места. `proxy_broken` или `proxy_missing` — cookies приняты, но сохранённый прокси тоже не работает: слот теперь просит `full`.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `reupload_not_allowed` | Слот не ждёт повторной загрузки |
| 409 | `use_replace_proxy` | Слот ждёт только прокси — отправьте его в [`replace-proxy`](#post-replace-proxy) |
| 409 | `reupload_identity_mismatch` | Cookies другого аккаунта |
| 409 | `reupload_identity_unavailable` | Этот слот обновить нельзя — напишите в поддержку |
| 422 | `reupload_single_account` | В экспорте ADS Power больше одного профиля |
| 422 | `proxy_missing` | Для `full` не передан прокси |
| 422 | `export_proxy_missing` | Для `full`: в профиле ADS Power нет прокси |
| 422 | `parse_error` | В экспорте ADS Power нет аккаунта |
| 422 | `missing_file`, `invalid_method` | Нет файла для выбранного `method` или неверный `method` |
| 422 | [коды разбора](codes.md#upload-codes) | Cookies или прокси не читаются |
| 413 | `file_too_large` | Запрос больше 22 МБ или файл больше своего лимита |

### Заменить прокси {#post-replace-proxy}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/replace-proxy</code></div>

Присылает новый прокси слоту с `reupload_scope: "proxy"`. Сохранённые cookies перепроверяются через новый прокси.

Право `upload`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `proxy` | строка | да | Строка прокси, до 512 символов |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3564/replace-proxy \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"proxy": "203.0.113.20:8000:login4:pass4"}'
```

Ответ `200`:

```json
{"status": "ok"}
```

`ok` — слот продолжает работу с того же места. `session_invalid` или `cookie_jar_too_large` — прокси сохранён, но cookies тоже не работают: слот теперь просит `full`, пришлите [`reupload`](#post-reupload).

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `proxy_replace_not_allowed` | Слот не ждёт нового прокси |
| 422 | [коды разбора](codes.md#upload-codes) | Строка прокси не читается: `invalid_proxy`, `private_proxy`, `parse_proxy_*` |

### Поставить слот на паузу для замены прокси {#post-start-proxy-replace}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/start-proxy-replace</code></div>

Ставит слот на паузу до нового прокси, когда прокси работает, а биржа через него не открывается (`check-kyc` ответил `409 exchange_unreachable`). Слот станет `REUPLOAD_REQUIRED` с `reupload_scope: "proxy"` — пришлите прокси в [`replace-proxy`](#post-replace-proxy). Доступно для слота `FREE` в опубликованном заказе, `IN_PROGRESS` и `VERIFICATION_FAILED`.

Право `upload`

Ответ `200`:

```json
{"status": "ok"}
```

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `reupload_required` | Слот уже ждёт повторной загрузки |
| 409 | `slot_no_session` | В слоте нет аккаунта |
| 409 | `edit_not_allowed` | Слот в другом статусе или заказ не опубликован — до публикации используйте [`POST …/proxy`](upload.md#post-proxy) |

## Проверка статуса

### Проверить статус верификации {#post-check-kyc}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/check-kyc</code></div>

Запрашивает у биржи статус верификации слота; если биржа подтверждает успех, слот засчитывается. Доступна ли проверка сейчас — поле `check_kyc_available` [карточки слота](orders.md#get-slot). Ответ может занять до полутора минут.

Право `upload`

Ответ `200`:

```json
{"action": "pending", "status": "pending", "order_done": false, "verification_type": "INITIAL_KYC"}
```

`action` — что проверка сделала со слотом:

- `result_only` — слот ещё не у исполнителя: результат только сообщается, слот не меняется;
- `stale` — слот изменился во время проверки: прочитайте его заново;
- `reupload_required` — прокси или вход не работают: слот встал на паузу и ждёт [повторной загрузки](#post-reupload); в `status` — `proxy_broken`, `proxy_missing`, `session_invalid` или `cookie_jar_too_large`;
- остальные значения (`passed_completed`, `mexc_hold_started`, `wrong_country_cancelled`, `blocked_cancelled` и другие) — решение по слоту у исполнителя; что оно значит, говорит `status`.

`order_done: true` — этой проверкой закончился весь заказ. `verification_type` — что проверялось, например `MEXC_FACE_SECURITY`.

| `status` | Что значит |
|---|---|
| `passed` | Верификация пройдена |
| `mexc_hold` | MEXC: верификация пройдена, начался период наблюдения |
| `bingx_face_off_started` | BingX: KYC пройден, начался второй этап — ждите [запроса кода](#bingx) |
| `bingx_review_held` | BingX: KYC пройден, слот проверит поддержка; от вас ничего не нужно |
| `risk_face_passed` | Risk Removal: проверка лица пройдена, дальше апелляция |
| `wrong_country` | Пройдена с другой страной, чем в заказе. При `action: "wrong_country_cancelled"` слот отменён, деньги возвращены |
| `pending` | Биржа рассматривает верификацию |
| `available` | Заявки ещё нет; у реверификации — проверка сейчас не требуется |
| `failed` | Попытка отклонена, возможна следующая |
| `face_not_submitted` | Проверка лица открыта, но ещё не пройдена |
| `blocked` | Биржа не допускает верификацию на аккаунте. При `action: "blocked_cancelled"` слот отменён, деньги возвращены; у реверификации решает поддержка |
| `already_verified` | При `result_only`: аккаунт был верифицирован ещё до загрузки |
| `stale` | Слот изменился во время проверки |
| `unknown` | Ответ биржи не распознан |

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `slot_no_session` | В слоте нет аккаунта |
| 409 | `proxy_missing` | В слоте нет прокси |
| 409 | `reupload_required` | Слот ждёт [повторной загрузки](#post-reupload) |
| 409 | `no_link_yet` | Исполнитель взял слот, но ещё не начал верификацию |
| 409 | `check_not_available` | В этом статусе проверка недоступна; `status` — статус слота |
| 409 | `check_in_flight` | По слоту идёт другая проверка — повторите через несколько секунд |
| 429 | `cooldown` | Слот проверяли меньше 30 секунд назад (после неудачной проверки — 15); `seconds` и `Retry-After` — сколько ждать |
| 429 | `client_exchange_busy` | Уже идут 3 обращения к бирже по вашим слотам (`limit`); без `Retry-After` |
| 409 | `exchange_transient` | Биржа не ответила, прокси работает; ничего не изменилось — повторите |
| 409 | `exchange_unreachable` | Прокси работает, но биржа через него не открывается — [замените прокси](#post-start-proxy-replace) |
| 409 | `proxy_broken`, `session_invalid`, `cookie_jar_too_large` | Данные не работают, но слот нельзя поставить на паузу — например, он не опубликован или закрыт |
| 409, 502 | `status_check_failed` | Статус прочитать не удалось — повторите позже |

## Код BingX {#bingx}

На втором этапе BingX (слот `BINGX_FACE_OFF`) нужен код из письма, которое BingX присылает на почту аккаунта. На коды у вас 60 минут на весь слот; время идёт, только пока `bingx.client_clock_running: true`. Время вышло — слот завершается с включённым входом по лицу, деньги не возвращаются ([итоги](codes.md#bingx-endings)).

1. Дождитесь события `slot_action_required` с `action: "bingx_code"`; `reason` — почему просят ([значения](codes.md#ask-reasons)).
2. Прочитайте [слот](orders.md#get-slot): при `bingx.step: "awaiting_code"` возьмите код из самого свежего письма, пришедшего не раньше `bingx.code_sent_at`.
3. При `bingx.fresh_code_available: true` (письму больше 10 минут) вызовите [`refresh`](#post-bingx-refresh). Шаг можно пропустить: на просроченный код платформа сама попросит новое письмо.
4. Отправьте код в [`bingx-code`](#post-bingx-code).
5. Дождитесь ответа в ленте: `slot_notice` с `notice: "bingx_code_accepted"` — код принят; новый запрос с `reason: "wrong_code"` — отправьте код из самого свежего письма ещё раз.

### Отправить код BingX {#post-bingx-code}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code</code></div>

Передаёт код из письма BingX. На каждый запрос кода принимается один код — первый, откуда бы его ни прислали: бот, веб-версия или API.

Право `upload`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `code` | строка | да | До 32 символов; без пробелов — от 4 до 8 цифр |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/8402-9173/slots/5120-3562/bingx-code \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"code": "123 456"}'
```

Ответ `200`:

```json
{"status": "accepted"}
```

`accepted` — код взят и отправлен в BingX, а не «код подошёл». Итог придёт в ленту. Код нигде не возвращается.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `not_open` | Слот сейчас не ждёт код: ещё не запросили, код уже взят, слот ждёт повторной загрузки, закрыт или это не второй этап BingX |
| 422 | `bad_format` | Без пробелов — не 4–8 цифр; ничего не изменилось |

### Запросить новый код BingX {#post-bingx-refresh}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/bingx-code/refresh</code></div>

Проверяет, действует ли код в последнем письме, и при необходимости просит BingX прислать новое.

Право `upload`

Ответ `200`:

```json
{"status": "resent"}
```

`still_fresh` — коду меньше 10 минут, отправляйте его. `resent` — BingX пришлёт новое письмо; в ленту придёт запрос с `reason: "stale_resent"`.

| HTTP | `code` | Когда |
|---|---|---|
| 409 | `not_open` | Код сейчас не ждут или ваши 60 минут закончились |

## Скриншоты для Risk Removal

Когда по слоту Risk Removal запросят новые скриншоты депозита, придёт событие `slot_action_required` с `action: "risk_proofs"`. Загрузите каждый скриншот в [`POST /risk-proofs/files`](#post-risk-proofs-files), затем отправьте набор в [`POST …/risk-proofs`](#post-slot-risk-proofs). Что должно быть на скриншоте — [Risk Removal](../guide/risk-removal.md).

### Загрузить скриншот депозита {#post-risk-proofs-files}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files</code></div>

Загружает один скриншот депозита. Неотправленный скриншот можно использовать 23 часа. Необязательный заголовок `X-Upload-Key` (UUID): повтор с тем же ключом в течение 24 часов вернёт тот же `id`.

Право `upload`

| Поле формы | Тип | Обязательно | Описание |
|---|---|---|---|
| `file` | файл | да | JPEG, PNG, WebP или HEIC (по содержимому); 10 КБ – 18 МБ; каждая сторона 300–12 000 пикселей |

```bash
curl -X POST https://app.kycportal.org/api/v1/risk-proofs/files \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "X-Upload-Key: 6f1d3c1e-0000-4000-8000-000000000001" \
  -F file=@deposit-1.png
```

Ответ `201`:

```json
{"id": "0b6c2a7e-1111-4222-8333-444455556666", "size_bytes": 184321, "mime": "image/png"}
```

| HTTP | `code` | Когда |
|---|---|---|
| 422 | `proof_not_an_image` | Не JPEG, PNG, WebP или HEIC, или нет части `file` |
| 413 | `proof_too_large` | Больше 18 МБ |
| 422 | `proof_too_small` | Меньше 10 КБ или короткая сторона меньше 300 пикселей |
| 422 | `proof_dimensions_absurd` | Сторона больше 12 000 пикселей |
| 429 | `proof_quota_exceeded` | За 24 часа с первой загрузки — 250 скриншотов или 500 МБ (удалённые тоже считаются), либо уже 120 неотправленных; `retry_after_seconds` |
| 409 | `proofs_upload_in_progress` | Первая попытка с этим `X-Upload-Key` ещё сохраняется; `retry_after_seconds: 3` |
| 503 | `proofs_storage_busy` | Хранилище занято; `retry_after_seconds: 5` |
| 503 | `proofs_storage_unavailable` | Хранилище недоступно — повторите позже |

### Удалить скриншот {#delete-risk-proofs-file}

<div class="api-endpoint"><span class="api-method api-method--delete">DELETE</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/risk-proofs/files/{file_id}</code></div>

Удаляет свой неотправленный скриншот.

Право `upload`

Ответ `204` без тела.

| HTTP | `code` | Когда |
|---|---|---|
| 404 | `proof_file_not_found` | Скриншот не найден, чужой или уже отправлен |

### Отправить скриншоты для Risk Removal {#post-slot-risk-proofs}

<div class="api-endpoint"><span class="api-method api-method--post">POST</span><code><span class="api-base">https://app.kycportal.org/api/v1</span>/orders/{order_id}/slots/{slot_id}/risk-proofs</code></div>

Отправляет новые скриншоты по слоту Risk Removal, когда их запросили. Набор полностью заменяет прежние скриншоты слота; платить ничего не нужно.

Право `upload`

| Поле тела | Тип | Обязательно | Описание |
|---|---|---|---|
| `deposits` | список | да | От 1 до 4 скриншотов |
| `deposits[].file_id` | строка | да | `id` из [`POST /risk-proofs/files`](#post-risk-proofs-files) |
| `deposits[].source` | строка | да | Откуда пришёл депозит, до 64 символов; попадёт в апелляцию как есть |

```bash
curl -X POST https://app.kycportal.org/api/v1/orders/2210-4471/slots/3307-1186/risk-proofs \
  -H "Authorization: Bearer $KP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"deposits": [{"file_id": "0b6c2a7e-1111-4222-8333-444455556666", "source": "Bybit"},
                   {"file_id": "9d4e1f20-2222-4333-8444-555566667777", "source": "Trust Wallet"}]}'
```

Ответ `200`:

```json
{"slot_id": "3307-1186", "status": "RISK_REJECTED", "count": 2}
```

`status` — статус слота, `count` — сколько скриншотов теперь у слота. После отправки `risk_proofs` пропадает из `waiting_for_client`.

| HTTP | `code` | Когда |
|---|---|---|
| 404 | `proof_file_not_found` | Скриншот не найден, чужой, уже отправлен или старше 23 часов |
| 422 | `proof_source_invalid` | Пустой `source` |
| 409 | `risk_proofs_not_requested` | Новые скриншоты по слоту не запрашивали или слот закрыт |
| 409 | `risk_proofs_invalid` | Набор отклонён |
| 404 | `slot_not_found` | В том числе слот не Risk Removal |
