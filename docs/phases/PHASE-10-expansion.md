# FAZ 10 — MVP Sonrası Genişletme

## Amaç

MVP doğrulandıktan sonra gerçek ihtiyaçlara göre yeni modeller ve operasyon özellikleri eklemek.

## Bağımlılıklar

- [FAZ 7](PHASE-07-mvp-validation.md) tamamlanmış olmalı.
- Production üzerinde geliştirilecekse [FAZ 9](PHASE-09-deployment.md) tamamlanmış olmalı.

## Olası geliştirmeler

- Counting modeli
- Classification modeli
- Segmentation modeli
- Birden fazla model seçeneğinin mevcut `ModelSelector` içine eklenmesi
- Model türlerine özel response şemaları
- Annotate edilmiş görsel gösterimi
- Mobil analiz geçmişi veya export
- Merkezi monitoring ve alarm
- CI/CD otomasyonu
- Kullanıcı/rol yönetimi
- Gelişmiş performans kuyruğu ve yatay ölçekleme

## Yeni model ekleme kontrol listesi

- [ ] Kullanım amacı ve kullanıcı çıktısı tanımlandı.
- [ ] Model artifact/runtime formatı belirlendi.
- [ ] `BaseModel` implementasyonu eklendi.
- [ ] Model registry kaydı eklendi.
- [ ] API response şeması geriye dönük uyumlu biçimde genişletildi.
- [ ] TypeScript response tipi eklendi.
- [ ] Model seçeneği `constants/models.ts` içine eklendi.
- [ ] Sonuç UI bileşeni eklendi.
- [ ] Contract, inference, mobil ve uçtan uca testler eklendi.
- [ ] Performans ölçümü ve deployment kaynak ihtiyacı kaydedildi.

## Önceliklendirme kuralı

Bu listedeki hiçbir özellik otomatik olarak kapsamda değildir. Her geliştirme müşteri geri bildirimi, demo ihtiyacı, model hazır olma durumu ve operasyon maliyetine göre ayrı iş paketi olarak planlanır.

## Tamamlanma kriteri

Seçilen genişletme özelliği kendi kabul kriterleri ve testleriyle tamamlanmış, mevcut Detection MVP akışında regresyon oluşturmamıştır.

