import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FilmForm } from "@/components/admin/FilmForm";

export default function NewFilmPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin/films"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Filmler
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Yeni Film</h1>
        <p className="mt-1 text-[var(--muted)]">Film bilgilerini girin</p>
        <FilmForm />
      </motion.div>
    </div>
  );
}
