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
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <HardDrive className="h-6 w-6 text-[#b8934a]" />
          Dosyalar
        </h1>
        <p className="mt-2 text-sm text-[#6b6158]">
          Private bucket — signed URL ile indir.
        </p>
      </header>
      <AdminDosyalarPanel initialFiles={files} initialFolders={folders} />
    </div>
  );
}
