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

- [ ] `HomeScreen` ve temel sayfa yerleşimini oluştur.
- [ ] `ImageSourceButtons` bileşenini oluştur.
- [ ] `ImagePreview` bileşenini oluştur.
- [ ] `ModelSelector` bileşenini oluştur; yalnızca `Detection` seçeneğini göster.
- [ ] Model seçeneklerini `constants/models.ts` üzerinden besle.
- [ ] `LoadingOverlay`, `ResultCard` ve `ErrorDialog` bileşenlerini oluştur.
- [ ] Sonuç kartlarında sınıf adı ve güven yüzdesi göster.
- [ ] Aynı sınıf sonuçlarını gruplamaya uygun bir view-model yardımcı fonksiyonu tasarla.
- [ ] Türkçe kullanıcı mesajlarını `constants/messages.ts` içinde merkezileştir.
- [ ] Tema, spacing, renk ve tipografi değerlerini merkezileştir.
- [ ] Kamera/galeri izin açıklamalarını `app.json` veya app config içine ekle.
- [ ] Statik sahte verilerle başarı, boş sonuç, loading ve hata durumlarını göster.

## UX kuralları

- Ham JSON kullanıcıya gösterilmez.
- `0.96` güven değeri `%96` biçiminde gösterilir.
- Analiz sürerken tekrar gönderim engellenir.
- Detection seçilmeden değerlendirme başlatılamaz.
- Boş detection listesi hata değil, “Nesne tespit edilemedi” sonucudur.

## Testler

- [ ] Model seçilmeden değerlendirme validasyonu.
- [ ] Confidence yüzde formatı.
- [ ] Aynı sınıf sonuçlarının gruplama fonksiyonu.
- [ ] Boş sonuç görünümü.
- [ ] Loading sırasında butonların pasif olması.
- [ ] Android küçük/büyük ekran yerleşim kontrolü.
- [ ] iOS küçük/büyük ekran yerleşim kontrolü.

## Tamamlanma kriteri

Android ve iOS üzerinde tek ekranlık akış statik verilerle tamamlanabiliyor; model seçim alanında yalnızca Detection görünüyor ve ham JSON hiçbir durumda kullanıcıya sunulmuyor.

## Çıktılar

- Statik MVP ekranı
- Yeniden kullanılabilir UI bileşenleri
- Sonuç biçimlendirme yardımcıları

