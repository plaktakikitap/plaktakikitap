"use client";

import { motion } from "framer-motion";

/** Sabit sayfa boyutu — küçültme; kapağı sayfaların dışına ör */
const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 700;

interface BulletJournalBookProps {
  children: React.ReactNode;
}

/**
 * Wrapper: HTMLPageFlip .book-container içinde.
 * Kapak yok; tüm sayfalar takvim/notlar (#fdfaf3).
 */
export function BulletJournalBook({ children }: BulletJournalBookProps) {
  const spreadWidth = PAGE_WIDTH * 2;
  const spreadHeight = PAGE_HEIGHT;

  return (
    <motion.div
      className="relative mx-auto my-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="book-container">
        <div
          className="relative overflow-hidden rounded-lg bg-transparent"
          style={{
            width: spreadWidth,
            height: spreadHeight,
          }}
        >
          {children}

          {/* Ortadaki cilt gölgesi (Spine) — sayfalar cilde bağlı dursun */}
          <div className="book-spine" aria-hidden />

          {/* Sayfa kenarı kağıt yığını efekti */}
          <div className="page-stack-effect rounded-sm" aria-hidden />
        </div>
      </div>
    </motion.div>
  );
}

export const BOOK_PAGE_WIDTH = PAGE_WIDTH;
export const BOOK_PAGE_HEIGHT = PAGE_HEIGHT;
