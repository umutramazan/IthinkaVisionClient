# FAZ 1 — Dummy Detection API

## Amaç

Gerçek model olmadan mobil istemcinin bağlanabileceği, sözleşmesi testlerle sabitlenmiş bir detection API oluşturmak.

## Bağımlılıklar

- [FAZ 0](PHASE-00-foundation.md) tamamlanmış olmalı.

## API sözleşmesi

Endpoint: `POST /api/v1/analyze`

Multipart alanları:

| Alan | Tip | Kural |
|---|---|---|
| `image` | file | Desteklenen bir görsel olmalı ve boyut limitini aşmamalı |
| `modelType` | string | MVP için yalnızca `detection` |

Başarılı cevap:

```json
{
  "success": true,
  "detections": [
    { "class": "Person", "confidence": 0.96 },
    { "class": "Helmet", "confidence": 0.91 }
  ]
}
```

Hata cevabı:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Geçersiz veya desteklenmeyen görsel."
  }
}
```

## Görevler

- [x] FastAPI application factory/entrypoint ve `/api/v1` router yapısını oluştur.
- [x] Başarı ve hata Pydantic şemalarını oluştur.
- [x] `modelType` değerini yalnızca `detection` kabul edecek şekilde doğrula.
- [x] Desteklenen MIME türlerini ve maksimum upload boyutunu config üzerinden yönet.
- [x] MIME başlığının yanı sıra dosyanın gerçekten decode edilebilir bir görsel olduğunu doğrula.
- [x] Dummy servis katmanından sözleşmeye uygun sabit detection sonucu döndür.
- [x] Ortak exception handler ile hataları standart JSON biçimine dönüştür.
- [x] `/health/live` ve `/health/ready` endpointlerini ekle.
- [x] Görseli kalıcı depolamaya yazma; geçici dosya gerekiyorsa `finally` ile sil.
- [x] Başarılı ve hatalı istekler için temel teknik log üret.

## Testler

- [x] Geçerli JPEG ile `200` ve doğru dummy cevap.
- [x] Geçerli PNG ile `200` ve doğru dummy cevap.
- [x] Eksik görsel alanı.
- [x] Eksik veya geçersiz `modelType`.
- [x] Desteklenmeyen dosya türü.
- [x] Boyut limitini aşan dosya.
- [x] Sahte MIME veya decode edilemeyen içerik.
- [x] Geçici dosyanın başarı ve hata sonrasında silinmesi.
- [x] OpenAPI şemasının beklenen request/response yapısını içermesi.

### Kapanış doğrulama notları

| Kontrol | Sonuç |
|---|---|
| Ruff lint ve format | Temiz |
| pytest | 34 test geçti |
| Gerçek Uvicorn süreci | Başladı ve doğrulama sonunda kapatıldı |
| `/health/live`, `/health/ready`, `/docs`, `/openapi.json` | HTTP 200 |
| Gerçek PNG ile multipart `POST /api/v1/analyze` | HTTP 200, 2 dummy detection |
| Postman isteği | HTTP 200, 2 dummy detection — reviewer doğruladı (2026-07-26) |

## Tamamlanma kriteri

Swagger, Postman ve otomatik testlerden aynı sözleşmeye uygun dummy detection sonucu alınabiliyor; geçersiz girdiler standart hata cevabı üretiyor.

## Çıktılar

- Çalışır dummy endpoint
- API şemaları ve exception altyapısı
- Endpoint/contract testleri
