import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminDizilerRedirectPage() {
  await requireAdmin();
  redirect("/secretgate/diziler");
}
