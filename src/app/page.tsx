"use client";

/**
 * Giriş: Kapüşonlu figür ellerini uzatıyor (arkaplan + Plak/Kitap seçenekleri)
 * Seçim: Plak → cızırtılı melodi → morph ile ana sayfa
 *        Kitap → sayfa sesi → morph ile ana sayfa
 */
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Disc3, Book } from "lucide-react";
import { playSound, AUDIO } from "@/lib/audio";

const EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION = { duration: 0.22, ease: EASE };

const RED_GLOW =
  "drop-shadow(0 0 10px rgba(255,60,60,0.75)) drop-shadow(0 0 34px rgba(255,0,0,0.35))";
const BLUE_GLOW =
  "drop-shadow(0 0 10px rgba(80,140,255,0.75)) drop-shadow(0 0 34px rgba(40,120,255,0.35))";
const BASE_SHADOW = "drop-shadow(0 20px 40px rgba(0,0,0,0.55))";

const PLAK_SOUND_DURATION_MS = 1500;
const KITAP_SOUND_DURATION_MS = 500;

export default function IntroGate() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<"plak" | "kitap" | null>(null);

  const handleChoice = (entry: "plak" | "kitap") => {
    if (selected) return;
    setSelected(entry);

    if (entry === "plak") {
      playSound(AUDIO.recordChoice, { volume: 0.7 });
      const delay = reduce ? 250 : PLAK_SOUND_DURATION_MS;
      setTimeout(() => router.push(`/home?entry=${entry}`), delay);
    } else {
      playSound(AUDIO.bookChoice, { volume: 0.8 });
      const delay = reduce ? 250 : KITAP_SOUND_DURATION_MS;
      setTimeout(() => router.push(`/home?entry=${entry}`), delay);
    }
  };

  const hoverAnim = reduce
    ? {}
    : { y: -10, scale: 1.06, transition: TRANSITION };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black px-6">
      {/* Mobil: lacivert + parıltılı arka plan (ana sayfa ile aynı) */}
      <div className="fixed inset-0 -z-10 md:hidden" aria-hidden>
        <div className="absolute inset-0" style={{ backgroundColor: "#050A14" }} />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(900px 600px at 50% 18%, rgba(255,255,255,0.08), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: "soft-light",
          }}
        />
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: "18%", top: "22%", size: 12, delay: "0s" },
            { left: "82%", top: "28%", size: 12, delay: "1.2s" },
            { left: "12%", top: "65%", size: 16, delay: "2.4s" },
            { left: "88%", top: "72%", size: 12, delay: "0.8s" },
            { left: "45%", top: "12%", size: 12, delay: "1.8s" },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-sparkle"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 65%)",
                boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mobil: başlık + alt başlık + plak / kitap alt alta */}
      <div className="flex md:hidden w-full flex-col items-center justify-center gap-8 py-12">
        <div className="flex flex-col items-center gap-1">
          <h1
            className="text-center text-3xl font-semibold tracking-[0.12em] text-[#F3EBDD] uppercase"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              textShadow: "0 0 12px rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            Make Your Choice
          </h1>
          <p
            className="text-sm font-normal tracking-[0.04em] text-[#F3EBDD] opacity-80"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            Plaktaki Kitap edition
          </p>
        </div>
        <motion.button
          type="button"
          aria-label="Plak"
          onClick={() => handleChoice("plak")}
          animate={
            selected
              ? selected === "plak"
                ? { scale: 1.08, opacity: 1, filter: `${BASE_SHADOW} ${RED_GLOW}` }
                : { opacity: 0.35, filter: BASE_SHADOW }
              : {}
          }
          transition={TRANSITION}
          whileHover={
            selected ? undefined : { scale: 1.05, filter: `${BASE_SHADOW} ${RED_GLOW}` }
          }
          style={{ filter: !selected ? BASE_SHADOW : undefined }}
          className="flex size-24 items-center justify-center rounded-full touch-manipulation"
        >
          <Disc3 size={80} strokeWidth={1.5} className="text-[#F3EBDD]" />
        </motion.button>
        <motion.button
          type="button"
          aria-label="Kitap"
          onClick={() => handleChoice("kitap")}
          animate={
            selected
              ? selected === "kitap"
                ? { scale: 1.08, opacity: 1, filter: `${BASE_SHADOW} ${BLUE_GLOW}` }
                : { opacity: 0.35, filter: BASE_SHADOW }
              : {}
          }
          transition={TRANSITION}
          whileHover={
            selected ? undefined : { scale: 1.05, filter: `${BASE_SHADOW} ${BLUE_GLOW}` }
          }
          style={{ filter: !selected ? BASE_SHADOW : undefined }}
          className="flex size-24 items-center justify-center rounded-xl touch-manipulation"
        >
          <Book size={72} strokeWidth={1.5} className="text-[#F3EBDD]" />
        </motion.button>
      </div>

      {/* Masaüstü: stage + arka plan görseli + ikonlar */}
      <div className="relative hidden w-[min(1200px,95vw)] aspect-[16/9] md:block">
        {/* Arka plan — stage içinde */}
        <Image
          src="/images/intro/arkaplan.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px 600px at 50% 20%, rgba(255,255,255,0.10), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.75))",
          }}
        />

        {/* Title + Subtitle */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <h1
            className="text-center text-4xl md:text-6xl font-semibold tracking-[0.12em] text-[#F3EBDD] uppercase"
            style={{
              fontFamily: "var(--font-cinzel), serif",
              textShadow: "0 0 12px rgba(255,255,255,0.15), 0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            MAKE YOUR CHOICE
          </h1>
          <p
            className="text-sm md:text-base font-normal tracking-[0.04em] text-[#F3EBDD] opacity-80"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            plaktaki kitap edition
          </p>
        </div>

        {/* Plak */}
        <div
          className="absolute flex cursor-pointer items-center justify-center"
          style={{
            left: "31%",
            top: "57%",
            width: 220,
            height: 220,
            transform: "translate(-50%, -50%) translateX(-8px) translateY(-26px)",
          }}
        >
          <motion.button
            type="button"
            aria-label="Plak"
            onClick={() => handleChoice("plak")}
            animate={
              selected
                ? selected === "plak"
                  ? { scale: 1.12, opacity: 1, filter: `${BASE_SHADOW} ${RED_GLOW}` }
                  : { opacity: 0.3, filter: BASE_SHADOW }
                : {}
            }
            transition={TRANSITION}
            whileHover={
              selected
                ? undefined
                : {
                    ...hoverAnim,
                    rotate: 6,
                    filter: `${BASE_SHADOW} ${RED_GLOW}`,
                  }
            }
            style={{ filter: !selected ? BASE_SHADOW : undefined }}
            className="flex size-full items-center justify-center rounded-full p-3"
          >
            <Disc3 size={200} strokeWidth={1.5} className="text-[#F3EBDD]" />
          </motion.button>
        </div>

        {/* Kitap */}
        <div
          className="absolute flex cursor-pointer items-center justify-center"
          style={{
            left: "72%",
            top: "56%",
            width: 215,
            height: 215,
            transform: "translate(-50%, -50%) translateX(16px) translateY(-24px)",
          }}
        >
          <motion.button
            type="button"
            aria-label="Kitap"
            onClick={() => handleChoice("kitap")}
            animate={
              selected
                ? selected === "kitap"
                  ? {
                      scale: 1.12,
                      opacity: 1,
                      filter: `${BASE_SHADOW} ${BLUE_GLOW}`,
                    }
                  : { opacity: 0.3, filter: BASE_SHADOW }
                : {}
            }
            transition={TRANSITION}
            whileHover={
              selected
                ? undefined
                : {
                    ...hoverAnim,
                    rotate: -4,
                    filter: `${BASE_SHADOW} ${BLUE_GLOW}`,
                  }
            }
            style={{ filter: !selected ? BASE_SHADOW : undefined }}
            className="flex size-full items-center justify-center rounded-xl p-3"
          >
            <Book size={190} strokeWidth={1.5} className="text-[#F3EBDD]" />
          </motion.button>
        </div>

      </div>
    </main>
  );
}
