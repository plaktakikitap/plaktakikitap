import { AdminImageUpload } from "./AdminImageUpload";

interface Reading {
  id: string;
  status: string;
  book_title: string;
  author: string | null;
  cover_url: string | null;
  note: string | null;
}

export function AdminReadingCard({ reading }: { reading: Reading | null }) {
  return (
    <div className="h-full">
      <h3 className="admin-heading mb-5 text-sm font-medium text-white/70">
        Şu an okuyorum kartı
      </h3>
      <form action="/api/admin/reading" method="POST" className="space-y-4">
        <select name="status" defaultValue={reading?.status ?? "reading"} className="admin-input admin-select">
          <option value="reading">reading (Şu an okuyorum)</option>
          <option value="last">last (En son okuduğum)</option>
        </select>
        <input
          name="book_title"
          defaultValue={reading?.book_title ?? ""}
          placeholder="Kitap adı"
          className="admin-input"
          required
        />
        <input
          name="author"
          defaultValue={reading?.author ?? ""}
          placeholder="Yazar"
          className="admin-input"
        />
        <AdminImageUpload
          name="cover_url"
          value={reading?.cover_url ?? ""}
          placeholder="Kapak görseli yükle"
        />
        <textarea
          name="note"
          defaultValue={reading?.note ?? ""}
          placeholder="Not (opsiyonel)"
          rows={4}
          className="admin-input admin-input-lg min-h-[100px] resize-y"
        />
        <button type="submit" className="admin-btn-gold w-full">
          Kaydet
        </button>
      </form>
    </div>
  );
}
