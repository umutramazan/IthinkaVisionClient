# FAZ 7 — MVP Doğrulama ve Teslim Adayı

## Amaç

Gerçek model kullanılan Android ve iOS uygulamalarını müşteri gösterimine hazır bir teslim adayı olarak doğrulamak.

## Bağımlılıklar

- [FAZ 5](PHASE-05-detection-integration.md) tamamlanmış olmalı.
- [FAZ 6](PHASE-06-observability.md) tamamlanmış olmalı.

## Preview build yaklaşımı

Expo Go geliştirme sırasında hızlı doğrulama için kullanılmaya devam eder. Teslim adayı kabulü ise
native izinler, uygulama kimliği ve production benzeri paket davranışı görülebilsin diye EAS internal
distribution ile oluşturulan Android ve iOS `preview` buildleri üzerinde yapılır.

`preview` build yalnızca test dağıtımı içindir; mağazaya gönderilecek production artifact'ı değildir.
Production build ve mağaza dağıtımı FAZ 9 kapsamındadır.

## Build görevleri

- [ ] Expo/EAS proje bağlantısını ve yetkili hesabı doğrula.
- [ ] `eas.json` içinde ortak ayarlar ile `development`, `preview` ve `production` profillerini tanımla.
- [ ] `preview` profilini internal distribution ve preview API ortamıyla yapılandır.
- [ ] Android preview build oluştur ve gerçek cihaza kur.
- [ ] iOS preview build oluştur, cihaz/provisioning gereksinimlerini tamamla ve gerçek cihaza kur.
- [ ] Build kimliklerini, commit SHA değerini ve paylaşım bağlantılarını teslim notuna kaydet.
- [ ] Preview artifact'larının secret veya yerel `.env` dosyası içermediğini doğrula.

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

Platform matrisi Expo Go yerine ilgili platformun `preview` buildi üzerinde kapatılır.

## Kalite kontrolleri

- [ ] Sunucu testlerinin tamamı geçiyor.
- [ ] Mobil unit/component testlerinin tamamı geçiyor.
- [ ] Lint ve type-check geçiyor.
- [ ] Ham JSON kullanıcıya gösterilmiyor.
- [ ] Görseller işlem sonunda sunucuda kalmıyor.
- [ ] Bilinen kısıtlar teslim notuna yazılmış.
- [ ] Demo öncesi kullanılacak örnek görseller doğrulanmış.
- [ ] Android ve iOS preview buildleri aynı commit'ten üretilmiş.
- [ ] Preview buildlerin kullandığı API ortamı teslim notunda kayıtlı.

## MVP kabul kriteri

Kullanıcı aynı commit'ten üretilen Android ve iOS preview buildlerinde kameradan veya galeriden
görsel seçebilir, Detection modelini seçebilir, görseli sunucuya gönderebilir ve gerçek modelin
sınıf/güven sonuçlarını anlaşılır arayüzde görebilir. Kritik hatalar uygulamayı kilitlemeden kullanıcı
mesajına dönüşür.

## Çıktılar

- Android ve iOS preview teslim adayları
- EAS build kimlikleri ve paylaşım bağlantıları
- Test sonuçları
- Bilinen kısıtlar ve demo notları
