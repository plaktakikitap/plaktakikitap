"use client";

const chip =
  "rounded-lg border border-[#1a1612]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#1a1612] transition hover:border-[#b8934a]/50 disabled:opacity-50";

export function PublishBar({
  loading,
  scheduledLabel,
  zamanOpen,
  zamanValue,
  onZamanChange,
  onTaslak,
  onZamanla,
}: {
  loading: boolean;
  scheduledLabel?: string | null;
  zamanOpen: boolean;
  zamanValue: string;
  onZamanChange: (value: string) => void;
  onTaslak: () => void;
  onZamanla: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2 pt-2">
      {scheduledLabel ? (
        <p className="text-xs text-[#6b6158]">{scheduledLabel}</p>
      ) : null}
      <div className="flex gap-2">
        <button type="button" onClick={onTaslak} disabled={loading} className={chip}>
          Taslağa at
        </button>
        <button
          type="button"
          onClick={onZamanla}
          disabled={loading}
          className={`${chip} ${zamanOpen ? "border-[#b8934a] text-[#8a6427]" : ""}`}
        >
          Zamanla
        </button>
      </div>
      {zamanOpen ? (
        <label className="flex items-center gap-2 text-[11px] text-[#6b6158]">
          <input
            type="datetime-local"
            value={zamanValue}
            onChange={(event) => onZamanChange(event.target.value)}
            className="rounded-lg border border-[#e8e0d4] bg-white px-2 py-1.5 text-xs text-[#1a1612]"
          />
          TSİ
        </label>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Kaydediliyor…" : "Yayınla"}
        <span className="ml-2 hidden text-[10px] font-normal text-black/50 sm:inline">
          ⌘/Ctrl+Enter
        </span>
      </button>
    </div>
  );
}
