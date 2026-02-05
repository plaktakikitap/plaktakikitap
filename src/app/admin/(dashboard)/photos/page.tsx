import { getPhotosAdmin } from "@/lib/photos";
import { AdminPhotosPanel } from "@/components/admin/AdminPhotosPanel";

export default async function AdminPhotosPage() {
  const photos = await getPhotosAdmin();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold">Fotoğraf</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Görsel yükle, etiket ve kamera ekle. /photos sayfasında listelenir.
      </p>
      <AdminPhotosPanel initialPhotos={photos} />
    </div>
  );
}
