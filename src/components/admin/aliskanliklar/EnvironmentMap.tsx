"use client";

import { useState } from "react";
import type { AliskanlikCevreAlani } from "@/types/takip";
import { CEVRE_ALANLARI } from "@/lib/takip/aliskanlik-now";
import { fieldClass } from "./api";

function label(alan: AliskanlikCevreAlani["alan"]) {
  return CEVRE_ALANLARI.find((a) => a.id === alan)?.ad ?? alan;
}

export function EnvironmentMap({
  alanlar,
  pendingId,
  onSave,
}: {
  alanlar: AliskanlikCevreAlani[];
  pendingId: string | null;
  onSave: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const haftalik = alanlar.find((a) => a.bu_hafta_aktif) ?? null;

  return (
    <div className="space-y-5">
      {haftalik ? (
        <section className="rounded-2xl border border-[#e8e0d4] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-wider text-[#6b6158]">
            Bu haftanın çevre değişikliği
          </p>
          <p className="mt-1 text-sm font-medium text-[#1a1612]">
            {label(haftalik.alan)}
          </p>
          <p className="mt-1 text-sm text-[#6b6158]">
            {haftalik.haftanin_degisikligi || "Henüz yazılmadı."}
          </p>
          <label className="mt-3 flex items-center gap-2 text-sm text-[#1a1612]">
            <input
              type="checkbox"
              checked={haftalik.tamamlandi}
              disabled={pendingId === haftalik.id}
              onChange={(e) =>
                onSave(haftalik.id, { tamamlandi: e.target.checked })
              }
            />
            Bu hafta uygulandı
          </label>
        </section>
      ) : (
        <p className="text-sm text-[#6b6158]">
          Bu hafta için tek bir çevre değişikliği seç. Uzun liste tutma.
        </p>
      )}
      <ul className="space-y-2">
        {alanlar.map((a) => {
          const open = openId === a.id;
          return (
            <li
              key={a.id}
              className="rounded-2xl border border-[#e8e0d4] bg-white/60 p-4"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : a.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-[#1a1612]">
                  {label(a.alan)}
                </span>
                <span className="text-[11px] text-[#6b6158]">
                  {a.bu_hafta_aktif ? "bu hafta" : open ? "kapat" : "düzenle"}
                </span>
              </button>
              {open ? (
                <CevreForm
                  alan={a}
                  pending={pendingId === a.id}
                  onSave={onSave}
                />
              ) : a.desteklenen_davranis ? (
                <p className="mt-2 text-xs text-[#6b6158]">
                  {a.desteklenen_davranis}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CevreForm({
  alan,
  pending,
  onSave,
}: {
  alan: AliskanlikCevreAlani;
  pending?: boolean;
  onSave: (id: string, patch: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    desteklenen_davranis: alan.desteklenen_davranis ?? "",
    gorunur_isaret: alan.gorunur_isaret ?? "",
    kaldirilacak_engel: alan.kaldirilacak_engel ?? "",
    surtunme: alan.surtunme ?? "",
    haftanin_degisikligi: alan.haftanin_degisikligi ?? "",
  });

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(alan.id, v);
      }}
    >
      <input
        value={v.desteklenen_davranis}
        onChange={(e) =>
          setV((p) => ({ ...p, desteklenen_davranis: e.target.value }))
        }
        placeholder="Desteklemek istediğim davranış"
        className={fieldClass}
      />
      <input
        value={v.gorunur_isaret}
        onChange={(e) =>
          setV((p) => ({ ...p, gorunur_isaret: e.target.value }))
        }
        placeholder="Görünür kılacağım işaret"
        className={fieldClass}
      />
      <input
        value={v.kaldirilacak_engel}
        onChange={(e) =>
          setV((p) => ({ ...p, kaldirilacak_engel: e.target.value }))
        }
        placeholder="Kaldıracağım engel"
        className={fieldClass}
      />
      <input
        value={v.surtunme}
        onChange={(e) => setV((p) => ({ ...p, surtunme: e.target.value }))}
        placeholder="Kötü alışkanlığa ekleyeceğim sürtünme"
        className={fieldClass}
      />
      <input
        value={v.haftanin_degisikligi}
        onChange={(e) =>
          setV((p) => ({ ...p, haftanin_degisikligi: e.target.value }))
        }
        placeholder="Bu haftanın tek çevre değişikliği"
        className={fieldClass}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-[#1a1612] disabled:opacity-50"
        >
          Kaydet
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onSave(alan.id, {
              bu_hafta_aktif: !alan.bu_hafta_aktif,
              haftanin_degisikligi: v.haftanin_degisikligi,
            })
          }
          className="rounded-xl border border-[#e8e0d4] px-3 py-1.5 text-xs text-[#6b6158]"
        >
          {alan.bu_hafta_aktif
            ? "Bu haftadan çıkar"
            : "Bu haftanın değişikliği yap"}
        </button>
      </div>
    </form>
  );
}
