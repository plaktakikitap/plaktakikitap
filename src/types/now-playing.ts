export interface NowPlayingBook {
  title: string;
  author: string;
  coverUrl: string | null;
}

export interface NowPlayingData {
  book: NowPlayingBook | null;
}
