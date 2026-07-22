# FAZ 3 — Kamera, Galeri ve Görsel Hazırlama

## Amaç

Kullanıcının gerçek bir fotoğraf çekmesini veya galeriden görsel seçmesini ve görselin sunucuya gönderime hazırlanmasını sağlamak.

## Bağımlılıklar

- [FAZ 2](PHASE-02-mobile-static-ui.md) tamamlanmış olmalı.

## Görevler

- [ ] Kamera iznini çalışma zamanında iste.
- [ ] Galeri erişim davranışını Android ve iOS için doğrula.
- [ ] İzin reddi ve kalıcı ret durumlarına anlaşılır mesaj göster.
- [ ] `launchCameraAsync` ile fotoğraf çekimini bağla.
- [ ] `launchImageLibraryAsync` ile tek görsel seçimini bağla.
- [ ] Kullanıcının seçimi iptal etmesini hata olarak göstermeden akışı sonlandır.
- [ ] Seçilen görseli önizleme alanına bağla.
- [ ] Görselin en-boy oranını koru.
- [ ] En uzun kenarı en fazla yaklaşık 1280 px olacak şekilde küçült.
- [ ] Görseli yaklaşık `0.7` kaliteyle JPEG olarak kaydet.
- [ ] Güncel `ImageManipulator.manipulate` API'sini kullan.
- [ ] Yeni görsel seçildiğinde önceki sonuç ve hata state'ini temizle.
- [ ] Optimizasyon hatasını kullanıcı dostu mesaja eşle.

## Testler

- [ ] Android gerçek cihazda kamera çekimi.
- [ ] Android gerçek cihazda galeri seçimi.
- [ ] iOS gerçek cihazda kamera çekimi.
- [ ] iOS gerçek cihazda galeri seçimi.
- [ ] Kamera izni reddi.
- [ ] Galeri/kamera seçim iptali.
- [ ] Portre ve yatay görsellerde oran koruma.
- [ ] Çok büyük görselin 1280 px sınırına indirilmesi.
- [ ] Küçük görselin gereksiz büyütülmemesi.

## Tamamlanma kriteri

Kullanıcı iki platformda kamera veya galeriden görsel alabiliyor; görsel doğru yönde ve oranda önizleniyor ve optimize edilmiş yerel URI gönderime hazır halde üretiliyor.

## Çıktılar

- `utils/imagePicker.ts`
- İzin/hata akışı
- Optimize edilmiş görsel URI'si

