import { getPhotosAdmin } from "@/lib/photos";
import { AdminPhotosPanel } from "@/components/admin/AdminPhotosPanel";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const photos = await getPhotosAdmin();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-white">Fotoğraflar</h1>
      <p className="mt-1 mb-8 text-sm text-white/50">
        Yükle, isteğe bağlı açıklama ekle.
      </p>
      <AdminPhotosPanel initialPhotos={photos} />
    </div>
  );
}
