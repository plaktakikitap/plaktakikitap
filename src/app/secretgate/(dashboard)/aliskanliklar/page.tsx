import { Flame } from "lucide-react";
import {
  addDaysISO,
  istanbulHour,
  istanbulTodayISO,
} from "@/lib/date/istanbul";
import {
  getAliskanlikGunu,
  listAliskanlikKayitlari,
  listAliskanliklar,
  listHaftalikDegerlendirmeler,
} from "@/lib/takip/aliskanliklar";
import {
  getAksamKayit,
  getAksamSablon,
  listCevreAlanlari,
  listDurtuler,
} from "@/lib/takip/aliskanlik-anlik";
import { AdminAliskanliklarPanel } from "@/components/admin/AdminAliskanliklarPanel";

export const dynamic = "force-dynamic";

export default async function AdminAliskanliklarPage() {
  const today = istanbulTodayISO();
  const from = addDaysISO(today, -100);
  const [
    habits,
    logs,
    gun,
    reviews,
    aksam,
    aksamSablon,
    cevre,
    durtuler,
  ] = await Promise.all([
    listAliskanliklar({ includeInactive: true, includeArchived: true }),
    listAliskanlikKayitlari({ from }),
    getAliskanlikGunu(today),
    listHaftalikDegerlendirmeler(),
    getAksamKayit(today),
    getAksamSablon(),
    listCevreAlanlari(today),
    listDurtuler(addDaysISO(today, -60)),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-[#1a1612]">
          <Flame className="h-6 w-6 text-[#b8934a]" />
          Alışkanlıklar
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6b6158]">
          Her küçük davranış, dönüşmek istediğin kişi lehine verdiğin bir oydur.
        </p>
      </header>
      <AdminAliskanliklarPanel
        initialHabits={habits}
        initialLogs={logs}
        initialGun={gun}
        initialReviews={reviews}
        initialAksam={aksam}
        initialAksamSablon={aksamSablon}
        initialCevre={cevre}
        initialDurtuler={durtuler}
        today={today}
        initialHour={istanbulHour()}
      />
    </div>
  );
}
