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

- [ ] Her istek için teknik bir correlation/request ID üret.
- [ ] Başlangıç, başarı ve hata loglarını yapılandırılmış alanlarla yaz.
- [ ] Süre, sonuç durumu, hata kodu ve detection sayısını logla.
- [ ] Geliştirmede okunabilir, üretimde JSON/stdout log formatı kullan.
- [ ] Docker ortamında log rotation/toplama sorumluluğunu deployment planına bağla.
- [ ] Model yükleme başarısı ve readiness durumunu logla.
- [ ] Mobilde kullanıcıya teknik stack trace göstermeden development logu üret.
- [ ] Log seviyelerini config üzerinden yönet.

## Önerilen sunucu log alanları

```text
timestamp, level, request_id, endpoint, model_type, status,
duration_ms, detection_count, error_code
```

## Testler

- [ ] Başarılı istek logu.
- [ ] Validation hata logu.
- [ ] Inference hata logu.
- [ ] Timeout logu.
- [ ] Loglarda görsel byte'ı veya hassas veri bulunmadığının kontrolü.
- [ ] Request ID ile tek isteğin loglarının takip edilebilmesi.

## Tamamlanma kriteri

Başarılı ve hatalı bir analiz, görsel saklanmadan ve hassas veri yazılmadan sunucu logları üzerinden uçtan uca takip edilebiliyor.

## Çıktılar

- Yapılandırılmış sunucu logları
- Log gizlilik kuralları
- Temel teşhis kabiliyeti

