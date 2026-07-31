# Geliştirme Ortamı ve Sürümler

FAZ 0 kapsamında doğrulanan ve kullanılan sürümler. Sürüm değiştiğinde bu dosya güncellenir.

## Doğrulama tarihi

2026-07-26 · Windows 10.0.26200 · PowerShell

## Araçlar

| Araç | Sürüm |
|---|---|
| Node.js | 24.18.0 (LTS) |
| npm | 11.16.0 |
| Python | 3.14.6 |
| Git | 2.55.0 |

## Mobil (Expo)

| Paket | Sürüm |
|---|---|
| expo | 54.0.35 |
| react-native | 0.81.5 |
| react | 19.1.0 |
| typescript | 5.9.2 |
| expo-image-picker | 17.0.10 |
| expo-image-manipulator | 14.0.8 |
| axios | 1.13.2 |
| jest-expo | 54.0.17 |
| @testing-library/react-native | 13.3.3 |
| eslint | 9.39.5 |
| prettier | 3.9.6 |

`npx expo-doctor` 18/18 kontrolden geçmektedir.

> Not: App Store / Play Store Expo Go Mayıs 2026'dan beri SDK 54'te takılıdır
> (SDK 55+ App Store onayında). Bu yüzden FAZ 0 cihaz testleri SDK 54 ile yapılır.

## Sunucu (FastAPI)

| Paket | Sürüm |
|---|---|
| fastapi | 0.140.0 |
| uvicorn[standard] | 0.51.0 |
| pydantic | 2.13.4 |
| pydantic-settings | 2.14.2 |
| python-multipart | 0.0.32 |
| Pillow | 12.3.0 |
| NumPy | 2.5.1 |
| ONNX Runtime | 1.28.0 |
| pytest | 9.1.1 |
| httpx2 | 2.9.1 |
| ruff | 0.16.0 |

## Sürüm notları

- Starlette 1.3 ile birlikte `TestClient` artık `httpx` yerine `httpx2` bekliyor.
  Sanal ortamda `httpx` kurulu olmamalıdır, aksi halde deprecation uyarısı üretilir.
- App Store / Play Store Expo Go SDK 54'tedir. SDK 55+ mağaza onayı beklediği için
  FAZ 0 cihaz testleri `blank-typescript@sdk-54` ile hizalanır.
- React Native Testing Library 13 sürümünde `render` senkrondur.
- Python 3.14 için `torch`, `onnxruntime` ve `ultralytics` wheel'leri mevcuttur. FAZ 5 runtime'ı,
  `best.onnx` artifact'ı için ONNX Runtime `1.28.0` ve CPU execution provider olarak seçilmiştir.
- Expo SDK 54'te `newArchEnabled: true` app.json içinde geçerlidir.
