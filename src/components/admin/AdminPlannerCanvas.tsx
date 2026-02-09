"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
} from "@dnd-kit/core";
import type { PlannerElement, PlannerElementType } from "@/lib/planner";
import { AttachmentSVG } from "@/components/planner/AttachmentSVG";
import { GlossyWashiTape } from "@/components/planner/GlossyWashiTape";
import { ChevronDown, Upload, StickyNote, Layers, Paperclip, Image, Type, Coffee, Trash2 } from "lucide-react";

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 493;

type PageSide = "left" | "right";

interface AdminPlannerCanvasProps {
  year: number;
  monthIndex: number;
}

/** Client-side element (id may be temp for new items) */
type CanvasElement = Omit<PlannerElement, "spread_id" | "created_at"> & {
  id: string;
  spread_id?: string;
};

const DEFAULT_W = 0.2;
const DEFAULT_H = 0.15;
const MIN_WH = 0.05;
const MAX_WH = 0.5;

function defaultPosition(elements: CanvasElement[], page_side: PageSide): { x: number; y: number } {
  const onPage = elements.filter((e) => e.page_side === page_side);
  if (onPage.length === 0) return { x: 0.5, y: 0.5 };
  const last = onPage[onPage.length - 1];
  let x = last.x + 0.08;
  let y = last.y;
  if (x > 0.85) {
    x = 0.2;
    y = Math.min(0.85, y + 0.12);
  }
  return { x, y };
}

function createNewElement(
  type: PlannerElementType,
  page_side: PageSide,
  elements: CanvasElement[],
  overrides?: Partial<CanvasElement>
): CanvasElement {
  const pos = defaultPosition(elements, page_side);
  const maxZ = elements.length ? Math.max(...elements.map((e) => e.z_index), 0) : 0;
  const base: CanvasElement = {
    id: `new-${crypto.randomUUID()}`,
    page_side,
    type,
    src: null,
    text: type === "sticky_note" || type === "text_block" ? "Metin" : null,
    x: pos.x,
    y: pos.y,
    w: DEFAULT_W,
    h: DEFAULT_H,
    rotation: type === "washi_tape" ? -8 : type === "paperclip" ? 5 : 0,
    z_index: maxZ + 1,
    meta: type === "sticky_note" ? { color: "#fef08a" } : type === "washi_tape" ? { variant: "pink" } : {},
  };
  if (type === "coffee_stain") base.meta = { size: 48 };
  return { ...base, ...overrides };
}

