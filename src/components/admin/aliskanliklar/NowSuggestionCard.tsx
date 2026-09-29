"use client";

import type { Aliskanlik, AliskanlikGunModu } from "@/types/takip";
import { minOncelik, oneriMetni } from "@/lib/takip/aliskanlik-now";
import { chipClass } from "./api";

export function NowSuggestionCard({
  habit,
  gunModu,
  baglam,
  missed,
  pending,
  onYapildi,
  onBaska,
  onUygunDegil,
}: {
  habit: Aliskanlik | null;
  gunModu: AliskanlikGunModu;
  baglam: Aliskanlik["baglamlar"][number] | null;
  missed: boolean;
  pending?: boolean;
  onYapildi: () => void;
  onBaska: () => void;
  onUygunDegil: () => void;
}) {
  const min = minOncelik(gunModu, baglam, missed);
  return (
    <section className="rounded-2xl border border-[#e8e0d4] bg-white/80 p-4">
      <p className="text-xs uppercase tracking-wider text-[#6b6158]">
        Şimdi ne yapmalıyım?
      </p>
      {habit ? (
        <>
          <h2 className="mt-2 text-base font-medium text-[#1a1612]">
            {oneriMetni(habit, min)}
          </h2>
          {habit.kimlik_ifadesi ? (
            <p className="mt-1 text-[11px] leading-snug text-[#6b6158]">
              {habit.kimlik_ifadesi}
            </p>
          ) : null}
          {min && habit.minimum_deger != null ? (
            <p className="mt-2 text-xs text-[#6b6158]">
              Yalnızca minimum sürüm yeterli.
            </p>
          ) : null}
          {habit.eger_kosulu && habit.o_zaman_davranis ? (
            <p className="mt-2 text-xs leading-relaxed text-[#6b6158]">
              Eğer {habit.eger_kosulu}, o zaman {habit.o_zaman_davranis}.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={pending}
              onClick={onYapildi}
              className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-[#1a1612] disabled:opacity-50"
            >
              Yapıldı
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onBaska}
              className={chipClass}
            >
              Başka öner
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onUygunDegil}
              className={chipClass}
            >
              Şimdi uygun değil
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-[#6b6158]">
          Şu an için önerilecek planlı bir davranış yok.
        </p>
      )}
    </section>
  );
}
