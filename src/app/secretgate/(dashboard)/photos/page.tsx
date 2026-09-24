import { getPhotosAdmin } from "@/lib/photos";
import { AdminPhotosPanelV2 } from "@/components/admin/AdminPhotosPanelV2";

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const photos = await getPhotosAdmin();
  return (
    <div className="mx-auto max-w-2xl">
      <AdminPhotosPanelV2 initialPhotos={photos} />
    </div>
  );
}
