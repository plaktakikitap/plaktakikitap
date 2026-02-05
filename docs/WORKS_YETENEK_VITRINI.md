# Yetenek Vitrini (/works)

## Routes

- **Public:** `/works` — Yetenek Vitrini sayfası (filtre, videolar, sanat, projeler, sertifikalar, CV).
- **Redirect:** `/yaptiklarim` → `/works`
- **Admin:** `/admin/works` — Tüm works_items CRUD (navbar’da “Yaptıklarım” ile erişilir).

## Env vars

Mevcut Supabase env’ler yeterli:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (admin ve signed URL’ler için)

Ek bir env gerekmez.

## Veritabanı

1. **Migration:** `supabase/migrations/020_works_items.sql`  
   - `works_items` tablosu (type, title, subtitle, description, tags, url, image_url, meta, sort_order, is_featured, visibility).  
   - Storage bucket `works-media` (migration’da varsa oluşturulur; yoksa Supabase Dashboard → Storage’dan “works-media” adında private bucket ekleyin).

2. **RLS:** Sadece `visibility = 'public'` kayıtlar anon ile okunur. Tüm yazma işlemleri service role ile yapılır.

## Nasıl kullanılır?

### Admin panelden içerik ekleme

1. `/admin/works` sayfasına girin.
2. Üstteki sekmelerden ilgili türü seçin: Videolar, Sanat/Resim, Fotoğraf, Deneyim, Projeler, Yazılım, Sertifikalar, CV Roller, CV PDF.
3. **Yeni ekle** formunu doldurup **Ekle** ile kaydedin.
4. **Görünürlük:** Public (herkese açık), Unlisted (sadece link ile), Private (sadece admin).
5. **Öne çıkan:** İşaretlenenler ana sayfada “Öne çıkanlar” satırında görünür.
6. **Sıra:** Listedeki sayıyı değiştirip kaydederek sıralamayı güncelleyin.

### Türlere göre alanlar

- **youtube:** title, url (YouTube linki). Opsiyonel image_url (yoksa YouTube thumbnail kullanılır).
- **art / photo:** title, subtitle, image_url. Görsel: `works-media` bucket’a yükleyip path’i image_url’e yazın veya harici URL verin. `meta.seed` ile kart dönüş açısı sabitlenebilir.
- **experience / project:** title, url (İncele linki), description. meta: role, metrics.
- **software:** title, url (canlı link), description. meta: stack (dizi), github_url.
- **certificate:** title, image_url (rozet), url (doğrulama). meta: issuer, year.
- **cv_role:** title, description. meta: org, start_year, end_year.
- **CV PDF:** “CV PDF” sekmesinde tek bir indirme linki (works_settings.cv_download_url). PDF’i storage’a koyup signed URL kullanabilir veya harici link girebilirsiniz.

### Görsel yükleme (works-media)

- **API:** `POST /api/admin/works/upload` — formData: `file`, `path` (örn. `art/xxx.jpg`).  
  Cevap: `{ path: "art/xxx.jpg" }`. Bu path’i ilgili works_items satırının `image_url` alanına yazın.
- Bucket private olduğu için public sayfada görseller server tarafında signed URL ile sunulur (`lib/works.ts` → `signImageUrls`).

## Performans

- YouTube: iframe sadece karta tıklanınca yüklenir (lazy embed).
- Görseller: Art/photo grid’de signed URL’ler server-side 1 saat geçerli.
- Filtre: İstemci taraflı; veri tek seferde gelir, filtre sadece gösterimi değiştirir.
