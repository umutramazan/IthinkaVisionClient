# iThinka AI Vision Client — MVP Proje Planı

Bu repository, müşterilere bilgisayarlı görü modelini hızlı biçimde göstermek için geliştirilecek Android+iOS mobil demo uygulamasının uygulanabilir proje planını içerir.

## Uygulama Ekibi

- Projeyi işe yeni başlayan ve daha önce mobil uygulama geliştirmemiş tek mühendis uygulayacaktır.
- Öğrenme ve araştırma görevleri proje eforuna dahildir; görünmez kişisel hazırlık olarak değerlendirilmez.
- Her task en fazla 16 saat olacak şekilde bölünür.
- API sözleşmesi, model runtime, container ve deployment aşamalarında teknik reviewer onayı zorunludur.
- Azure DevOps iş paketleri ve eforları proje planına göre tanımlanır.

## MVP Tanımı

Kullanıcı:

1. Kameradan fotoğraf çeker veya galeriden görsel seçer.
2. Model seçim alanından **Detection** modelini seçer.
3. Görseli şirket sunucusuna gönderir.
4. Sunucudaki model görseli işler.
5. Sınıf ve güven sonuçlarını ham JSON yerine kullanıcı dostu kartlarda görür.

Bu akışın Android ve iOS gerçek cihazlarda loading ve temel hata durumlarıyla uçtan uca çalışması MVP teslim kriteridir.

## Sabit Kararlar

- Mobil istemci React Native, Expo ve TypeScript ile geliştirilecek.
- Sunucu Python ve FastAPI kullanacak.
- İlk teslim Android ve iOS'u kapsayacak.
- Model seçim alanı görünecek; MVP'de yalnızca Detection seçeneği bulunacak.
- Detection modeli hazır, fakat runtime formatı hedef ortama göre değiştirilebilir.
- Nihai backend ve model şirket sunucusunda çalışacak.
- Yüklenen görseller kalıcı olarak saklanmayacak ve işlem sonunda silinecek.
- Counting, classification ve segmentation MVP sonrasında ihtiyaç oldukça eklenecek.
- Mobil uygulamaya gömülen sabit bir anahtar gizli kabul edilmeyecek.

## API Sözleşmesi

Endpoint: `POST /api/v1/analyze`

Multipart alanları:

- `image`: Optimize edilmiş görsel
- `modelType`: MVP için `detection`

Başarılı cevap:

```json
{
  "success": true,
  "detections": [
    {
      "class": "Person",
      "confidence": 0.96
    },
    {
      "class": "Helmet",
      "confidence": 0.91
    }
  ]
}
```

Hata cevabı:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Geçersiz veya desteklenmeyen görsel."
  }
}
```

Ham JSON kullanıcıya gösterilmez. Mobil uygulama `confidence` değerini yüzdeye çevirir ve aynı sınıftaki tekrarları gerektiğinde gruplar.

## Genel Mimari

```text
React Native / Expo
  UI ve model seçimi
        ↓
  useAnalyze hook
        ↓
  API service
        ↓ HTTPS multipart
FastAPI
  API ve validasyon
        ↓
  Analyze service
        ↓
  Detection adapter
        ↓
  Hazır detection modeli
```

Model formatına özel kod inference adaptöründe tutulur. Mobil uygulama ve API sözleşmesi PyTorch, ONNX veya başka bir runtime seçimine bağımlı olmaz.

## Fazlar

Azure DevOps iş paketleri, saat eforları, review kapıları ve toplam takvim tahmini faz planlarına göre hazırlanmalıdır.

| Faz | Dosya | Durum | Temel çıktı |
|---:|---|---|---|
| 0 | [Proje Temeli](docs/phases/PHASE-00-foundation.md) | Tamamlandı | Mobil ve sunucu iskeletleri |
| 1 | [Dummy Detection API](docs/phases/PHASE-01-backend-dummy.md) | Tamamlandı | Test edilmiş dummy endpoint |
| 2 | [Mobil Statik Arayüz](docs/phases/PHASE-02-mobile-static-ui.md) | Tamamlandı | Android+iOS statik MVP ekranı |
| 3 | [Kamera ve Galeri](docs/phases/PHASE-03-image-acquisition.md) | Başlanmadı | Optimize edilmiş gerçek görsel |
| 4 | [Dummy Uçtan Uca](docs/phases/PHASE-04-dummy-e2e.md) | Başlanmadı | Mobil ↔ dummy API akışı |
| 5 | [Gerçek Detection](docs/phases/PHASE-05-detection-integration.md) | Başlanmadı | Gerçek model sonucu |
| 6 | [Gözlemlenebilirlik](docs/phases/PHASE-06-observability.md) | Başlanmadı | Güvenli teknik loglar |
| 7 | [MVP Doğrulama](docs/phases/PHASE-07-mvp-validation.md) | Başlanmadı | Android+iOS teslim adayı |
| 8 | [Docker](docs/phases/PHASE-08-docker.md) | Başlanmadı | Taşınabilir sunucu container'ı |
| 9 | [Şirket Sunucusu](docs/phases/PHASE-09-deployment.md) | Başlanmadı | Production deployment |
| 10 | [Genişletme](docs/phases/PHASE-10-expansion.md) | Opsiyonel | Yeni modeller/özellikler |

## Faz Bağımlılıkları

```text
FAZ 0
 ├─→ FAZ 1 ─────────┐
 └─→ FAZ 2 → FAZ 3 ├─→ FAZ 4 → FAZ 5 → FAZ 6 → FAZ 7
                    └──────────────────────┘

