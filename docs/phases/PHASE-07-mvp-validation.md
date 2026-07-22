# FAZ 7 — MVP Doğrulama ve Teslim Adayı

## Amaç

Gerçek model kullanılan Android ve iOS uygulamalarını müşteri gösterimine hazır bir teslim adayı olarak doğrulamak.

## Bağımlılıklar

- [FAZ 5](PHASE-05-detection-integration.md) tamamlanmış olmalı.
- [FAZ 6](PHASE-06-observability.md) tamamlanmış olmalı.

## Fonksiyonel senaryolar

- [ ] Kamera → Detection seç → analiz → sonuç.
- [ ] Galeri → Detection seç → analiz → sonuç.
- [ ] Aynı sınıftan birden fazla sonuç.
- [ ] Hiç nesne bulunmayan sonuç.
- [ ] Görseli değiştirip yeniden analiz.
- [ ] Arka arkaya birden fazla analiz.

## Hata senaryoları

- [ ] Kamera izni reddi.
- [ ] Kullanıcının seçimden vazgeçmesi.
- [ ] Görsel seçmeden gönderim.
- [ ] Model seçmeden gönderim.
- [ ] Sunucunun kapalı olması.
- [ ] Yavaş bağlantı ve istemci timeout.
- [ ] Geçersiz veya büyük dosya.
- [ ] Sunucu inference hatası.
- [ ] Uygulamanın analiz sırasında arka plana alınması.

## Platform matrisi

| Kontrol | Android | iOS |
|---|---:|---:|
| Kamera | [ ] | [ ] |
| Galeri | [ ] | [ ] |
| İzin reddi | [ ] | [ ] |
| Görsel optimizasyonu | [ ] | [ ] |
| Model seçimi | [ ] | [ ] |
| Loading | [ ] | [ ] |
| Sonuç kartları | [ ] | [ ] |
| Hata mesajları | [ ] | [ ] |

## Kalite kontrolleri

- [ ] Sunucu testlerinin tamamı geçiyor.
- [ ] Mobil unit/component testlerinin tamamı geçiyor.
- [ ] Lint ve type-check geçiyor.
- [ ] Ham JSON kullanıcıya gösterilmiyor.
- [ ] Görseller işlem sonunda sunucuda kalmıyor.
- [ ] Bilinen kısıtlar teslim notuna yazılmış.
- [ ] Demo öncesi kullanılacak örnek görseller doğrulanmış.

## MVP kabul kriteri

Kullanıcı Android ve iOS gerçek cihazlarda kameradan veya galeriden görsel seçebilir, Detection modelini seçebilir, görseli sunucuya gönderebilir ve gerçek modelin sınıf/güven sonuçlarını anlaşılır arayüzde görebilir. Kritik hatalar uygulamayı kilitlemeden kullanıcı mesajına dönüşür.

## Çıktılar

- Android ve iOS teslim adayları
- Test sonuçları
- Bilinen kısıtlar ve demo notları

