# FAZ 4 — Dummy API ile Uçtan Uca Entegrasyon

## Amaç

Mobil uygulamayı dummy FastAPI endpointine bağlayarak gerçek model öncesinde MVP akışını uçtan uca doğrulamak.

## Bağımlılıklar

- [FAZ 1](PHASE-01-backend-dummy.md) tamamlanmış olmalı.
- [FAZ 3](PHASE-03-image-acquisition.md) tamamlanmış olmalı.

## Görevler

- [x] `EXPO_PUBLIC_API_BASE_URL` zorunlu config değerini tanımla.
- [x] Development ve production URL ayrımını oluştur.
- [x] `ModelType = "detection"` ve API response TypeScript tiplerini tanımla.
- [x] Axios instance'ını base URL ve timeout ile oluştur.
- [x] Görsel ve seçilen modeli `multipart/form-data` ile gönder.
- [x] Multipart boundary yönetimini HTTP istemcisine bırak.
- [x] `useAnalyze` hook'unda loading/result/error state'lerini yönet.
- [x] API'deki `success: false` cevabını kullanıcı hatasına dönüştür.
- [x] HTTP 413, 415, 422, 5xx, bağlantı hatası ve istemci timeout'unu mesajlara eşle.
- [x] Analiz sürerken ikinci isteği engelle.
- [x] Gerekirse ekran kapanırken isteği iptal et.
- [x] `detections` sonucunu view-model üzerinden kullanıcı kartlarına dönüştür.
- [x] Boş `detections` dizisini “Nesne tespit edilemedi” olarak göster.

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

- [x] Kamera → Detection seç → gönder → sonucu göster.
- [x] Galeri → Detection seç → gönder → sonucu göster.
- [x] Boş detection cevabı.
- [x] Aynı sınıftan birden fazla detection.
- [x] Sunucu kapalıyken hata görünümü.
- [x] Timeout simülasyonu.
- [x] 413, 415 ve 422 eşlemeleri.
- [x] Loading sırasında çift tıklama.
- [x] iOS gerçek cihazda kamera ve galeri uçtan uca akışı.
- [ ] Android gerçek cihazda kamera ve galeri uçtan uca akışı.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| API base URL zorunluluğu | Eksik ve boş değerler açıklayıcı config hatası üretiyor |
| URL doğrulama | HTTP geliştirme ve HTTPS production adresleri kabul ediliyor; diğer protokoller reddediliyor |
| URL normalizasyonu | Baştaki/sondaki boşluklar ve sondaki `/` karakterleri temizleniyor |
| Ortam ayrımı | Development LAN ve production HTTPS değerleri ayrı şablon/build girdileriyle yönetiliyor |
| API TypeScript sözleşmesi | Başarılı/hatalı cevaplar, Detection modeli ve altı sunucu hata kodu tanımlandı |
| Axios istemcisi | Doğrulanmış base URL ve ortak 15 saniye timeout ile tek instance üretiliyor |
| Multipart analiz servisi | Optimize görsel `image`, model `modelType` alanıyla gönderiliyor; Content-Type elle ayarlanmıyor |
| API başarısız cevabı | `success: false` kontrollü `AnalyzeResponseError` hatasına dönüştürülüyor |
| Hata eşleme | 400/413/415/422, 5xx, bağlantı, timeout ve iptal durumları ayrıştırılıyor |
| `useAnalyze` | Loading/result/error, çift istek engeli, temizleme ve unmount iptali yönetiliyor |
| HomeScreen entegrasyonu | Statik demo kaldırıldı; gerçek success/empty/network-error akışı bağlandı |
| iOS galeri uçtan uca | Gerçek görsel LAN üzerinden dummy FastAPI'ye gönderildi; Person ve Helmet kartları gösterildi |
| iOS kamera uçtan uca | Yeni çekilen fotoğraf optimize edilip dummy FastAPI'ye gönderildi; beklenen kartlar gösterildi |
| iOS sunucu kapalı | FastAPI durdurulduğunda uygulama çökmeden kullanıcı dostu bağlantı hatası gösterdi |
| `npm run check` | Temiz; 64 test geçti |

## Tamamlanma kriteri

Android ve iOS istemcileri gerçek bir görseli dummy sunucuya gönderip sade API cevabını kullanıcı dostu sonuçlara dönüştürebiliyor; kritik bağlantı ve validasyon hataları anlaşılır mesaj üretiyor.

## Çıktılar

- `apiService.ts`
- `useAnalyze.ts`
- Uçtan uca çalışan dummy MVP akışı
