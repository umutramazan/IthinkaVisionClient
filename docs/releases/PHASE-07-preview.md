# FAZ 7 — Preview Teslim Notu

## Durum

Devam ediyor. EAS proje bağlantısı ve preview build yapılandırması tamamlandı. Android preview APK
Android 16 / API 36 emülatöründe LAN API ile doğrulandı; gerçek Android cihaz doğrulaması ertelendi.
Runtime `0.1.1` APK üzerinde adaptive ikon, açık/koyu splash ve `preview` kanalı EAS Update akışı
doğrulandı. Android ve iOS update bundle'ları yayımlandı; iOS binary/cihaz uygulaması henüz doğrulanmadı.
Apple Developer Program üyeliği ve macOS ortamı bulunmadığından iOS ad hoc preview build üretimi
bekliyor; geçici iOS gerçek cihaz doğrulamaları Expo Go ile yürütülüyor.

## EAS projesi

| Alan            | Değer                                                              |
| --------------- | ------------------------------------------------------------------ |
| Proje           | `@umutramazan/ithinka-vision`                                      |
| Proje ID        | `03fde56f-2aeb-41eb-8386-dd22816421c7`                             |
| Build profili   | `preview`                                                          |
| Dağıtım         | Internal distribution                                              |
| Environment     | EAS `preview`                                                      |
| Update kanalı   | `preview`                                                          |
| Runtime version | `0.1.1` (`appVersion` policy)                                      |
| API ortamı      | Aynı ağdaki geliştirme bilgisayarında çalışan LAN API, port `8000` |

Gerçek LAN IP'si kaynak koda veya bu nota yazılmaz; EAS proje environment'ında
`EXPO_PUBLIC_API_BASE_URL` olarak yönetilir. Şirket sunucusu hazır olduğunda bu değer HTTPS adresiyle
değiştirilecektir.

## Build kayıtları

