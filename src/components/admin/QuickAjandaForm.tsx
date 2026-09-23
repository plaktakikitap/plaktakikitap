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

// Mood seçenekleri
const MOOD_OPTIONS = [
  { emoji: "😊", label: "İyi" },
  { emoji: "😐", label: "Normal" },
  { emoji: "😔", label: "Kötü" },
  { emoji: "🔥", label: "Heyecanlı" },
  { emoji: "😴", label: "Yorgun" },
  { emoji: "🙏", label: "Şükür" },
  { emoji: "😤", label: "Stresli" },
  { emoji: "❤️", label: "Sevgi" },
];

// Hızlı etiket önerileri
const TAG_SUGGESTIONS = [
  "kitap", "film", "müzik", "spor", "yemek", "seyahat",
  "iş", "aile", "arkadaş", "not", "fikir", "hedef",
];

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
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
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

  // Etiket ekle
  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      showAdminToast("error", "Başlık zorunludur.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/planner/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          title: t,
          content: note.trim() || null,
          mood: mood || null,
          tags,
          time: time || null,
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
      setMood("");
      setTags([]);
      setTagInput("");
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
      className="rounded-2xl border border-[#e8e0d4] bg-[#1a1612]/5 p-5 sm:p-6"
    >
      <AdminRecentList items={recent.slice(0, 5)} />

      <div className="space-y-4">
        {/* Tarih */}
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

        {/* Başlık */}
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

        {/* Not */}
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

        {/* Mood */}
        <div>
          <AdminFieldLabel>Ruh hali</AdminFieldLabel>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.emoji}
                type="button"
                onClick={() => setMood((prev) => (prev === m.emoji ? "" : m.emoji))}
                title={m.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-all ${
                  mood === m.emoji
                    ? "border-[#b8934a] bg-[#b8934a]/10 shadow-sm"
                    : "border-[#e8e0d4] hover:border-[#b8934a]/40 hover:bg-[#1a1612]/5"
                }`}
              >
                {m.emoji}
              </button>
            ))}
            {mood && (
              <button
                type="button"
                onClick={() => setMood("")}
                className="rounded-lg border border-[#e8e0d4] px-2 text-xs text-[#6b6158] hover:bg-[#1a1612]/5"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Etiketler */}
        <div>
          <AdminFieldLabel>Etiketler</AdminFieldLabel>
          {/* Mevcut etiketler */}
          {tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-[#b8934a]/10 px-2.5 py-0.5 text-xs text-[#b8934a]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 text-[#b8934a]/60 hover:text-[#b8934a]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Etiket girişi */}
          <div className="flex gap-2">
            <AdminTextInput
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  e.stopPropagation();
                  addTag(tagInput);
                }
              }}
              placeholder="Etiket yaz, Enter'a bas…"
            />
          </div>
          {/* Hızlı öneriler */}
          <div className="mt-2 flex flex-wrap gap-1">
            {TAG_SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="rounded-full border border-[#e8e0d4] px-2 py-0.5 text-xs text-[#6b6158] hover:border-[#b8934a]/40 hover:text-[#1a1612]"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Opsiyonel: Saat */}
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
