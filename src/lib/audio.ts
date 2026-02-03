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

export function playSound(
  src: string,
  options?: {
    volume?: number;
    playbackRate?: number;
    onEnded?: () => void;
  }
): HTMLAudioElement | null {
  if (!areSoundsEnabled()) return null;
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, options?.volume ?? 1));
    audio.playbackRate = options?.playbackRate ?? 1;
    if (options?.onEnded) audio.addEventListener("ended", options.onEnded);
    audio.play().catch(() => {});
    return audio;
  } catch {
    return null;
  }
}

export const AUDIO = {
  recordChoice: "/audio/record-choice.mp3",
  bookChoice: "/audio/book-choice.mp3",
  paperFlip: "/audio/paper-flip.mp3",
  metallicClick: "/audio/metallic-click.mp3",
} as const;
