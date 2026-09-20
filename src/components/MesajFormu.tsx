"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const inputBase =
  "min-w-0 rounded-md border bg-white/[0.04] px-2.5 py-2 text-[0.82rem] text-[#f3ead9] outline-none transition-colors placeholder:text-[#9a9488]/70 focus:border-[rgba(201,166,90,0.55)]";

function isFormValid(isim: string, mesaj: string) {
  return isim.trim().length >= 2 && mesaj.trim().length >= 5;
}

export default function MesajFormu() {
  const [isim, setIsim] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [durum, setDurum] = useState<"bos" | "gonderiliyor" | "basarili" | "hata">("bos");
  const [hataMetni, setHataMetni] = useState("");
  const [uyariAcik, setUyariAcik] = useState(false);
  const [isimHatali, setIsimHatali] = useState(false);
  const [mesajHatali, setMesajHatali] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (durum === "gonderiliyor") return;

    const isimOk = isim.trim().length >= 2;
    const mesajOk = mesaj.trim().length >= 5;

    if (!isimOk || !mesajOk) {
      setIsimHatali(!isimOk);
      setMesajHatali(!mesajOk);
      setUyariAcik(true);
      return;
    }

    setUyariAcik(false);
    setIsimHatali(false);
    setMesajHatali(false);
    setDurum("gonderiliyor");
    setHataMetni("");

    try {
      const res = await fetch("/api/mesaj", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isim, mesaj }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };

      if (!res.ok) {
        setHataMetni(data.error || "Bir sorun oluştu");
        setDurum("hata");
        return;
      }

      setDurum("basarili");
      setIsim("");
      setMesaj("");
    } catch {
      setHataMetni("Bağlantı hatası, lütfen tekrar dene");
      setDurum("hata");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto mb-12 max-w-xl px-4 sm:max-w-2xl"
    >
      <div className="mb-3 text-center">
        <h3 className="font-display text-base font-bold text-[#f3ead9] sm:text-lg">
          Bana bir şey söylemek ister misin?
        </h3>
        <p className="mt-1 font-display text-sm italic text-[#9a9488] sm:text-base">
          Buradan da yazabilirsin..
        </p>
      </div>

      <div className="rounded-lg border border-[rgba(201,166,90,0.18)] bg-white/[0.025] px-3 py-3 sm:px-4 sm:py-3.5">
        <AnimatePresence>
          {uyariAcik && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="overflow-hidden rounded-md border border-[#b85c38]/35 bg-[#b85c38]/12 px-3 py-2.5 text-center"
              role="alert"
            >
              <p className="text-[0.82rem] font-medium text-[#e8a090]">
                Ooopps ama doldurmadığın yerler var!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {durum === "basarili" ? (
            <motion.div
              key="basarili"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1 text-center text-[0.82rem]"
            >
              <span className="text-[#c9a65a]">✦ Mesajın ulaştı, teşekkürler.</span>
              <button
                type="button"
                onClick={() => setDurum("bos")}
                className="text-[0.75rem] text-[#9a9488] underline-offset-2 hover:text-[#c9a65a] hover:underline"
              >
                Yeni mesaj
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={isim}
                  onChange={(e) => {
                    setIsim(e.target.value);
                    if (e.target.value.trim().length >= 2) setIsimHatali(false);
                    if (isFormValid(e.target.value, mesaj)) setUyariAcik(false);
                  }}
                  placeholder="Adın*"
                  maxLength={80}
                  aria-label="İsim"
                  aria-invalid={isimHatali}
                  className={`${inputBase} w-[5.5rem] shrink-0 sm:w-24 ${
                    isimHatali
                      ? "border-[#b85c38]/60"
                      : "border-[rgba(201,166,90,0.2)]"
                  }`}
                />
                <input
                  type="text"
                  value={mesaj}
                  onChange={(e) => {
                    setMesaj(e.target.value);
                    if (e.target.value.trim().length >= 5) setMesajHatali(false);
                    if (isFormValid(isim, e.target.value)) setUyariAcik(false);
                  }}
                  placeholder="Ne söylemek istersin?*"
                  maxLength={500}
                  aria-label="Mesaj"
                  aria-invalid={mesajHatali}
                  className={`${inputBase} flex-1 ${
                    mesajHatali
                      ? "border-[#b85c38]/60"
                      : "border-[rgba(201,166,90,0.2)]"
                  }`}
                />
                <motion.button
                  type="submit"
                  disabled={durum === "gonderiliyor"}
                  whileTap={durum !== "gonderiliyor" ? { scale: 0.97 } : undefined}
                  className={`shrink-0 rounded-md px-3 py-2 text-[0.78rem] font-medium tracking-[0.02em] transition-colors sm:px-3.5 sm:text-[0.82rem] ${
                    durum === "gonderiliyor"
                      ? "cursor-wait bg-[rgba(201,166,90,0.12)] text-[#9a9488]"
                      : "cursor-pointer bg-gradient-to-br from-[#c9a65a] to-[#8a6427] text-[#0a0908]"
                  }`}
                >
                  {durum === "gonderiliyor" ? "…" : "Gönder"}
                </motion.button>
              </div>

              <div className="flex items-center justify-between gap-2 px-0.5">
                {durum === "hata" && hataMetni ? (
                  <p className="text-[0.72rem] text-[#b85c38]">{hataMetni}</p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-[0.68rem] tabular-nums ${
                    mesaj.length > 450 ? "text-[#c9a65a]" : "text-[#9a9488]/60"
                  }`}
                >
                  {mesaj.length}/500
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
