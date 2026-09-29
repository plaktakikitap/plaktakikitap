"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Flame,
  Trophy,
  ChevronRight,
  Check,
  X,
  PenLine,
  List,
  Brain,
  FileText,
  Lock,
} from "lucide-react";
import type {
  Dil,
  DilIlerleme,
  QuizSorusu,
  Seviye,
  YaziOdevi,
} from "@/types/dil-ogrenme";
import {
  bugunkunOdevGetir,
  cevapKaydet,
  quizSorularUret,
  yaziGonder,
} from "@/app/actions/dil-ogrenme";

const DL_ADI: Record<Dil, string> = {
  ingilizce: "🇬🇧 İngilizce",
  fransizca: "🇫🇷 Fransızca",
  almanca: "🇩🇪 Almanca",
};

const SEV_RENK: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800 border-emerald-200",
  A2: "bg-teal-100 text-teal-800 border-teal-200",
  B1: "bg-sky-100 text-sky-800 border-sky-200",
  B2: "bg-violet-100 text-violet-800 border-violet-200",
  C1: "bg-amber-100 text-amber-800 border-amber-200",
  C2: "bg-rose-100 text-rose-800 border-rose-200",
};

type Sekme = "ilerleme" | "quiz" | "yazi";
type QuizDurum = "bekliyor" | "cevaplandi" | "bitti";

type YaziSonuc = {
  puan: number | null;
  gramer?: string;
  kelime_kullanimi?: string;
  oneri?: string;
  iyi_yonler?: string;
};

function parseYaziSonuc(raw: {
  puan: number | null;
  ai_geri_bildirim: string | null;
}): YaziSonuc {
  let parsed: Record<string, unknown> = {};
  if (raw.ai_geri_bildirim) {
    try {
      parsed = JSON.parse(raw.ai_geri_bildirim) as Record<string, unknown>;
    } catch {
      parsed = { oneri: raw.ai_geri_bildirim };
    }
  }
  const puan =
    raw.puan ??
    (typeof parsed.puan === "number" ? parsed.puan : Number(parsed.puan) || null);
  return {
    puan,
    gramer: parsed.gramer ? String(parsed.gramer) : undefined,
    kelime_kullanimi: parsed.kelime_kullanimi
      ? String(parsed.kelime_kullanimi)
      : undefined,
    oneri: parsed.oneri ? String(parsed.oneri) : undefined,
    iyi_yonler: parsed.iyi_yonler ? String(parsed.iyi_yonler) : undefined,
  };
}

function XpBadge({ xp, streak }: { xp: number; streak: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-1 font-semibold text-[#b8934a]">
        <Zap size={14} className="fill-[#b8934a]" />
        {xp} XP
      </span>
      {streak > 0 ? (
        <span className="flex items-center gap-1 font-semibold text-orange-600">
          <Flame size={14} className="fill-orange-600" />
          {streak} gün
        </span>
      ) : null}
    </div>
  );
}

function IlerlemeHalka({
  yuzde,
  seviye,
  kilitli,
}: {
  yuzde: number;
  seviye: string;
  kilitli?: boolean;
}) {
  const r = 20;
  const cember = 2 * Math.PI * r;
  const dolu = (yuzde / 100) * cember;

  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="#e8e0d4"
            strokeWidth="4"
          />
          {!kilitli ? (
            <circle
              cx="24"
              cy="24"
              r={r}
              fill="none"
              stroke={yuzde >= 80 ? "#22c55e" : "#b8934a"}
              strokeWidth="4"
              strokeDasharray={`${dolu} ${cember - dolu}`}
              strokeLinecap="round"
            />
          ) : null}
        </svg>
        {kilitli ? (
          <Lock
            size={16}
            className="absolute inset-0 m-auto text-[#6b6158]/40"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1a1612]">
            {yuzde}%
          </span>
        )}
      </div>
      <span
        className={`rounded border px-2 py-0.5 text-xs font-semibold ${SEV_RENK[seviye]} ${kilitli ? "opacity-40" : ""}`}
      >
        {seviye}
      </span>
    </div>
  );
}

