# iThinka Vision — Sunucu (FastAPI)

MVP detection API'si. Faz planı için [docs/phases](../docs/phases) klasörüne bakınız.

## Gereksinimler

- Python 3.14.6 (minimum 3.12)

## Kurulum

```powershell
cd server
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

macOS/Linux için:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
```

Production ortamına yalnızca `requirements.txt` kurulur.

## Çalıştırma

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger: http://127.0.0.1:8000/docs (yalnızca `APP_ENV=development`)
- Liveness: http://127.0.0.1:8000/health/live
- Readiness: http://127.0.0.1:8000/health/ready

Mobil uygulamayı gerçek cihazdan bağlarken `--host 0.0.0.0` gereklidir ve
`EXPO_PUBLIC_API_BASE_URL` bilgisayarın LAN IP'sini göstermelidir.

## Kalite komutları

| Komut | Açıklama |
|---|---|
| `python -m ruff check .` | Lint |
| `python -m ruff format .` | Format |
| `python -m ruff format --check .` | Format kontrolü (CI) |
| `python -m pytest` | Testler |

## Yapılandırma

Tüm ayarlar `APP_` önekli ortam değişkenlerinden okunur (bkz. `.env.example`).
`APP_ENV=production` olduğunda Swagger ve OpenAPI şeması kapatılır.

## Klasör yapısı

```text
app/
  api/          HTTP katmanı (health) ve api/v1 (FAZ 1: analyze)
  schemas/      Pydantic request/response modelleri
  services/     İş mantığı (FAZ 1: dummy, FAZ 5: gerçek analiz)
  inference/    Model formatına özel kod (FAZ 5)
  core/         Loglama gibi çapraz kesen altyapı
  config/       Ayarlar
tests/          pytest testleri
```
