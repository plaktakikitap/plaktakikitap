import { NextResponse } from "next/server";
import { getSiteLinks } from "@/lib/db/queries";

export const revalidate = 60;

export async function GET() {
  const links = await getSiteLinks();
  return NextResponse.json(links);
}
