"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { showAdminToast } from "./admin-toast-events";
import {
  AdminFieldLabel,
  AdminOptionalSection,
  AdminRecentList,
  AdminSaveBar,
  AdminTextArea,
  AdminTextInput,
  useAdminCmdEnter,
} from "./AdminFormPrimitives";

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMeta(date: string, createdAt: string) {
  try {
    const d = date || createdAt.slice(0, 10);
    return new Date(d + "T12:00:00").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return date;
  }
}

type RecentItem = { id: string; title: string; meta?: string };

export function QuickAjandaForm({
  initialRecent = [],
}: {
  initialRecent?: { id: string; title: string | null; date: string; created_at: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  useAdminCmdEnter(formRef);

  const [date, setDate] = useState(todayISO);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>(() =>
    initialRecent.map((r) => ({
      id: r.id,
      title: r.title || "Başlıksız",
      meta: formatMeta(r.date, r.created_at),
    }))
  );

  const refreshRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/planner/recent");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setRecent(
        data.map(
          (r: { id: string; title: string | null; date: string; created_at: string }) => ({
            id: r.id,
            title: r.title || "Başlıksız",
            meta: formatMeta(r.date, r.created_at),
          })
        )
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (initialRecent.length === 0) void refreshRecent();
  }, [initialRecent.length, refreshRecent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      showAdminToast("error", "Başlık zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const content = note.trim() || null;
      const mood = time.trim() || null;
      const res = await fetch("/api/planner/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title: t,
          content,
          mood,
          tags: [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showAdminToast("error", data.error || "Kayıt başarısız.");
        return;
      }
      showAdminToast("success", "Ajanda kaydı eklendi ✓");
      setTitle("");
      setNote("");
      setTime("");
      setDate(todayISO());
      await refreshRecent();
    } catch {
      showAdminToast("error", "Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "TEXTAREA") return;
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        formRef.current?.requestSubmit();
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <AdminRecentList items={recent.slice(0, 5)} />

      <div className="space-y-4">
        <div>
          <AdminFieldLabel htmlFor="ajanda-date">Tarih</AdminFieldLabel>
          <AdminTextInput
            id="ajanda-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor="ajanda-title" required>
            Başlık
          </AdminFieldLabel>
          <AdminTextInput
            id="ajanda-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ne oldu?"
            required
            autoFocus
          />
        </div>
        <div>
          <AdminFieldLabel htmlFor="ajanda-note">Not</AdminFieldLabel>
          <AdminTextArea
            id="ajanda-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="İsteğe bağlı not…"
          />
        </div>

        <AdminOptionalSection>
          <div>
            <AdminFieldLabel htmlFor="ajanda-time">Saat</AdminFieldLabel>
            <AdminTextInput
              id="ajanda-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </AdminOptionalSection>

        <AdminSaveBar loading={loading} />
      </div>
    </form>
  );
}
