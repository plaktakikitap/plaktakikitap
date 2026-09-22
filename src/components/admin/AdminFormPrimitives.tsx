"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

const fieldClass =
  "w-full rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-2.5 text-sm text-[#1a1612] placeholder:text-[#6b6158] outline-none focus:border-[#b8934a]/40";
const labelClass = "mb-1.5 block text-sm text-[#1a1612]/70";

export function AdminFieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label className={labelClass} htmlFor={htmlFor}>
      {children}
      {required ? <span className="ml-0.5 text-[#b8934a]">*</span> : null}
    </label>
  );
}

export function AdminTextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function AdminTextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea {...props} className={`${fieldClass} resize-y ${props.className ?? ""}`} />
  );
}

export function AdminOptionalSection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs uppercase tracking-wider text-[#1a1612]/40 hover:text-[#1a1612]/70"
      >
        Opsiyonel alanları {open ? "gizle ▴" : "göster ▾"}
      </button>
      {open ? <div className="space-y-4 border-t border-[#e8e0d4] px-3.5 py-4">{children}</div> : null}
    </div>
  );
}

export function AdminRecentList({
  items,
}: {
  items: { id: string; title: string; meta?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5 rounded-xl border border-[#e8e0d4] bg-[#1a1612]/5 px-3.5 py-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#1a1612]/40">
        Son kayıtlar
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-baseline justify-between gap-3 text-sm"
          >
            <span className="truncate text-[#1a1612]/80">{item.title || "—"}</span>
            {item.meta ? (
              <span className="shrink-0 text-[11px] text-[#1a1612]/40">{item.meta}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminSaveBar({
  loading,
  label = "Kaydet",
  className = "",
}: {
  loading?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex justify-end pt-2 ${className}`}>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : label}
        <span className="ml-2 hidden text-[10px] font-normal text-black/50 sm:inline">
          ⌘/Ctrl+Enter
        </span>
      </button>
    </div>
  );
}

/** Cmd/Ctrl+Enter submits the nearest form */
export function useAdminCmdEnter(
  formRef: React.RefObject<HTMLFormElement | null>
) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "Enter") return;
      const form = formRef.current;
      if (!form) return;
      e.preventDefault();
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [formRef]);
}

export function adminFormOnSubmit(
  handler: (e: FormEvent<HTMLFormElement>) => void | Promise<void>
) {
  return async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handler(e);
  };
}

export { fieldClass, labelClass };
