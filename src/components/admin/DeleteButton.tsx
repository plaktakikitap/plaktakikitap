"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteContent } from "@/app/actions";

export function DeleteButton({
  id,
  type,
  label,
}: {
  id: string;
  type: "film" | "series" | "book";
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const { error } = await deleteContent(id, type);
    if (error) alert(error);
    else router.refresh();
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--muted)]">Sil?</span>
        <button
          onClick={handleDelete}
          className="rounded px-2 py-0.5 text-xs font-medium text-red-500 hover:bg-red-500/10"
        >
          Evet
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded px-2 py-0.5 text-xs text-[var(--muted)] hover:bg-[var(--background)]"
        >
          Hayır
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500"
      title={`${label} sil`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
