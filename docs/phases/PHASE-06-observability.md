# FAZ 6 — Temel Gözlemlenebilirlik

## Amaç

Müşteri demosunda oluşabilecek sorunları kullanıcı verisi biriktirmeden teşhis edebilmek.

## Bağımlılıklar

- [FAZ 5](PHASE-05-detection-integration.md) tamamlanmış olmalı.

## Gizlilik kuralları

- Yüklenen görsel loglanmaz veya kalıcı olarak saklanmaz.
- Mobil cihazda kalıcı analiz geçmişi MVP kapsamında tutulmaz.
- Teknik loglarda gizli anahtar veya hassas header bulunmaz.
- Dosya adı gerekli değilse loglanmaz; gerekiyorsa anonimleştirilir.

## Görevler

- [x] Her istek için teknik bir correlation/request ID üret.
- [x] Başlangıç, başarı ve hata loglarını yapılandırılmış alanlarla yaz.
- [x] Süre, sonuç durumu, hata kodu ve detection sayısını logla.
- [x] Geliştirmede okunabilir, üretimde JSON/stdout log formatı kullan.
- [x] Docker ortamında log rotation/toplama sorumluluğunu deployment planına bağla.
- [x] Model yükleme başarısı ve readiness durumunu logla.
- [x] Mobilde kullanıcıya teknik stack trace göstermeden development logu üret.
- [x] Log seviyelerini config üzerinden yönet.

## Önerilen sunucu log alanları

```text
timestamp, level, request_id, endpoint, model_type, status,
duration_ms, detection_count, error_code
```

## Container ve deployment log sorumluluğu

Uygulama log dosyası oluşturmaz ve rotation yapmaz; development ortamında okunabilir, production
ortamında JSON loglarını `stdout/stderr` üzerinden üretir. Sonraki fazlardaki sorumluluklar şöyledir:

| Katman | Sorumluluk |
|---|---|
| Uygulama — FAZ 6 | Yapılandırılmış, hassas veri içermeyen log üretmek ve request ID ile korelasyon sağlamak |
| Container — [FAZ 8](PHASE-08-docker.md) | Logging driver seçmek, boyut/dosya sınırıyla yerel rotation yapılandırmak ve disk büyümesini test etmek |
| Şirket sunucusu — [FAZ 9](PHASE-09-deployment.md) | Log toplama hedefini, saklama süresini, erişim yetkisini, disk takibini ve operasyon kontrolünü belirlemek |
| CI/CD — [FAZ 10](PHASE-10-expansion.md) | Container/deployment log ayarlarını ve hassas veri bulunmadığını otomatik doğrulamak |

Merkezi monitoring ve alarm MVP sonrasında genişletilebilir; ancak production için sınırlı yerel rotation,
erişim kontrollü log inceleme yolu ve disk kullanımı kontrolü zorunludur.

## Testler

- [x] Başarılı istek logu.
- [x] Validation hata logu.
- [x] Inference hata logu.
- [x] Timeout logu.
- [x] Loglarda görsel byte'ı veya hassas veri bulunmadığının kontrolü.
- [x] Request ID ile tek isteğin loglarının takip edilebilmesi.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| Request ID üretimi | Her HTTP isteğinde sunucu tarafından benzersiz UUID üretiliyor |
| Request context | Kimlik `request.state.request_id` ve context variable üzerinden erişilebilir |
| Response correlation | `X-Request-ID` response header'ında döndürülüyor ve CORS ile expose ediliyor |
| Güven sınırı | İstemciden gelen `X-Request-ID` kabul edilmiyor; sunucu kendi değerini üretiyor |
| Hata cevapları | Validation dahil standart hata cevapları `X-Request-ID` içeriyor |
| Development log formatı | Tek satır, okunabilir mesaj ve yapılandırılmış `key=value` alanları |
| Production log formatı | UTF-8, geçerli tek satır JSON ve stdout |
| Log seviyesi | `APP_LOG_LEVEL` değeri normalize ediliyor; geçersiz seviyeler başlangıçta reddediliyor |
| Request yaşam döngüsü | Başlangıç/bitiş; endpoint, status ve `duration_ms` ortak middleware'de loglanıyor |
| Analiz alanları | `model_type`, `detection_count` ve `error_code` ilgili event'lere ekleniyor |
| Model/readiness | Yükleme süresi, başarı/başarısızlık ve readiness sonucu yapılandırılmış loglanıyor |
| Production smoke | Lifecycle ve `/health/ready` logları aynı request ID ile geçerli JSON üretti |
| Log korelasyonu | Başarılı analiz, validation ve inference hatası event'leri response `X-Request-ID` değeriyle eşleşiyor |
| Sunucu log gizliliği | Görsel içeriği, dosya adı, authorization ve özel header değerleri production JSON loguna yazılmıyor |
| Operasyon sorumluluğu | Rotation FAZ 8'e; toplama, saklama ve erişim politikası FAZ 9'a; otomatik kontrol FAZ 10'a bağlandı |
| Sunucu kalite kontrolü | Ruff temiz; 56 test geçti |
| Mobil development logu | Başlangıç, başarı, hata, timeout ve iptal olayları yalnızca `__DEV__` modunda |
| Mobil correlation | Sunucunun `X-Request-ID` değeri alınabildiği cevaplarda development loguna ekleniyor |
| Mobil log gizliliği | Görsel URI'si, dosya adı, FormData, hata mesajı veya stack trace loglanmıyor |
| Mobil kalite kontrolü | Type-check, ESLint ve Prettier temiz; 71 test geçti |
| iOS başarılı analiz smoke testi | 6 detection döndü; mobil ve sunucu logları aynı `093b39d8-7981-4cb6-8e06-039744f4d90a` request ID'siyle eşleşti (2026-08-03) |
| iOS timeout smoke testi | Sunucu kapalıyken yaklaşık 15 saniyede `analysis_timeout` ve `ECONNABORTED` development logu üretildi (2026-08-03) |
| iOS smoke-test gizliliği | Gözlemlenen mobil ve sunucu loglarında görsel URI'si, dosya adı, görsel içeriği veya stack trace bulunmadı |

## Tamamlanma kriteri

Başarılı ve hatalı bir analiz, görsel saklanmadan ve hassas veri yazılmadan sunucu logları üzerinden uçtan uca takip edilebiliyor.

## Çıktılar

- Yapılandırılmış sunucu logları
- Log gizlilik kuralları
- Temel teşhis kabiliyeti
