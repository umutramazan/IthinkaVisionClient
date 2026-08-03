# FAZ 8 — Sunucuyu Docker ile Paketleme

## Amaç

FastAPI ve detection runtime'ını şirket sunucusuna taşınabilir, tekrar üretilebilir bir container haline getirmek.

## Bağımlılıklar

- [FAZ 5](PHASE-05-detection-integration.md) tamamlanmış olmalı.
- Nihai model runtime bağımlılıkları biliniyor olmalı.

## Açık karar

Şirket sunucusunda GPU bulunup bulunmadığı bilinmemektedir. Önce mevcut ortamda doğrulanan CPU image hazırlanabilir; hedef sunucu GPU sağlıyorsa ayrı GPU image/profile eklenir.

## CI/CD sınırı

Bu fazda Docker build, test ve yerel çalıştırma adımları önce manuel olarak uygulanır ve tekrar
edilebilir komutlar halinde belgelenir. Registry'ye otomatik image gönderme ve pipeline otomasyonu
[FAZ 10](PHASE-10-expansion.md) kapsamındadır.

## Görevler

- [ ] Python ve native bağımlılık sürümlerini sabitle.
- [ ] `.dockerignore` oluştur.
- [ ] Multi-stage veya uygun minimal Dockerfile oluştur.
- [ ] Container'ı non-root kullanıcıyla çalıştır.
- [ ] Uvicorn host/port ayarlarını ortam değişkeninden yönet.
- [ ] `/health/live` ve `/health/ready` için healthcheck ekle.
- [ ] Model ağırlığını image, read-only volume veya harici artifact olarak sağlama kararını kaydet.
- [ ] Model artifact sürüm/checksum doğrulaması ekle.
- [ ] Görseller için kalıcı volume bağlama; gerekiyorsa yalnızca geçici alan kullan.
- [ ] Logları stdout/stderr'a yönlendir.
- [ ] Hedef ortam için Docker logging driver'ını seç ve `max-size`/`max-file` benzeri sınırlarla
  yerel log rotation yapılandır.
- [ ] CPU/RAM limitleri ve inference concurrency değerlerini tanımla.
- [ ] `docker-compose.yml` veya production compose tanımı oluştur.
- [ ] GPU gerekiyorsa NVIDIA container runtime profilini ayrıca oluştur.
- [ ] Manuel build, smoke test, başlatma ve durdurma komutlarını CI/CD girdisi olacak şekilde kaydet.

## Güvenlik kontrolleri

- [ ] Secret'lar image içine kopyalanmıyor.
- [ ] `.env` image veya repository içine girmiyor.
- [ ] Gereksiz portlar açılmıyor.
- [ ] Container root olarak çalışmıyor.
- [ ] Model volume'u mümkünse read-only.

## Testler

- [ ] Temiz ortamda `docker compose up --build`.
- [ ] Healthcheck başarılı.
- [ ] Gerçek görselle analiz.
- [ ] Container restart sonrasında model yükleme.
- [ ] Geçici görsellerin container içinde kalmaması.
- [ ] Log rotation sınırlarının çalıştığını ve container loglarının sınırsız disk tüketmediğini doğrula.
- [ ] Bellek ve concurrency smoke testi.
- [ ] Aynı commit ve model checksum'uyla image'ın tekrar üretilebildiğini doğrula.

## Tamamlanma kriteri

Sunucu temiz bir makinede belgelenmiş tek komutla başlayabiliyor, healthcheck geçiyor ve gerçek detection sonucu döndürüyor.

## Çıktılar

- `Dockerfile`
- `.dockerignore`
- Compose tanımı
- Model artifact yerleşim kararı
- Container logging driver ve yerel rotation ayarları
- CI/CD otomasyonuna girdi olacak doğrulanmış manuel container komutları
