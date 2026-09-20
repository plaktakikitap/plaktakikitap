import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type BookRow = {
  id: string;
  title: string;
  author: string | null;
  rating: number | null;
  tags: string[] | null;
  review: string | null;
  cover_url: string | null;
  status: string;
  end_date: string | null;
  created_at: string;
};

export type ReviewSnippet = {
  id: string;
  title: string;
  author: string | null;
  review: string;
  length: number;
};

export type TopItem = { name: string; count: number };

export type BookCoverItem = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  rating: number;
};

export type OkumaStatsPayload = {
  totalBooks: number;
  thisYearCount: number;
  avgRating: number | null;
  topAuthors: TopItem[];
  topGenres: TopItem[];
  topRated: BookCoverItem[];
  fiveStarBooks: BookCoverItem[];
  ratingDistribution: Record<string, number>;
  longestReview: ReviewSnippet | null;
  shortestReview: ReviewSnippet | null;
  monthlyDistribution: Record<string, number>;
  totalReviewWords: number;
  mostProductiveMonth: { month: number; label: string; count: number } | null;
  favoriteAuthor: TopItem | null;
};

export type OkumaIstatistikleriResponse = {
  currentYear: number;
  years: number[];
  booksByYear: Record<string, number>;
  all: OkumaStatsPayload;
  byYear: Record<string, OkumaStatsPayload>;
};

const MONTH_LABELS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function bookDate(book: BookRow): Date {
  const raw = book.end_date || book.created_at;
  return new Date(raw);
}

function bookYear(book: BookRow): number {
  return bookDate(book).getFullYear();
}

function wordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function emptyMonthly(): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 1; i <= 12; i++) out[String(i)] = 0;
  return out;
}

function emptyRatingDist(): Record<string, number> {
  return { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
}

function computeStats(books: BookRow[], currentYear: number): OkumaStatsPayload {
  const authorCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  const ratingDist = emptyRatingDist();
  const monthly = emptyMonthly();

  let ratingSum = 0;
  let ratingCount = 0;
  let totalReviewWords = 0;
  let thisYearCount = 0;

  let longest: ReviewSnippet | null = null;
  let shortest: ReviewSnippet | null = null;

  const ratedBooks: BookCoverItem[] = [];

  for (const book of books) {
    const y = bookYear(book);
    if (y === currentYear) thisYearCount += 1;

    const author = (book.author || "").trim();
    if (author) {
      authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    }

    for (const tag of book.tags ?? []) {
      const name = tag.trim();
      if (!name) continue;
      genreCounts.set(name, (genreCounts.get(name) ?? 0) + 1);
    }

    if (book.rating != null && book.rating > 0) {
      const rounded = Math.min(5, Math.max(1, Math.round(book.rating)));
      ratingDist[String(rounded)] = (ratingDist[String(rounded)] ?? 0) + 1;
      ratingSum += book.rating;
      ratingCount += 1;
      ratedBooks.push({
        id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        rating: book.rating,
      });
    }

    const month = bookDate(book).getMonth() + 1;
    monthly[String(month)] = (monthly[String(month)] ?? 0) + 1;

    const review = (book.review || "").trim();
    if (review) {
      totalReviewWords += wordCount(review);
      const length = review.length;
      const snippet: ReviewSnippet = {
        id: book.id,
        title: book.title,
        author: book.author,
        review,
        length,
      };
      if (!longest || length > longest.length) longest = snippet;
      if (!shortest || length < shortest.length) shortest = snippet;
    }
  }

  const topAuthors = [...authorCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "tr"))
    .slice(0, 5);

  const topGenres = [...genreCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "tr"))
    .slice(0, 5);

  const topRated = [...ratedBooks]
    .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title, "tr"))
    .slice(0, 3);

  const fiveStarBooks = ratedBooks
    .filter((b) => b.rating >= 5)
    .sort((a, b) => a.title.localeCompare(b.title, "tr"))
    .slice(0, 12);

  let mostProductiveMonth: OkumaStatsPayload["mostProductiveMonth"] = null;
  for (let m = 1; m <= 12; m++) {
    const count = monthly[String(m)] ?? 0;
    if (!mostProductiveMonth || count > mostProductiveMonth.count) {
      mostProductiveMonth = {
        month: m,
        label: MONTH_LABELS[m - 1],
        count,
      };
    }
  }
  if (mostProductiveMonth && mostProductiveMonth.count === 0) {
    mostProductiveMonth = null;
  }

  return {
    totalBooks: books.length,
    thisYearCount,
    avgRating: ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null,
    topAuthors,
    topGenres,
    topRated,
    fiveStarBooks,
    ratingDistribution: ratingDist,
    longestReview: longest,
    shortestReview: shortest,
    monthlyDistribution: monthly,
    totalReviewWords,
    mostProductiveMonth,
    favoriteAuthor: topAuthors[0] ?? null,
  };
}

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("books")
      .select(
        "id, title, author, rating, tags, review, cover_url, status, end_date, created_at, visibility"
      )
      .in("visibility", ["public", "unlisted"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("okuma-istatistikleri:", error.message);
      return NextResponse.json({ error: "Veri alınamadı" }, { status: 500 });
    }

    const kitaplar = (data ?? []) as BookRow[];
    const currentYear = new Date().getFullYear();

    const booksByYear: Record<string, number> = {};
    const yearBuckets = new Map<number, BookRow[]>();

    for (const book of kitaplar) {
      const y = bookYear(book);
      if (!Number.isFinite(y) || y < 1990 || y > currentYear + 1) continue;
      booksByYear[String(y)] = (booksByYear[String(y)] ?? 0) + 1;
      const list = yearBuckets.get(y) ?? [];
      list.push(book);
      yearBuckets.set(y, list);
    }

    const years = [...yearBuckets.keys()].sort((a, b) => a - b);
    const byYear: Record<string, OkumaStatsPayload> = {};
    for (const y of years) {
      byYear[String(y)] = computeStats(yearBuckets.get(y) ?? [], y);
    }

    const payload: OkumaIstatistikleriResponse = {
      currentYear,
      years,
      booksByYear,
      all: computeStats(kitaplar, currentYear),
      byYear,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("okuma-istatistikleri:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
