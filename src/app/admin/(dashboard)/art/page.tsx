import { getAdminArt } from "@/lib/db/queries";
import { AdminArt } from "@/components/admin/AdminArt";

export default async function AdminArtPage() {
  const items = await getAdminArt();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 pt-20">
      <AdminArt items={items} />
    </div>
  );
}
