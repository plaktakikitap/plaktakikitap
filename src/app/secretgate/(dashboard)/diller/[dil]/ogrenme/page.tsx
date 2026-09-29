import { notFound } from "next/navigation";
import { dilIlerlemeGetir } from "@/app/actions/dil-ogrenme";
import AdminDilOgrenmePanel from "@/components/admin/AdminDilOgrenmePanel";
import { DILLER, isSeviye, type Dil, type Seviye } from "@/types/dil-ogrenme";

export const dynamic = "force-dynamic";

export default async function DilOgrenmeSayfasi({
  params,
  searchParams,
}: {
  params: Promise<{ dil: string }>;
  searchParams: Promise<{ seviye?: string }>;
}) {
  const { dil: dilParam } = await params;
  const { seviye: seviyeParam } = await searchParams;
  if (!DILLER.includes(dilParam as Dil)) notFound();
  const dil = dilParam as Dil;
  const seviye: Seviye = isSeviye(seviyeParam ?? "") ? (seviyeParam as Seviye) : "A1";

  const ilerleme = await dilIlerlemeGetir(dil);

  return (
    <AdminDilOgrenmePanel
      dil={dil}
      secilenSeviye={seviye}
      ilerleme={ilerleme}
    />
  );
}
