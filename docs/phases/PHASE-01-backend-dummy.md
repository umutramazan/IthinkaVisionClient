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

- [ ] FastAPI application factory/entrypoint ve `/api/v1` router yapısını oluştur.
- [ ] Başarı ve hata Pydantic şemalarını oluştur.
- [ ] `modelType` değerini yalnızca `detection` kabul edecek şekilde doğrula.
- [ ] Desteklenen MIME türlerini ve maksimum upload boyutunu config üzerinden yönet.
- [ ] MIME başlığının yanı sıra dosyanın gerçekten decode edilebilir bir görsel olduğunu doğrula.
- [ ] Dummy servis katmanından sözleşmeye uygun sabit detection sonucu döndür.
- [ ] Ortak exception handler ile hataları standart JSON biçimine dönüştür.
- [ ] `/health/live` ve `/health/ready` endpointlerini ekle.
- [ ] Görseli kalıcı depolamaya yazma; geçici dosya gerekiyorsa `finally` ile sil.
- [ ] Başarılı ve hatalı istekler için temel teknik log üret.

## Testler

- [ ] Geçerli JPEG ile `200` ve doğru dummy cevap.
- [ ] Geçerli PNG ile `200` ve doğru dummy cevap.
- [ ] Eksik görsel alanı.
- [ ] Eksik veya geçersiz `modelType`.
- [ ] Desteklenmeyen dosya türü.
- [ ] Boyut limitini aşan dosya.
- [ ] Sahte MIME veya decode edilemeyen içerik.
- [ ] Geçici dosyanın başarı ve hata sonrasında silinmesi.
- [ ] OpenAPI şemasının beklenen request/response yapısını içermesi.

## Tamamlanma kriteri

Swagger, Postman ve otomatik testlerden aynı sözleşmeye uygun dummy detection sonucu alınabiliyor; geçersiz girdiler standart hata cevabı üretiyor.

## Çıktılar

- Çalışır dummy endpoint
- API şemaları ve exception altyapısı
- Endpoint/contract testleri

