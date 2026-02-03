# "Şu an" paneli ve admin kurulumu

## Özet

Ana sayfada **Şu an** paneli: Spotify (şu an dinliyorum) + okuma durumu (şu an okuyorum) kartları. Admin `/admin` üzerinden yönetilir (navbar'da link yok).

## Ortam değişkenleri (.env.local)

```env
# Admin – basit şifre ile koruma (navbar'da link yok)
ADMIN_PASSWORD=your-secure-password

# Spotify – mevcut yapılandırma
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
SPOTIFY_REFRESH_TOKEN=xxx

# Supabase – mevcut yapılandırma
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Opsiyonel: Ana sayfa Spotify API cache için (production)
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

## Supabase migration

```bash
supabase db push
# veya migration'ı manuel çalıştır: supabase/migrations/008_reading_status_site_links.sql
```

## Admin girişi

1. `/admin/login` adresine gidin (navbar'da link yok)
2. `ADMIN_PASSWORD` ile giriş yapın
3. Cookie tabanlı httpOnly oturum (7 gün)

## Yapı

### "Şu an" paneli (ana sayfa)

- **Spotify kartı**: `Şu an dinliyorum:` / `En son dinlediğim:` – `/api/spotify/now-playing`
- **Okuma kartı**: `Şu an okuyorum:` / `En son okuduğum:` – Supabase `reading_status` tablosu

### Admin sayfaları

- `/admin/reading` – Okuma durumu (kitap adı, yazar, kapak, not, status)
- `/admin/site-links` – Footer linkleri (tip, etiket, url, sıra, aktif)

### Footer

- Sol: © 2026 Eymen — Plaktaki Kitap
- Sağ: "Bana ulaşın" + `site_links` tablosundan linkler
