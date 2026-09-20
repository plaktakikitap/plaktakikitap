"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { WorksItem, WorksItemType } from "@/types/works";
import { AdminImageUpload } from "./AdminImageUpload";
import {
  Briefcase,
  FileText,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  ExternalLink,
} from "lucide-react";

const TABS: { id: WorksItemType | "cv"; label: string }[] = [
  { id: "youtube", label: "Videolar" },
  { id: "photo", label: "Fotoğraf" },
  { id: "experience", label: "Deneyim" },
  { id: "project", label: "Projeler" },
  { id: "software", label: "Yazılım" },
  { id: "certificate", label: "Sertifikalar" },
  { id: "cv_role", label: "CV Roller" },
  { id: "cv", label: "CV PDF" },
];

const TAB_LABELS: Record<WorksItemType | "cv", string> = Object.fromEntries(
  TABS.map((t) => [t.id, t.label])
) as Record<WorksItemType | "cv", string>;

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Herkese açık" },
  { value: "unlisted", label: "Listelenmez" },
  { value: "private", label: "Gizli" },
] as const;

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    name.endsWith(".pdf")
  );
}

function isCvStoragePath(stored: string): boolean {
  const v = stored.trim();
  return !!v && !v.startsWith("http://") && !v.startsWith("https://");
}

function cvDisplayHref(stored: string): string {
  if (!stored.trim()) return "";
  return isCvStoragePath(stored) ? "/api/cv/download" : stored;
}

function cvDisplayLabel(stored: string): string {
  if (!stored.trim()) return "";
  if (isCvStoragePath(stored)) return stored.split("/").pop() ?? "CV.pdf";
  return stored.split("/").pop() ?? stored;
}

type Props = {
  items: WorksItem[];
  cvDownloadUrl: string;
};

