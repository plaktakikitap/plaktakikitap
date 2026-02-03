# Ses Dosyaları

Bu klasöre aşağıdaki ses dosyalarını ekleyin. Proje **.webm** (daha küçük) veya **.mp3** formatlarını destekler.

## Format Desteği

- **.webm** — Daha küçük boyut, önce denenir
- **.mp3** — Yaygın uyumluluk, yedek format

Aynı isimde her iki format varsa önce .webm kullanılır, yüklenmezse .mp3’e geçilir.

## Giriş Ekranı (Make Your Choice)

| Dosya | Ne zaman çalar | Özellik | Önerilen süre |
|-------|----------------|---------|---------------|
| `record-choice` | **Plak** butonuna tıklandığında | Vintage plak cızırtısı + lo-fi/caz melodisi | ~1.5 sn |
| `book-choice` | **Kitap** butonuna tıklandığında | Kitap kapağı kapanma / sayfa çevirme | ~0.3–0.5 sn |

**Not:** Tarayıcı kuralları gereği ses yalnızca buton tıklaması gibi kullanıcı etkileşiminde çalar.

## Ajanda (Planner)

| Dosya | Ne zaman çalar | Özellik | Önerilen süre |
|-------|----------------|---------|---------------|
| `paper-flip` | Sayfa çevrildiğinde (sürükle/tıkla) | Kağıt hışırtısı | ~0.2–0.4 sn |
| `metallic-click` | Ataşlı sayfa çevrildiğinde | Metalik tıkırtı | ~0.1–0.2 sn |

**Not:** Ses, sayfa çevirme hareketine (kullanıcı etkileşimi) bağlıdır.

## Dosya Yapısı

```
public/audio/
  ├── record-choice.webm   veya  record-choice.mp3
  ├── book-choice.webm     veya  book-choice.mp3
  ├── paper-flip.webm      veya  paper-flip.mp3
  └── metallic-click.webm  veya  metallic-click.mp3
```

En az bir format (webm veya mp3) yeterlidir. İkisi de varsa webm tercih edilir.

## Boyut İpuçları

- Kısa sesler için 128 kbps yeterli
- .webm genelde .mp3’ten daha küçüktür
- Süreleri kısa tutun (0.2–1.5 sn)

## Ses Açma/Kapama

Kullanıcılar site seslerini admin panelinden veya `localStorage` (`site_sounds_enabled`) ile kapatabilir.
