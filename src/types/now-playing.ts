export interface NowPlayingBook {
  title: string;
  author: string;
  coverUrl: string | null;
}

export interface NowPlayingData {
  book: NowPlayingBook | null;
}

export interface LastFmNowPlaying {
  title: string;
  artist: string;
  albumArt: string | null;
  isNowPlaying: boolean;
  /** Last.fm scrobble zamanı (ISO); şu an çalıyorsa null */
  playedAt: string | null;
}
