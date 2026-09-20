import { HardDrive } from "lucide-react";
import {
  listKisiselDosyalar,
  listKlasorler,
} from "@/lib/kisisel/dosyalar";
import { AdminDosyalarPanel } from "@/components/admin/AdminDosyalarPanel";

export const dynamic = "force-dynamic";

export default async function AdminDosyalarPage() {
  const [files, folders] = await Promise.all([
    listKisiselDosyalar(),
    listKlasorler(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <HardDrive className="h-6 w-6 text-amber-400" />
          Dosyalar
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Private bucket — signed URL ile indir.
        </p>
      </header>
      <AdminDosyalarPanel initialFiles={files} initialFolders={folders} />
    </div>
  );
}
