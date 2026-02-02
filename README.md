# plaktakikitap

Kişisel film, dizi, kitap ve proje koleksiyonu. Next.js (App Router) + Supabase ile geliştirilmiştir.

## Özellikler

- **Ana Sayfa**: Animasyonlu giriş alanı ve istatistikler
- **Sinema**: Film ve dizi listesi
- **Kitaplar**: Okunan kitaplar
- **Admin**: Giriş, CRUD işlemleri, istatistik dashboard
- **Görünürlük**: public / unlisted / private

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase Projesi

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'da `supabase/migrations/001_initial_schema.sql` dosyasını çalıştırın
4. Authentication → Providers → Email: etkinleştirin
5. Settings → API: URL ve anon key kopyalayın

### 3. Ortam Değişkenleri

`.env.local.example` dosyasını `.env.local` olarak kopyalayın ve değerleri girin:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. İlk Kullanıcı

Supabase Dashboard → Authentication → Users → Add user ile ilk admin kullanıcısını oluşturun. MVP'de giriş yapabilen tüm kullanıcılar admin yetkisine sahiptir.

## Geliştirme

```bash
npm run dev
```

## Üretim

```bash
npm run build
npm start
```

## Sayfa Yapısı

| Sayfa | Açıklama |
|-------|----------|
| `/` | Ana sayfa, animasyonlu stage, istatistikler |
| `/cinema` | Film ve dizi listesi |
| `/books` | Kitap listesi |
| `/admin` | Admin dashboard (giriş gerekli) |
| `/admin/login` | Giriş sayfası |
| `/admin/films` | Film yönetimi |
| `/admin/series` | Dizi yönetimi |
| `/admin/books` | Kitap yönetimi |
