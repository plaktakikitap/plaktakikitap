import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  const { admin_password_hash: _hash, ...publicSettings } = settings;
  return NextResponse.json(publicSettings);
}
