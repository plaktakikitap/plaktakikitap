"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Check, AlertCircle, Copy } from "lucide-react";

const JsonView = dynamic(() => import("@uiw/react-json-view"), { ssr: false });

interface AdminJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  minHeight?: number;
}

function safeParse(val: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    const trimmed = val.trim();
    if (!trimmed) return { ok: true, data: [] };
    const data = JSON.parse(trimmed);
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Geçersiz JSON" };
  }
}

function formatJson(val: string): string {
  const p = safeParse(val);
  if (p.ok) return JSON.stringify(p.data, null, 2);
  return val;
}

export function AdminJsonEditor({
  value,
  onChange,
  name,
  placeholder = "[]",
  minHeight = 200,
}: AdminJsonEditorProps) {
  const [text, setText] = useState(value);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const parsed = safeParse(text);
  const isValid = parsed.ok;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setText(v);
    const p = safeParse(v);
    if (p.ok) onChange(v);
  };

  const handleFormat = () => {
    const formatted = formatJson(text);
    setText(formatted);
    onChange(formatted);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={isValid ? text : value} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            Formatla
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            <Copy className="h-3.5 w-3.5" />
            Kopyala
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10"
          >
            {showPreview ? "Düzenle" : "Önizle"}
          </button>
        </div>
        {isValid ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            Geçerli JSON
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Geçersiz JSON
          </span>
        )}
      </div>
      {showPreview && isValid ? (
        <div
          className="admin-bento-card overflow-auto rounded-xl p-4 font-mono text-sm"
          style={{ minHeight }}
        >
          <JsonView value={parsed.data as object} style={{ fontSize: "13px" }} />
        </div>
      ) : (
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className={`admin-input min-h-[200px] w-full resize-y font-mono text-sm ${
            !isValid && text.trim() ? "border-amber-500/50" : ""
          }`}
          style={{ minHeight }}
          spellCheck={false}
        />
      )}
    </div>
  );
}
