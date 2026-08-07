# FAZ 8 — Sunucuyu Docker ile Paketleme

## Amaç

FastAPI ve detection runtime'ını şirket sunucusuna taşınabilir, tekrar üretilebilir bir container haline getirmek.

## Bağımlılıklar

- [FAZ 5](PHASE-05-detection-integration.md) tamamlanmış olmalı.
- Nihai model runtime bağımlılıkları biliniyor olmalı.

## Hedef runtime kararı

Şirket sunucusunda GPU bulunmadığı doğrulandı. Production hedefi, yerel ortamda doğrulanan ONNX Runtime
`CPUExecutionProvider` image'ıdır; NVIDIA Container Toolkit veya ayrı GPU image/profile gerekmemektedir.

## CI/CD sınırı

Bu fazda Docker build, test ve yerel çalıştırma adımları önce manuel olarak uygulanır ve tekrar
edilebilir komutlar halinde belgelenir. Registry'ye otomatik image gönderme ve pipeline otomasyonu
[FAZ 10](PHASE-10-expansion.md) kapsamındadır.

## Durum

**Tamamlandı.** CPU image temiz Docker Desktop/WSL 2 kurulumunda build edildi; healthcheck, gerçek ONNX
inference, Android preview uygulamasıyla LAN iletişimi, container restart, concurrency, log rotation ve
tekrar build kontrolleri geçti. Hedef sunucuda GPU bulunmadığı için CPU image production hedefi olarak
kesinleştirildi.

## Container kararları

- Taban image `python:3.14.6-slim-bookworm` etiketi ve çoklu mimari digest'i ile sabitlendi.
- ONNX Runtime'ın Linux native gereksinimi `libgomp1=12.2.0-14+deb12u1` olarak sabitlendi.
- `best.onnx` image içine gömülmez; `server/models/best.onnx`, `/models/best.onnx` yoluna read-only bind
  mount edilir.
- Container başlamadan önce modelin SHA-256 değeri doğrulanır. Beklenen değer
  `39B2E8EC75F063D88A41344626EFAAB04C1643F5B82AFAA2536E4AD1488C796D` değeridir.
- Yüklenen görseller bellekte işlenir; kalıcı görsel volume'u yoktur. Salt-okunur kök dosya sistemine ek
  olarak yalnızca `/tmp` için 64 MiB geçici RAM alanı sağlanır.
- CPU image 2 CPU, 2 GiB RAM ve `APP_INFERENCE_MAX_CONCURRENCY=2` ile sınırlandırıldı.
- Loglar stdout/stderr'a JSON olarak yazılır. Yerel rotation için `json-file`, `max-size=10m` ve
  `max-file=3` kullanılır.
- Şirket sunucusunda GPU bulunmadığı için NVIDIA runtime veya ayrı GPU image/profile oluşturulmayacak.

## Görevler

- [x] Python ve native bağımlılık sürümlerini sabitle.
- [x] `.dockerignore` oluştur.
- [x] Multi-stage veya uygun minimal Dockerfile oluştur.
- [x] Container'ı non-root kullanıcıyla çalıştır.
- [x] Uvicorn host/port ayarlarını ortam değişkeninden yönet.
- [x] `/health/live` ve `/health/ready` için healthcheck ekle.
- [x] Model ağırlığını image, read-only volume veya harici artifact olarak sağlama kararını kaydet.
- [x] Model artifact sürüm/checksum doğrulaması ekle.
- [x] Görseller için kalıcı volume bağlama; gerekiyorsa yalnızca geçici alan kullan.
- [x] Logları stdout/stderr'a yönlendir.
- [x] Hedef ortam için Docker logging driver'ını seç ve `max-size`/`max-file` benzeri sınırlarla
  yerel log rotation yapılandır.
- [x] CPU/RAM limitleri ve inference concurrency değerlerini tanımla.
- [x] `docker-compose.yml` veya production compose tanımı oluştur.
- [x] Hedef sunucuda GPU bulunmadığını ve NVIDIA container runtime profili gerekmediğini kaydet.
- [x] Manuel build, smoke test, başlatma ve durdurma komutlarını CI/CD girdisi olacak şekilde kaydet.

## Güvenlik kontrolleri

- [x] Secret'lar image içine kopyalanmıyor.
- [x] `.env` image veya repository içine girmiyor.
- [x] Gereksiz portlar açılmıyor.
- [x] Container root olarak çalışmıyor.
- [x] Model volume'u read-only.

