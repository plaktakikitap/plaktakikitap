# Admin Panel — RLS (Row Level Security) Kontrol Listesi

## Veri Girilememe Sorunu

Admin panelinden film, kitap, dizi eklerken veya diğer verileri kaydederken hata alıyorsanız, Supabase RLS ayarları veya client kullanımı kaynaklı olabilir.

---

## 1. Hangi Tablolar Nasıl Korunuyor?

| Tablo / Alan | RLS Politikası | Yazma İzin |
|--------------|----------------|------------|
| `content_items`, `films`, `series`, `books` | `auth.role() = 'authenticated'` | Sadece ** authenticated** Supabase oturumu |
| `photos`, `videos`, `works_*`, `plaktaki_kitap_*` | `auth.role() = 'service_role'` | Sadece **service_role** (RLS bypass) |
| `planner_spreads`, `planner_elements`, `planner_canvas_item` | `auth.role() = 'authenticated'` | Sadece **authenticated** |
| `planner_entry`, `planner_media` | planner-admin.ts | **createAdminClient** (RLS bypass) |

---

## 2. Olası RLS Sorunu: Film / Kitap / Dizi Eklerken

**Durum:** `lib/db/queries.ts` içindeki `createFilm`, `createSeries`, `createBook` fonksiyonları `createServerClient()` kullanıyor. Bu client, kullanıcının Supabase oturumuna bağlıdır.

- **Supabase Auth ile giriş yaptıysanız** → `authenticated` → RLS geçer, yazma çalışır.
- **Basit admin auth** (`pk_admin`, `ADMIN_PASSWORD`, `NODE_ENV=development` bypass) kullanıyorsanız → Supabase tarafında oturum **yok** → client `anon` gibi davranır → RLS politikası `auth.role() = 'authenticated'` nedeniyle **INSERT engellenebilir**.

**Çözüm önerisi:** Admin yazma işlemlerini `createAdminClient()` ile yapmak. `createAdminClient` service_role kullanır ve RLS’i bypass eder. Örnek:

- `admin/actions.ts` → `createFilm`, `createSeries`, `createBook` çağrılarını `lib/db/admin-queries.ts` gibi service_role kullanan bir modüle taşıyın, **veya**
- `createFilm`, `createSeries`, `createBook` fonksiyonlarına opsiyonel bir `supabase` parametresi ekleyin; admin actions bu parametreye `createAdminClient()` geçirsin.

---

## 3. Doğru Kullanım Özeti

| İşlem | Kullanılması Gereken Client | RLS Etkisi |
|-------|-----------------------------|------------|
| Admin panelinden içerik ekleme (film, kitap, dizi) | `createAdminClient()` | RLS bypass |
| Planner, photos, videos, works vb. admin işlemleri | `createAdminClient()` | RLS bypass |
| Public sayfa okuma | `createServerClient()` veya `createBrowserClient()` | RLS uygulanır |

---

## 4. Kontrol Adımları

1. **Supabase Dashboard** → Authentication → Users: Admin kullanıcısı Supabase Auth ile kayıtlı mı?
2. **Supabase Dashboard** → Table Editor → Logs: Hata mesajlarında `RLS` veya `policy` geçiyor mu?
3. **`.env.local`** → `SUPABASE_SERVICE_ROLE_KEY` tanımlı mı? (Admin API’ler bunu kullanmalı)
4. **Admin giriş şekli:** Sadece `pk_admin` veya `ADMIN_PASSWORD` ile mi giriyorsunuz? Eğer öyleyse, film/kitap/dizi ekleme akışının mutlaka `createAdminClient()` kullanan bir yol üzerinden gitmesi gerekir.

---

## 5. Özet Uyarı

**Eğer admin panelinden veri girilemiyorsa ve hata mesajı net değilse:**

- Önce Supabase Logs’a bakın; RLS policy hatası olup olmadığını kontrol edin.
- `createFilm`, `createSeries`, `createBook` ve benzeri admin yazma işlemlerinin `createAdminClient()` kullanarak yapıldığından emin olun.

Planner, photos, videos, works, plaktaki-kitap gibi alanlar zaten `planner-admin.ts`, `photos.ts`, `videos.ts`, `works.ts` vb. üzerinden `createAdminClient()` ile yazılıyor; bunlarda RLS sorunu beklenmez.
