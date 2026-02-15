"use client";

import React from "react";
import styles from "./covers.module.css";

export function InsideBackCover() {
  return <div className={`${styles.page} ${styles.flyleaf}`} />;
}
