"use client";

import { useState } from "react";
import Image from "next/image";
import type { MusicTrackRow } from "@/types/database";
import {
  adminCreateMusicTrack,
  adminUpdateMusicTrack,
  adminDeleteMusicTrack,
  adminStartMusicPlaylist,
} from "@/app/secretgate/actions";

const labelClass = "mb-1 block text-sm font-medium text-[var(--foreground)]";
const inputClass =
  "w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export function AdminMusicPanel({
  tracks: initialTracks,
  playlistStartedAt,
}: {
  tracks: MusicTrackRow[];
  playlistStartedAt: string | null;
}) {
  const [tracks, setTracks] = useState(initialTracks);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [durationSec, setDurationSec] = useState<number>(180);
  const [uploading, setUploading] = useState<"audio" | "cover" | null>(null);

  async function uploadFile(type: "audio" | "cover", file: File) {
    setUploading(type);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("type", type);
      const res = await fetch("/api/admin/music/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız");
      if (type === "audio") {
        setAudioUrl(data.url);
        const url = data.url as string;
        const audio = new Audio(url);
        audio.addEventListener("loadedmetadata", () => {
          const sec = Math.round(audio.duration);
          if (Number.isFinite(sec) && sec > 0) setDurationSec(sec);
        });
      } else setCoverUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(null);
    }
  }

  async function handleStartPlaylist() {
    setError(null);
    const result = await adminStartMusicPlaylist();
    if (result.error) setError(result.error);
    else {
      setSuccess("Playlist başlatıldı — herkes aynı pozisyonda dinleyecek.");
      window.location.reload();
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (audioUrl) formData.set("audio_url", audioUrl);
    if (coverUrl) formData.set("cover_url", coverUrl);
    const result = await adminCreateMusicTrack(formData);
    if (result.error) setError(result.error);
    else {
      setSuccess("Parça eklendi.");
      setAudioUrl("");
      setCoverUrl("");
      form.reset();
      window.location.reload();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu parçayı silmek istediğinize emin misiniz?")) return;
    setError(null);
    const result = await adminDeleteMusicTrack(id);
    if (result.error) setError(result.error);
    else {
      setTracks((prev) => prev.filter((t) => t.id !== id));
      setSuccess("Silindi.");
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {playlistStartedAt ? (
        <p className="text-sm text-[var(--muted)]">
          Playlist başlangıç: {new Date(playlistStartedAt).toLocaleString("tr-TR")}
        </p>
      ) : null}
      <div>
        <button
          type="button"
          onClick={handleStartPlaylist}
          disabled={tracks.filter((t) => t.is_active).length === 0}
          className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          Playlisti şimdi başlat
        </button>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Aktif parçalar sırayla, tek bir zaman çizgisiyle çalacak.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <form onSubmit={handleCreate} className="space-y-4 rounded border border-[var(--border)] p-4">
        <h2 className="font-medium">Yeni parça ekle</h2>
        <div>
          <label className={labelClass}>Şarkı adı</label>
          <input name="title" required className={inputClass} placeholder="Şarkı adı" />
        </div>
        <div>
          <label className={labelClass}>Sanatçı</label>
          <input name="artist" required className={inputClass} placeholder="Sanatçı" />
        </div>
        <div>
          <label className={labelClass}>MP3 dosyası</label>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile("audio", f);
            }}
            disabled={!!uploading}
          />
          {uploading === "audio" && <span className="ml-2 text-sm text-amber-600">Yükleniyor…</span>}
          {audioUrl && <p className="mt-1 text-xs text-[var(--muted)]">Yüklendi.</p>}
        </div>
        <div>
          <label className={labelClass}>Kapak (opsiyonel)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile("cover", f);
            }}
            disabled={!!uploading}
          />
          {uploading === "cover" && <span className="ml-2 text-sm text-amber-600">Yükleniyor…</span>}
          {coverUrl && <p className="mt-1 text-xs text-[var(--muted)]">Yüklendi.</p>}
        </div>
        <div>
          <label className={labelClass}>Süre (saniye) — MP3 yükleyince otomatik dolar</label>
          <input
            name="duration_sec"
            type="number"
            min={0}
            className={inputClass}
            placeholder="180"
            value={durationSec}
            onChange={(e) => setDurationSec(Math.max(0, parseInt(e.target.value, 10) || 0))}
          />
        </div>
        <div>
          <label className={labelClass}>Sıra</label>
          <input
            name="order_index"
            type="number"
            min={0}
            className={inputClass}
            defaultValue={tracks.length}
          />
        </div>
        <button
          type="submit"
          disabled={!audioUrl}
          className="rounded bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)] disabled:opacity-50"
        >
          Ekle
        </button>
      </form>

      <div>
        <h2 className="font-medium">Parçalar ({tracks.length})</h2>
        <ul className="mt-2 space-y-2">
          {tracks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-4 rounded border border-[var(--border)] p-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[var(--muted)]">
                {t.cover_url ? (
                  <Image src={t.cover_url} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">?</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.title}</p>
                <p className="truncate text-sm text-[var(--muted)]">{t.artist}</p>
              </div>
              <span className="text-xs text-[var(--muted)]">{t.duration_sec}s</span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-600 hover:bg-red-500/10"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
        {tracks.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Henüz parça yok. Yukarıdan ekleyin.</p>
        )}
      </div>
    </div>
  );
}