FAZ 5 → FAZ 8 → FAZ 9
FAZ 7/9 → FAZ 10 (ihtiyaca göre)
```

FAZ 1 ve FAZ 2 teknik olarak paralel yürütülebilir; ancak projeyi tek ve mobil deneyimi olmayan mühendis geliştireceği için önerilen sıra FAZ 1'in ardından FAZ 2'dir. Diğer fazlara geçmeden önce ilgili dosyanın tamamlanma kriterleri ve zorunlu review kapısı karşılanmalıdır.

## Çalışma Kuralı

Her faz dosyasında:

- amaç ve bağımlılıklar,
- uygulanacak görevler,
- test senaryoları,
- tamamlanma kriteri,
- beklenen çıktılar

bulunur. Bir faz tamamlandığında görev kutuları ve bu README'deki durum tablosu güncellenir. Başarısız test veya karşılanmayan kabul kriteri varken sonraki bağımlı faz tamamlanmış sayılmaz.

Durum alanı şu değerleri alır ve faz dosyasındaki kutularla birlikte aynı commit içinde güncellenir:

| Durum | Anlamı |
|---|---|
| Başlanmadı | Faz dosyasında işaretli görev yok |
| Devam ediyor | En az bir görev tamamlandı, doğrulama kapanmadı |
| Cihaz doğrulaması bekliyor | Kod tamam, yalnızca fiziksel cihaz gerektiren kontroller açık |
| Tamamlandı | Tüm görevler, doğrulamalar ve varsa review kapısı kapandı |

Projeyi geliştirecek mühendisin mobil deneyimi olmadığı için öğrenme görevleri normal proje işi olarak Azure DevOps'a açılır. Her task en fazla 16 saat olacak şekilde bölünür; daha büyük görünen iş önce araştırma/spike task'ına ayrılır. Faz geçişlerinde ilgili teknik review kapıları zorunludur.

## Açık Kararlar

Bunlar FAZ 0–4 başlangıcını engellemez:

- Şirket sunucusunda GPU bulunup bulunmadığı
- Modelin nihai runtime formatı
- Şirket sunucusuna VPN/şirket ağı/internet üzerinden erişim
- Kimlik doğrulama yöntemi
- Beklenen eşzamanlı kullanıcı sayısı
- Kabul edilebilir maksimum analiz süresi
- Model için uygulanacak confidence threshold

Bu kararlar gerçek model ölçümleri ve şirket sunucusu bilgileri elde edildiğinde FAZ 5, FAZ 8 ve FAZ 9 içinde kesinleştirilecektir.

## Repository yapısı

```text
mobile/   Expo + React Native + TypeScript istemcisi
server/   FastAPI sunucusu
docs/     Faz planları ve ortam kayıtları
```

## Hızlı başlangıç

```powershell
# Sunucu
cd server
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Mobil (ayrı terminal)
cd mobile
npm install
Copy-Item .env.example .env
npm start
```

Ayrıntılar için [mobile/README.md](mobile/README.md) ve [server/README.md](server/README.md);
doğrulanan sürümler için [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) dosyalarına bakınız.

Faz sırası [FAZ 0 — Proje Temeli ve Teknik Hazırlık](docs/phases/PHASE-00-foundation.md) ile başlar.
