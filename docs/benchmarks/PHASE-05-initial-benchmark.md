# FAZ 5 — İlk ONNX CPU Benchmark

## Kapsam

Bu ölçüm, gerçek `best.onnx` artifact'ının geliştirme bilgisayarında yüklenebildiğini ve inference
adaptörünün temel performansını doğrular. Doğruluk değerlendirmesi değildir. Bilinen nesneler ve çoklu
sınıflar, mobil uygulamadan çekilecek gerçek fotoğraflarla FAZ 5 kapanışında doğrulanacaktır.

## Ortam

| Alan | Değer |
|---|---|
| Tarih | 2026-07-31 |
| İşletim sistemi | Windows 11, build 26200 |
| CPU | 11th Gen Intel Core i7-1165G7 @ 2.80 GHz |
| Sistem belleği | 34,043,187,200 byte (yaklaşık 31.7 GiB) |
| Python | 3.14.6 |
| ONNX Runtime | 1.28.0 |
| NumPy | 2.5.1 |
| Execution provider | `CPUExecutionProvider` |
| Model | `best.onnx`, 9,811,535 byte |
| Girdi | Sentetik 1280 × 720 JPEG |
| Confidence threshold | `0.25` |

GPU provider kullanılmadığı için GPU bellek ölçümü uygulanabilir değildir.

## Tek Görsel Ölçümü

İlk warm-up isteği ölçüm dışında bırakıldı. Aynı sentetik görselle 20 inference çalıştırıldı.

| Ölçüm | Sonuç |
|---|---:|
| Model yükleme | 81.74 ms |
| Ortalama inference | 48.40 ms |
| p95 inference | 53.64 ms |
| Süreç belleği, model öncesi | 62.20 MiB |
| Süreç belleği, model yüklü | 82.53 MiB |
| Süreç belleği, inference sonrası | 162.92 MiB |
| Detection sayısı | 0 |

Bu değerler tek bir yerel koşunun başlangıç referansıdır; production kapasite taahhüdü değildir.

## Eşzamanlılık Ölçümü

Warm-up sonrasında sekiz inference isteğinin toplam tamamlanma süresi ölçüldü.

| Worker sınırı | Sekiz istek | Throughput |
|---:|---:|---:|
| 1 | 367.67 ms | 21.76 istek/sn |
| 2 | 296.60 ms | 26.97 istek/sn |
| 4 | 271.87 ms | 29.43 istek/sn |

Varsayılan sınır `2` seçildi. Dört worker yalnızca yaklaşık `%9` ek throughput sağlarken eşzamanlı CPU
yükünü iki katına çıkarıyor. Hedef sunucu donanımı öğrenildiğinde değer yeniden ölçülecektir.

