# Supabase Tabloları ve Migration Rehberi

## Kaynak nedir?

**Tüm bu hataların kaynağı Supabase tarafı.** Kod, `supabase/migrations/` içindeki SQL dosyalarına göre yazıldı. Supabase projenizde bu migration'lar **sırayla uygulanmamış**; bu yüzden "Could not find the table 'public.xxx' in the schema cache" benzeri hatalar alıyorsunuz.

Çözüm: Aşağıdaki migration dosyalarını **numara sırasıyla** Supabase projenize uygulayın (Dashboard → SQL Editor → her dosyanın içeriğini yapıştırıp çalıştırın veya `supabase db push` kullanın).

---

## Uygulamanın kullandığı tüm tablolar (migration sırasıyla)

| # | Migration dosyası | Oluşturulan / değiştirilen tablolar |
|---|-------------------|--------------------------------------|
| 1 | `001_initial_schema.sql` | `content_items`, `films`, `series`, `books` (eski), `media_assets`, `tags`, `content_tags` |
| 2 | `002_planner_entries.sql` | `planner_entries`, `planner_media` (sonra 006'da kaldırılıyor) |
| 3 | `003_translations.sql` | (çeviri ile ilgili eski yapı; 039 ile güncel yapı geliyor) |
| 4 | `004_planner_calendar.sql` | (planner takvim) |
| 5 | `005_manual_now_playing.sql` | **`manual_now_playing`** |
| 6 | `006_planner_schema_v2.sql` | **`planner_day`**, **`planner_entry`**, **`planner_media`** (yeni) |
| 7 | `007_planner_decor.sql` | **`planner_decor`** |
| 8 | `008_reading_status_site_links.sql` | **`reading_status`**, **`site_links`** |
| 9 | `009_now_tracks.sql` | **`now_tracks`** |
| 10 | `010_songs.sql` | (şarkılar) |
| 11 | `011_social_links.sql` | **`social_links`** |
| 12 | `012_social_links_rls.sql` | social_links RLS |
| 13 | `013_planner_page_settings.sql` | **`planner_page_settings`** |
| 14 | `014_planner_entry_media_extras.sql` | planner alanları |
| 15 | `015_planner_attachment_style.sql` | planner alanları |
| 16 | `016_planner_day_smudge.sql` | **`planner_day_smudge`** |
| 17 | `017_planner_custom_fields.sql` | planner alanları |
| 18 | `018_about_timeline.sql` | **`about_timeline`** |
| 19 | `019_works.sql` | works tablosu |
| 20 | `020_works_items.sql` | **`works_items`** |
| 21 | `021_photos.sql` | **`photos`** |
| 22 | `022_videos.sql` | **`videos`** |
| 23 | `023_films_spine_url.sql` | films sütunu |
| 24 | `024_films_movies_fields.sql` | films sütunları |
| 25 | `025_series_total_seasons.sql` | series sütunları |
| 26 | `026_films_series_favorite.sql` | films/series sütunları |
| 27 | `027_watched_at_creator.sql` | films/series sütunları |
| 28 | `028_series_total_duration_min.sql` | series sütunu |
| 29 | `029_reading_progress_and_goal.sql` | **`reading_status.progress_percent`**, **`reading_goal`** |
| 30 | `030_books_tags.sql` | books sütunları (content_items.books ile ilgili) |
| 31 | `031_books_extended.sql` | books sütunları |
| 32 | `032_reading_log_books_and_settings.sql` | **`settings`**, **`books`** (yeni standalone; eski books kaldırılıyor) |
| 33 | `033_books_is_featured_current.sql` | books sütunu |
| 34 | `034_photos_caption_date_type.sql` | photos sütunları |
| 35 | `035_photos_shot_at_type_enum.sql` | photos |
| 36 | `036_published_books.sql` | **`published_books`** |
| 37 | `037_published_books_lang_pairs.sql` | published_books sütunları |
| 38 | `038_published_books_translator_note.sql` | published_books sütunu |
| 39 | `039_translations_portfolio.sql` | **`translations_settings`**, **`translation_books`**, **`translation_independent`**, **`translation_volunteer_projects`** |
| 40 | `040_videos_description.sql` | videos sütunu |
| 41 | `041_videos_type.sql` | videos sütunu |
| 42 | `042_plaktaki_kitap.sql` | **`plaktaki_kitap_settings`**, **`plaktaki_kitap_items`** |
| 43 | `043_writings.sql` | **`writings`** |
| 44 | `044_writings_tefrika.sql` | writings sütunu |
| 45 | `045_planner_canvas_item.sql` | **`planner_canvas_item`** |
| 46 | `046_planner_spreads_elements_day_entries.sql` | **`planner_spreads`**, **`planner_elements`**, **`planner_day_entries`** |
| 47 | `047_planner_seed_2026_jan_feb.sql` | seed veri |
| 48 | `048_admin_uploads_bucket.sql` | storage bucket |
| 49 | `049_plaktaki_kitap_subscriber_count.sql` | plaktaki_kitap sütunu |
| 50 | `050_planner_pages_items_settings.sql` | **`planner_pages`**, **`planner_items`**, **`planner_settings`** |
| 51 | `051_series_poster_spine.sql` | series sütunları |
| 52 | `052_series_season_episode_count.sql` | series sütunları |
| 53 | `053_site_settings.sql` | **`site_settings`** |

---

## Hata – Tablo eşlemesi (sizin gördüğünüz mesajlar)

| Hata mesajı | Eksik tablo / sütun | Hangi migration |
|-------------|---------------------|------------------|
| Could not find the table 'public.settings' | `settings` | **032** |
| Could not find the table 'public.about_timeline' | `about_timeline` | **018** |
| Could not find the table 'public.works_items' | `works_items` | **020** |
| Create failed (Yazılarım) | `writings` | **043** |
| Upload failed (Fotoğraf) | `photos` + storage bucket | **021** |
| Update failed / Video URL (Plaktaki Kitap) | `plaktaki_kitap_settings`, `plaktaki_kitap_items` | **042** |
| Planner’da güne ekleme | `planner_day`, `planner_entry`, `planner_media`, `planner_day_entries`, vb. | **006, 016, 046** (+ 050) |
| Could not find the table 'public.content_items' | `content_items` | **001** |
| Could not find the table 'public.manual_now_playing' | `manual_now_playing` | **005** |
| Could not find the 'progress_percent' column of 'reading_status' | `reading_status.progress_percent` | **029** |
| Could not find the table 'public.translations_settings' | `translations_settings` | **039** |
| Could not find the table 'public.social_links' | `social_links` | **011** |

---

## Ne yapmalısınız?

1. **Supabase Dashboard** → **SQL Editor** açın.
2. **`supabase/migrations`** klasöründeki dosyaları **001’den 053’e kadar sırayla** çalıştırın (her dosyanın içeriğini kopyalayıp tek tek Run edin).
3. Bazı migration’lar önceki tablolara bağlıdır (ör. 032, `reading_goal` ve eski `books` tablosunu kullanır); bu yüzden sıra önemli.
4. İsterseniz projede Supabase CLI kuruluysa:  
   `supabase link` (projeyi bağladıktan sonra)  
   `supabase db push`  
   ile tüm migration’ları tek seferde uygulayabilirsiniz.

Bu işlemlerden sonra “schema cache” hataları ve eksik tablo/sütun uyarıları biter; kod tarafında değişiklik yapmanız gerekmez.
