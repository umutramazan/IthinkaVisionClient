# FAZ 7 — Preview Teslim Notu

## Durum

Devam ediyor. EAS proje bağlantısı ve preview build yapılandırması tamamlandı. Apple Developer Program
üyeliği ve macOS ortamı bulunmadığından iOS ad hoc preview build üretimi bekliyor; geçici iOS gerçek
cihaz doğrulamaları Expo Go ile yürütülüyor. Android gerçek cihaz doğrulamaları ertelendi.

## EAS projesi

| Alan | Değer |
|---|---|
| Proje | `@umutramazan/ithinka-vision` |
| Proje ID | `03fde56f-2aeb-41eb-8386-dd22816421c7` |
| Build profili | `preview` |
| Dağıtım | Internal distribution |
| Environment | EAS `preview` |
| API ortamı | Aynı ağdaki geliştirme bilgisayarında çalışan LAN API, port `8000` |

Gerçek LAN IP'si kaynak koda veya bu nota yazılmaz; EAS proje environment'ında
`EXPO_PUBLIC_API_BASE_URL` olarak yönetilir. Şirket sunucusu hazır olduğunda bu değer HTTPS adresiyle
değiştirilecektir.

## Build kayıtları

| Platform | Durum | Build ID | Kaynak commit | Paylaşım bağlantısı |
|---|---|---|---|---|
| iOS | Bekliyor | — | — | — |
| Android | Ertelendi | — | — | — |

## Otomatik doğrulamalar

| Kontrol | Sonuç |
|---|---|
| Expo Doctor | 18/18 geçti |
| TypeScript | Geçti |
| ESLint | Geçti |
| Prettier | Geçti |
| Jest | 71/71 test geçti |

## iOS Expo Go gerçek cihaz doğrulaması

Bu tablo geçici fonksiyonel cihaz kanıtıdır; ad hoc internal preview artifact kabulünün yerine geçmez.

| Kontrol | Sonuç |
|---|---|
| Tarih ve ortam | 2026-08-04, gerçek iPhone, Expo Go, aynı Wi-Fi üzerindeki LAN API |
| Galeri ve önizleme | İzin akışı, seçim, yön/oran ve optimize önizleme başarılı |
| Kamera ve önizleme | Kamera izni, çekim, onay ve optimize önizleme başarılı |
| Gerçek model analizi | Kamera ve galeri görselleri ONNX modele gönderildi; kullanıcı dostu kart/boş sonuç üretildi |
| Sunucu kanıtı | Cihaz istekleri `200`; detection sayıları `0` ve `1`; yaklaşık `50–192 ms` request süreleri gözlendi |
| Yeni görsel | Önceki sonuç yeni önizleme uygulanınca temizlendi |
| Seçim iptali | Hata veya kilitlenme olmadan önceki görsel korundu |
| Kamera izni reddi | Kamera açılmadı; uygulama çökmeden kullanıcı uyarısı gösterdi |
| Sunucu kapalı | Loading sonlandı ve “Sunucudan cevap alınamadı” uyarısı gösterildi |
| Ardışık analiz | 11 hızlı ardışık istek tamamlandı; sunucuda eşzamanlı/üst üste binen istek gözlenmedi |
| Önceki faz kanıtları | Çoklu aynı sınıf gruplaması, büyük görsel optimizasyonu, inference hatası ve arka plan davranışı doğrulandı |
| Log gizliliği | Request ID, durum, süre ve detection sayısı mevcut; görsel içeriği ve dosya adı yok |
| Expo Go kısıtı | Native izin metni Expo Go'ya ait ve İngilizce; Türkçe config metni bağımsız build olmadan doğrulanamaz |

## Bilinen kısıtlar

- Preview API yalnızca telefon ile geliştirme bilgisayarı aynı ağdayken erişilebilir.
- FastAPI `0.0.0.0:8000` üzerinde çalışıyor olmalıdır.
- Geçici LAN bağlantısı HTTP kullanır; production veya dış ağ dağıtımı için uygun değildir.
- Android gerçek cihaz ve Android preview build doğrulamaları ertelenmiştir.
- Apple Developer Program üyeliği ve macOS ortamı bulunmadığı için iOS ad hoc signing/provisioning
  oluşturulamamıştır. Expo Go cihaz kontrolleri bağımsız iOS preview artifact kabulünün yerine geçmez.
- npm audit içinde Expo SDK 54 araç zincirinden gelen bir yüksek ve orta seviye transitif bağımlılık
  grubu kalmaktadır. Otomatik tam çözüm Expo 57'ye kırıcı yükseltme gerektirdiği için `--force`
  uygulanmamıştır; SDK yükseltmesi ayrı bir çalışma olarak ele alınmalıdır.
