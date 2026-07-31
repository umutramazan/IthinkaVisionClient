# FAZ 5 — Gerçek Detection Modeli Entegrasyonu

## Amaç

Hazır detection modelini FastAPI inference katmanına bağlamak ve dummy cevabı gerçek sonuçla değiştirmek.

## Bağımlılıklar

- [FAZ 4](PHASE-04-dummy-e2e.md) tamamlanmış olmalı.
- Model dosyası ve birkaç doğrulama görseli erişilebilir olmalı.

## Açık kararlar

- İlk geliştirme runtime'ı ONNX Runtime `1.28.0` ve `CPUExecutionProvider` olarak seçildi.
- Şirket sunucusunda GPU olup olmadığı bilinmemektedir.
- İlk benchmark mevcut geliştirme ortamında yapılır; nihai runtime kararı hedef sunucu öğrenilince doğrulanır.
- Sabit doğrulama görselleri başlangıç koşulu değildir; doğruluk senaryoları uygulamadan çekilecek
  gerçek fotoğraflarla faz kapanışında doğrulanacaktır.

## Tasarım kuralları

- Format bağımlı kod yalnızca `inference/detection_model.py` içinde kalır.
- API ve mobil istemci model formatını bilmez.
- Model uygulama başlangıcında bir kez yüklenir.
- API çıktısı yalnızca `class` ve `confidence` içerir.
- Görsel analiz sonrasında kalıcı olarak saklanmaz.

## Görevler

- [x] `BaseModel.predict(image_bytes)` arayüzünü kesinleştir.
- [x] Model için gerekli runtime bağımlılıklarını belirle ve sürümlerini sabitle.
- [x] `detection_model.py` adaptörünü oluştur.
- [x] Model yüklemeyi FastAPI lifespan içine bağla.
- [x] Model yüklenemezse readiness endpointini başarısız duruma getir.
- [x] Görsel byte'larını model girişine dönüştür.
- [x] Preprocessing adımlarını modelle uyumlu hale getir.
- [x] Ham model çıktısını `{class, confidence}` listesine map et.
- [x] Confidence threshold değerini config'e taşı; başlangıç değeri model doğrulamasında belirlensin.
- [x] Inference çağrısını event loop'u bloklamayacak sınırlı executor/worker yapısında çalıştır.
- [x] Aynı anda çalışabilecek inference sayısını ölçüme göre sınırla.
- [x] Başarı ve hata durumunda geçici görsel kaynaklarını temizle.
- [x] Dummy servisi gerçek model servisiyle değiştir.

## Ölçümler

- [x] Model yükleme süresi
- [x] Tek görsel ortalama/p95 inference süresi
- [x] Boşta ve inference sırasındaki RAM kullanımı
- [x] Varsa GPU belleği kullanımı
- [x] Model dosyası boyutu
- [x] Kullanılan cihaz/donanım bilgisi

İlk ölçümler: [FAZ 5 ONNX CPU benchmark](../benchmarks/PHASE-05-initial-benchmark.md).

## Testler

- [x] Bilinen nesne içeren örnek görsel.
- [x] Hiç nesne bulunmayan sentetik ve gerçek cihaz görseli.
- [x] Birden fazla sınıf ve tekrar içeren görsel.
- [x] Bozuk görsel.
- [x] Model yüklenememe durumu.
- [x] Ardışık isteklerde modelin tekrar yüklenmemesi.
- [x] Eşzamanlı istek sınırı.
- [x] İşlem sonunda geçici dosya kalmaması.
- [x] API contract testlerinin gerçek modelle de geçmesi.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| Gerçek model yükleme | `best.onnx`, ONNX Runtime `1.28.0`, `CPUExecutionProvider` ile başarılı |
| Readiness | Model yüklüyken `200 ok`; yükleme hatasında `503 unavailable` |
| Gerçek model API smoke | Sentetik JPEG ile `POST /api/v1/analyze` → `200`, sözleşmeye uygun boş detection |
| Model yaşam döngüsü | Lifespan'da bir kez yükleniyor; ardışık isteklerde aynı model kullanılıyor |
| Worker sınırı | 1/2/4 ölçümü sonrası varsayılan eşzamanlılık `2` |
| Sunucu kalite kontrolü | Ruff temiz; 39 test geçti |
| iOS kamera → gerçek model | Bilinen sınıf sonucu ve kullanıcı dostu kartlar başarılı (2026-07-31) |
| iOS galeri → gerçek model | Bilinen sınıf sonucu ve kullanıcı dostu kartlar başarılı (2026-07-31) |
| Çoklu sınıf ve tekrar | Ayrı sınıf kartları ve aynı sınıf adet gruplaması doğru (2026-07-31) |
| Nesne bulunmayan görsel | Hata yerine “Nesne tespit edilemedi” sonucu gösterildi (2026-07-31) |
| Yeni görsel ve ardışık analiz | Önceki sonuç temizlendi; beş ardışık analiz karışmadan tamamlandı (2026-07-31) |
| Sunucu kapalı | Uygulama çökmeden kullanıcı dostu bağlantı hatası gösterdi (2026-07-31) |
| Model yaşam döngüsü, cihaz gözlemi | Ardışık analizlerde model yükleme logu yalnızca başlangıçta görüldü |

FAZ 5'in kendi görev, ölçüm ve test listesi tamamlanmıştır. Ana faz geçişi, bağımlı FAZ 4'te
bekleyen Android gerçek cihaz kamera/galeri doğrulaması kapatıldıktan sonra “Tamamlandı” olarak
işaretlenecektir.

## Tamamlanma kriteri

Mobil uygulama gerçek model sonucunu alıp kullanıcı dostu biçimde gösterebiliyor; model yalnızca başlangıçta yükleniyor; ölçümler kaydedilmiş ve görseller işlemden sonra siliniyor.

## Çıktılar

- Gerçek `detection_model.py`
- Runtime bağımlılıkları
- Model benchmark notu
- Gerçek inference kullanan `/api/v1/analyze`
