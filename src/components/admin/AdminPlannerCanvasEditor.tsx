"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import Link from "next/link";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  StickyNote,
  Paperclip,
  Type,
  Coffee,
  Upload,
} from "lucide-react";
import { Page } from "@/components/planner/Page";
import { ItemLayer } from "@/components/planner/ItemLayer";
import type { PlannerItem } from "@/types/planner-items";

const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 700;

const ITEM_TYPES: { type: PlannerItem["type"]; label: string }[] = [
  { type: "photo", label: "Fotoğraf" },
  { type: "polaroid", label: "Polaroid" },
  { type: "sticker", label: "Sticker" },
  { type: "postit", label: "Post-it" },
  { type: "tape", label: "Bant" },
  { type: "paperclip", label: "Ataş" },
  { type: "text", label: "Metin" },
  { type: "doodle", label: "Karalama" },
  { type: "coffee_stain", label: "Kahve lekesi" },
];

interface AdminPlannerCanvasEditorProps {
  year: number;
  month: number;
  monthName: string;
}

export function AdminPlannerCanvasEditor({ year, month, monthName }: AdminPlannerCanvasEditorProps) {
  const [pageId, setPageId] = useState<string | null>(null);
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addSide, setAddSide] = useState<"left" | "right">("right");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ensurePage = useCallback(async () => {
    const res = await fetch("/api/planner/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month }),
    });
    const data = await res.json();
    if (data.id) return data.id;
    return null;
  }, [year, month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    ensurePage()
      .then((id) => {
        if (cancelled || !id) return;
        setPageId(id);
        return fetch(`/api/planner/items?year=${year}&month=${month}`).then((r) => r.json());
      })
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        setItems(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { cancelled = true; };
  }, [year, month, ensurePage]);

  const updateItem = useCallback((id: string, updates: Partial<PlannerItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updates } : it)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const addItem = useCallback(
    async (type: PlannerItem["type"], overrides?: Partial<PlannerItem>) => {
      if (!pageId) return;
      const maxZ = items.length ? Math.max(...items.map((it) => it.z_index), 0) : 0;
      const body = {
        page_id: pageId,
        page_side: addSide,
        type,
        x: 30 + Math.random() * 40,
        y: 30 + Math.random() * 40,
        rotation: 0,
        scale: 1,
        z_index: maxZ + 1,
        ...overrides,
      };

      const res = await fetch("/api/planner/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await res.json();
      if (created?.id) setItems((prev) => [...prev, created]);
      setAddOpen(false);
    },
    [pageId, addSide, items]
  );

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploading(true);
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/planner/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data.publicUrl) addItem("photo", { asset_url: data.publicUrl });
        else if (data.path) {
          const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
          addItem("photo", {
            asset_url: base ? `${base}/storage/v1/object/public/planner-assets/${data.path}` : data.path,
          });
        }
      } finally {
        setUploading(false);
      }
    },
    [addItem]
  );

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      for (const it of items) {
        await fetch(`/api/planner/admin/items/${it.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            x: it.x,
            y: it.y,
            rotation: it.rotation,
            scale: it.scale,
            z_index: it.z_index,
            text_content: it.text_content,
            asset_url: it.asset_url,
            style_json: it.style_json,
            page_side: it.page_side,
          }),
        });
      }
    } finally {
      setSaving(false);
    }
  }, [items]);

  const selected = items.find((it) => it.id === selectedId);

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-[var(--muted)]">
        Yükleniyor…
      </div>
    );
  }

  if (!pageId) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-700">
        Sayfa oluşturulamadı. Lütfen tekrar deneyin.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-2">
          <Link
            href="/admin/planner"
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm hover:bg-[var(--background)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Listeye dön
          </Link>
        </div>

        <div
          className="relative mx-auto overflow-visible rounded-lg border-2 border-[var(--card-border)] bg-[#3d2b1f] p-3"
          style={{ width: PAGE_WIDTH * 2 + 32, maxWidth: "100%" }}
        >
          <div className="flex" style={{ width: PAGE_WIDTH * 2 }}>
            {/* Left page */}
            <div
              className="relative shrink-0 overflow-visible"
              style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
            >
              <Page side="left">
                <div className="absolute inset-0" />
              </Page>
              <ItemLayer
                items={items}
                pageSide="left"
                pageWidth={PAGE_WIDTH}
                pageHeight={PAGE_HEIGHT}
              />
              {items
                .filter((it) => it.page_side === "left")
                .sort((a, b) => a.z_index - b.z_index)
                .map((it) => (
                  <Rnd
                    key={it.id}
                    size={{ width: 80, height: 60 }}
                    position={{
                      x: (it.x / 100) * PAGE_WIDTH - 40,
                      y: (it.y / 100) * PAGE_HEIGHT - 30,
                    }}
                    scale={it.scale}
                    onDragStop={(_e, d) => {
                      const x = ((d.x + 40) / PAGE_WIDTH) * 100;
                      const y = ((d.y + 30) / PAGE_HEIGHT) * 100;
                      updateItem(it.id, { x, y });
                    }}
                    onResizeStop={(_e, _dir, ref, _delta, pos) => {
                      const w = ref.offsetWidth;
                      const h = ref.offsetHeight;
                      const x = (pos.x + w / 2) / PAGE_WIDTH * 100;
                      const y = (pos.y + h / 2) / PAGE_HEIGHT * 100;
                      updateItem(it.id, {
                        x,
                        y,
                        style_json: { ...it.style_json, width: w, height: h },
                      });
                    }}
                    enableResizing={selectedId === it.id}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setSelectedId(it.id);
                    }}
                    style={{
                      zIndex: it.z_index + (selectedId === it.id ? 100 : 0),
                      border: selectedId === it.id ? "2px solid var(--accent)" : "none",
                    }}
                    className="!cursor-move"
                  >
                    <ItemThumb item={it} />
                  </Rnd>
                ))}
            </div>

            {/* Right page */}
            <div
              className="relative shrink-0 overflow-visible"
              style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }}
            >
              <Page side="right">
                <div className="absolute inset-0" />
              </Page>
              {items
                .filter((it) => it.page_side === "right")
                .sort((a, b) => a.z_index - b.z_index)
                .map((it) => {
                  const style = (it.style_json ?? {}) as Record<string, unknown>;
                  const w = Math.max(24, (style.width as number) ?? 80);
                  const h = Math.max(24, (style.height as number) ?? 60);
                  const posX = (it.x / 100) * PAGE_WIDTH - w / 2;
                  const posY = (it.y / 100) * PAGE_HEIGHT - h / 2;
                  return (
                    <Rnd
                      key={it.id}
                      size={{ width: w, height: h }}
                      position={{ x: posX, y: posY }}
                      onDragStop={(_e, d) => {
                        const x = (d.x + w / 2) / PAGE_WIDTH * 100;
                        const y = (d.y + h / 2) / PAGE_HEIGHT * 100;
                        updateItem(it.id, { x, y });
                      }}
                      onResizeStop={(_e, _dir, ref, _delta, pos) => {
                        const nw = ref.offsetWidth;
                        const nh = ref.offsetHeight;
                        const x = (pos.x + nw / 2) / PAGE_WIDTH * 100;
                        const y = (pos.y + nh / 2) / PAGE_HEIGHT * 100;
                        updateItem(it.id, {
                          x,
                          y,
                          style_json: { ...it.style_json, width: nw, height: nh },
                        });
                      }}
                      enableResizing={selectedId === it.id}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedId(it.id);
                      }}
                      style={{
                        zIndex: it.z_index + (selectedId === it.id ? 100 : 0),
                        border: selectedId === it.id ? "2px solid var(--accent)" : "none",
                      }}
                      className="!cursor-move"
                    >
                      <div
                        style={{
                          transform: `rotate(${it.rotation}deg) scale(${it.scale})`,
                          transformOrigin: "center center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <ItemThumb item={it} />
                      </div>
                    </Rnd>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 lg:w-72">
        <h2 className="mb-3 font-medium">Öğe ekle</h2>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => setAddSide("left")}
            className={`flex-1 rounded px-2 py-1.5 text-sm ${addSide === "left" ? "bg-[var(--accent)] text-white" : "bg-[var(--background)]"}`}
          >
            Sol
          </button>
          <button
            type="button"
            onClick={() => setAddSide("right")}
            className={`flex-1 rounded px-2 py-1.5 text-sm ${addSide === "right" ? "bg-[var(--accent)] text-white" : "bg-[var(--background)]"}`}
          >
            Sağ
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-3 py-1.5 text-sm hover:bg-[var(--background)]"
          >
            <Upload className="h-4 w-4" />
            Fotoğraf yükle
          </button>
          {ITEM_TYPES.filter((t) => t.type !== "photo").map(({ type, label }) => (
            <button
              key={type}
              type="button"
              onClick={() => addItem(type, type === "postit" ? { text_content: "Not" } : undefined)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--card-border)] px-2 py-1.5 text-sm hover:bg-[var(--background)]"
            >
              {label}
            </button>
          ))}
        </div>

        {selected && (
          <>
            <hr className="my-4 border-[var(--card-border)]" />
            <h2 className="mb-2 font-medium">Seçili öğe</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <span className="w-16">Döndür</span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selected.rotation}
                  onChange={(e) => updateItem(selected.id, { rotation: Number(e.target.value) })}
                  className="flex-1"
                />
                <span>{selected.rotation}°</span>
              </label>
              <label className="flex items-center gap-2">
                <span className="w-16">Ölçek</span>
                <input
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.1}
                  value={selected.scale}
                  onChange={(e) => updateItem(selected.id, { scale: Number(e.target.value) })}
                  className="flex-1"
                />
                <span>{selected.scale.toFixed(1)}</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateItem(selected.id, { z_index: Math.max(0, selected.z_index - 1) })
                  }
                  className="rounded border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--background)]"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={() => updateItem(selected.id, { z_index: selected.z_index + 1 })}
                  className="rounded border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--background)]"
                >
                  Öne
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Bu öğeyi silmek istediğinize emin misiniz?")) {
                    fetch(`/api/planner/admin/items/${selected.id}`, { method: "DELETE" }).then(() =>
                      removeItem(selected.id)
                    );
                  }
                }}
                className="flex items-center gap-1 rounded border border-red-500/50 bg-red-500/10 px-2 py-1 text-red-600 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </button>
            </div>
          </>
        )}

        <hr className="my-4 border-[var(--card-border)]" />
        <button
          type="button"
          disabled={saving}
          onClick={saveAll}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>
    </div>
  );
}

function ItemThumb({ item }: { item: PlannerItem }) {
  const style = (item.style_json ?? {}) as Record<string, unknown>;
  const w = (style.width as number) ?? 80;
  const h = (style.height as number) ?? 60;
  const color = (style.color as string) ?? "#fef08a";

  switch (item.type) {
    case "photo":
    case "polaroid":
      return item.asset_url ? (
        <img
          src={item.asset_url}
          alt=""
          className="h-full w-full object-cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs">Foto</div>
      );
    case "postit":
      return (
        <div
          className="flex h-full w-full items-center justify-center rounded px-2 py-1 text-xs"
          style={{ backgroundColor: color }}
        >
          {item.text_content || "Not"}
        </div>
      );
    case "text":
      return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden text-xs">
          {item.text_content || "Metin"}
        </div>
      );
    case "paperclip":
      return (
        <div className="flex h-full w-full items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M12 3v15m0 0c-2.5 0-4.5-2-4.5-4.5S9.5 9 12 9s4.5 2 4.5 4.5-2 4.5-4.5 4.5z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case "coffee_stain":
      return <div className="h-full w-full rounded-full bg-amber-900/30" />;
    default:
      return (
        <div className="flex h-full w-full items-center justify-center rounded bg-white/80 text-xs shadow">
          {item.type}
        </div>
      );
  }
}
