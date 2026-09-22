"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { SECTION_PATH } from "@/lib/karalamalar-section";
import type { Karalama } from "@/lib/karalamalar";
import { hasSpoilerMarkup, stripSpoilers } from "@/lib/spoiler";
import { AdminKaralamalarForm } from "./AdminKaralamalarForm";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  async function handleDelete(id: string) {
    if (!confirm("Emin misin? Bu karalama silinecek.")) return;
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
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-[#6b6158]">Henüz kayıt yok.</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <p className="admin-error">{error}</p> : null}
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 p-4"
        >
          {editingId === item.id ? (
            <AdminKaralamalarForm
              initial={item}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-[#1a1612]">{item.baslik}</h3>
                  {!item.yayinda ? (
                    <span className="rounded bg-[#1a1612]/8 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[#6b6158]">
                      taslak
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[#1a1612]/40">
                  /{item.slug} · {formatDate(item.olusturma_tarihi)}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-[#6b6158]">
                  {stripSpoilers(item.icerik) ||
                    (hasSpoilerMarkup(item.icerik) ? "Spoiler içerir" : "")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`${SECTION_PATH}/${item.slug}`}
                  target="_blank"
                  className="rounded-lg px-2 py-1.5 text-xs text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#1a1612]"
                >
                  Gör
                </Link>
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  disabled={loading}
                  className="rounded-lg p-2 text-[#6b6158] hover:bg-[#1a1612]/5 hover:text-[#b8934a]"
                  aria-label="Düzenle"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                  className="rounded-lg p-2 text-[#6b6158] hover:bg-red-500/20 hover:text-red-300"
                  aria-label="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
