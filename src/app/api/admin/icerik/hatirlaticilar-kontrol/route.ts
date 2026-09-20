import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdminApi";
import { checkAndClaimHatirlaticilar } from "@/lib/icerik";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const hatirlaticilar = await checkAndClaimHatirlaticilar();
  return NextResponse.json({ hatirlaticilar });
}
