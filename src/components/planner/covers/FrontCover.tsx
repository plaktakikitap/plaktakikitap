"use client";

import React from "react";
import styles from "./covers.module.css";

interface FrontCoverProps {
  year: number;
}

export function FrontCover({ year }: FrontCoverProps) {
  return (
    <div
      className={`${styles.page} ${styles.cover} ${styles.front}`}
      style={{ width: "100%", height: "100%" }}
      data-page="front-cover"
    >
      <div className={styles.coverInner}>
        <div className={styles.title}>
          <div className={styles.titleBig}>AJANDA</div>
          <div className={styles.titleSmall}>{year}</div>
        </div>
      </div>
    </div>
  );
}
