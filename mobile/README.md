# iThinka Vision — Mobil (Expo / React Native / TypeScript)

Android ve iOS demo istemcisi. Faz planı için [docs/phases](../docs/phases) klasörüne bakınız.

## Gereksinimler

- Node.js 24.18.0 LTS, npm 11.16.0
- Android: Expo Go veya development build yüklü cihaz/emülatör
- iOS: Expo Go yüklü iPhone (Windows'ta simülatör kullanılamaz)

## Kurulum

```powershell
cd mobile
npm install
Copy-Item .env.example .env
```

Yerel geliştirme için `.env.development.example` dosyasını `.env.local` olarak kopyalayıp
`EXPO_PUBLIC_API_BASE_URL` değerini kendi ortamınıza göre düzenleyin.
Gerçek cihazdan test ederken `localhost` çalışmaz; bilgisayarınızın LAN IP'sini yazın
(Android emülatöründe `http://10.0.2.2:8000`).

## Çalıştırma

```powershell
npm start        # QR kodu okutup Expo Go ile açın
npm run android  # Bağlı Android cihaz/emülatör
npm run ios      # Yalnızca macOS
```

## Kalite komutları

| Komut                  | Açıklama                   |
| ---------------------- | -------------------------- |
| `npm run typecheck`    | TypeScript strict kontrolü |
| `npm run lint`         | ESLint                     |
| `npm run format`       | Prettier ile biçimlendirme |
| `npm run format:check` | Biçim kontrolü (CI)        |
| `npm test`             | Jest testleri              |
| `npm run check`        | Hepsini sırayla çalıştırır |

## Ortam değişkenleri

Expo yalnızca `EXPO_PUBLIC_` önekli değişkenleri istemciye aktarır. Development, preview ve production
aynı `EXPO_PUBLIC_API_BASE_URL` anahtarını farklı değerlerle kullanır:

- Development değeri `.env.local` içindeki bilgisayar LAN adresidir.
- Preview değeri EAS `preview` environment'ında tanımlanır. Şirket sunucusu hazır olana kadar aynı
  ağdaki geliştirme bilgisayarının LAN adresi, sonrasında test sunucusunun HTTPS adresi kullanılabilir.
- Production değeri build ortamından verilen şirket sunucusunun HTTPS adresidir.

Şablonlar `.env.development.example`, `.env.preview.example` ve `.env.production.example`
dosyalarındadır. Gerçek `.env` dosyaları version control'e girmez; adresler koda gömülmez ve
`config/env.ts` üzerinden okunur. EAS build profilleri ilgili `development`, `preview` veya `production`
environment'ındaki değeri kullanır.

## EAS Update

Android ve iOS buildleri `development`, `preview` ve `production` kanallarıyla birbirinden ayrılır.
Native uyumluluk `fingerprint` runtime policy ile otomatik hesaplanır. Preview build ile uyumlu
JavaScript, stil ve asset değişikliklerini yayımlamak için:

```powershell
npx eas-cli@latest update `
  --channel preview `
  --environment preview `
  --message "Preview güncellemesi"
```

Preview veya production build, uyumlu güncellemeyi uygulama açıldığında arka planda indirir ve sonraki
yeniden başlatmada uygular. Production kanalına yalnızca preview ortamında doğrulanan commit yayımlanır.

Uygulama ikonu, native izinler, config plugin ayarları, native paketler veya Expo SDK değiştiğinde OTA
update yerine yeni Android/iOS buildi üretilir. Yeni build yeni fingerprint runtime'ıyla kendi uyumlu
update akışını başlatır.

## Klasör yapısı

```text
components/   Yeniden kullanılabilir UI bileşenleri (FAZ 2)
config/       Ortam yapılandırması
constants/    Model listesi ve kullanıcı mesajları (FAZ 2)
hooks/        useAnalyze gibi hook'lar (FAZ 4)
screens/      Ekranlar (FAZ 2)
services/     API istemcisi (FAZ 4)
theme/        Renk, spacing, tipografi (FAZ 2)
types/        Paylaşılan TypeScript tipleri (FAZ 4)
utils/        Görsel seçme/optimize etme yardımcıları (FAZ 3)
```
