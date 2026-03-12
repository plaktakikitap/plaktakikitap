import { redirect } from "next/navigation";

/** Eski URL: /okuma-gunlugum → /readings */
export default function OkumaGunlugumRedirect() {
  redirect("/readings");
}
