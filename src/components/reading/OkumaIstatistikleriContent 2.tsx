"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  OkumaIstatistikleriResponse,
  OkumaStatsPayload,
} from "@/app/api/okuma-istatistikleri/route";

const GOLD = "#b8934a";
const MUTED = "#6b6158";
const INK = "#1a1612";
const TOOLTIP_STYLE = {
  background: "#faf6f0",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: 8,
  color: INK,
  fontSize: 12,
};
const GRID_STROKE = "rgba(0,0,0,0.06)";

const MONTH_SHORT = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara",
];

const MONTH_FULL = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const PIE_COLORS = [
  "#b8934a",
  "#8b7355",
  "#d4b87a",
  "#6b5a42",
  "#e8d5a3",
  "#a89060",
];

const EMPTY_STATS: OkumaStatsPayload = {
  totalBooks: 0,
  thisYearCount: 0,
  avgRating: null,
  topAuthors: [],
  topGenres: [],
  topRated: [],
  fiveStarBooks: [],
  ratingDistribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
  longestReview: null,
  shortestReview: null,
  monthlyDistribution: {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
    "6": 0,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": 0,
    "11": 0,
    "12": 0,
  },
  totalReviewWords: 0,
  mostProductiveMonth: null,
  favoriteAuthor: null,
};

type YearFilter = "all" | number;

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-rule bg-card px-4 py-5 text-center sm:px-6 sm:py-6">
      <p className="font-editorial text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        {value}
      </p>
      <p className="section-eyebrow mt-2">
        {label}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-editorial text-lg font-medium text-ink/90 sm:text-xl">
      {children}
    </h2>
  );
}

function pickFunFact(stats: OkumaStatsPayload): string {
  const facts: string[] = [];

  if (stats.favoriteAuthor && stats.favoriteAuthor.count >= 2) {
    facts.push(
      `${stats.favoriteAuthor.name} senin favorin — ondan ${stats.favoriteAuthor.count} kitap okudun`
    );
  }

  if (stats.mostProductiveMonth && stats.mostProductiveMonth.count > 0) {
    facts.push(
      `En verimli ayın ${stats.mostProductiveMonth.label}: o ay ${stats.mostProductiveMonth.count} kitap okudun`
    );
  }

  if (stats.totalReviewWords >= 50) {
    const novelish =
      stats.totalReviewWords >= 40000
        ? " — yaklaşık bir roman!"
        : stats.totalReviewWords >= 5000
          ? " — kısa bir novella kadar!"
          : " — güzel bir birikim.";
    facts.push(
      `Yorumlarının toplam uzunluğu: ${stats.totalReviewWords.toLocaleString("tr-TR")} kelime${novelish}`
    );
  }

  if (stats.avgRating != null) {
    facts.push(`Ortalama puanın ${stats.avgRating}/5 — ne kadar seçici olduğunu gösterir.`);
  }

  if (stats.longestReview) {
    facts.push(
      `En uzun yorumun «${stats.longestReview.title}» için — ${stats.longestReview.length} karakter.`
    );
  }

  if (facts.length === 0) {
    return "İstatistikler birikiyor — daha fazla kitap ekledikçe burası dolacak.";
  }

  return facts[Math.floor(Math.random() * facts.length)]!;
}

