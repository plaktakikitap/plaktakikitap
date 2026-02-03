interface Reading {
  id: string;
  status: string;
  book_title: string;
  author: string | null;
  cover_url: string | null;
  note: string | null;
}

interface Link {
  id: string;
  type: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  duration_sec: number | null;
  sort_order: number;
  is_active: boolean;
}

interface AdminPanelMainProps {
  reading: Reading | null;
  links: Link[];
  tracks: Track[];
}

export function AdminPanelMain({
  reading,
  links,
  tracks,
}: AdminPanelMainProps) {
  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold text-[var(--foreground)]">
        Admin Panel
      </h1>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Reading */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-semibold">Şu an okuyorum kartı</h2>

          <form
            action="/api/admin/reading"
            method="POST"
            className="space-y-3"
          >
            <select
              name="status"
              defaultValue={reading?.status ?? "reading"}
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            >
              <option value="reading">reading (Şu an okuyorum)</option>
              <option value="last">last (En son okuduğum)</option>
            </select>

            <input
              name="book_title"
              defaultValue={reading?.book_title ?? ""}
              placeholder="Kitap adı"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />

            <input
              name="author"
              defaultValue={reading?.author ?? ""}
              placeholder="Yazar"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />

            <input
              name="cover_url"
              defaultValue={reading?.cover_url ?? ""}
              placeholder="Kapak URL"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />

            <textarea
              name="note"
              defaultValue={reading?.note ?? ""}
              placeholder="Not (opsiyonel)"
              className="min-h-[110px] w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />

            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Kaydet
            </button>
          </form>
        </section>

        {/* Links */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-semibold">Footer linkleri</h2>

          <form action="/api/admin/links" method="POST" className="space-y-3">
            <p className="text-sm text-[var(--muted)]">
              JSON olarak güncelliyoruz (hızlı ve net).
            </p>

            <textarea
              name="links_json"
              defaultValue={JSON.stringify(links, null, 2)}
              className="min-h-[340px] w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 font-mono text-xs"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Linkleri Kaydet
            </button>
          </form>
        </section>

        {/* Müzikler */}
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Müzikler (Şu an dinliyorum)
          </h2>

          <form
            action="/api/admin/tracks/add"
            method="POST"
            className="space-y-3"
          >
            <input
              name="title"
              placeholder="Şarkı adı"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
              required
            />
            <input
              name="artist"
              placeholder="Sanatçı"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
              required
            />
            <input
              name="cover_url"
              placeholder="Kapak URL (opsiyonel)"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />
            <input
              name="duration_sec"
              type="number"
              placeholder="Süre (sn) örn: 195"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />
            <input
              name="sort_order"
              type="number"
              placeholder="Sıra (0-999)"
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3"
            />

            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-5 py-3 font-medium text-white hover:opacity-90"
            >
              Ekle
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <p className="text-xs text-[var(--muted)]">Mevcut şarkılar:</p>

            {tracks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
                  {t.cover_url ? (
                    <img
                      src={t.cover_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--foreground)]">
                    {t.title}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {t.artist}
                    {t.duration_sec != null ? ` • ${t.duration_sec}s` : ""} •
                    order:{t.sort_order}
                  </p>
                </div>

                <form action="/api/admin/tracks/toggle" method="POST">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)]"
                  >
                    {t.is_active ? "pasif yap" : "aktif yap"}
                  </button>
                </form>

                <form action="/api/admin/tracks/delete" method="POST">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--muted)]/70 underline underline-offset-4 hover:text-red-400"
                  >
                    sil
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
