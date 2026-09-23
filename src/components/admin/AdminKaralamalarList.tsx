"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { SECTION_PATH } from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";
import { hasSpoilerMarkup, stripSpoilers } from "@/lib/spoiler";
import { AdminKaralamalarForm } from "./AdminKaralamalarForm";

type Filtre = "hepsi" | "yayinda" | "taslak";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AdminKaralamalarList({
  initialItems,
}: {
  initialItems: Karalama[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtre>("hepsi");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function handleDelete(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/karalamalar/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Silinemedi.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (editingId === id) setEditingId(null);
      setConfirmDeleteId(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const filtreliItems = items.filter((item) => {
    if (filtre === "yayinda") return item.yayinda;
    if (filtre === "taslak") return !item.yayinda;
    return true;
  });

  if (items.length === 0) {
    return <p className="text-sm text-[#6b6158]">Henüz kayıt yok.</p>;
  }

  return (
    <div>
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="mb-4 flex gap-1 rounded-xl border border-[#e8e0d4] p-1">
        {(["hepsi", "yayinda", "taslak"] as Filtre[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltre(f)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
              filtre === f
                ? "bg-[#1a1612] text-white"
                : "text-[#6b6158] hover:text-[#1a1612]"
            }`}
          >
            {f === "hepsi" ? "Hepsi" : f === "yayinda" ? "Yayında" : "Taslak"}
            <span className="ml-1.5 text-[10px] opacity-60">
              {f === "hepsi"
                ? items.length
                : f === "yayinda"
                  ? items.filter((i) => i.yayinda).length
                  : items.filter((i) => !i.yayinda).length}
            </span>
          </button>
        ))}
      </div>
      {filtreliItems.length === 0 ? (
        <p className="text-sm text-[#6b6158]">Bu filtrede kayıt yok.</p>
      ) : (
        filtreliItems.map((item, index) => (
          <div
            key={item.id}
            className="group relative border-b border-[#e8e0d4] py-4 first:pt-0"
          >
            {editingId === item.id ? (
              <AdminKaralamalarForm
                initial={item}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-6 shrink-0 font-mono text-xs text-[#6b6158]/50">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-sm font-medium text-[#1a1612]">
                      {item.baslik}
                    </h3>
                    {item.yayinda ? (
                      <span className="text-[10px] text-[#b8934a]">
                        {formatDate(item.olusturma_tarihi)}
                      </span>
                    ) : (
                      <span className="rounded bg-[#1a1612]/8 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#6b6158]">
                        taslak
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[#6b6158]">
                    {stripSpoilers(item.icerik) ||
                      (hasSpoilerMarkup(item.icerik)
                        ? "⚠ Spoiler içeriyor"
                        : "—")}
                  </p>
                </div>
                <div
                  className={`flex shrink-0 items-center gap-1 transition-opacity ${
                    confirmDeleteId === item.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Link
                    href={`${SECTION_PATH}/${item.slug}`}
                    target="_blank"
                    className="rounded px-2 py-1 text-[10px] text-[#6b6158] hover:text-[#1a1612]"
                  >
                    ↗
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    disabled={loading}
                    className="rounded p-1.5 text-[#6b6158] hover:text-[#b8934a]"
                    aria-label="Düzenle"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="rounded border border-red-400/50 px-2 py-0.5 text-[10px] text-red-600 hover:bg-red-500/10"
                      >
                        Sil
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded border border-[#e8e0d4] px-2 py-0.5 text-[10px] text-[#6b6158]"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      disabled={loading}
                      className="rounded p-1.5 text-[#6b6158] hover:text-red-600"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
