# FAZ 5 — Gerçek Detection Modeli Entegrasyonu

## Amaç

Hazır detection modelini FastAPI inference katmanına bağlamak ve dummy cevabı gerçek sonuçla değiştirmek.

## Bağımlılıklar

- [FAZ 4](PHASE-04-dummy-e2e.md) tamamlanmış olmalı.
- Model dosyası ve birkaç doğrulama görseli erişilebilir olmalı.

## Açık kararlar

- Modelin runtime formatı henüz kesin değildir; PyTorch, ONNX veya hedefe uygun başka bir formata dönüştürülebilir.
- Şirket sunucusunda GPU olup olmadığı bilinmemektedir.
- İlk benchmark mevcut geliştirme ortamında yapılır; nihai runtime kararı hedef sunucu öğrenilince doğrulanır.

## Tasarım kuralları

- Format bağımlı kod yalnızca `inference/detection_model.py` içinde kalır.
- API ve mobil istemci model formatını bilmez.
- Model uygulama başlangıcında bir kez yüklenir.
- API çıktısı yalnızca `class` ve `confidence` içerir.
- Görsel analiz sonrasında kalıcı olarak saklanmaz.

## Görevler

- [ ] `BaseModel.predict(image_bytes)` arayüzünü kesinleştir.
- [ ] Model için gerekli runtime bağımlılıklarını belirle ve sürümlerini sabitle.
- [ ] `detection_model.py` adaptörünü oluştur.
- [ ] Model yüklemeyi FastAPI lifespan içine bağla.
- [ ] Model yüklenemezse readiness endpointini başarısız duruma getir.
- [ ] Görsel byte'larını model girişine dönüştür.
- [ ] Preprocessing adımlarını modelle uyumlu hale getir.
- [ ] Ham model çıktısını `{class, confidence}` listesine map et.
- [ ] Confidence threshold değerini config'e taşı; başlangıç değeri model doğrulamasında belirlensin.
- [ ] Inference çağrısını event loop'u bloklamayacak sınırlı executor/worker yapısında çalıştır.
- [ ] Aynı anda çalışabilecek inference sayısını ölçüme göre sınırla.
- [ ] Başarı ve hata durumunda geçici görsel kaynaklarını temizle.
- [ ] Dummy servisi gerçek model servisiyle değiştir.

## Ölçümler

- [ ] Model yükleme süresi
- [ ] Tek görsel ortalama/p95 inference süresi
- [ ] Boşta ve inference sırasındaki RAM kullanımı
- [ ] Varsa GPU belleği kullanımı
- [ ] Model dosyası boyutu
- [ ] Kullanılan cihaz/donanım bilgisi

## Testler

- [ ] Bilinen nesne içeren örnek görsel.
- [ ] Hiç nesne bulunmayan görsel.
- [ ] Birden fazla sınıf ve tekrar içeren görsel.
- [ ] Bozuk görsel.
- [ ] Model yüklenememe durumu.
- [ ] Ardışık isteklerde modelin tekrar yüklenmemesi.
- [ ] Eşzamanlı istek sınırı.
- [ ] İşlem sonunda geçici dosya kalmaması.
- [ ] API contract testlerinin gerçek modelle de geçmesi.

## Tamamlanma kriteri

Mobil uygulama gerçek model sonucunu alıp kullanıcı dostu biçimde gösterebiliyor; model yalnızca başlangıçta yükleniyor; ölçümler kaydedilmiş ve görseller işlemden sonra siliniyor.

## Çıktılar

- Gerçek `detection_model.py`
- Runtime bağımlılıkları
- Model benchmark notu
- Gerçek inference kullanan `/api/v1/analyze`