export function OkumaIstatistikleriContent() {
  const [data, setData] = useState<OkumaIstatistikleriResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<YearFilter>("all");
  const [funFact, setFunFact] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/okuma-istatistikleri");
        if (!res.ok) throw new Error("Yüklenemedi");
        const json = (await res.json()) as OkumaIstatistikleriResponse;
        if (!cancelled) {
          setData(json);
          setFunFact(pickFunFact(json.all));
        }
      } catch {
        if (!cancelled) setError("İstatistikler yüklenemedi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: OkumaStatsPayload | null = useMemo(() => {
    if (!data) return null;
    if (year === "all") return data.all;
    return data.byYear[String(year)] ?? EMPTY_STATS;
  }, [data, year]);

  const monthlyStats: OkumaStatsPayload | null = useMemo(() => {
    if (!data) return null;
    if (year === "all") {
      return data.byYear[String(data.currentYear)] ?? EMPTY_STATS;
    }
    return data.byYear[String(year)] ?? EMPTY_STATS;
  }, [data, year]);

  useEffect(() => {
    if (stats) setFunFact(pickFunFact(stats));
  }, [stats]);

  const yearPills: YearFilter[] = useMemo(() => {
    if (!data) return ["all"];
    const fromData = data.years;
    const extras = [2024, 2025, 2026].filter(
      (y) => !fromData.includes(y) && y <= data.currentYear + 1
    );
    const merged = [...new Set([...fromData, ...extras])].sort((a, b) => a - b);
    return ["all", ...merged];
  }, [data]);

  const yearChartData = useMemo(() => {
    if (!data) return [];
    const keys = Object.keys(data.booksByYear)
      .map(Number)
      .sort((a, b) => a - b);
    if (keys.length === 0) return [];
    const min = keys[0]!;
    const max = Math.max(keys[keys.length - 1]!, data.currentYear);
    const rows = [];
    for (let y = min; y <= max; y++) {
      rows.push({ year: String(y), count: data.booksByYear[String(y)] ?? 0 });
    }
    return rows;
  }, [data]);

  const monthChartData = useMemo(() => {
    if (!monthlyStats) return [];
    return MONTH_SHORT.map((label, i) => ({
      month: label,
      full: MONTH_FULL[i],
      count: monthlyStats.monthlyDistribution[String(i + 1)] ?? 0,
    }));
  }, [monthlyStats]);

  const ratingChartData = useMemo(() => {
    if (!stats) return [];
    return [5, 4, 3, 2, 1].map((r) => ({
      rating: String(r),
      count: stats.ratingDistribution[String(r)] ?? 0,
    }));
  }, [stats]);

  const maxAuthor = stats?.topAuthors[0]?.count ?? 1;
  const genrePie = (stats?.topGenres ?? []).map((g) => ({
    name: g.name,
    value: g.count,
  }));

  if (loading) {
    return (
      <p className="mt-12 text-center text-sm" style={{ color: MUTED }}>
        İstatistikler hazırlanıyor…
      </p>
    );
  }

  if (error || !data || !stats) {
    return (
      <p className="mt-12 text-center text-sm text-red-300/80">
        {error ?? "Veri yok."}
      </p>
    );
  }

  const yearLabel =
    year === "all" ? "bu yıl" : String(year);
  const yearCount =
    year === "all" ? stats.thisYearCount : stats.totalBooks;

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Year pills */}
      <div className="flex flex-wrap gap-2">
        {yearPills.map((y) => {
          const active = year === y;
          const label = y === "all" ? "Tüm Zamanlar" : String(y);
          return (
            <button
              key={String(y)}
              type="button"
              onClick={() => setYear(y)}
              className="rounded-full px-3.5 py-1.5 text-xs tracking-wide transition-colors sm:text-sm"
              style={
                active
                  ? {
                      background: "rgba(184,147,74,0.2)",
                      color: INK,
                      border: "1px solid rgba(184,147,74,0.45)",
                    }
                  : {
                      background: "transparent",
                      color: MUTED,
                      border: "1px solid rgba(184,147,74,0.15)",
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Bölüm 1 — Büyük sayılar */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard value={String(stats.totalBooks)} label="toplam kitap" />
        <StatCard
          value={stats.avgRating != null ? `${stats.avgRating}/5` : "—"}
          label="ort. puan"
        />
        <StatCard value={String(yearCount)} label={yearLabel} />
        <StatCard
          value={String(stats.fiveStarBooks.length)}
          label="5 yıldız"
        />
      </section>

      {/* Bölüm 2 — Yıllara göre */}
      {year === "all" && yearChartData.length > 0 ? (
        <section>
          <SectionTitle>Yıllara göre</SectionTitle>
          <div className="h-56 w-full rounded-xl border border-rule bg-card p-3 sm:h-64 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearChartData}>
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fill: MUTED, fontSize: 11 }}
                  axisLine={{ stroke: GRID_STROKE }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: MUTED, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "rgba(184,147,74,0.08)" }}
                  formatter={(value) => [`${value} kitap`, ""]}
                  labelFormatter={(label) => String(label)}
                />
                <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} name="kitap" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {/* Bölüm 3 — Aylık dağılım */}
      <section>
        <SectionTitle>
          {year === "all"
            ? `${data.currentYear} — ay ay`
            : `${year} — ay ay`}
        </SectionTitle>
        <div className="h-44 w-full rounded-xl border border-rule bg-card p-3 sm:h-52 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthChartData}>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: MUTED, fontSize: 10 }}
                axisLine={{ stroke: GRID_STROKE }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: MUTED, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: "rgba(184,147,74,0.08)" }}
                formatter={(value) => [`${value} kitap`, ""]}
                labelFormatter={(_, payload) => {
                  const row = payload?.[0]?.payload as { full?: string } | undefined;
                  return row?.full ?? "";
                }}
              />
              <Bar dataKey="count" fill={GOLD} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bölüm 4 — Puan dağılımı */}
      <section>
        <SectionTitle>Puan dağılımı</SectionTitle>
        <div className="space-y-2.5 rounded-xl border border-rule bg-card p-4 sm:p-5">
          {ratingChartData.map((row) => {
            const maxR = Math.max(...ratingChartData.map((r) => r.count), 1);
            const pct = (row.count / maxR) * 100;
            return (
              <div key={row.rating} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-right font-editorial text-sm" style={{ color: INK }}>
                  {row.rating}★
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: GOLD }}
                  />
                </div>
                <span className="w-8 shrink-0 text-xs tabular-nums" style={{ color: MUTED }}>
                  {row.count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bölüm 5 — Yazarlar */}
      <section>
        <SectionTitle>En çok okunan yazarlar</SectionTitle>
        {stats.topAuthors.length === 0 ? (
          <p className="text-sm" style={{ color: MUTED }}>
            Henüz yeterli veri yok.
          </p>
        ) : (
          <ul className="space-y-3 rounded-xl border border-rule bg-card p-4 sm:p-5">
            {stats.topAuthors.map((a, i) => (
              <li key={a.name}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <span className="text-sm" style={{ color: INK }}>
                    <span className="mr-2 tabular-nums" style={{ color: MUTED }}>
                      {i + 1}.
                    </span>
                    {a.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums" style={{ color: MUTED }}>
                    {a.count} kitap
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(a.count / maxAuthor) * 100}%`,
                      background: GOLD,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Bölüm 6 — Türler */}
      <section>
        <SectionTitle>En çok okunan türler</SectionTitle>
        {genrePie.length === 0 ? (
          <p className="text-sm" style={{ color: MUTED }}>
            Tür / etiket verisi yok.
          </p>
        ) : (
          <div className="grid gap-4 rounded-xl border border-rule bg-card p-4 sm:grid-cols-2 sm:p-5">
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genrePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {genrePie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) => [`${value} kitap`, String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col justify-center space-y-2">
              {stats.topGenres.map((g, i) => (
                <li key={g.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span style={{ color: INK }}>{g.name}</span>
                  <span className="ml-auto tabular-nums" style={{ color: MUTED }}>
                    {g.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Bölüm 7 — En sevdiğim */}
      <section>
        <SectionTitle>En sevdiğim kitaplar</SectionTitle>
        {stats.fiveStarBooks.length === 0 ? (
          <p className="text-sm" style={{ color: MUTED }}>
            Henüz 5 yıldızlı kitap yok.
          </p>
        ) : (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {stats.fiveStarBooks.map((book) => (
              <Link
                key={book.id}
                href={`/readings?book=${book.id}`}
                className="group w-[88px] shrink-0 sm:w-[100px]"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-rule bg-card">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="100px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-[0.65rem] leading-tight" style={{ color: MUTED }}>
                      {book.title}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[0.7rem] leading-snug" style={{ color: INK }}>
                  {book.title}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* En uzun / en kısa yorum */}
      {(stats.longestReview || stats.shortestReview) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {stats.longestReview ? (
            <div className="rounded-xl border border-rule bg-card p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                En uzun yorum
              </p>
              <p className="mt-2 font-editorial text-base" style={{ color: INK }}>
                {stats.longestReview.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {stats.longestReview.length} karakter
              </p>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/55">
                {stats.longestReview.review}
              </p>
            </div>
          ) : null}
          {stats.shortestReview &&
          stats.shortestReview.id !== stats.longestReview?.id ? (
            <div className="rounded-xl border border-rule bg-card p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.14em]" style={{ color: MUTED }}>
                En kısa yorum
              </p>
              <p className="mt-2 font-editorial text-base" style={{ color: INK }}>
                {stats.shortestReview.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: MUTED }}>
                {stats.shortestReview.length} karakter
              </p>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink/55">
                {stats.shortestReview.review}
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* Bölüm 8 — Rastgele not */}
      {funFact ? (
        <aside className="rounded-xl border border-rule bg-[rgba(184,147,74,0.06)] px-5 py-4">
          <p
            className="text-[0.65rem] uppercase tracking-[0.16em]"
            style={{ color: GOLD }}
          >
            rastgele not
          </p>
          <p
            className="mt-2 font-editorial text-base italic leading-relaxed sm:text-lg"
            style={{ color: INK }}
          >
            {funFact}
          </p>
        </aside>
      ) : null}
    </div>
  );
}
