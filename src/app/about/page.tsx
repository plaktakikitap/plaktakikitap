"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransitionTarget } from "@/components/layout/PageTransitionTarget";

export default function AboutPage() {
  return (
    <PageTransitionTarget layoutId="card-/about">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <PageHeader
          layoutId="nav-/about"
          title="About"
          subtitle="Eymen — Plaktaki Kitap"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="prose prose-neutral dark:prose-invert"
        >
          <p className="text-[var(--muted)]">
            Film, kitap, proje ve çeviri koleksiyonum.
          </p>
          <Link
            href="/home"
            className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            ← Ana sayfaya dön
          </Link>
        </motion.div>
      </div>
    </PageTransitionTarget>
  );
}
