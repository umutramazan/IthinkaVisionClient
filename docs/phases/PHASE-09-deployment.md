# FAZ 9 — Şirket Sunucusuna Deployment

## Amaç

Container paketini şirket sunucusuna kurmak ve mobil uygulamayı üretim API adresine bağlamak.

## Bağımlılıklar

- [FAZ 8](PHASE-08-docker.md) tamamlanmış olmalı.
- Şirket sunucusuna erişim ve deployment yetkisi sağlanmış olmalı.

## Deployment yaklaşımı

İlk şirket sunucusu deployment'ı kontrollü ve manuel olarak gerçekleştirilir. Kullanılan image
etiketi/digest'i, model checksum'ı, ortam girdileri, health kontrolleri ve rollback komutları kaydedilir.
Bu fazda doğrulanan süreç [FAZ 10](PHASE-10-expansion.md) içinde CI/CD pipeline'ına dönüştürülür.

## Faz başında öğrenilecekler

- CPU, RAM ve varsa GPU modeli
- İşletim sistemi ve Docker desteği
- Domain/DNS imkânı
- VPN/şirket ağı/internet erişim modeli
- Reverse proxy standardı
- Sertifika yönetimi
- Beklenen eşzamanlı kullanıcı sayısı
- Kurumun kimlik doğrulama ve log politikası

## Production log işletimi

Uygulama ve container tarafındaki temel [FAZ 6](PHASE-06-observability.md) ve
[FAZ 8](PHASE-08-docker.md) kontrollerine ek olarak, deployment öncesinde kurumun mevcut log
altyapısı öğrenilir. Merkezi bir sistem varsa container `stdout/stderr` logları bu sisteme aktarılır;
yoksa erişimi sınırlandırılmış Docker logları, tanımlı rotation ve düzenli disk kontrolüyle işletilir.
Her iki durumda da saklama süresi, erişebilen roller ve olay anında request ID ile inceleme yolu
operasyon notuna kaydedilir. Görsel içeriği ve hassas header'lar hiçbir toplama hedefine gönderilmez.

## Görevler

- [ ] Sunucu kapasitesini FAZ 5 benchmark sonuçlarıyla karşılaştır.
- [ ] CPU veya GPU runtime profilini seç.
- [ ] Model artifact'ını güvenli biçimde sunucuya yerleştir.
- [ ] Production `.env` değerlerini sunucuda oluştur.
- [ ] Reverse proxy üzerinden HTTPS yayınla.
- [ ] API container portunu doğrudan internete açma.
- [ ] VPN/ağ kısıtı veya kararlaştırılan token/kimlik doğrulamasını uygula.
- [ ] Rate limit ve eşzamanlı inference sınırı ekle.
- [ ] Mobil production `EXPO_PUBLIC_API_BASE_URL` değerini ayarla.
- [ ] Android ve iOS production buildlerini aynı release commit'inden oluştur.
- [ ] Log toplama hedefini, saklama süresini ve erişim yetkilerini kaydet.
- [ ] Health, container log rotation ve disk kullanımı kontrolünü yapılandır.
- [ ] Rollback komutlarını ve önceki image etiketini kaydet.
- [ ] Deployment girdilerini ve manuel komutları CI/CD otomasyonuna uygun teslim notunda kaydet.

## Testler

- [ ] Dış ağ/şirket ağı üzerinden HTTPS health kontrolü.
- [ ] Android production build ile analiz.
- [ ] iOS production build ile analiz.
- [ ] Yetkisiz erişim kontrolü.
- [ ] Büyük dosya/rate limit kontrolü.
- [ ] Container restart ve sunucu reboot sonrası açılış.
- [ ] Görsellerin işlem sonrasında kalmadığının doğrulanması.
- [ ] Request ID ile production loglarında başarılı ve hatalı bir isteği uçtan uca takip et.
- [ ] Rotation sonrasında disk sınırının korunduğunu ve gerekli log inceleme yolunun çalıştığını doğrula.
- [ ] Rollback denemesi.
- [ ] Production buildlerin commit SHA, build numarası ve API ortamı eşleşmesini doğrula.

## Tamamlanma kriteri

Android ve iOS uygulamaları şirket sunucusundaki gerçek modelden HTTPS üzerinden sonuç alıyor; erişim sınırlandırılmış, health/log kontrolleri çalışıyor ve rollback yolu belgelenmiş.

## Çıktılar

- Çalışır production deployment
- Production mobil config/buildleri
- Operasyon ve rollback notu
- Log toplama, saklama, erişim ve disk kontrolü kararı
- FAZ 10 CI/CD otomasyonuna girdi olacak manuel release/deployment kaydı
