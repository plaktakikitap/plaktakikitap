export type LegacySeriesStatus = "finished" | "waiting" | "dropped";
export type SeriesWatchStatus =
  | "watchlist"
  | "watching"
  | "completed"
  | "dropped"
  | "rewatching"
  | "paused";

export function mapSeriesStatusInput(raw: string | null | undefined): {
  status: LegacySeriesStatus | null;
  watch_status: SeriesWatchStatus | null;
} {
  const v = raw?.trim() || null;
  switch (v) {
    case "finished":
    case "completed":
      return { status: "finished", watch_status: "completed" };
    case "waiting":
    case "watching":
      return { status: "waiting", watch_status: "watching" };
    case "dropped":
      return { status: "dropped", watch_status: "dropped" };
    case "watchlist":
      return { status: null, watch_status: "watchlist" };
    case "paused":
      return { status: "waiting", watch_status: "paused" };
    case "rewatching":
      return { status: "waiting", watch_status: "rewatching" };
    default:
      return { status: null, watch_status: null };
  }
}

export function toUiWatchStatus(
  watchStatus: string | null | undefined,
  legacyStatus: string | null | undefined
): string {
  if (watchStatus) return watchStatus;
  if (legacyStatus === "finished") return "completed";
  if (legacyStatus === "waiting") return "watching";
  if (legacyStatus === "dropped") return "dropped";
  return "completed";
}

export function parseAdminVisibility(
  raw: unknown
): "public" | "unlisted" | "private" | "archived" | undefined {
  if (raw === "public" || raw === "unlisted" || raw === "private" || raw === "archived") {
    return raw;
  }
  return undefined;
}

/** İzlendi/İzlenecek kutusu ile watch_status'u birlikte tut. */
export function syncWatchStatusForVisibility(
  visibility: string,
  status: string
): string {
  if (visibility === "private") return "watchlist";
  if (visibility === "public" && (status === "watchlist" || !status)) {
    return "completed";
  }
  return status;
}