export function AdminWorksItemsPanel({ items: initialItems, cvDownloadUrl }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState<WorksItemType | "cv">("youtube");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cvUrl, setCvUrl] = useState(cvDownloadUrl);
  const [certificatePdfUrl, setCertificatePdfUrl] = useState<string | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [cvPdfUploading, setCvPdfUploading] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const cvPdfInputRef = useRef<HTMLInputElement>(null);

  const filtered =
    tab === "cv" ? [] : items.filter((i) => (tab === "photo" ? i.type === tab : i.type === tab));

  async function refetch() {
    const res = await fetch("/api/admin/works/items");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      type: tab,
      title: fd.get("title") ?? "",
      subtitle: fd.get("subtitle") || null,
      description: fd.get("description") || null,
      tags: [],
      url: tab === "certificate" && certificatePdfUrl ? certificatePdfUrl : (fd.get("url") || null),
      external_url: fd.get("external_url") || null,
      image_url: fd.get("image_url") || null,
      meta: {},
      sort_order: items.length,
      is_featured: fd.get("featured") === "on",
      visibility: (fd.get("visibility") as string) || "public",
    };
    if (tab === "certificate" && fd.get("issuer")) (body.meta as Record<string, unknown>).issuer = fd.get("issuer");
    if (tab === "certificate" && fd.get("year")) (body.meta as Record<string, unknown>).year = fd.get("year");
    if (tab === "cv_role") {
      (body.meta as Record<string, unknown>).org = fd.get("org") || null;
      (body.meta as Record<string, unknown>).start_year = fd.get("start_year") || null;
      (body.meta as Record<string, unknown>).end_year = fd.get("end_year") || null;
    }
    if (tab === "project" || tab === "experience") {
      (body.meta as Record<string, unknown>).role = fd.get("role") || null;
      (body.meta as Record<string, unknown>).metrics = fd.get("metrics") || null;
    }
    if (tab === "software") {
      const stack = (fd.get("stack") as string)?.split(",").map((s) => s.trim()).filter(Boolean);
      (body.meta as Record<string, unknown>).stack = stack;
      (body.meta as Record<string, unknown>).github_url = fd.get("github_url") || null;
    }
    const res = await fetch("/api/admin/works/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Kaydedilemedi.");
      return;
    }
    form.reset();
    if (tab === "certificate") setCertificatePdfUrl(null);
    await refetch();
  }

  async function handleCertificatePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !isPdfFile(file)) return;
    setPdfUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", "certificates");
    const res = await fetch("/api/admin/upload/file", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setPdfUploading(false);
    e.target.value = "";
    if (res.ok && data.url) setCertificatePdfUrl(data.url);
    else setError(data.error ?? "PDF yükleme başarısız.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu öğeyi silmek istediğinize emin misiniz?")) return;
    setLoading(true);
    await fetch(`/api/admin/works/items/${id}`, { method: "DELETE" });
    setLoading(false);
    await refetch();
  }

  async function handleSortOrder(id: string, sort_order: number) {
    const res = await fetch(`/api/admin/works/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order }),
    });
    if (res.ok) await refetch();
  }

  async function saveCvUrl(url?: string) {
    const value = (url ?? cvUrl).trim();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/works/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "cv_download_url", value }),
    });
    setLoading(false);
    if (res.ok) {
      setCvUrl(value);
      router.refresh();
    } else {
      setError("Kaydetme hatası.");
    }
    return res.ok;
  }

  async function handleCvPdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Lütfen PDF dosyası seçin.");
      e.target.value = "";
      return;
    }
    setCvPdfUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/admin/works/cv-upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));
    setCvPdfUploading(false);
    e.target.value = "";
    if (!res.ok || !data.path) {
      setError(data.error ?? "PDF yükleme başarısız.");
      return;
    }
    setCvUrl(data.path);
    router.refresh();
  }

  async function handleCvFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveCvUrl();
  }

  const activeTabLabel = TAB_LABELS[tab];

  return (
    <div className="space-y-6">
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-bento-card p-2">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-[rgba(212,175,55,0.15)] text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.12)]"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "cv" ? (
        <section className="admin-bento-card p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-white/[0.06] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,175,55,0.12)] text-[#d4af37]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="admin-section-title">CV PDF</h3>
              <p className="mt-0.5 text-sm text-white/45">
                Bilgisayarınızdan yükleyin veya bir link girin
              </p>
            </div>
          </div>
          <form onSubmit={handleCvFormSubmit} className="space-y-5">
            <div>
              <label className="admin-label">PDF yükle</label>
              <input
                type="file"
                ref={cvPdfInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={handleCvPdfSelect}
              />
              <button
                type="button"
                onClick={() => cvPdfInputRef.current?.click()}
                disabled={loading || cvPdfUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.04] px-4 py-8 text-sm text-white/65 transition-colors hover:border-[rgba(212,175,55,0.35)] hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                {cvPdfUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-[#d4af37]" />
                    PDF yükleniyor…
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(212,175,55,0.12)] text-[#d4af37]">
                      <Upload className="h-6 w-6" />
                    </div>
                    Bilgisayardan CV PDF seçin
                  </>
                )}
              </button>
              <p className="admin-hint">En fazla 15 MB. Yükleme sonrası otomatik kaydedilir.</p>
            </div>

            {cvUrl ? (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-white/40">Aktif CV</p>
                <a
                  href={cvDisplayHref(cvUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 break-all text-sm text-[#d4af37] hover:text-[#f4d03f]"
                >
                  {cvDisplayLabel(cvUrl)}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </a>
              </div>
            ) : null}

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-3 text-xs uppercase tracking-wide text-white/35">
                  veya link girin
                </span>
              </div>
            </div>

            <div>
              <label className="admin-label" htmlFor="cv-pdf-url">
                PDF URL
              </label>
              <input
                id="cv-pdf-url"
                type="url"
                className="admin-input"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="admin-hint">Harici bir depolama linki de kullanabilirsiniz.</p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="admin-btn-gold disabled:opacity-50"
                disabled={loading || cvPdfUploading}
              >
                {loading ? "Kaydediliyor…" : "Linki kaydet"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="admin-bento-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="admin-section-title">{activeTabLabel}</h3>
              <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-white/45">
                {filtered.length} öğe
              </span>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-white/45">Bu sekmede henüz içerik yok.</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 sm:px-4"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <GripVertical className="hidden h-4 w-4 shrink-0 text-white/25 sm:block" aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white/90">{item.title}</p>
                        {item.subtitle ? (
                          <p className="mt-0.5 truncate text-xs text-white/45">{item.subtitle}</p>
                        ) : null}
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.is_featured ? (
                            <span className="rounded-md bg-[rgba(212,175,55,0.12)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#d4af37]">
                              Öne çıkan
                            </span>
                          ) : null}
                          <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/40">
                            {VISIBILITY_OPTIONS.find((v) => v.value === item.visibility)?.label ??
                              item.visibility}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <label className="sr-only" htmlFor={`sort-${item.id}`}>
                          Sıra
                        </label>
                        <span className="text-[10px] uppercase tracking-wide text-white/35">Sıra</span>
                        <input
                          id={`sort-${item.id}`}
                          type="number"
                          className="admin-input w-16 !min-h-0 px-2 py-1.5 text-center text-sm"
                          defaultValue={item.sort_order}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v)) handleSortOrder(item.id, v);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-red-500/15 hover:text-red-400"
                        disabled={loading}
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form onSubmit={handleCreate} className="admin-bento-card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b border-white/[0.06] pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(212,175,55,0.12)] text-[#d4af37]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="admin-section-title">Yeni {activeTabLabel.toLowerCase()} ekle</h3>
                <p className="mt-0.5 text-sm text-white/45">Formu doldurup kaydedin</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="admin-label" htmlFor="works-title">
                    Başlık *
                  </label>
                  <input
                    id="works-title"
                    name="title"
                    type="text"
                    className="admin-input admin-input-lg"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label" htmlFor="works-subtitle">
                    Alt başlık
                  </label>
                  <input id="works-subtitle" name="subtitle" type="text" className="admin-input" />
                </div>
              </div>

              {(tab === "youtube" || tab === "project" || tab === "experience" || tab === "software") && (
                <div>
                  <label className="admin-label" htmlFor="works-url">
                    URL
                  </label>
                  <input
                    id="works-url"
                    name="url"
                    type="url"
                    className="admin-input"
                    placeholder="https://..."
                  />
                </div>
              )}

              {tab === "certificate" && (
                <div>
                  <label className="admin-label" htmlFor="works-cert-url">
                    URL (isteğe bağlı)
                  </label>
                  <input
                    id="works-cert-url"
                    name="url"
                    type="url"
                    className="admin-input"
                    placeholder="https://..."
                    disabled={!!certificatePdfUrl}
                  />
                  <p className="admin-hint">PDF yüklerseniz bu alan devre dışı kalır.</p>
                </div>
              )}

              {tab === "photo" && (
                <div>
                  <label className="admin-label">Görsel</label>
                  <AdminImageUpload
                    name="image_url"
                    placeholder="Fotoğraf veya çizim yükleyin"
                  />
                </div>
              )}

              {tab === "certificate" && (
                <>
                  <div>
                    <label className="admin-label">Görsel</label>
                    <AdminImageUpload
                      name="image_url"
                      placeholder="Sertifika fotoğrafı veya rozet yükleyin"
                    />
                  </div>
                  <div>
                    <label className="admin-label">PDF sertifika</label>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCertificatePdfSelect}
                    />
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={loading || pdfUploading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.04] px-4 py-4 text-sm text-white/65 transition-colors hover:border-[rgba(212,175,55,0.35)] hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                    >
                      {pdfUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 text-[#d4af37]" />
                      )}
                      {pdfUploading
                        ? "Yükleniyor…"
                        : certificatePdfUrl
                          ? "PDF yüklendi — değiştirmek için tıklayın"
                          : "PDF dosyası seçin"}
                    </button>
                    {certificatePdfUrl ? (
                      <p className="admin-hint">Kayıt sırasında PDF linki otomatik eklenir.</p>
                    ) : null}
                  </div>
                </>
              )}

              {(tab === "project" || tab === "experience") && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="admin-label" htmlFor="works-role">
                      Rol
                    </label>
                    <input id="works-role" name="role" type="text" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="works-metrics">
                      Metrik
                    </label>
                    <input
                      id="works-metrics"
                      name="metrics"
                      type="text"
                      className="admin-input"
                      placeholder="Haftada X içerik"
                    />
                  </div>
                </div>
              )}

              {tab === "software" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="admin-label" htmlFor="works-stack">
                      Teknoloji yığını
                    </label>
                    <input
                      id="works-stack"
                      name="stack"
                      type="text"
                      className="admin-input"
                      placeholder="React, Node, …"
                    />
                    <p className="admin-hint">Virgülle ayırın.</p>
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="works-github">
                      GitHub URL
                    </label>
                    <input
                      id="works-github"
                      name="github_url"
                      type="url"
                      className="admin-input"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              )}

              {tab === "certificate" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="admin-label" htmlFor="works-issuer">
                      Veren kurum
                    </label>
                    <input id="works-issuer" name="issuer" type="text" className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label" htmlFor="works-year">
                      Yıl
                    </label>
                    <input id="works-year" name="year" type="text" className="admin-input" placeholder="2024" />
                  </div>
                </div>
              )}

              {tab === "cv_role" && (
                <>
                  <div>
                    <label className="admin-label" htmlFor="works-org">
                      Kurum
                    </label>
                    <input id="works-org" name="org" type="text" className="admin-input" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="admin-label" htmlFor="works-start-year">
                        Başlangıç yılı
                      </label>
                      <input id="works-start-year" name="start_year" type="text" className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label" htmlFor="works-end-year">
                        Bitiş yılı
                      </label>
                      <input
                        id="works-end-year"
                        name="end_year"
                        type="text"
                        className="admin-input"
                        placeholder="Devam ediyorsa boş bırakın"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="admin-label" htmlFor="works-description">
                  Açıklama
                </label>
                <textarea
                  id="works-description"
                  name="description"
                  className="admin-input min-h-[5.5rem] resize-y py-3"
                  rows={3}
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                  <input
                    name="featured"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white text-[#d4af37] focus:ring-[rgba(212,175,55,0.5)]"
                  />
                  Öne çıkan
                </label>
                <div className="flex flex-1 items-center gap-3 sm:max-w-xs">
                  <label className="admin-label !mb-0 shrink-0" htmlFor="works-visibility">
                    Görünürlük
                  </label>
                  <select
                    id="works-visibility"
                    name="visibility"
                    className="admin-input admin-select !min-h-0 py-2"
                    defaultValue="public"
                  >
                    {VISIBILITY_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="admin-btn-gold inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ekleniyor…
                  </>
                ) : (
                  <>
                    <Briefcase className="h-4 w-4" />
                    Ekle
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