function ElementPreview({ el, isSelected }: { el: CanvasElement; isSelected: boolean }) {
  const wPx = el.w * CANVAS_WIDTH;
  const hPx = el.h * CANVAS_HEIGHT;
  const style: React.CSSProperties = {
    width: wPx,
    minWidth: 24,
    minHeight: 24,
    height: hPx,
    transform: `rotate(${el.rotation}deg)`,
  };

  switch (el.type) {
    case "photo":
      return (
        <div className="overflow-hidden rounded border border-black/10 bg-white shadow" style={style}>
          {el.src ? (
            <img src={el.src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
              Fotoğraf
            </div>
          )}
        </div>
      );
    case "sticky_note": {
      const color = (el.meta?.color as string) || "#fef08a";
      return (
        <div
          className="rounded px-2 py-1 shadow text-xs"
          style={{ ...style, backgroundColor: color, color: "rgba(0,0,0,0.85)" }}
        >
          {el.text || "(Not)"}
        </div>
      );
    }
    case "washi_tape": {
      const variant = (el.meta?.variant as "pink" | "blue" | "mint") || "pink";
      return (
        <div style={style}>
          <GlossyWashiTape variant={variant} rotateDeg={el.rotation} className="h-full w-full opacity-90" />
        </div>
      );
    }
    case "paperclip":
      return (
        <div style={style} className="flex items-center justify-center">
          <AttachmentSVG style="standard_clip" size={Math.min(wPx, hPx) * 0.9} />
        </div>
      );
    case "sticker":
      return (
        <div className="flex items-center justify-center rounded bg-white/80 shadow" style={style}>
          <span className="text-xs">Sticker</span>
        </div>
      );
    case "text_block":
      return (
        <div
          className="rounded border border-black/10 bg-white/90 px-2 py-1 shadow text-xs"
          style={style}
        >
          {el.text || "Metin"}
        </div>
      );
    case "coffee_stain":
      return (
        <div
          className="rounded-full bg-amber-900/20"
          style={{ ...style, width: (el.meta?.size as number) || 48, height: (el.meta?.size as number) || 48 }}
        />
      );
    case "doodle":
      return <div className="rounded border border-dashed border-black/20 bg-white/50" style={style} />;
    default:
      return <div className="rounded bg-gray-200" style={style} />;
  }
}

function DraggableCanvasElement({
  el,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  canvasWidth,
  canvasHeight,
}: {
  el: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onRemove: () => void;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const id = el.id;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { el },
  });
  const tx = transform?.x ?? 0;
  const ty = transform?.y ?? 0;
  const leftPct = el.x * 100;
  const topPct = el.y * 100;
  const canResize = isSelected && (el.type === "photo" || el.type === "sticky_note");

  return (
    <div
      ref={setNodeRef}
      className="absolute cursor-grab active:cursor-grabbing touch-none"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px)`,
        zIndex: el.z_index + (transform ? 1000 : 0),
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative">
        <ElementPreview el={el} isSelected={isSelected} />
        {isSelected && (
          <div className="absolute -right-2 top-0 z-10 flex flex-col gap-0.5">
            <button
              type="button"
              className="rounded bg-red-500/90 p-0.5 text-white hover:bg-red-600"
              title="Sil"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {canResize && (
          <ResizeHandle
            onResize={(dw, dh) => {
              const nw = Math.max(MIN_WH, Math.min(MAX_WH, el.w + dw / canvasWidth));
              const nh = Math.max(MIN_WH, Math.min(MAX_WH, el.h + dh / canvasHeight));
              onUpdate({ w: nw, h: nh });
            }}
          />
        )}
      </div>
    </div>
  );
}

function ResizeHandle({ onResize }: { onResize: (dx: number, dy: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    startRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    startRef.current = { x: e.clientX, y: e.clientY };
    onResize(dx, dy);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    startRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={ref}
      className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm border border-amber-600 bg-amber-400"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { startRef.current = null; }}
    />
  );
}

export function AdminPlannerCanvas({ year, monthIndex }: AdminPlannerCanvasProps) {
  const month1 = monthIndex + 1;
  const [spreadId, setSpreadId] = useState<string | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addTargetPage, setAddTargetPage] = useState<PageSide>("right");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ id: string; x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/planner/spreads?year=${year}&month=${month1}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || data?.error) return;
        setSpreadId(data.id);
        return fetch(`/api/planner/spreads/${data.id}/elements`).then((res) => res.json());
      })
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;
        setElements(
          list.map((row: PlannerElement) => ({
            id: row.id,
            page_side: row.page_side,
            type: row.type,
            src: row.src,
            text: row.text,
            x: row.x,
            y: row.y,
            w: row.w,
            h: row.h,
            rotation: row.rotation,
            z_index: row.z_index,
            meta: row.meta ?? {},
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { cancelled = true; };
  }, [year, month1]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const addElement = useCallback((type: PlannerElementType, overrides?: Partial<CanvasElement>) => {
    const el = createNewElement(type, addTargetPage, elements, overrides);
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
    setAddMenuOpen(false);
  }, [addTargetPage, elements]);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setPhotoUploading(true);
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/planner/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data.publicUrl) addElement("photo", { src: data.publicUrl });
        else if (data.path) {
          const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") || "";
          addElement("photo", { src: base ? `${base}/storage/v1/object/public/planner-media/${data.path}` : data.path });
        }
      } finally {
        setPhotoUploading(false);
      }
    },
    [addElement]
  );

  const router = useRouter();
  const saveElements = useCallback(async () => {
    if (!spreadId) return;
    setSaving(true);
    try {
      const payload = elements.map((e) => ({
        id: e.id.startsWith("new-") ? null : e.id,
        page_side: e.page_side,
        type: e.type,
        src: e.src,
        text: e.text,
        x: e.x,
        y: e.y,
        w: e.w,
        h: e.h,
        rotation: e.rotation,
        z_index: e.z_index,
        meta: e.meta,
      }));
      const res = await fetch(`/api/planner/spreads/${spreadId}/elements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements: payload }),
      });
      if (res.ok) {
        router.push(`/admin/planner?toast=saved&msg=${encodeURIComponent("Notun ajandaya iğnelendi! ✨")}`);
        router.refresh();
        const list = await fetch(`/api/planner/spreads/${spreadId}/elements`).then((r) => r.json());
        if (Array.isArray(list)) {
          setElements(
            list.map((row: PlannerElement) => ({
              id: row.id,
              page_side: row.page_side,
              type: row.type,
              src: row.src,
              text: row.text,
              x: row.x,
              y: row.y,
              w: row.w,
              h: row.h,
              rotation: row.rotation,
              z_index: row.z_index,
              meta: row.meta ?? {},
            }))
          );
        }
      }
    } finally {
      setSaving(false);
    }
  }, [spreadId, elements, router]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    const el = elements.find((e) => e.id === id);
    if (el) {
      dragStartRef.current = { id, x: el.x, y: el.y };
      setSelectedId(id);
    }
  }, [elements]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const id = String(event.active.id);
      const delta = event.delta;
      const start = dragStartRef.current;
      if (start && start.id === id) {
        const newX = Math.max(0, Math.min(1, start.x + delta.x / CANVAS_WIDTH));
        const newY = Math.max(0, Math.min(1, start.y + delta.y / CANVAS_HEIGHT));
        updateElement(id, { x: newX, y: newY });
      }
      dragStartRef.current = null;
    },
    [updateElement]
  );

  const selectedEl = elements.find((e) => e.id === selectedId);
  const bringForward = () => selectedId && updateElement(selectedId, { z_index: (selectedEl?.z_index ?? 0) + 1 });
  const sendBackward = () => selectedId && updateElement(selectedId, { z_index: Math.max(0, (selectedEl?.z_index ?? 0) - 1) });

  if (loading) {
    return (
      <section className="rounded-xl border border-white/20 bg-white/5 p-4">
        <p className="text-sm text-white/70">Canvas yükleniyor…</p>
      </section>
    );
  }

  const leftElements = elements.filter((e) => e.page_side === "left");
  const rightElements = elements.filter((e) => e.page_side === "right");
  const canvasBg = "repeating-linear-gradient(transparent, transparent 26px, rgba(0,0,0,0.035) 26px, rgba(0,0,0,0.035) 27px)";

  return (
    <section className="rounded-xl border border-white/20 bg-white/5 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-white">Sayfa canvas — {year} / {month1}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-white/70">Eklenen öğe sayfası:</label>
          <select
            value={addTargetPage}
            onChange={(e) => setAddTargetPage(e.target.value as PageSide)}
            className="rounded border border-[var(--card-border)] bg-white px-2 py-1 text-sm text-neutral-900"
          >
            <option value="left">Sol</option>
            <option value="right">Sağ</option>
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/20"
            >
              <span>Öğe ekle</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {addMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAddMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-white/20 bg-[#1a1f2e] py-1 shadow-xl">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    disabled={photoUploading}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {photoUploading ? "Yükleniyor…" : "Fotoğraf yükle"}
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("sticky_note")}
                  >
                    <StickyNote className="h-4 w-4" /> Post-it
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("washi_tape")}
                  >
                    <Layers className="h-4 w-4" /> Washi bant
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("paperclip")}
                  >
                    <Paperclip className="h-4 w-4" /> Ataş
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("sticker")}
                  >
                    <Image className="h-4 w-4" /> Sticker
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("text_block")}
                  >
                    <Type className="h-4 w-4" /> Metin
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    onClick={() => addElement("coffee_stain")}
                  >
                    <Coffee className="h-4 w-4" /> Kahve lekesi
                  </button>
                </div>
              </>
            )}
          </div>
          {selectedId && (
            <>
              <button
                type="button"
                className="rounded border border-white/20 px-2 py-1 text-xs text-white/90 hover:bg-white/10"
                onClick={sendBackward}
              >
                Geri
              </button>
              <button
                type="button"
                className="rounded border border-white/20 px-2 py-1 text-xs text-white/90 hover:bg-white/10"
                onClick={bringForward}
              >
                Öne
              </button>
              {selectedEl && (selectedEl.type === "sticky_note" || selectedEl.type === "text_block") && (
                <input
                  type="text"
                  className="max-w-[120px] rounded border border-[var(--card-border)] bg-white px-2 py-0.5 text-xs text-neutral-900 placeholder:text-neutral-500"
                  value={selectedEl.text ?? ""}
                  onChange={(e) => updateElement(selectedId, { text: e.target.value })}
                  placeholder="Metin"
                />
              )}
              {selectedEl && (
                <label className="flex items-center gap-1 text-xs text-white/90">
                  Açı:
                  <input
                    type="number"
                    className="w-14 rounded border border-[var(--card-border)] bg-white px-1 py-0.5 text-xs text-neutral-900"
                    value={selectedEl.rotation}
                    onChange={(e) => updateElement(selectedId, { rotation: Number(e.target.value) || 0 })}
                    min={-180}
                    max={180}
                  />
                </label>
              )}
            </>
          )}
          <button
            type="button"
            disabled={saving || !spreadId}
            onClick={saveElements}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-amber-600"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            className="relative overflow-hidden rounded-lg border-2 border-dashed border-[var(--card-border)] bg-[#e6dcc8]"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              backgroundImage: canvasBg,
            }}
            onClick={() => setSelectedId(null)}
          >
            <span className="absolute left-2 top-1 text-xs text-neutral-600">Sol sayfa</span>
            {leftElements.map((el) => (
              <DraggableCanvasElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                onSelect={() => setSelectedId(el.id)}
                onUpdate={(u) => updateElement(el.id, u)}
                onRemove={() => removeElement(el.id)}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={CANVAS_HEIGHT}
              />
            ))}
          </div>
          <div
            className="relative overflow-hidden rounded-lg border-2 border-dashed border-[var(--card-border)] bg-[#e6dcc8]"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              backgroundImage: canvasBg,
            }}
            onClick={() => setSelectedId(null)}
          >
            <span className="absolute left-2 top-1 text-xs text-neutral-600">Sağ sayfa</span>
            {rightElements.map((el) => (
              <DraggableCanvasElement
                key={el.id}
                el={el}
                isSelected={selectedId === el.id}
                onSelect={() => setSelectedId(el.id)}
                onUpdate={(u) => updateElement(el.id, u)}
                onRemove={() => removeElement(el.id)}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={CANVAS_HEIGHT}
              />
            ))}
          </div>
        </DndContext>
      </div>
      <p className="mt-2 text-xs text-white/60">
        Öğeyi seçip sürükleyin; fotoğraf ve post-it için köşeden boyut değiştirebilirsiniz. Kaydet’e basın.
      </p>
    </section>
  );
}
