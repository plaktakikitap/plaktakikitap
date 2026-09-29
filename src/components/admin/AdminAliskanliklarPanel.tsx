"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { formatIstanbulLong, istanbulHour, startOfIsoWeekISO } from "@/lib/date/istanbul";
import type {
  Aliskanlik,
  AliskanlikAltAdim,
  AliskanlikAksamKayit,
  AliskanlikCevreAlani,
  AliskanlikDurtu,
  AliskanlikGunModu,
  AliskanlikGunu,
  AliskanlikHaftalikDegerlendirme,
  AliskanlikKayit,
} from "@/types/takip";
import { showAdminToast } from "./admin-toast-events";
import { DayModeSelector } from "./aliskanliklar/DayModeSelector";
import { ContextSelector } from "./aliskanliklar/ContextSelector";
import { NowSuggestionCard } from "./aliskanliklar/NowSuggestionCard";
import { HabitsTodayView } from "./aliskanliklar/HabitsTodayView";
import { HabitForm } from "./aliskanliklar/HabitForm";
import { HabitStats } from "./aliskanliklar/HabitStats";
import { WeeklyReview } from "./aliskanliklar/WeeklyReview";
import { HabitPlanSetup } from "./aliskanliklar/HabitPlanSetup";
import { EveningRitualCard } from "./aliskanliklar/EveningRitualCard";
import { EnvironmentMap } from "./aliskanliklar/EnvironmentMap";
import { ImpulseBrake } from "./aliskanliklar/ImpulseBrake";
import { postAliskanlik, replaceLog } from "./aliskanliklar/api";
import type { KayitPayload } from "./aliskanliklar/HabitCard";
import {
  isAksamSaati,
  pickNowSuggestion,
} from "@/lib/takip/aliskanlik-now";
import { missedLastPlanned } from "@/lib/takip/aliskanlik-schedule";

type Section = "bugun" | "olcum" | "hafta" | "plan" | "cevre" | "liste";

const SECTIONS: { id: Section; ad: string }[] = [
  { id: "bugun", ad: "Bugün" },
  { id: "cevre", ad: "Çevrem" },
  { id: "olcum", ad: "Ölçümler" },
  { id: "hafta", ad: "Haftalık" },
  { id: "plan", ad: "Plan" },
  { id: "liste", ad: "Yönet" },
];

