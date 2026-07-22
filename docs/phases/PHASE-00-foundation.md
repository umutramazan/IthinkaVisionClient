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

- [ ] Node LTS, npm ve Python sürümlerini doğrula ve kullanılan sürümleri kaydet.
- [ ] `mobile/` projesini blank TypeScript Expo şablonuyla oluştur.
- [ ] `server/` için sanal ortam ve temel FastAPI projesini oluştur.
- [ ] Mobil bağımlılıklarını kur: `expo-image-picker`, `expo-image-manipulator`, `axios`.
- [ ] Sunucu bağımlılıklarını kur: `fastapi`, `uvicorn`, `pydantic-settings`, `python-multipart`.
- [ ] `.gitignore`, `.env.example` dosyaları ve development/production config ayrımını hazırla.
- [ ] Mobil klasörlerini oluştur: `config`, `constants`, `types`, `services`, `hooks`, `utils`, `components`, `screens`, `theme`.
- [ ] Sunucu klasörlerini oluştur: `api/v1`, `schemas`, `services`, `inference`, `core`, `config`, `tests`.
- [ ] TypeScript strict mode, lint ve format komutlarını tanımla.
- [ ] Python lint/format/test komutlarını tanımla.
- [ ] README faz indeksindeki durum alanını güncelleme yöntemini belirle.

## Doğrulama

- [ ] Expo uygulaması Android cihaz/emülatörde açılıyor.
- [ ] Expo uygulaması iOS cihaz/simülatör veya EAS development build üzerinde açılabiliyor.
- [ ] FastAPI uygulaması yerel olarak başlıyor.
- [ ] `/docs` Swagger arayüzü açılıyor.
- [ ] Lint ve boş test komutları hatasız çalışıyor.
- [ ] Gerçek `.env` dosyaları version control kapsamı dışında.

## Tamamlanma kriteri

İki proje iskeleti temiz bir kurulumdan sonra belgelenmiş komutlarla çalıştırılabiliyor ve sonraki fazlar için gerekli klasörler hazır.

## Çıktılar

- Çalışır `mobile/` ve `server/` iskeletleri
- Ortam değişkeni şablonları
- Geliştirme ve kalite komutları

