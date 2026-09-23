"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { adminDeleteMesaj } from "@/app/secretgate/actions";

export type SiteMessage = {
  id: string;
  isim: string;
  mesaj: string;
  tarih: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminMesajlarPanel({ messages }: { messages: SiteMessage[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    setLoadingId(id);
    setError(null);
    const result = await adminDeleteMesaj(id);
    setLoadingId(null);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {messages.length === 0 ? (
        <p className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/40 px-4 py-8 text-center text-sm text-[var(--muted)]">
          Henüz mesaj yok.
        </p>
      ) : (
        messages.map((msg) => (
          <article
            key={msg.id}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h2 className="font-medium text-white/95">{msg.isim}</h2>
                  <time className="text-xs text-[var(--muted)]">{formatDate(msg.tarih)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                  {msg.mesaj}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(msg.id)}
                disabled={loadingId === msg.id}
                className="shrink-0 rounded-lg p-2 text-[var(--muted)] transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                aria-label="Mesajı sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