export function AdminAliskanliklarPanel({
  initialHabits,
  initialLogs,
  initialGun,
  initialReviews,
  initialAksam,
  initialAksamSablon,
  initialCevre,
  initialDurtuler,
  today,
  initialHour,
}: {
  initialHabits: Aliskanlik[];
  initialLogs: AliskanlikKayit[];
  initialGun: AliskanlikGunu | null;
  initialReviews: AliskanlikHaftalikDegerlendirme[];
  initialAksam: AliskanlikAksamKayit | null;
  initialAksamSablon: AliskanlikAltAdim[];
  initialCevre: AliskanlikCevreAlani[];
  initialDurtuler: AliskanlikDurtu[];
  today: string;
  initialHour: number;
}) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [gun, setGun] = useState<AliskanlikGunu | null>(initialGun);
  const [reviews, setReviews] = useState(initialReviews);
  const [aksam, setAksam] = useState(initialAksam);
  const [aksamSablon, setAksamSablon] = useState(initialAksamSablon);
  const [cevre, setCevre] = useState(initialCevre);
  const [durtuler, setDurtuler] = useState(initialDurtuler);
  const [hour, setHour] = useState(initialHour);
  const [section, setSection] = useState<Section>("bugun");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const gunModu: AliskanlikGunModu = gun?.gun_modu ?? "normal";
  const hafta = startOfIsoWeekISO(today);
  const thisReview = useMemo(
    () => reviews.find((r) => r.hafta_baslangici === hafta) ?? null,
    [reviews, hafta]
  );

  useEffect(() => {
    const tick = () => setHour(istanbulHour());
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const oneri = useMemo(
    () => pickNowSuggestion({ habits, logs, today, hour, gun }),
    [habits, logs, today, hour, gun]
  );

  async function run<T>(
    key: string,
    body: Record<string, unknown>,
    apply: (data: T) => void
  ) {
    if (pendingId === key) return;
    setPendingId(key);
    try {
      const data = await postAliskanlik<T>(body);
      apply(data);
    } catch (e) {
      showAdminToast(
        "error",
        e instanceof Error ? e.message : "İşlem başarısız."
      );
    } finally {
      setPendingId(null);
    }
  }

  function onKayit(payload: KayitPayload) {
    const prev = logs;
    const optimistic: AliskanlikKayit = {
      id: `tmp-${payload.aliskanlik_id}`,
      aliskanlik_id: payload.aliskanlik_id,
      tarih: payload.tarih,
      tamamlandi: payload.durum
        ? ["minimum", "hedef", "bonus"].includes(payload.durum)
        : false,
      durum: payload.durum ?? null,
      deger: payload.deger ?? null,
      notlar: null,
      gun_modu: gunModu,
      kayit_zamani: new Date().toISOString(),
      alt_adimlar: {},
      ekstra: payload.ekstra ?? {},
    };
    const existing = logs.find(
      (l) =>
        l.aliskanlik_id === payload.aliskanlik_id && l.tarih === payload.tarih
    );
    if (existing && payload.alt_adim_kod) {
      optimistic.id = existing.id;
      optimistic.alt_adimlar = {
        ...existing.alt_adimlar,
        [payload.alt_adim_kod]: Boolean(payload.alt_adim_deger),
      };
      optimistic.durum = existing.durum;
      optimistic.tamamlandi = existing.tamamlandi;
      optimistic.deger = existing.deger;
      optimistic.ekstra = { ...existing.ekstra, ...payload.ekstra };
    }
    if (payload.geri_al) {
      setLogs((p) =>
        p.filter(
          (l) =>
            !(
              l.aliskanlik_id === payload.aliskanlik_id &&
              l.tarih === payload.tarih
            )
        )
      );
    } else {
      setLogs((p) => replaceLog(p, optimistic));
    }
    void (async () => {
      setPendingId(payload.aliskanlik_id);
      try {
        const data = await postAliskanlik<AliskanlikKayit>({
          action: payload.geri_al
            ? "geri-al"
            : payload.alt_adim_kod
              ? "alt-adim"
              : "kayit",
          ...payload,
          gun_modu: gunModu,
        });
        setLogs((p) => replaceLog(p, data));
      } catch (e) {
        setLogs(prev);
        showAdminToast(
          "error",
          e instanceof Error ? e.message : "Kayıt güncellenemedi."
        );
      } finally {
        setPendingId(null);
      }
    })();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-[#6b6158]">{formatIstanbulLong(today)}</p>
        <nav className="flex flex-wrap gap-1.5" aria-label="Bölümler">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs ${
                section === s.id
                  ? "bg-[#b8934a]/20 text-[#1a1612]"
                  : "text-[#6b6158] hover:bg-[#1a1612]/5"
              }`}
            >
              {s.ad}
            </button>
          ))}
        </nav>
      </div>

      {section === "bugun" ? (
        <div className="space-y-6">
          <NowSuggestionCard
            habit={oneri}
            gunModu={gunModu}
            baglam={gun?.baglam ?? null}
            missed={
              oneri
                ? gunModu === "normal" &&
                  missedLastPlanned(oneri, today, logs)
                : false
            }
            pending={pendingId === "oneri"}
            onYapildi={() => {
              if (!oneri) return;
              void run<{ gun: AliskanlikGunu; kayit: AliskanlikKayit | null }>(
                "oneri",
                {
                  action: "oneri",
                  aliskanlik_id: oneri.id,
                  eylem: "yapildi",
                  tarih: today,
                },
                (data) => {
                  setGun(data.gun);
                  if (data.kayit) setLogs((p) => replaceLog(p, data.kayit!));
                }
              );
            }}
            onBaska={() => {
              if (!oneri) return;
              void run<{ gun: AliskanlikGunu }>(
                "oneri",
                {
                  action: "oneri",
                  aliskanlik_id: oneri.id,
                  eylem: "baska",
                  tarih: today,
                },
                (data) => setGun(data.gun)
              );
            }}
            onUygunDegil={() => {
              if (!oneri) return;
              void run<{ gun: AliskanlikGunu }>(
                "oneri",
                {
                  action: "oneri",
                  aliskanlik_id: oneri.id,
                  eylem: "uygun_degil",
                  tarih: today,
                },
                (data) => setGun(data.gun)
              );
            }}
          />
          <DayModeSelector
            gun={gun}
            disabled={pendingId === "gun"}
            onChange={(modu) =>
              void run<AliskanlikGunu>(
                "gun",
                { action: "gun-modu", tarih: today, gun_modu: modu },
                (data) => {
                  setGun(data);
                  showAdminToast("success", "Gün modu kaydedildi.");
                }
              )
            }
          />
          <ContextSelector
            value={gun?.baglam ?? null}
            disabled={pendingId === "baglam"}
            onChange={(baglam) =>
              void run<AliskanlikGunu>(
                "baglam",
                { action: "baglam", tarih: today, baglam },
                (data) => setGun(data)
              )
            }
          />
          <ImpulseBrake
            records={durtuler}
            pending={pendingId === "durtu"}
            onStart={async (input) => {
              try {
                setPendingId("durtu");
                const row = await postAliskanlik<AliskanlikDurtu>({
                  action: "durtu-ac",
                  ...input,
                });
                setDurtuler((p) => [row, ...p]);
                return row;
              } catch (e) {
                showAdminToast(
                  "error",
                  e instanceof Error ? e.message : "Kayıt alınamadı."
                );
                return null;
              } finally {
                setPendingId(null);
              }
            }}
            onClose={(id, patch) =>
              void run<AliskanlikDurtu>(
                "durtu",
                { action: "durtu-kapat", id, ...patch },
                (data) =>
                  setDurtuler((p) => p.map((d) => (d.id === data.id ? data : d)))
              )
            }
          />
          {isAksamSaati(hour) ? (
            <EveningRitualCard
              today={today}
              habits={habits}
              logs={logs}
              kayit={aksam}
              sablon={aksamSablon}
              pending={pendingId === "aksam"}
              onToggle={(kod, deger) =>
                void run<AliskanlikAksamKayit>(
                  "aksam",
                  { action: "aksam", tarih: today, adim_kod: kod, adim_deger: deger },
                  setAksam
                )
              }
              onIlkDavranis={(value) =>
                void run<AliskanlikAksamKayit>(
                  "aksam",
                  { action: "aksam", tarih: today, ilk_davranis: value },
                  setAksam
                )
              }
              onSaveSablon={(adimlar) =>
                void run<{ sablon: AliskanlikAltAdim[] }>(
                  "aksam",
                  { action: "aksam", adimlar_sablon: adimlar },
                  (data) => setAksamSablon(data.sablon)
                )
              }
            />
          ) : null}
          <HabitsTodayView
            habits={habits}
            logs={logs}
            today={today}
            hour={hour}
            gunModu={gunModu}
            baglam={gun?.baglam ?? null}
            pendingId={pendingId}
            onKayit={onKayit}
          />
        </div>
      ) : null}

      {section === "olcum" ? (
        <HabitStats habits={habits} logs={logs} today={today} />
      ) : null}

      {section === "hafta" ? (
        <WeeklyReview
          habits={habits}
          logs={logs}
          today={today}
          existing={thisReview}
          pending={pendingId === "hafta"}
          onSave={(body) =>
            void run<AliskanlikHaftalikDegerlendirme>(
              "hafta",
              body,
              (data) => {
                setReviews((prev) => {
                  const rest = prev.filter(
                    (r) => r.hafta_baslangici !== data.hafta_baslangici
                  );
                  return [data, ...rest];
                });
                showAdminToast("success", "Değerlendirme kaydedildi.");
              }
            )
          }
        />
      ) : null}

      {section === "cevre" ? (
        <EnvironmentMap
          alanlar={cevre}
          pendingId={pendingId}
          onSave={(id, patch) =>
            void run<AliskanlikCevreAlani>(
              id,
              { action: "cevre", id, ...patch },
              (data) =>
                setCevre((prev) => {
                  const next = prev.map((a) => (a.id === data.id ? data : a));
                  if (data.bu_hafta_aktif) {
                    return next.map((a) =>
                      a.id === data.id ? data : { ...a, bu_hafta_aktif: false }
                    );
                  }
                  return next;
                })
            )
          }
        />
      ) : null}

      {section === "plan" ? (
        <HabitPlanSetup
          habits={habits}
          pending={pendingId === "plan"}
          onPreviewApply={(maxAsama) =>
            void run<{ eklendi: Aliskanlik[]; atlanan: string[] }>(
              "plan",
              { action: "plan-kur", maxAsama },
              (data) => {
                if (data.eklendi.length) {
                  setHabits((prev) => [...prev, ...data.eklendi]);
                }
                showAdminToast(
                  "success",
                  data.eklendi.length
                    ? `${data.eklendi.length} alışkanlık eklendi.`
                    : "Eklenecek yeni alışkanlık yok."
                );
              }
            )
          }
          onActivateStage={(asama) =>
            void run<{ updated: Aliskanlik[] }>(
              "plan",
              { action: "asama-etkinlestir", asama },
              (data) => {
                const map = new Map(data.updated.map((h) => [h.id, h]));
                setHabits((prev) =>
                  prev.map((h) => map.get(h.id) ?? h)
                );
                showAdminToast("success", `${asama}. hafta etkin.`);
              }
            )
          }
        />
      ) : null}

      {section === "liste" ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowNew((o) => !o);
                setEditId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e8e0d4] px-3 py-2 text-xs text-[#1a1612]/70 hover:bg-[#1a1612]/5"
            >
              <Plus className="h-3.5 w-3.5" />
              Yeni alışkanlık
            </button>
          </div>
          {showNew ? (
            <HabitForm
              loading={pendingId === "create"}
              onCancel={() => setShowNew(false)}
              onSubmit={(values) =>
                void run<Aliskanlik>(
                  "create",
                  { action: "create", ...values },
                  (data) => {
                    setHabits((prev) => [...prev, data]);
                    setShowNew(false);
                    showAdminToast("success", "Alışkanlık eklendi.");
                  }
                )
              }
            />
          ) : null}
          <ul className="space-y-2">
            {habits.length === 0 ? (
              <li className="text-sm text-[#1a1612]/40">Henüz alışkanlık yok.</li>
            ) : (
              habits.map((h) => (
                <li
                  key={h.id}
                  className="rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3"
                >
                  {editId === h.id ? (
                    <HabitForm
                      initial={h}
                      loading={pendingId === h.id}
                      onCancel={() => setEditId(null)}
                      onSubmit={(values) =>
                        void run<Aliskanlik>(
                          h.id,
                          { action: "update", id: h.id, ...values },
                          (data) => {
                            setHabits((prev) =>
                              prev.map((x) => (x.id === data.id ? data : x))
                            );
                            setEditId(null);
                            showAdminToast("success", "Güncellendi.");
                          }
                        )
                      }
                    />
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm ${
                            h.aktif && !h.arsivlendi
                              ? "text-[#1a1612]"
                              : "text-[#1a1612]/40"
                          }`}
                        >
                          {h.ad}
                        </p>
                        <p className="text-[11px] text-[#6b6158]">
                          {[h.kategori, h.arsivlendi ? "arşiv" : h.aktif ? "aktif" : "pasif"]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label="Düzenle"
                          onClick={() => setEditId(h.id)}
                          className="rounded-lg p-1.5 text-[#6b6158] hover:text-[#1a1612]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={h.aktif ? "Pasife al" : "Aktifleştir"}
                          onClick={() =>
                            void run<Aliskanlik>(
                              h.id,
                              {
                                action: "set-aktif",
                                id: h.id,
                                aktif: !h.aktif,
                              },
                              (data) => {
                                setHabits((prev) =>
                                  prev.map((x) => (x.id === data.id ? data : x))
                                );
                              }
                            )
                          }
                          className="rounded-lg p-1.5 text-[#6b6158] hover:text-[#1a1612]"
                        >
                          {h.aktif ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        {confirmId === h.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-[#6b6158]">
                              Arşivlensin mi?
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void run<Aliskanlik>(
                                  h.id,
                                  {
                                    action: "arsivle",
                                    id: h.id,
                                    arsivlendi: !h.arsivlendi,
                                  },
                                  (data) => {
                                    setHabits((prev) =>
                                      prev.map((x) =>
                                        x.id === data.id ? data : x
                                      )
                                    );
                                    setConfirmId(null);
                                    showAdminToast(
                                      "success",
                                      data.arsivlendi
                                        ? "Arşivlendi."
                                        : "Arşivden alındı."
                                    );
                                  }
                                )
                              }
                              className="rounded-lg bg-[#1a1612]/10 px-2.5 py-1 text-xs font-medium text-[#1a1612]"
                            >
                              {h.arsivlendi ? "Geri al" : "Arşivle"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="rounded-lg border border-[#e8e0d4] px-2.5 py-1 text-xs text-[#6b6158]"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label="Arşivle"
                            onClick={() => setConfirmId(h.id)}
                            className="rounded-lg p-1.5 text-[#6b6158] hover:text-[#1a1612]"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
