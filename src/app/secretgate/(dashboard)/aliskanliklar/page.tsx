import { Flame } from "lucide-react";
import {
  listAliskanlikKayitlari,
  listAliskanliklar,
} from "@/lib/takip/aliskanliklar";
import { AdminAliskanliklarPanel } from "@/components/admin/AdminAliskanliklarPanel";

export const dynamic = "force-dynamic";

export default async function AdminAliskanliklarPage() {
  const from = new Date();
  from.setDate(from.getDate() - 100);
  const [habits, logs] = await Promise.all([
    listAliskanliklar({ includeInactive: true }),
    listAliskanlikKayitlari({ from: from.toISOString().slice(0, 10) }),
  ]);

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold text-white">
          <Flame className="h-6 w-6 text-amber-400" />
          Alışkanlıklar
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Günlük check-in + streak.
        </p>
      </header>
      <AdminAliskanliklarPanel
        initialHabits={habits}
        initialLogs={logs}
      />
    </div>
  );
}
