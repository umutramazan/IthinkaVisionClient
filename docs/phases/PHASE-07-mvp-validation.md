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

### Geçici iOS doğrulama yaklaşımı

Apple Developer Program üyeliği ve macOS geliştirme ortamı bulunmadığı sürece gerçek iPhone'a özel
ad hoc `preview` binary kurulamaz. Bu nedenle iOS fonksiyonel doğrulamaları geçici olarak Expo Go ve
aynı ağdaki LAN API üzerinden yürütülür. Bu kontroller cihaz davranışını doğrular ancak aşağıdaki iOS
preview build görevinin yerine geçmez; signing/provisioning imkânı sağlandığında ilgili kabul matrisi
internal distribution buildi üzerinde yeniden kapatılır.

## Build görevleri

- [x] Expo/EAS proje bağlantısını ve yetkili hesabı doğrula.
- [x] `eas.json` içinde ortak ayarlar ile `development`, `preview` ve `production` profillerini tanımla.
- [x] `preview` profilini internal distribution ve preview API ortamıyla yapılandır.
- [x] Android preview build oluştur, emülatöre kur ve LAN API smoke testini tamamla.
- [ ] Android preview buildi gerçek cihaza kur ve doğrula.
- [ ] iOS preview build oluştur, cihaz/provisioning gereksinimlerini tamamla ve gerçek cihaza kur.
- [x] Üretilen Android build kimliklerini, commit SHA değerlerini ve paylaşım bağlantılarını teslim notuna kaydet.
- [ ] Preview artifact'larının secret veya yerel `.env` dosyası içermediğini doğrula.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| Expo yapılandırması | SDK 54 public config başarıyla üretildi; iOS bundle ID ve Android package tanımlı |
| Expo Doctor | 18/18 kontrol geçti |
| Development build | SDK 54 uyumlu `expo-dev-client` `6.0.21` eklendi |
| EAS profilleri | Ortak Node `24.18.0` ayarıyla development, preview ve production profilleri tanımlandı |
| Ortam ayrımı | Profiller EAS `development`, `preview` ve `production` environment'larına açıkça bağlandı |
| Preview dağıtımı | `preview` profili internal distribution olarak tanımlandı |
| Preview API ortamı | `EXPO_PUBLIC_API_BASE_URL`, şirket sunucusu öncesi doğrulama için EAS `preview` environment'ına özel LAN adresiyle kaydedildi |
| Android preview build | Düzeltilmiş APK Android 16 / API 36 Pixel 8 emülatörüne kuruldu; LAN API üzerinden gerçek model sonucu görüntülendi |
| Android LAN HTTP | SDK 54 `expo-build-properties` ile preview APK'nin geçici LAN HTTP API'sine erişimi doğrulandı |
| Yerel ortam güvenliği | Gerçek `.env` Git dışında; yalnızca değer içermeyen preview şablonu version control'e açık |
| Mobil kalite kontrolü | Type-check, ESLint ve Prettier temiz; 71 test geçti |
| EAS hesap kontrolü | `umutramazan` kişisel hesabında yetkili oturum doğrulandı |
| EAS proje bağlantısı | `@umutramazan/ithinka-vision`, proje ID `03fde56f-2aeb-41eb-8386-dd22816421c7` ile bağlandı |
| iOS build hazırlığı | Export compliance değeri özel/non-exempt şifreleme kullanılmadığı için `false`; build numarası kaynağı EAS remote olarak tanımlandı |
| iOS preview build engeli | Apple Developer Program üyeliği ve macOS ortamı yok; ad hoc signing/provisioning oluşturulamadı |
| Geçici iOS cihaz yaklaşımı | Expo Go ve aynı ağdaki LAN API ile fonksiyonel smoke testleri yürütülecek; preview build maddesi açık kalacak |
| Teslim notu | [FAZ 7 preview teslim notu](../releases/PHASE-07-preview.md) oluşturuldu |

## Fonksiyonel senaryolar

- [x] Kamera → Detection seç → analiz → sonuç.
- [x] Galeri → Detection seç → analiz → sonuç.
- [x] Aynı sınıftan birden fazla sonuç.
- [x] Hiç nesne bulunmayan sonuç.
- [x] Görseli değiştirip yeniden analiz.
- [x] Arka arkaya birden fazla analiz.

## Hata senaryoları

- [x] Kamera izni reddi.
- [x] Kullanıcının seçimden vazgeçmesi.
- [x] Görsel seçmeden gönderim.
- [x] Model seçmeden gönderim.
- [x] Sunucunun kapalı olması.
- [x] Yavaş bağlantı ve istemci timeout.
- [x] Geçersiz veya büyük dosya.
- [x] Sunucu inference hatası.
- [x] Uygulamanın analiz sırasında arka plana alınması.

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

- [x] Sunucu testlerinin tamamı geçiyor.
- [x] Mobil unit/component testlerinin tamamı geçiyor.
- [x] Lint ve type-check geçiyor.
- [x] Ham JSON kullanıcıya gösterilmiyor.
- [x] Görseller işlem sonunda sunucuda kalmıyor.
- [x] Bilinen kısıtlar teslim notuna yazılmış.
- [x] Demo öncesi kullanılacak örnek görseller doğrulanmış.
- [ ] Android ve iOS preview buildleri aynı commit'ten üretilmiş.
- [x] Preview buildlerin kullandığı API ortamı teslim notunda kayıtlı.

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
