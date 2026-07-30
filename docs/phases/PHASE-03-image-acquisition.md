# FAZ 3 — Kamera, Galeri ve Görsel Hazırlama

## Amaç

Kullanıcının gerçek bir fotoğraf çekmesini veya galeriden görsel seçmesini ve görselin sunucuya gönderime hazırlanmasını sağlamak.

## Bağımlılıklar

- [FAZ 2](PHASE-02-mobile-static-ui.md) tamamlanmış olmalı.

## Görevler

- [x] Kamera iznini çalışma zamanında iste.
- [ ] Galeri erişim davranışını Android ve iOS için doğrula.
- [x] İzin reddi ve kalıcı ret durumlarına anlaşılır mesaj göster.
- [x] `launchCameraAsync` ile fotoğraf çekimini bağla.
- [x] `launchImageLibraryAsync` ile tek görsel seçimini bağla.
- [x] Kullanıcının seçimi iptal etmesini hata olarak göstermeden akışı sonlandır.
- [x] Seçilen görseli önizleme alanına bağla.
- [x] Görselin en-boy oranını koru.
- [x] En uzun kenarı en fazla yaklaşık 1280 px olacak şekilde küçült.
- [x] Görseli `0.85` kaliteyle JPEG olarak kaydet.
- [x] Güncel `ImageManipulator.manipulate` API'sini kullan.
- [x] Yeni görsel seçildiğinde önceki sonuç ve hata state'ini temizle.
- [x] Optimizasyon hatasını kullanıcı dostu mesaja eşle.

## Testler

- [ ] Android gerçek cihazda kamera çekimi.
- [ ] Android gerçek cihazda galeri seçimi.
- [x] iOS gerçek cihazda kamera çekimi.
- [x] iOS gerçek cihazda galeri seçimi.
- [x] Kamera izni reddi.
- [x] Galeri/kamera seçim iptali.
- [x] Portre ve yatay görsellerde oran koruma.
- [x] Çok büyük görselin 1280 px sınırına indirilmesi.
- [ ] Küçük görselin gereksiz büyütülmemesi.

### Ara doğrulama notları

| Kontrol | Sonuç |
|---|---|
| `npm run check` | Temiz; 31 test geçti |
| Kamera izin sonucu | Geçici ret ve kalıcı ret otomatik testlerle ayrılıyor |
| Kamera/galeri iptali | Hata üretmeden sonlanıyor |
| Android pending result | Activity yeniden oluşturulursa bekleyen seçim geri alınıyor |
| Görsel boyutlandırma | Büyük yatay ve portre görseller 1280 px uzun kenara indiriliyor; küçük görsel büyütülmüyor |
| Görsel çıktı biçimi | Güncel ImageManipulator akışıyla JPEG ve `0.85` kalite kullanılıyor |
| Optimizasyon hatası | Kullanıcı dostu hata mesajına eşleniyor |
| Gerçek cihaz büyük görsel | `1179 × 2556` görsel oranı korunarak `591 × 1280` üretildi; ikinci örnek `960 × 1280` üretildi |
| Gerçek cihaz yön/oran | Portre ve yatay görsellerin doğru oranla, bozulmadan önizlendiği doğrulandı |
| Gerçek cihaz küçük görsel | Uygun örnek bulunmadığı için ertelendi; büyütmeme davranışı otomatik testle doğrulandı |
| Yeni görsel seçimi | Önceki statik analiz sonuçlarının temizlendiği gerçek cihazda doğrulandı |
| iOS kamera/galeri | Kamera çekimi, galeri seçimi ve seçim iptali gerçek cihazda başarılı |
| iOS kamera izni reddi | İzin kapalıyken kamera açılmadı ve kullanıcı dostu uyarı gösterildi |
| Android gerçek cihaz | Cihaz mevcut olmadığı için kamera ve galeri kabul testleri ertelendi |
| `npx expo-doctor` | 18/18 kontrol geçti |
| Android mikrofon izni | Fotoğraf akışında gerekmediği için config üzerinden kaldırıldı |

## Tamamlanma kriteri

Kullanıcı iki platformda kamera veya galeriden görsel alabiliyor; görsel doğru yönde ve oranda önizleniyor ve optimize edilmiş yerel URI gönderime hazır halde üretiliyor.

## Çıktılar

- `utils/imagePicker.ts`
- İzin/hata akışı
- Optimize edilmiş görsel URI'si
