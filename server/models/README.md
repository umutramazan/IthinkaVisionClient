# Detection model files

Sunucunun kullandığı ONNX model dosyasını bu klasöre yerleştirin:

```text
server/models/best.onnx
```

Model dosyaları büyük veya kuruma özel olabileceği için version control'e eklenmez. Repository
yalnızca bu açıklama dosyasını tutar. Aktif geliştirme runtime'ı ONNX Runtime `1.28.0` ve
`CPUExecutionProvider` olarak belirlenmiştir. Model yolu `APP_MODEL_PATH` ortam değişkeniyle
yapılandırılır; varsayılan değer `models/best.onnx` dosyasıdır.

Kaynak `best.pt` dosyası model envanteri ve gerektiğinde yeniden export için korunur; FastAPI inference
akışında doğrudan kullanılmaz. Hedef şirket sunucusunun donanımı öğrenildiğinde CPU/GPU provider seçimi
yeniden doğrulanacaktır.

## Yerel model envanteri

`best.pt` dosyası 2026-07-30 tarihinde proje dışındaki izole inceleme ortamında kontrol edildi:

- Boyut: `5,400,645` byte
- SHA-256: `29D2C9EB44D06DE60321D309DB053231658FD8808D020831D8E4DF9005975E6A`
- Ultralytics: `8.4.102`
- PyTorch: `2.13.0+cpu`
- Görev: `detect`
- Sınıflar: `manhole`, `pothole`, `patch`, `bump`, `shadow`, `crosswalk`, `spill`, `debris`, `lane`

Sınıf isimleri checkpoint içinde bulunduğu için yalnızca inference yapmak amacıyla ayrıca `data.yaml`
dosyası gerekmemektedir. Eğitim veya dataset validation yapılacaksa dataset yapılandırması yine gerekir.

## ONNX export envanteri

`best.pt`, 2026-07-30 tarihinde proje dışındaki aynı izole ortamda ONNX biçimine dönüştürüldü:

- Dosya: `server/models/best.onnx`
- Boyut: `9,811,535` byte
- SHA-256: `39B2E8EC75F063D88A41344626EFAAB04C1643F5B82AFAA2536E4AD1488C796D`
- Kaynak model: `best.pt`
- ONNX opset: `20`
- Giriş: `images`, `float32`, `[1, 3, 640, 640]`
- Çıkış: `output0`, `float32`, `[1, 300, 6]`
- Export ayarları: sabit boyut, batch `1`, simplify etkin, CPU

Dosya `onnx.checker` ile yapısal olarak doğrulandı. ONNX Runtime `1.28.0` ve
`CPUExecutionProvider` kullanılarak örnek tensörle inference çalıştırıldı; çıktı boyutu beklendiği gibi
`[1, 300, 6]` oldu ve tüm çıktı değerlerinin sonlu olduğu doğrulandı. Sınıf isimleri ile `640 × 640`
görsel boyutu ONNX metadata alanında korunmaktadır.

Bu kontrol, model dosyasının yüklenip çalıştırılabildiğini doğrular. Gerçek görseller üzerindeki `.pt` ve
`.onnx` sonuçlarının karşılaştırılması ayrıca yapılmalıdır.
