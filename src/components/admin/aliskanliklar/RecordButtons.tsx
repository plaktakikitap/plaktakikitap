"use client";

import type { AliskanlikKayitDurum } from "@/types/takip";
import { chipClass, goldBtn } from "./api";

export function RecordButtons({
  pending,
  emphasizeMin,
  onDurum,
  onPlanliDegil,
  onGeriAl,
  showValue,
  onValue,
}: {
  pending?: boolean;
  emphasizeMin?: boolean;
  onDurum: (durum: AliskanlikKayitDurum) => void;
  onPlanliDegil: () => void;
  onGeriAl: () => void;
  showValue?: boolean;
  onValue?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => onDurum("minimum")}
        className={emphasizeMin ? goldBtn : chipClass}
      >
        Minimum
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => onDurum("hedef")}
        className={chipClass}
      >
        Hedef
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => onDurum("bonus")}
        className={chipClass}
      >
        Bonus
      </button>
      {showValue && onValue ? (
        <button
          type="button"
          disabled={pending}
          onClick={onValue}
          className={chipClass}
        >
          Değer gir
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={onPlanliDegil}
        className={chipClass}
      >
        Bugün planlı değil
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onGeriAl}
        className={chipClass}
      >
        Geri al
      </button>
    </div>
  );
}
