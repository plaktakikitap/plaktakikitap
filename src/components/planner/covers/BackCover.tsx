"use client";

import React from "react";
import styles from "./covers.module.css";

export function BackCover() {
  return (
    <div className={`${styles.page} ${styles.cover} ${styles.back}`}>
      <div className={styles.coverInner} />
    </div>
  );
}