## Testler

- [x] Temiz ortamda `docker compose up --build`.
- [x] Healthcheck başarılı.
- [x] Gerçek görselle analiz.
- [x] Container restart sonrasında model yükleme.
- [x] Geçici görsellerin container içinde kalmaması.
- [x] Log rotation sınırlarının çalıştığını ve container loglarının sınırsız disk tüketmediğini doğrula.
- [x] Bellek ve concurrency smoke testi.
- [x] Aynı commit ve model checksum'uyla image'ın tekrar üretilebildiğini doğrula.

## Yerel doğrulama — 2026-08-07

| Kontrol | Sonuç |
|---|---|
| Docker ortamı | Docker Desktop 4.85.0, Engine 29.6.2, Compose 5.3.1, WSL 2/Linux amd64 |
| Image | `ithinka-vision-server:0.1.0`, yaklaşık 102 MB |
| Runtime | Python 3.14.6, ONNX Runtime 1.28.0, `CPUExecutionProvider` |
| Kullanıcı ve dosya sistemi | UID 10001 (`app`), read-only rootfs, `no-new-privileges`, tüm capability'ler düşürüldü |
| Model | Read-only mount; başlangıçta beklenen SHA-256 ile doğrulandı |
| Health | `/health/live` ve `/health/ready` `200`; Docker durumu `healthy` |
| Model yükleme | Container başlangıcında yaklaşık 114 ms |
| Teknik inference | PNG upload → ONNX inference → `200`, yaklaşık 99 ms; uygun olmayan görselde 0 detection |
| Mobil uçtan uca | Android preview APK → LAN Docker API → gerçek görsel; `200`, 1 detection, yaklaşık 118 ms |
| Restart | Docker Desktop'tan restart sonrası checksum/model yükleme ve mobil analiz tekrar geçti |
| Geçici dosya | Analiz sonrasında `/tmp` ve `/app` altında yüklenen görsel bulunmadı |
| Kaynak sınırları | 2 CPU, 2 GiB RAM, concurrency 2; boşta yaklaşık 143 MiB |
| Concurrency smoke | 4 paralel istek de `200`; test sonrası yaklaşık 224 MiB, container `healthy` |
| Log yapılandırması | `json-file`, `max-size=10m`, `max-file=3` çalışan API container üzerinde doğrulandı |
| Log rotation | İzole testte 4000 satır/yaklaşık 2 MB üretildi; `10k × 3` sınırı yalnızca son 40 satır/yaklaşık 20 KB tuttu |
| Health log gürültüsü | Başarılı live/ready probe kayıtları INFO'dan çıkarıldı; başarısız health ve analiz kayıtları korunuyor |
| Entrypoint logları | Model checksum başarı/hata kayıtları tek satırlık production JSON biçimine getirildi |
| Image içeriği | Model, `.env`, secret/anahtar ve test dosyası bulunmadı |
| Tekrar build | Runtime manifest ve config aynı kaldı; BuildKit provenance attestation üst image kimliğini yeniledi |
| Sunucu kalite kontrolü | Ruff lint/format temiz; `61` pytest testi geçti |

## Manuel komutlar

Repository kökünden:

```powershell
# Build ve arka planda başlatma
docker compose -f server/compose.yaml up --build --detach

# Durum, log ve health
docker compose -f server/compose.yaml ps
docker compose -f server/compose.yaml logs --follow api
curl.exe http://127.0.0.1:8000/health/live
curl.exe http://127.0.0.1:8000/health/ready

# Gerçek görselle smoke test
curl.exe -X POST http://127.0.0.1:8000/api/v1/analyze `
  -F "modelType=detection" `
  -F "image=@sample.jpg;type=image/jpeg"

# Durdurma ve Compose kaynaklarını kaldırma
docker compose -f server/compose.yaml down
```

## Tamamlanma kriteri

Sunucu temiz bir makinede belgelenmiş tek komutla başlayabiliyor, healthcheck geçiyor ve gerçek detection sonucu döndürüyor.

## Çıktılar

- `Dockerfile`
- `.dockerignore`
- Compose tanımı
- Model artifact yerleşim kararı
- Container logging driver ve yerel rotation ayarları
- CI/CD otomasyonuna girdi olacak doğrulanmış manuel container komutları
