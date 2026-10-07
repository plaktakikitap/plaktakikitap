"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Loader2,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { deleteFilmViewing, logFilmRewatch } from "@/app/actions";
import type { MovieViewing } from "@/lib/movie-watch-log";
import { ExcelIndirButonu } from "./ExcelIndirButonu";
import { WatchLogMovieForm } from "./WatchLogMovieForm";

const PAGE_SIZE = 40;

type FilmGroup = {
  contentId: string;
  title: string;
  year: number | null;
  director: string | null;
  posterUrl: string | null;
  durationMin: number;
  visibility: string;
  viewings: MovieViewing[];
};

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function formatWatch(iso: string | null) {
  if (!iso) return "tarih yok";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupFilms(rows: MovieViewing[]): FilmGroup[] {
  const map = new Map<string, FilmGroup>();
  for (const row of rows) {
    const current = map.get(row.contentId);
    if (!current) {
      map.set(row.contentId, {
        contentId: row.contentId,
        title: row.title,
        year: row.year,
        director: row.director,
        posterUrl: row.posterUrl,
        durationMin: row.durationMin,
        visibility: row.visibility,
        viewings: [row],
      });
      continue;
    }
    current.viewings.push(row);
    if (!current.posterUrl && row.posterUrl) current.posterUrl = row.posterUrl;
  }

  const groups = [...map.values()];
  for (const group of groups) {
    group.viewings.sort((a, b) =>
      (b.watchedAt ?? "").localeCompare(a.watchedAt ?? "")
    );
    const latest = group.viewings[0];
    if (latest) {
      group.title = latest.title;
      group.year = latest.year;
      group.director = latest.director;
      group.durationMin = latest.durationMin;
      group.visibility = latest.visibility;
    }
  }
  groups.sort((a, b) =>
    (b.viewings[0]?.watchedAt ?? "").localeCompare(a.viewings[0]?.watchedAt ?? "")
  );
  return groups;
}

function RewatchControl({
  contentId,
  onAdded,
}: {
  contentId: string;
  onAdded: (viewing: { id: string; watchedAt: string; rating5: number | null }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(nowLocalDatetime);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    const result = await logFilmRewatch(contentId, when);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    if (result && "viewing" in result) {
      onAdded(result.viewing);
      setOpen(false);
      setWhen(nowLocalDatetime());
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setWhen(nowLocalDatetime());
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-[#e8e0d4] bg-white px-2 py-1 text-xs font-medium text-[#1a1612] transition-colors hover:border-[#b8934a]/40 hover:text-[#b8934a]"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Tekrar izledim
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="rounded-lg border border-[#d4c9bb] bg-white px-2 py-1 text-xs text-[#1a1612]"
          aria-label="Tekrar izleme tarihi"
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={pending || !when}
          className="inline-flex items-center gap-1 rounded-lg bg-[#1a1612] px-2.5 py-1 text-xs font-medium text-[#faf7f2] disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Ekle
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-2 py-1 text-xs text-[#6b6158] hover:text-[#1a1612]"
        >
          Vazgeç
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function AdminMovieWatchLog({
  initialViewings,
  loadError,
}: {
  initialViewings: MovieViewing[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialViewings);
  const [tab, setTab] = useState<"liste" | "ekle">("liste");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setRows(initialViewings);
  }, [initialViewings]);

  const groups = useMemo(() => groupFilms(rows), [rows]);
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr");
    if (!q) return groups;
    return groups.filter((group) => {
      const haystack = [group.title, group.director ?? "", group.year ? String(group.year) : ""]
        .join(" ")
        .toLocaleLowerCase("tr");
      return haystack.includes(q);
    });
  }, [groups, search]);

  const shown = filtered.slice(0, visible);
  const viewingCount = rows.length;

  function addViewing(
    group: FilmGroup,
    viewing: { id: string; watchedAt: string; rating5: number | null }
  ) {
    const source = group.viewings[0];
    if (!source) return;
    setRows((prev) => [
      {
        ...source,
        id: viewing.id,
        watchedAt: viewing.watchedAt,
        rating5: viewing.rating5,
      },
      ...prev,
    ]);
    setOpenId(group.contentId);
    router.refresh();
  }

  async function removeViewing(viewingId: string) {
    setDeleteError(null);
    setDeletingId(viewingId);
    const result = await deleteFilmViewing(viewingId);
    setDeletingId(null);
    if (result && "error" in result && result.error) {
      setDeleteError(result.error);
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== viewingId));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-[#b8934a]">
            <Film className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1a1612]">
              Film izleme günlüğü
            </h1>
            <p className="mt-0.5 text-sm text-[#6b6158]">
              {groups.length} film · {viewingCount} izlenme
            </p>
          </div>
        </div>
        <ExcelIndirButonu tur="filmler" />
      </header>

      <div className="flex gap-1 rounded-2xl border border-[#e8e0d4] bg-[#f4f0ea] p-1">
        {(["liste", "ekle"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-[#1a1612] shadow-sm"
                : "text-[#6b6158] hover:text-[#1a1612]"
            }`}
          >
            {key === "liste" ? `Liste (${groups.length})` : "Yeni film"}
          </button>
        ))}
      </div>

      {tab === "ekle" ? (
        <div className="rounded-2xl border border-[#e8e0d4] bg-[#f0ebe2] p-6 sm:p-8">
          <WatchLogMovieForm
            onCreated={() => {
              setTab("liste");
              setSearch("");
              router.refresh();
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {loadError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          ) : null}
          {deleteError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </p>
          ) : null}

          <div className="flex items-center gap-2 rounded-xl border border-[#e8e0d4] bg-white px-3 py-2">
            <Search className="h-4 w-4 text-[#a09588]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Film, yönetmen veya yıl ara…"
              className="flex-1 bg-transparent text-sm text-[#1a1612] outline-none placeholder:text-[#a09588]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[#a09588] hover:text-[#1a1612]"
                aria-label="Aramayı temizle"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="divide-y divide-[#e8e0d4] rounded-2xl border border-[#e8e0d4] bg-white/70">
            {shown.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#a09588]">
                {search ? "Sonuç bulunamadı." : "Henüz film yok."}
              </p>
            ) : null}
            {shown.map((group) => {
              const latest = group.viewings[0];
              const open = openId === group.contentId;
              return (
                <div key={group.contentId} className="px-3 py-3 sm:px-4">
                  <div className="flex items-start gap-3">
                    {group.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={group.posterUrl}
                        alt=""
                        className="h-[60px] w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="h-[60px] w-10 shrink-0 rounded bg-[#e8e0d4]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1a1612]">
                            {group.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6b6158]">
                            {[group.director, group.year, `${group.durationMin} dk`]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenId(open ? null : group.contentId)
                            }
                            className="mt-1 text-left text-xs text-[#b8934a] hover:underline"
                          >
                            {group.viewings.length} izlenme
                            {latest?.watchedAt
                              ? ` · son ${formatWatch(latest.watchedAt)}`
                              : ""}
                          </button>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                          <RewatchControl
                            contentId={group.contentId}
                            onAdded={(viewing) => addViewing(group, viewing)}
                          />
                          <Link
                            href={`/secretgate/films/${group.contentId}/edit`}
                            className="rounded-lg p-1.5 text-[#6b6158] transition-colors hover:bg-[#b8934a]/10 hover:text-[#b8934a]"
                            aria-label={`${group.title} düzenle`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      {open ? (
                        <ul className="mt-3 space-y-1.5">
                          {group.viewings.map((viewing, index) => (
                            <li
                              key={viewing.id}
                              className="flex items-center justify-between gap-2 rounded-lg bg-[#faf7f2] px-2.5 py-1.5 text-xs text-[#1a1612]"
                            >
                              <span>
                                {formatWatch(viewing.watchedAt)}
                                {index === 0 ? " · son izleme" : ""}
                                {viewing.rating5 != null
                                  ? ` · ${viewing.rating5}/5`
                                  : ""}
                              </span>
                              {group.viewings.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => void removeViewing(viewing.id)}
                                  disabled={deletingId === viewing.id}
                                  className="rounded p-1 text-[#6b6158] hover:text-red-600 disabled:opacity-50"
                                  aria-label="Bu izlemeyi sil"
                                >
                                  {deletingId === viewing.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visible < filtered.length ? (
            <button
              type="button"
              onClick={() => setVisible((n) => n + PAGE_SIZE)}
              className="w-full rounded-xl border border-[#e8e0d4] bg-white py-2.5 text-sm text-[#6b6158] transition-colors hover:text-[#1a1612]"
            >
              Daha fazla ({filtered.length - visible})
            </button>
          ) : null}

          <p className="text-center text-xs text-[#1a1612]/40">
            Kaydettiğin filmler{" "}
            <Link
              href="/izleme-gunlugum/filmler"
              className="underline hover:text-[#1a1612]/70"
            >
              İzleme günlüğüm → Filmler
            </Link>{" "}
            sayfasında görünür. Tekrar izleme, aynı filme yeni bir tarih ekler.
          </p>
        </div>
      )}
    </div>
  );
}
