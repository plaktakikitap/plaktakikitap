export type SeriesStatus = "finished" | "waiting" | "dropped" | null;

const LABELS: Record<NonNullable<SeriesStatus>, string> = {
  finished: "Bitirilmiş",
  waiting: "Devamını Bekliyorum",
  dropped: "Yarıda Bıraktım",
};

const LINE_COLORS: Record<NonNullable<SeriesStatus>, string> = {
  finished: "rgb(34, 197, 94)",   // green
  waiting: "rgb(234, 179, 8)",    // yellow/amber
  dropped: "rgb(239, 68, 68)",    // red
};

export function getSeriesStatusLabel(status: SeriesStatus): string | null {
  if (!status) return null;
  return LABELS[status] ?? null;
}

export function getSeriesStatusLineColor(status: SeriesStatus): string | null {
  if (!status) return null;
  return LINE_COLORS[status] ?? null;
}
