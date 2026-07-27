# FAZ 2 — Mobil İskelet ve Statik Arayüz

## Amaç

API bağlantısı olmadan MVP kullanıcı akışını Android ve iOS üzerinde görünür ve kullanılabilir hale getirmek.

## Bağımlılıklar

- [FAZ 0](PHASE-00-foundation.md) tamamlanmış olmalı.
- FAZ 1 ile paralel yürütülebilir; API sözleşmesi değiştirilmemelidir.

## Ekran akışı

Tek ekran:

1. Kamera veya galeri kaynağı seçimi
2. Görsel önizleme
3. Model seçimi
4. Değerlendir butonu
5. Loading durumu
6. Sonuç kartları veya hata diyaloğu

## Görevler

- [x] `HomeScreen` ve temel sayfa yerleşimini oluştur.
- [x] `ImageSourceButtons` bileşenini oluştur.
- [x] `ImagePreview` bileşenini oluştur.
- [x] `ModelSelector` bileşenini oluştur; yalnızca `Detection` seçeneğini göster.
- [x] Model seçeneklerini `constants/models.ts` üzerinden besle.
- [x] `LoadingOverlay`, `ResultCard` ve `ErrorDialog` bileşenlerini oluştur.
- [x] Sonuç kartlarında sınıf adı ve güven yüzdesi göster.
- [x] Aynı sınıf sonuçlarını gruplamaya uygun bir view-model yardımcı fonksiyonu tasarla.
- [x] Türkçe kullanıcı mesajlarını `constants/messages.ts` içinde merkezileştir.
- [x] Tema, spacing, renk ve tipografi değerlerini merkezileştir.
- [x] Kamera/galeri izin açıklamalarını `app.json` veya app config içine ekle.
- [x] Statik sahte verilerle başarı, boş sonuç, loading ve hata durumlarını göster.

## UX kuralları

- Ham JSON kullanıcıya gösterilmez.
- `0.96` güven değeri `%96` biçiminde gösterilir.
- Analiz sürerken tekrar gönderim engellenir.
- Detection seçilmeden değerlendirme başlatılamaz.
- Boş detection listesi hata değil, “Nesne tespit edilemedi” sonucudur.

## Testler

- [x] Model seçilmeden değerlendirme validasyonu.
- [x] Confidence yüzde formatı.
- [x] Aynı sınıf sonuçlarının gruplama fonksiyonu.
- [x] Boş sonuç görünümü.
- [x] Loading sırasında butonların pasif olması.
- [ ] Android küçük/büyük ekran yerleşim kontrolü.
- [x] iOS küçük/büyük ekran yerleşim kontrolü.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| `npm run check` (typecheck + lint + format + Jest) | Temiz; 12 test geçti |
| `npx expo-doctor` | 18/18 kontrol geçti |
| Açık/koyu tema | Brandbook renkleriyle sistem temasını otomatik takip ediyor |
| Android küçük/büyük ekran | Telefon mevcut olmadığından kullanıcı kararıyla ertelendi (2026-07-27) |
| iPhone gerçek cihaz (Expo Go) | Başarılı — taşma/kesilme yok; seçim, validasyon, statik durumlar, loading, sonuç kartları, kaydırma ve diyalog doğrulandı (2026-07-27) |

## Tamamlanma kriteri

Android ve iOS üzerinde tek ekranlık akış statik verilerle tamamlanabiliyor; model seçim alanında yalnızca Detection görünüyor ve ham JSON hiçbir durumda kullanıcıya sunulmuyor.

## Çıktılar

- Statik MVP ekranı
- Yeniden kullanılabilir UI bileşenleri
- Sonuç biçimlendirme yardımcıları
