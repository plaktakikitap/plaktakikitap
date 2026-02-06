# Admin Panel – Veri Girememe Sorunu: RLS ve .env Kontrolü

## "Supabase RLS ayarlarım veri girmemi engelliyor mu?"

**Kısa cevap:** Bu projede **admin paneli yazma işlemleri** Supabase **service_role** anahtarı ile yapılıyor. Service_role kullandığınızda Supabase **RLS’i uygulamaz** (tüm satırlara erişir). Yani:

- **RLS açık kalsın** – güvenlik için kapamanıza gerek yok.
- **“Herkes yazabilsin”** gibi bir policy eklemeniz de gerekmez.
- Veri girememenin büyük ihtimalle sebebi **RLS değil**, **.env’de eksik/yanlış anahtar** (özellikle `SUPABASE_SERVICE_ROLE_KEY`) veya **NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY** eksikliğidir.

**Ne zaman RLS gerçekten engel olur?**

- Sadece **anon** veya **authenticated** anahtarı ile (yani `NEXT_PUBLIC_SUPABASE_ANON_KEY` ile) yazma yapıyorsanız RLS devreye girer. Bu projede admin API’ler artık **service_role** (`createAdminClient()`) kullandığı için admin tarafında RLS sizi engellemez; önce .env’i kontrol edin.

---

## 1. Environment Variables (.env) – Mutlaka Kontrol Edin

Projede bu değişkenlerin **tanımlı ve doğru** olması gerekir. `.env.example` dosyasında hepsi listeleniyor; siz **`.env.local`** içinde doldurmalısınız.

### Zorunlu (admin + site çalışsın diye)

| Değişken | Nereden alınır | Açıklama |
|----------|----------------|----------|
| **NEXT_PUBLIC_SUPABASE_URL** | Supabase → Project Settings → API → Project URL | Projede tanımlı olmalı; yoksa hiçbir Supabase isteği çalışmaz. |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | Supabase → Project Settings → API → anon / public key | Projede tanımlı olmalı; public okuma ve auth için kullanılır. |
| **SUPABASE_SERVICE_ROLE_KEY** | Supabase → Project Settings → API → **service_role** (secret) | **Admin panelinden veri yazabilmek için şart.** Bu yoksa veya yanlışsa admin kayıtları veritabanına gitmez. |

### Kontrol listesi

1. Proje kökünde **`.env.local`** var mı? (`.env.example` sadece şablon; uygulama `.env.local` okur.)
2. **NEXT_PUBLIC_SUPABASE_URL** ve **NEXT_PUBLIC_SUPABASE_ANON_KEY** `.env.local` içinde gerçek değerlerle dolu mu? (Placeholder değil.)
3. **SUPABASE_SERVICE_ROLE_KEY** `.env.local` içinde Supabase’teki **service_role** secret ile dolu mu?

Bunlar tamamsa ve hâlâ veri girmiyorsa, bir sonraki adım Supabase panelinde RLS’e bakmaktır.

---

## 2. Supabase Panelinde RLS Kontrolü (İsteğe Bağlı)

RLS’i **kapatmak zorunda değilsiniz**. Sadece aşağıdakileri doğrulayın.

### Supabase Dashboard adımları

1. **Table Editor** veya **SQL Editor** ile ilgili tabloya gidin (örn. `reading_status`, `site_links`, `now_tracks`, `photos`, `content_items`).
2. Tabloya tıklayıp **RLS** bölümüne bakın:
   - **“RLS enabled”** (RLS açık) görüyorsanız bu normal; admin service_role ile yazdığı için engel olmaz.
   - **“Herkes okuyabilir / yazabilir”** gibi bir policy’ye ihtiyacınız **yok**; admin tarafı zaten service_role ile çalışıyor.
3. Eğer **sadece anon key** ile deneme yapıyorsanız (ör. Postman’de anon key ile insert), o zaman RLS sizi keser. Uygulama tarafında admin işlemleri **server’da service_role** ile yapıldığı için bu senaryo sizin normal kullanımınız değil.

### Özet

- **RLS kapalı mı?** → Kapalı olmak zorunda değil; açık kalabilir.
- **Herkes okuyabilir/yazabilir izni var mı?** → Admin yazması için gerek yok; **SUPABASE_SERVICE_ROLE_KEY** doğru tanımlı olsun yeter.
- **Veri giremiyorum** → Önce `.env.local` içinde **NEXT_PUBLIC_SUPABASE_URL**, **NEXT_PUBLIC_SUPABASE_ANON_KEY** ve **SUPABASE_SERVICE_ROLE_KEY** tanımlı mı kontrol edin; sorun çoğunlukla buradan kaynaklanır.

---

## 3. Bu Projede Hangi Client Ne Zaman Kullanılıyor?

- **Admin paneli (kayıt güncelleme / silme):** `createAdminClient()` → **service_role** → RLS uygulanmaz.
- **Public sayfalar (okuma) ve planner vb.:** `createServerClient()` → **anon key** (ve isteğe bağlı auth) → RLS uygulanır; tablolarda `SELECT` için policy gerekir (çoğu migration’da var).

---

## 4. Yapılan Kod Düzeltmeleri (Referans)

- Tracks API’ler (`/api/admin/tracks/*`) artık **createAdminClient()** kullanıyor (önceden anon client kullanılıyordu).
- Reading, Links API’lerde hata yanıtı ve toast mesajları eklendi.
- `.env.example` içinde **NEXT_PUBLIC_SUPABASE_URL** ve **NEXT_PUBLIC_SUPABASE_ANON_KEY** tanımlı; **.env.local**’i bu şablona göre doldurup **SUPABASE_SERVICE_ROLE_KEY** eklemeniz yeterli.
