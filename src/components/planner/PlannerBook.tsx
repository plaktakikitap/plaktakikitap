"use client";

import styles from "./PlannerBook.module.css";

interface PlannerBookProps {
  children: React.ReactNode;
}

/**
 * Tek defter görünümü: overflow hidden, gutter gölge, sayfa kalınlığı hissi.
 * PageStack/spiral/ok yok.
 */
export function PlannerBook({ children }: PlannerBookProps) {
  return (
    <div className={styles.bookStage}>
      <div className={styles.bookShell}>
        <div className={styles.spread}>{children}</div>
      </div>
    </div>
  );
}