export default function AdminDilOgrenmePanel({
  dil,
  secilenSeviye,
  ilerleme,
}: {
  dil: Dil;
  secilenSeviye: Seviye;
  ilerleme: DilIlerleme;
}) {
  const router = useRouter();
  const [sekme, setSekme] = useState<Sekme>("ilerleme");
  const [secilenSev, setSecilenSev] = useState<Seviye>(secilenSeviye);

  const [quizSorular, setQuizSorular] = useState<QuizSorusu[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizDurum, setQuizDurum] = useState<QuizDurum>("bekliyor");
  const [secilenCevap, setSecilenCevap] = useState<string | null>(null);
  const [sonuclar, setSonuclar] = useState({ dogru: 0, yanlis: 0 });
  const [yanlisSorular, setYanlisSorular] = useState<QuizSorusu[]>([]);
  const [quizYukleniyor, setQuizYukleniyor] = useState(false);
  const [kazanilanXp, setKazanilanXp] = useState(0);

  const [odev, setOdev] = useState<YaziOdevi | null>(null);
  const [yaziMetin, setYaziMetin] = useState("");
  const [yaziGonderiliyor, setYaziGonderiliyor] = useState(false);
  const [yaziSonuc, setYaziSonuc] = useState<YaziSonuc | null>(null);

  const seviyeBilgi = ilerleme.seviyeler.find((s) => s.seviye === secilenSev);
  const mevcutSeviye =
    [...ilerleme.seviyeler].reverse().find((s) => s.acildi)?.seviye ?? "A1";

  const quizBaslat = useCallback(async () => {
    setQuizYukleniyor(true);
    try {
      const sorular = await quizSorularUret(dil, secilenSev, 10);
      setQuizSorular(sorular);
      setQuizIndex(0);
      setSecilenCevap(null);
      setQuizDurum("bekliyor");
      setSonuclar({ dogru: 0, yanlis: 0 });
      setYanlisSorular([]);
      setKazanilanXp(0);
      setSekme("quiz");
    } finally {
      setQuizYukleniyor(false);
    }
  }, [dil, secilenSev]);

  const cevapSec = useCallback(
    async (cevap: string) => {
      if (secilenCevap !== null) return;
      const soru = quizSorular[quizIndex];
      if (!soru) return;

      setSecilenCevap(cevap);
      setQuizDurum("cevaplandi");

      const dogru = cevap === soru.dogru_cevap;
      try {
        const { xp } = await cevapKaydet(soru.kelime.id, dogru, dil);
        setKazanilanXp((p) => p + xp);
      } catch {
        /* kayıt hatası quiz'i durdurmasın */
      }

      if (dogru) {
        setSonuclar((p) => ({ ...p, dogru: p.dogru + 1 }));
      } else {
        setSonuclar((p) => ({ ...p, yanlis: p.yanlis + 1 }));
        setYanlisSorular((p) => [...p, soru]);
      }
    },
    [secilenCevap, quizSorular, quizIndex, dil]
  );

  const sonrakiSoru = useCallback(() => {
    const sonraki = quizIndex + 1;
    if (sonraki >= quizSorular.length) {
      if (yanlisSorular.length > 0) {
        setQuizSorular((p) => [...p, ...yanlisSorular]);
        setYanlisSorular([]);
        setQuizIndex(sonraki);
        setSecilenCevap(null);
        setQuizDurum("bekliyor");
        return;
      }
      setQuizDurum("bitti");
      return;
    }
    setQuizIndex(sonraki);
    setSecilenCevap(null);
    setQuizDurum("bekliyor");
  }, [quizIndex, quizSorular.length, yanlisSorular]);

  useEffect(() => {
    if (sekme !== "yazi") return;
    let iptal = false;
    bugunkunOdevGetir(dil, secilenSev).then((row) => {
      if (iptal) return;
      if (!row) {
        setOdev(null);
        return;
      }
      setOdev({
        id: String(row.id),
        dil,
        seviye: secilenSev,
        prompt_tr: String(row.prompt_tr ?? ""),
        hedef_kelimeler: Array.isArray(row.hedef_kelimeler)
          ? (row.hedef_kelimeler as string[])
          : [],
        tarih: String(row.tarih ?? ""),
      });
    });
    return () => {
      iptal = true;
    };
  }, [sekme, dil, secilenSev]);

  const yaziGonderAction = useCallback(async () => {
    if (!odev || !yaziMetin.trim()) return;
    setYaziGonderiliyor(true);
    try {
      const sonuc = await yaziGonder({
        odev_id: odev.id,
        dil,
        metin: yaziMetin,
      });
      setYaziSonuc(parseYaziSonuc(sonuc));
    } finally {
      setYaziGonderiliyor(false);
    }
  }, [odev, yaziMetin, dil]);

  const mevcutSoru = quizSorular[quizIndex];
  const toplamSoru = quizSorular.length;

  return (
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-[#faf7f2] sm:-mx-8 lg:-mx-10">
      <header className="sticky top-14 z-20 border-b border-[#e8e0d4] bg-[#faf7f2]/95 backdrop-blur lg:top-0">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.push("/secretgate/diller")}
            className="flex items-center gap-2 text-sm text-[#6b6158] transition-colors hover:text-[#1a1612]"
          >
            <ArrowLeft size={16} />
            Diller
          </button>
          <h1 className="font-semibold text-[#1a1612]">{DL_ADI[dil]}</h1>
          <XpBadge xp={ilerleme.bugun_xp + kazanilanXp} streak={ilerleme.streak} />
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
          {ilerleme.seviyeler.map((sv) => (
            <button
              key={sv.seviye}
              type="button"
              onClick={() => sv.acildi && setSecilenSev(sv.seviye)}
              className={`flex-shrink-0 transition-all ${sv.acildi ? "cursor-pointer" : "cursor-not-allowed"}`}
            >
              <IlerlemeHalka
                yuzde={sv.yuzde}
                seviye={sv.seviye}
                kilitli={!sv.acildi}
              />
            </button>
          ))}
        </div>

        {seviyeBilgi ? (
          <div className="rounded-xl border border-[#e8e0d4] bg-white/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded border px-2 py-1 text-sm font-semibold ${SEV_RENK[secilenSev]}`}
              >
                {secilenSev} Seviyesi
              </span>
              <span className="text-sm text-[#6b6158]">
                {seviyeBilgi.ustalasildi}/{seviyeBilgi.toplam} ustalaşıldı
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { label: "Yeni", sayi: seviyeBilgi.yeni, renk: "text-[#6b6158]" },
                {
                  label: "Öğreniyor",
                  sayi: seviyeBilgi.ogreniyor,
                  renk: "text-sky-600",
                },
                {
                  label: "Tekrar",
                  sayi: seviyeBilgi.tekrar,
                  renk: "text-amber-600",
                },
                {
                  label: "Ustalaştı",
                  sayi: seviyeBilgi.ustalasildi,
                  renk: "text-emerald-600",
                },
              ].map(({ label, sayi, renk }) => (
                <div key={label} className="rounded-lg bg-[#faf7f2] p-2">
                  <div className={`text-lg font-bold ${renk}`}>{sayi}</div>
                  <div className="text-[#6b6158]">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8e0d4]">
              <div
                className="h-full rounded-full bg-[#b8934a] transition-all"
                style={{ width: `${seviyeBilgi.yuzde}%` }}
              />
            </div>
            {seviyeBilgi.yuzde >= 80 ? (
              <p className="mt-1 text-xs font-medium text-emerald-600">
                ✓ Bir sonraki seviye açık!
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#6b6158]">
                Sonraki seviye için %80 ustalaş
              </p>
            )}
          </div>
        ) : null}

        <div className="flex rounded-xl bg-[#e8e0d4]/50 p-1">
          {(
            [
              { id: "ilerleme", label: "Kelimeler", icon: List },
              { id: "quiz", label: "Quiz", icon: Brain },
              { id: "yazi", label: "Yazı Ödevi", icon: PenLine },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSekme(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${
                sekme === id
                  ? "bg-white text-[#1a1612] shadow-sm"
                  : "text-[#6b6158] hover:text-[#1a1612]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {sekme === "ilerleme" && seviyeBilgi ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={quizBaslat}
              disabled={quizYukleniyor || seviyeBilgi.toplam === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8934a] py-3 font-semibold text-white transition-colors hover:bg-[#a07840] disabled:opacity-50"
            >
              <Brain size={18} />
              {quizYukleniyor ? "Hazırlanıyor..." : `Quiz Başlat (${secilenSev})`}
            </button>

            {seviyeBilgi.toplam === 0 ? (
              <div className="py-12 text-center text-[#6b6158]">
                <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Bu seviyede henüz kelime yok</p>
                <p className="mt-1 text-sm">
                  Kelime eklemek için Diller &gt; Banka sekmesine git
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-[#6b6158]">
                {seviyeBilgi.toplam} kelime — {seviyeBilgi.yeni} yeni,{" "}
                {seviyeBilgi.ogreniyor} öğreniliyor, {seviyeBilgi.tekrar} tekrar
                bekliyor, {seviyeBilgi.ustalasildi} ustalaşıldı
              </p>
            )}
          </div>
        ) : null}

        {sekme === "quiz" ? (
          <div className="space-y-4">
            {quizSorular.length === 0 ? (
              <div className="py-12 text-center text-[#6b6158]">
                <Brain size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">
                  Quiz başlatmak için kelimeler sekmesine git
                </p>
                <button
                  type="button"
                  onClick={() => setSekme("ilerleme")}
                  className="mt-3 text-sm text-[#b8934a] underline"
                >
                  Kelimeler sekmesine dön
                </button>
              </div>
            ) : quizDurum === "bitti" ? (
              <div className="space-y-4 rounded-2xl border border-[#e8e0d4] bg-white/80 p-6 text-center">
                <Trophy size={40} className="mx-auto text-[#b8934a]" />
                <h2 className="text-xl font-bold text-[#1a1612]">Quiz Bitti!</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-2xl font-bold text-emerald-700">
                      {sonuclar.dogru}
                    </div>
                    <div className="text-xs text-emerald-600">Doğru</div>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <div className="text-2xl font-bold text-red-700">
                      {sonuclar.yanlis}
                    </div>
                    <div className="text-xs text-red-600">Yanlış</div>
                  </div>
                  <div className="rounded-xl border border-[#b8934a]/20 bg-[#b8934a]/10 p-3">
                    <div className="text-2xl font-bold text-[#b8934a]">
                      +{kazanilanXp}
                    </div>
                    <div className="text-xs text-[#b8934a]">XP kazandı</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={quizBaslat}
                    className="flex-1 rounded-xl bg-[#b8934a] py-2.5 font-medium text-white transition-colors hover:bg-[#a07840]"
                  >
                    Tekrar Oyna
                  </button>
                  <button
                    type="button"
                    onClick={() => setSekme("ilerleme")}
                    className="flex-1 rounded-xl border border-[#e8e0d4] py-2.5 font-medium text-[#6b6158] transition-colors hover:text-[#1a1612]"
                  >
                    Kelimeler
                  </button>
                </div>
              </div>
            ) : mevcutSoru ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8e0d4]">
                    <div
                      className="h-full rounded-full bg-[#b8934a] transition-all"
                      style={{
                        width: `${(quizIndex / Math.max(toplamSoru, 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="flex-shrink-0 text-xs text-[#6b6158]">
                    {quizIndex + 1}/{toplamSoru}
                  </span>
                </div>

                <div className="rounded-2xl border border-[#e8e0d4] bg-white/80 p-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#6b6158]">
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${SEV_RENK[mevcutSoru.kelime.seviye]}`}
                    >
                      {mevcutSoru.kelime.seviye}
                    </span>
                    <span className="capitalize text-[#6b6158]">
                      {mevcutSoru.kelime.tip}
                    </span>
                  </div>
                  <div className="my-4 text-center text-xl font-bold text-[#1a1612]">
                    {mevcutSoru.yon === "tr_to_target"
                      ? mevcutSoru.kelime.anlam_tr
                      : mevcutSoru.kelime.hedef_dil}
                  </div>
                  <p className="text-center text-xs text-[#6b6158]">
                    {mevcutSoru.yon === "tr_to_target"
                      ? `${DL_ADI[dil].split(" ")[1]} karşılığı nedir?`
                      : "Türkçe anlamı nedir?"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {mevcutSoru.secenekler.map((secenek, i) => {
                    const dogruMu = secenek === mevcutSoru.dogru_cevap;
                    const secildiMi = secenek === secilenCevap;
                    let stil =
                      "bg-white border-[#e8e0d4] text-[#1a1612] hover:border-[#b8934a]";
                    if (quizDurum === "cevaplandi") {
                      if (dogruMu)
                        stil = "bg-emerald-50 border-emerald-500 text-emerald-800";
                      else if (secildiMi)
                        stil = "bg-red-50 border-red-500 text-red-800";
                      else
                        stil =
                          "bg-white border-[#e8e0d4] text-[#6b6158] opacity-50";
                    }
                    return (
                      <button
                        key={`${i}-${secenek}`}
                        type="button"
                        onClick={() => cevapSec(secenek)}
                        className={`rounded-xl border-2 px-4 py-3 text-left font-medium transition-all ${stil}`}
                      >
                        <span className="flex items-center justify-between">
                          {secenek}
                          {quizDurum === "cevaplandi" && dogruMu ? (
                            <Check size={16} className="text-emerald-600" />
                          ) : null}
                          {quizDurum === "cevaplandi" &&
                          secildiMi &&
                          !dogruMu ? (
                            <X size={16} className="text-red-600" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {quizDurum === "cevaplandi" ? (
                  <div className="space-y-2">
                    {mevcutSoru.kelime.ornek_cumle ? (
                      <div className="rounded-xl border border-[#b8934a]/20 bg-[#b8934a]/8 p-3">
                        <p className="text-sm font-medium italic text-[#1a1612]">
                          &ldquo;{mevcutSoru.kelime.ornek_cumle}&rdquo;
                        </p>
                        {mevcutSoru.kelime.ornek_cumle_tr ? (
                          <p className="mt-1 text-xs text-[#6b6158]">
                            {mevcutSoru.kelime.ornek_cumle_tr}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={sonrakiSoru}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1612] py-3 font-semibold text-white transition-colors hover:bg-[#2d2520]"
                    >
                      {quizIndex + 1 >= toplamSoru &&
                      yanlisSorular.length === 0 ? (
                        <>
                          <Trophy size={16} /> Sonuçları Gör
                        </>
                      ) : (
                        <>
                          Devam <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {sekme === "yazi" ? (
          <div className="space-y-4">
            {!odev ? (
              <div className="py-12 text-center text-[#6b6158]">
                <FileText size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Bugün için yazı ödevi yok</p>
                <p className="mt-1 text-sm">
                  Admin panelinden {secilenSev} seviyesi için bugünkü ödevi ekle
                </p>
              </div>
            ) : yaziSonuc ? (
              <div className="space-y-4">
                <div className="space-y-3 rounded-2xl border border-[#e8e0d4] bg-white/80 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#1a1612]">
                      AI Geri Bildirimi
                    </h3>
                    <span
                      className={`text-2xl font-bold ${
                        (yaziSonuc.puan ?? 0) >= 80
                          ? "text-emerald-600"
                          : (yaziSonuc.puan ?? 0) >= 60
                            ? "text-[#b8934a]"
                            : "text-red-600"
                      }`}
                    >
                      {yaziSonuc.puan ?? "?"}/100
                    </span>
                  </div>
                  {yaziSonuc.iyi_yonler ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-emerald-700">
                        ✓ İyi Yönler
                      </p>
                      <p className="text-sm text-emerald-800">
                        {yaziSonuc.iyi_yonler}
                      </p>
                    </div>
                  ) : null}
                  {yaziSonuc.gramer ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-[#6b6158]">
                        Dil Bilgisi
                      </p>
                      <p className="text-sm text-[#1a1612]">{yaziSonuc.gramer}</p>
                    </div>
                  ) : null}
                  {yaziSonuc.kelime_kullanimi ? (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-[#6b6158]">
                        Kelime Kullanımı
                      </p>
                      <p className="text-sm text-[#1a1612]">
                        {yaziSonuc.kelime_kullanimi}
                      </p>
                    </div>
                  ) : null}
                  {yaziSonuc.oneri ? (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                      <p className="mb-1 text-xs font-semibold text-sky-700">
                        💡 Öneri
                      </p>
                      <p className="text-sm text-sky-800">{yaziSonuc.oneri}</p>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setYaziSonuc(null);
                    setYaziMetin("");
                  }}
                  className="w-full rounded-xl border border-[#e8e0d4] py-2.5 text-[#6b6158] transition-colors hover:text-[#1a1612]"
                >
                  Tekrar Yaz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e8e0d4] bg-white/80 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${SEV_RENK[secilenSev]}`}
                    >
                      {secilenSev}
                    </span>
                    <span className="text-xs text-[#6b6158]">Bugünkü Görev</span>
                  </div>
                  <p className="font-medium text-[#1a1612]">{odev.prompt_tr}</p>
                </div>

                <textarea
                  value={yaziMetin}
                  onChange={(e) => setYaziMetin(e.target.value)}
                  placeholder={`${DL_ADI[dil].split(" ")[1]} ile yaz...`}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-[#e8e0d4] bg-white/60 px-4 py-3 text-sm text-[#1a1612] placeholder-[#6b6158]/50 focus:outline-none focus:ring-2 focus:ring-[#b8934a]/40"
                />

                <div className="flex items-center justify-between text-xs text-[#6b6158]">
                  <span>
                    {yaziMetin.split(/\s+/).filter(Boolean).length} kelime
                  </span>
                  <span>Min. 50 kelime önerilir</span>
                </div>

                <button
                  type="button"
                  onClick={yaziGonderAction}
                  disabled={yaziGonderiliyor || yaziMetin.trim().length < 20}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8934a] py-3 font-semibold text-white transition-colors hover:bg-[#a07840] disabled:opacity-50"
                >
                  {yaziGonderiliyor ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      AI değerlendiriyor...
                    </>
                  ) : (
                    <>
                      <PenLine size={16} /> Gönder (+50 XP)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {sekme === "ilerleme" ? (
          <div className="rounded-xl border border-[#e8e0d4] bg-white/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#1a1612]">
              Genel İlerleme
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <div className="text-xl font-bold text-[#b8934a]">
                  {ilerleme.toplam_xp}
                </div>
                <div className="text-[#6b6158]">Toplam XP</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-500">
                  {ilerleme.streak}
                </div>
                <div className="text-[#6b6158]">Gün serisi</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-600">
                  {mevcutSeviye}
                </div>
                <div className="text-[#6b6158]">Mevcut seviye</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
