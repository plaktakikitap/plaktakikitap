"use server";

import { getPlannerEntriesByDate, getPlannerEntriesByMonth } from "@/lib/db/queries";

export async function fetchDayEntries(dateStr: string) {
  return getPlannerEntriesByDate(dateStr);
}

export async function fetchMonthEntries(year: number, month: number) {
  return getPlannerEntriesByMonth(year, month);
}
