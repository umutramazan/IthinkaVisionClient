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

## Docker ile çalıştırma

CPU tabanlı production-benzeri container, repository kökünden tek komutla build edilip başlatılır:

```powershell
docker compose -f server/compose.yaml up --build --detach
```

Başlatmadan önce `server/models/best.onnx` dosyasının mevcut ve checksum değerinin
`server/compose.yaml` içindeki `APP_MODEL_SHA256` ile aynı olması gerekir. Model image içine kopyalanmaz;
container'a `/models/best.onnx` yolunda read-only bind mount olarak bağlanır.

```powershell
# Durum ve healthcheck
docker compose -f server/compose.yaml ps

# JSON uygulama logları
docker compose -f server/compose.yaml logs --follow api

# Liveness ve readiness
curl.exe http://127.0.0.1:8000/health/live
curl.exe http://127.0.0.1:8000/health/ready

# Container'ı durdur ve Compose kaynaklarını kaldır
docker compose -f server/compose.yaml down
```

Container root olmayan `app` kullanıcısıyla ve read-only kök dosya sistemiyle çalışır. Compose tanımı
2 CPU, 2 GiB RAM, en fazla 2 eşzamanlı inference ve `json-file` logging driver için `10m × 3` rotation
sınırı uygular. Yerel mobil testte `EXPO_PUBLIC_API_BASE_URL`, Docker host bilgisayarının LAN adresini ve
`8000` portunu göstermelidir.

Başarılı `/health/live` ve `/health/ready` çağrıları periyodik Docker probe gürültüsünü önlemek için INFO
loglarına yazılmaz. Başarısız healthcheck'ler WARNING/ERROR olarak, analiz istekleri ise request ID ile
birlikte normal şekilde loglanmaya devam eder. Container entrypoint'i model checksum başarı ve hata
kayıtlarını diğer production loglarıyla aynı tek satırlık JSON biçiminde üretir.

## Analyze isteği

Endpoint: `POST http://127.0.0.1:8000/api/v1/analyze`

Postman'da **Body → form-data** seçin ve şu alanları ekleyin:

| Key | Tür | Değer |
|---|---|---|
| `modelType` | Text | `detection` |
| `image` | File | Geçerli bir JPEG veya PNG dosyası |

`Content-Type` başlığını elle eklemeyin; Postman multipart boundary değeriyle birlikte otomatik
oluşturur. Aynı isteğin komut satırı karşılığı:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyze \
  -F "modelType=detection" \
  -F "image=@sample.jpg;type=image/jpeg"
```

Başarılı istek `200` ve `success: true`; geçersiz istekler standart `success: false` hata
sözleşmesini döndürür. Desteklenen türler ve maksimum dosya boyutu `.env` üzerinden yönetilir.

## Detection runtime

FAZ 5 geliştirme runtime'ı ONNX Runtime ve `CPUExecutionProvider` kullanır. Model
`APP_MODEL_PATH` üzerinden uygulama başlangıcında bir kez yüklenir. Yükleme başarısız olursa liveness
çalışmaya devam eder; readiness `503` döndürür ve analiz istekleri `MODEL_UNAVAILABLE` hatası alır.

| Ayar | Varsayılan | Açıklama |
|---|---:|---|
| `APP_MODEL_PATH` | `models/best.onnx` | ONNX artifact yolu |
| `APP_MODEL_CONFIDENCE_THRESHOLD` | `0.25` | Sonuçlara uygulanan ilk güven eşiği |
| `APP_INFERENCE_MAX_CONCURRENCY` | `2` | Aynı anda çalışan en fazla inference |

İlk yerel ölçümler [FAZ 5 benchmark notunda](../docs/benchmarks/PHASE-05-initial-benchmark.md)
kayıtlıdır. Confidence eşiği ve worker sınırı gerçek fotoğraflar ve hedef sunucu üzerinde yeniden
doğrulanacaktır.

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
  services/     İş mantığı ve sınırlı inference worker'ı
  inference/    BaseModel arayüzü ve ONNX detection adaptörü
  core/         Loglama gibi çapraz kesen altyapı
  config/       Ayarlar
tests/          pytest testleri
```
