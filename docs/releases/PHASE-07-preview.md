# FAZ 7 — Preview Teslim Notu

## Durum

Devam ediyor. EAS proje bağlantısı ve preview build yapılandırması tamamlandı; iOS preview build ve
cihaz doğrulaması bekliyor. Android gerçek cihaz doğrulamaları geçici olarak ertelendi.

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

## Bilinen kısıtlar

- Preview API yalnızca telefon ile geliştirme bilgisayarı aynı ağdayken erişilebilir.
- FastAPI `0.0.0.0:8000` üzerinde çalışıyor olmalıdır.
- Geçici LAN bağlantısı HTTP kullanır; production veya dış ağ dağıtımı için uygun değildir.
- Android gerçek cihaz ve Android preview build doğrulamaları ertelenmiştir.
- npm audit içinde Expo SDK 54 araç zincirinden gelen bir yüksek ve orta seviye transitif bağımlılık
  grubu kalmaktadır. Otomatik tam çözüm Expo 57'ye kırıcı yükseltme gerektirdiği için `--force`
  uygulanmamıştır; SDK yükseltmesi ayrı bir çalışma olarak ele alınmalıdır.
