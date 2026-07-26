# FAZ 0 — Proje Temeli ve Teknik Hazırlık

## Amaç

Android ve iOS için Expo/TypeScript mobil projesini, FastAPI sunucu projesini ve ortak geliştirme standartlarını çalışır halde hazırlamak.

## Bağımlılıklar

- Yok; başlangıç fazıdır.
- Model hazırdır, ancak runtime formatı bu fazda seçilmek zorunda değildir.

## Sabit kararlar

- Tek repository: `mobile/` ve `server/`.
- Mobil: React Native, Expo ve TypeScript.
- Sunucu: Python ve FastAPI.
- MVP modeli: `detection`.
- Android ve iOS ilk teslim kapsamındadır.
- Ortam bağımlı adresler kaynak koda gömülmez.

## Görevler

- [x] Node LTS, npm ve Python sürümlerini doğrula ve kullanılan sürümleri kaydet. → [docs/ENVIRONMENT.md](../ENVIRONMENT.md)
- [x] `mobile/` projesini blank TypeScript Expo şablonuyla oluştur.
- [x] `server/` için sanal ortam ve temel FastAPI projesini oluştur.
- [x] Mobil bağımlılıklarını kur: `expo-image-picker`, `expo-image-manipulator`, `axios`.
- [x] Sunucu bağımlılıklarını kur: `fastapi`, `uvicorn`, `pydantic-settings`, `python-multipart`.
- [x] `.gitignore`, `.env.example` dosyaları ve development/production config ayrımını hazırla.
- [x] Mobil klasörlerini oluştur: `config`, `constants`, `types`, `services`, `hooks`, `utils`, `components`, `screens`, `theme`.
- [x] Sunucu klasörlerini oluştur: `api/v1`, `schemas`, `services`, `inference`, `core`, `config`, `tests`.
- [x] TypeScript strict mode, lint ve format komutlarını tanımla.
- [x] Python lint/format/test komutlarını tanımla.
- [x] README faz indeksindeki durum alanını güncelleme yöntemini belirle.

## Doğrulama

- [x] Expo uygulaması Android cihaz/emülatörde açılıyor.
- [x] Expo uygulaması iOS cihaz/simülatör veya EAS development build üzerinde açılabiliyor.
- [x] FastAPI uygulaması yerel olarak başlıyor.
- [x] `/docs` Swagger arayüzü açılıyor.
- [x] Lint ve boş test komutları hatasız çalışıyor.
- [x] Gerçek `.env` dosyaları version control kapsamı dışında.

### Doğrulama notları

| Kontrol | Sonuç |
|---|---|
| `uvicorn app.main:app` | Başlıyor |
| `/health/live`, `/health/ready`, `/docs`, `/openapi.json` | HTTP 200 |
| `ruff check .` + `ruff format --check .` | Temiz |
| `pytest` | 4 test geçti |
| `npm run check` (typecheck + lint + format + jest) | Temiz |
| `npx expo-doctor` | 18/18 (SDK 54) |
| Android gerçek cihaz (Expo Go) | Açıldı — 2026-07-26 |
| iOS gerçek cihaz (Expo Go) | Açıldı — 2026-07-26 |

> Mağaza Expo Go SDK 54'te takılı olduğu için mobil proje `blank-typescript@sdk-54` ile hizalandı.
> Ayrıntılar: [docs/ENVIRONMENT.md](../ENVIRONMENT.md)

## Tamamlanma kriteri

İki proje iskeleti temiz bir kurulumdan sonra belgelenmiş komutlarla çalıştırılabiliyor ve sonraki fazlar için gerekli klasörler hazır.

## Çıktılar

- Çalışır `mobile/` ve `server/` iskeletleri
- Ortam değişkeni şablonları
- Geliştirme ve kalite komutları

## Üretilenler

| Yol | İçerik |
|---|---|
| `mobile/` | Expo SDK 54 + TypeScript projesi, klasör iskeleti, `config/env.ts` |
| `mobile/README.md` | Kurulum ve kalite komutları |
| `server/app/` | FastAPI application factory, ayarlar, loglama, health endpointleri |
| `server/tests/` | pytest altyapısı ve smoke testleri |
| `server/README.md` | Kurulum ve kalite komutları |
| `docs/ENVIRONMENT.md` | Doğrulanan sürümler ve sürüm notları |
| `.gitignore`, `.editorconfig` | Ortak repo standartları |

