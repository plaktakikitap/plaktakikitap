# Planner — Deliverables

## 1. Kullanıcı görüntüleme: `/planner`

- **Flip**: react-pageflip ile sayfa çevirme; Ocak–Aralık spread’leri (sol: takvim, sağ: notlar).
- **Modal**: Takvimde güne tıklanınca gün kayıtları modal’ı (planner_entry + planner_media); backdrop ile kapatma.
- **Previews**: Takvim hücrelerinde polaroid thumbnail, metin önizlemesi, sticker ikonu (MessyDayCell).

## 2. Admin: `/admin/planner`

- **Canvas editor**: Yıl/ay seçimi → sol/sağ sayfa canvas; “Öğe ekle” (fotoğraf yükle, post-it, washi, ataş, sticker, metin, kahve lekesi); sürükle, boyutlandır (foto/post-it), döndür, z-index; Kaydet → `planner_elements` upsert.
- **Day entry editor**: Takvimden gün seç → “Gün notu” bölümü; başlık, içerik, fotoğraflar, etiketler → `planner_day_entries` upsert.

## 3. Veritabanı: Supabase migrations

Proje **Supabase** kullanıyor (Prisma yok). İlgili migration’lar:

- `supabase/migrations/004_planner_calendar.sql` — planner_entries (eski)
- `supabase/migrations/006_planner_schema_v2.sql` — planner_day, planner_entry, planner_media
- `supabase/migrations/013_planner_page_settings.sql` — planner_page_settings
- `supabase/migrations/014_planner_entry_media_extras.sql` — summary_quote, sticker_selection, attachment_type
- `supabase/migrations/015_planner_attachment_style.sql` — attachment_style
- `supabase/migrations/016_planner_day_smudge.sql` — planner_day_smudge
- `supabase/migrations/017_planner_custom_fields.sql` — custom_fields (planner_page_settings)
- `supabase/migrations/045_planner_canvas_item.sql` — planner_canvas_item (eski canvas)
- `supabase/migrations/046_planner_spreads_elements_day_entries.sql` — planner_spreads, planner_elements, planner_day_entries
- **`supabase/migrations/047_planner_seed_2026_jan_feb.sql`** — 2026 Ocak ve Şubat dummy data (planner_day, planner_entry, planner_spreads, planner_elements, planner_day_entries)

Seed’i uygulamak için:

```bash
npx supabase db push
# veya
npx supabase migration up
```

## 4. Gerekli asset placeholder’ları (`public/`)

| Asset | Açıklama |
|-------|----------|
| `textures/leather.jpg` | Kapak deri dokusu (placeholder oluşturuldu) |
| `textures/paper.jpg` | Kağıt dokusu (placeholder oluşturuldu) |
| `stickers/star.png`, `heart.png`, `moon.png`, `flower.png`, `check.png` | Sticker placeholder’ları (oluşturuldu) |
| `sfx/page-turn.mp3` | Sayfa çevirme sesi (mevcut) |

Placeholder’ları oluşturmak için:

```bash
node scripts/create-placeholder-assets.js
```

Gerçek dokuları/sesleri isterseniz `public/textures/`, `public/stickers/` ve `public/sfx/` içindeki dosyaları kendi asset’lerinizle değiştirebilirsiniz.
