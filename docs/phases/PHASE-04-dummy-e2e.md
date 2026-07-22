# FAZ 4 — Dummy API ile Uçtan Uca Entegrasyon

## Amaç

Mobil uygulamayı dummy FastAPI endpointine bağlayarak gerçek model öncesinde MVP akışını uçtan uca doğrulamak.

## Bağımlılıklar

- [FAZ 1](PHASE-01-backend-dummy.md) tamamlanmış olmalı.
- [FAZ 3](PHASE-03-image-acquisition.md) tamamlanmış olmalı.

## Görevler

- [ ] `EXPO_PUBLIC_API_BASE_URL` zorunlu config değerini tanımla.
- [ ] Development ve production URL ayrımını oluştur.
- [ ] `ModelType = "detection"` ve API response TypeScript tiplerini tanımla.
- [ ] Axios instance'ını base URL ve timeout ile oluştur.
- [ ] Görsel ve seçilen modeli `multipart/form-data` ile gönder.
- [ ] Multipart boundary yönetimini HTTP istemcisine bırak.
- [ ] `useAnalyze` hook'unda loading/result/error state'lerini yönet.
- [ ] API'deki `success: false` cevabını kullanıcı hatasına dönüştür.
- [ ] HTTP 413, 415, 422, 5xx, bağlantı hatası ve istemci timeout'unu mesajlara eşle.
- [ ] Analiz sürerken ikinci isteği engelle.
- [ ] Gerekirse ekran kapanırken isteği iptal et.
- [ ] `detections` sonucunu view-model üzerinden kullanıcı kartlarına dönüştür.
- [ ] Boş `detections` dizisini “Nesne tespit edilemedi” olarak göster.

## Hata mesajları

| Durum | Kullanıcı mesajı |
|---|---|
| Görsel seçilmedi | Lütfen önce bir görsel seçiniz. |
| Model seçilmedi | Lütfen model seçiniz. |
| Kamera açılamadı | Kamera açılamadı. |
| Sunucuya ulaşılamadı | Sunucuya bağlanılamadı. |
| İstemci timeout | Sunucudan cevap alınamadı. |
| Geçersiz/büyük görsel | Geçersiz veya çok büyük görsel. |
| Sunucu hatası | İşlem sırasında bir hata oluştu. |

## Testler

- [ ] Kamera → Detection seç → gönder → sonucu göster.
- [ ] Galeri → Detection seç → gönder → sonucu göster.
- [ ] Boş detection cevabı.
- [ ] Aynı sınıftan birden fazla detection.
- [ ] Sunucu kapalıyken hata görünümü.
- [ ] Timeout simülasyonu.
- [ ] 413, 415 ve 422 eşlemeleri.
- [ ] Loading sırasında çift tıklama.

## Tamamlanma kriteri

Android ve iOS istemcileri gerçek bir görseli dummy sunucuya gönderip sade API cevabını kullanıcı dostu sonuçlara dönüştürebiliyor; kritik bağlantı ve validasyon hataları anlaşılır mesaj üretiyor.

## Çıktılar

- `apiService.ts`
- `useAnalyze.ts`
- Uçtan uca çalışan dummy MVP akışı

