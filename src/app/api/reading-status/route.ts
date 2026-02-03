import { NextResponse } from "next/server";
import { getReadingStatus } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getReadingStatus();
  return NextResponse.json(status);
}
