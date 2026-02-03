/**
 * Ses sistemi — HTML5 Audio API
 *
 * ÖNEMLİ: Tarayıcılar kullanıcı etkileşimi olmadan ses çalmayı engeller (autoplay policy).
 * Bu sesler YALNIZCA şu etkileşimlere bağlıdır:
 * - Buton tıklamaları (giriş: Plak/Kitap)
 * - Sayfa çevirme hareketleri (ajanda: sürükle/tıkla)
 */

const STORAGE_KEY = "site_sounds_enabled";

export function areSoundsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function setSoundsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent("sounds-enabled-changed", { detail: enabled }));
}

/**
 * Ses çal — HTML5 Audio API.
 * Birden fazla format verilirse (örn. [.webm, .mp3]) sırayla dener; ilk yüklenen çalar.
 */
export function playSound(
  sources: string | readonly string[],
  options?: {
    volume?: number;
    playbackRate?: number;
    onEnded?: () => void;
  }
): HTMLAudioElement | null {
  if (!areSoundsEnabled()) return null;
  const list = Array.isArray(sources) ? sources : [sources];

  const attempt = (idx: number): HTMLAudioElement | null => {
    if (idx >= list.length) return null;
    try {
      const audio = new Audio(list[idx]);
      audio.volume = Math.min(1, Math.max(0, options?.volume ?? 1));
      audio.playbackRate = options?.playbackRate ?? 1;
      if (options?.onEnded) audio.addEventListener("ended", options.onEnded);

      audio.addEventListener("error", () => {
        attempt(idx + 1);
      });

      audio.play().catch(() => {});
      return audio;
    } catch {
      return attempt(idx + 1);
    }
  };

  return attempt(0);
}

/** Ses yolları — .webm (daha küçük) önce, .mp3 yedek */
export const AUDIO = {
  recordChoice: ["/audio/record-choice.webm", "/audio/record-choice.mp3"],
  bookChoice: ["/audio/book-choice.webm", "/audio/book-choice.mp3"],
  paperFlip: ["/audio/paper-flip.webm", "/audio/paper-flip.mp3"],
  metallicClick: ["/audio/metallic-click.webm", "/audio/metallic-click.mp3"],
} as const;