| Platform | Durum                                                      | Build ID                               | Kaynak commit                              | Paylaşım bağlantısı                                                                                                    |
| -------- | ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| iOS      | Bekliyor                                                   | —                                      | —                                          | —                                                                                                                      |
| Android  | Geçersiz kılındı — LAN HTTP engeli                         | `2d9cc941-920d-452d-a458-93db5cbeb97a` | `1c39085a5db8fcd08c19891503e7bf0412512936` | [EAS build](https://expo.dev/accounts/umutramazan/projects/ithinka-vision/builds/2d9cc941-920d-452d-a458-93db5cbeb97a) |
| Android  | Emülatör smoke testi geçti                                 | `ef11fd58-f76b-4579-b7ad-0cebbe206695` | `8874bfa793f5082d9b52b2f5184aa36ea436e818` | [EAS build](https://expo.dev/accounts/umutramazan/projects/ithinka-vision/builds/ef11fd58-f76b-4579-b7ad-0cebbe206695) |
| Android  | Runtime `0.1.1`, adaptive ikon ve temalı splash doğrulandı | `2ed2c4d7-d6e5-4048-9df6-560e6fde29d2` | `70548b24cc381f03a5158b3691e14fad1b7199cb` | [EAS build](https://expo.dev/accounts/umutramazan/projects/ithinka-vision/builds/2ed2c4d7-d6e5-4048-9df6-560e6fde29d2) |

## Android preview emülatör doğrulaması

| Kontrol              | Sonuç                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tarih ve ortam       | 2026-08-05, Pixel 8 emülatörü, Android 16 / API 36, EAS internal preview APK                                                |
| Kurulum              | Düzeltilmiş APK `com.ithinka.vision` paketine kuruldu ve başarıyla açıldı                                                   |
| Preview API          | EAS `preview` environment'ındaki LAN API adresi ve port `8000` kullanıldı                                                   |
| LAN HTTP davranışı   | İlk aday Android'in varsayılan cleartext politikası nedeniyle istek gönderemedi; düzeltilmiş buildde LAN erişimi doğrulandı |
| Gerçek model analizi | Galeriden seçilen görsel sunucuya gönderildi ve sonuç uygulama arayüzünde görüntülendi                                      |
| Marka ikonu          | Adaptive ikonun launcher ve recent apps görünümü beyaz zeminli iThinka markasıyla doğrulandı                                |
| Temalı splash        | Büyütülmüş logo ile açık ve koyu sistem teması splash ekranları doğrulandı                                                  |
| Kapsam sınırı        | Bu kayıt emülatör smoke testidir; gerçek Android cihaz kabulünün yerine geçmez                                              |

## EAS Update doğrulaması

| Kontrol                   | Sonuç                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Taban build               | Android preview build `2ed2c4d7-d6e5-4048-9df6-560e6fde29d2`, runtime `0.1.1`, kanal `preview`                                |
| Görünür test güncellemesi | Update group `2e5085d7-faf7-461b-abcf-a331a96c9ede`, commit `69794fc`; `OTA TEST 0.1.1` etiketi yeni APK olmadan görüntülendi |
| Temizleme güncellemesi    | Update group `369c0751-9b3b-408b-a4cb-4971e672ef57`, commit `bd68a95`; test etiketi yeni APK olmadan kaldırıldı               |
| Platform bundle'ları      | Her iki update group için Android ve iOS bundle'ları runtime `0.1.1` ile yayımlandı                                           |
| Android uygulama sonucu   | Uygulama iki açılışlı indirme/uygulama akışında her iki güncellemeyi başarıyla aldı                                           |
| iOS kapsam sınırı         | iOS bundle yayımlandı; bağımsız iOS preview build/provisioning olmadığı için cihazda uygulanması doğrulanmadı                 |

## Otomatik doğrulamalar

| Kontrol     | Sonuç            |
| ----------- | ---------------- |
| Expo Doctor | 18/18 geçti      |
| TypeScript  | Geçti            |
| ESLint      | Geçti            |
| Prettier    | Geçti            |
| Jest        | 71/71 test geçti |

## iOS Expo Go gerçek cihaz doğrulaması

Bu tablo geçici fonksiyonel cihaz kanıtıdır; ad hoc internal preview artifact kabulünün yerine geçmez.

| Kontrol              | Sonuç                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tarih ve ortam       | 2026-08-04, gerçek iPhone, Expo Go, aynı Wi-Fi üzerindeki LAN API                                           |
| Galeri ve önizleme   | İzin akışı, seçim, yön/oran ve optimize önizleme başarılı                                                   |
| Kamera ve önizleme   | Kamera izni, çekim, onay ve optimize önizleme başarılı                                                      |
| Gerçek model analizi | Kamera ve galeri görselleri ONNX modele gönderildi; kullanıcı dostu kart/boş sonuç üretildi                 |
| Sunucu kanıtı        | Cihaz istekleri `200`; detection sayıları `0` ve `1`; yaklaşık `50–192 ms` request süreleri gözlendi        |
| Yeni görsel          | Önceki sonuç yeni önizleme uygulanınca temizlendi                                                           |
| Seçim iptali         | Hata veya kilitlenme olmadan önceki görsel korundu                                                          |
| Kamera izni reddi    | Kamera açılmadı; uygulama çökmeden kullanıcı uyarısı gösterdi                                               |
| Sunucu kapalı        | Loading sonlandı ve “Sunucudan cevap alınamadı” uyarısı gösterildi                                          |
| Ardışık analiz       | 11 hızlı ardışık istek tamamlandı; sunucuda eşzamanlı/üst üste binen istek gözlenmedi                       |
| Önceki faz kanıtları | Çoklu aynı sınıf gruplaması, büyük görsel optimizasyonu, inference hatası ve arka plan davranışı doğrulandı |
| Log gizliliği        | Request ID, durum, süre ve detection sayısı mevcut; görsel içeriği ve dosya adı yok                         |
| Expo Go kısıtı       | Native izin metni Expo Go'ya ait ve İngilizce; Türkçe config metni bağımsız build olmadan doğrulanamaz      |

## Bilinen kısıtlar

- Preview API yalnızca telefon ile geliştirme bilgisayarı aynı ağdayken erişilebilir.
- FastAPI `0.0.0.0:8000` üzerinde çalışıyor olmalıdır.
- Geçici LAN bağlantısı HTTP kullanır; production veya dış ağ dağıtımı için uygun değildir.
- Android preview build emülatörde doğrulanmıştır; gerçek Android cihaz doğrulaması ertelenmiştir.
- iOS marka ikonu Android ile aynı içerik ölçeğinde yapılandırılmıştır; işletim sistemi maskesi farklıdır ve
  görünüm bağımsız iOS build üzerinde henüz doğrulanmamıştır.
- Apple Developer Program üyeliği ve macOS ortamı bulunmadığı için iOS ad hoc signing/provisioning
  oluşturulamamıştır. Expo Go cihaz kontrolleri bağımsız iOS preview artifact kabulünün yerine geçmez.
- npm audit içinde Expo SDK 54 araç zincirinden gelen bir yüksek ve orta seviye transitif bağımlılık
  grubu kalmaktadır. Otomatik tam çözüm Expo 57'ye kırıcı yükseltme gerektirdiği için `--force`
  uygulanmamıştır; SDK yükseltmesi ayrı bir çalışma olarak ele alınmalıdır.
