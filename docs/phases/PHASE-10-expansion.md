# FAZ 10 — CI/CD, Sürekli Teslimat ve MVP Sonrası Genişletme

## Amaç

FAZ 7–9 boyunca doğrulanmış kalite, mobil build, container ve deployment adımlarını güvenli CI/CD
pipeline'larına dönüştürmek; MVP sonrasında yeni özelliklerin kontrollü biçimde teslim edilebileceği
sürdürülebilir geliştirme altyapısını kurmak.

## Bağımlılıklar

- [FAZ 7](PHASE-07-mvp-validation.md) tamamlanmış olmalı.
- Backend image otomasyonu için [FAZ 8](PHASE-08-docker.md) tamamlanmış olmalı.
- Production deployment otomasyonu için [FAZ 9](PHASE-09-deployment.md) tamamlanmış olmalı.

## CI/CD ilkeleri

- Pull request kontrolleri secret veya gerçek model artifact'ı gerektirmeden çalışır.
- Aynı commit tüm testlerden geçmeden build veya deployment adımına ilerlemez.
- Container image'ları değiştirilemez commit SHA/release etiketi ve mümkünse digest ile izlenir.
- Preview/staging ve production ortamlarının değişkenleri ile secret'ları ayrıdır.
- Production deployment otomatik başlamaz; yetkili reviewer onayı gerektirir.
- Production'a yalnızca staging/preview ortamında doğrulanan artifact yükseltilir.
- Her deployment için health kontrolü, audit kaydı ve belgelenmiş rollback yolu bulunur.
- Model artifact'ı Git'e veya CI loglarına yazılmaz; checksum doğrulaması yapılır.

## Zorunlu CI görevleri

- [ ] GitHub Actions üzerinde pull request ve `main` push tetikleyicilerini tanımla.
- [ ] Mobil pipeline'da temiz kurulum sonrası type-check, lint, format ve Jest çalıştır.
- [ ] Sunucu pipeline'ında temiz kurulum sonrası Ruff ve pytest çalıştır.
- [ ] Branch protection ile gerekli CI kontrolleri geçmeden `main` birleştirmesini engelle.
- [ ] Dependency ve build cache'lerini kilit dosyalarıyla güvenli biçimde anahtarla.
- [ ] Pipeline'larda kullanılan action ve araç sürümlerini sabitle.

## Backend teslimat görevleri

- [ ] FAZ 8 Dockerfile'ını pipeline içinde build et ve container smoke testini çalıştır.
- [ ] Model artifact'ını yetkili depodan alıp beklenen checksum ile doğrula.
- [ ] Başarılı image'ı seçilen private registry'ye commit SHA ve release etiketiyle gönder.
- [ ] Staging ortamına otomatik deployment ve health/readiness smoke testi ekle.
- [ ] Production ortamı için reviewer onaylı, tek deployment çalıştıran kontrollü job oluştur.
- [ ] Deployment başarısızlığında önceki image digest'ine rollback akışını ekle.

## Mobil teslimat görevleri

- [ ] EAS `preview`, `staging` ve `production` ortam değişkenlerini ayır.
- [ ] Preview build veya uyumlu EAS Update akışını CI üzerinden tetikle.
- [ ] Native değişikliklerde Android/iOS EAS Build; yalnızca JS/asset değişikliklerinde uyumlu
  runtime'a EAS Update uygulanması için release kuralını belgele.
- [ ] Staging update/build doğrulanmadan production kanalına yükseltmeyi engelle.
- [ ] Production Android/iOS buildlerini release etiketi ve commit SHA ile ilişkilendir.
- [ ] Store submission'ı ilk aşamada manuel onaylı tut; otomatik submission kararını ayrıca kaydet.

## Secret ve operasyon görevleri

- [ ] GitHub `preview`, `staging` ve `production` environment'larını tanımla.
- [ ] Registry, şirket sunucusu, Expo/EAS ve mağaza credential'larını environment secret olarak tut.
- [ ] Şirket ağı dışarıdan erişilemiyorsa şirket içinde self-hosted runner/deployment agent kur.
- [ ] Pipeline loglarında secret, model içeriği, görsel byte'ı veya hassas header bulunmadığını doğrula.
- [ ] Release, deployment, rollback ve sorumlu/onaylayan bilgilerini izlenebilir biçimde kaydet.

## CI/CD testleri

- [ ] Hatalı mobil veya sunucu testi deployment'ı engelliyor.
- [ ] Docker smoke testi başarısız olduğunda image yayınlanmıyor.
- [ ] Yanlış model checksum'ı build/deployment'ı durduruyor.
- [ ] Staging health kontrolü başarısız olduğunda production adımı açılmıyor.
- [ ] Production deployment reviewer onayı olmadan başlamıyor.
- [ ] Aynı production ortamına eşzamanlı iki deployment çalışmıyor.
- [ ] Başarılı ve başarısız rollback denemeleri kayıt altına alınıyor.
- [ ] Preview/staging mobil artifact'ı production API değişkenini yanlışlıkla kullanmıyor.

## Opsiyonel ürün geliştirmeleri

- Counting modeli
- Classification modeli
- Segmentation modeli
- Birden fazla model seçeneğinin mevcut `ModelSelector` içine eklenmesi
- Model türlerine özel response şemaları
- Annotate edilmiş görsel gösterimi
- Mobil analiz geçmişi veya export
- Merkezi monitoring ve alarm
- Kullanıcı/rol yönetimi
- Gelişmiş performans kuyruğu ve yatay ölçekleme

## Opsiyonel yeni model ekleme kontrol listesi

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

CI/CD görevleri sürekli geliştirme hedefinin zorunlu kapsamıdır. Opsiyonel ürün geliştirmelerinin hiçbiri
otomatik olarak kapsamda değildir; her biri müşteri geri bildirimi, demo ihtiyacı, model hazır olma
durumu ve operasyon maliyetine göre ayrı iş paketi olarak planlanır.

## Tamamlanma kriteri

Pull request kalite kontrolleri, backend staging/production teslimatı ve mobil preview/production
dağıtımı izlenebilir pipeline'larla çalışıyor; production geçişi onaylı, health kontrollü ve geri
alınabilir durumda. Seçilen opsiyonel geliştirmeler kendi kabul kriterleriyle tamamlanmış ve mevcut
Detection MVP akışında regresyon oluşturmamıştır.

## Çıktılar

- GitHub Actions kalite ve release workflow'ları
- Backend image registry ve staging/production deployment pipeline'ları
- EAS preview/staging/production build-update akışları
- Environment/secret envanteri
- Release, onay ve rollback runbook'u
