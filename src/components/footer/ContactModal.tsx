"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  mailTo?: string; // E-posta adresi (mail link'ten gelir)
}

const DEFAULT_MAIL = "iletisim@plaktakikitap.com";

export function ContactModal({ isOpen, onClose, mailTo }: ContactModalProps) {
  const to = mailTo?.replace(/^mailto:/i, "").trim() || DEFAULT_MAIL;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-black/10 text-[#201A14] shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
              style={{
                backgroundColor: "#f2ead7",
                backgroundImage: [
                  "repeating-linear-gradient(transparent, transparent 28px, rgba(0,0,0,0.04) 28px, rgba(0,0,0,0.04) 29px)",
                  "linear-gradient(rgba(0,0,0,0.02), transparent)",
                ].join(", "),
              }}
            >
              <div className="relative p-6">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-black/50 transition hover:bg-black/5 hover:text-black/80"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5" />
                </button>

                <h3 className="font-display text-xl font-semibold">
                  Bana yazın
                </h3>
                <p className="mt-1 text-sm text-black/60">
                  Merhaba demek isterseniz, formu doldurun.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value ?? "";
                    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value ?? "";
                    const message = (form.querySelector('[name="message"]') as HTMLTextAreaElement)?.value ?? "";
                    const subject = encodeURIComponent(`İletişim: ${name}`);
                    const body = encodeURIComponent(`${message}\n\n---\n${name} (${email})`);
                    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
                    onClose();
                  }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1 block text-sm font-medium text-black/70"
                    >
                      Adınız
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      className="w-full rounded-lg border border-black/15 bg-white/60 px-4 py-2.5 text-[#201A14] outline-none transition placeholder:text-black/40 focus:border-amber-600/50 focus:ring-1 focus:ring-amber-500/30"
                      placeholder="Adınız"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1 block text-sm font-medium text-black/70"
                    >
                      E-posta
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-lg border border-black/15 bg-white/60 px-4 py-2.5 text-[#201A14] outline-none transition placeholder:text-black/40 focus:border-amber-600/50 focus:ring-1 focus:ring-amber-500/30"
                      placeholder="email@ornek.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1 block text-sm font-medium text-black/70"
                    >
                      Mesajınız
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      className="w-full resize-none rounded-lg border border-black/15 bg-white/60 px-4 py-2.5 text-[#201A14] outline-none transition placeholder:text-black/40 focus:border-amber-600/50 focus:ring-1 focus:ring-amber-500/30"
                      placeholder="Merhaba, ..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-700/90 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
                    >
                      Gönder
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-black/15 px-4 py-2.5 text-sm font-medium text-black/70 transition hover:bg-black/5"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
