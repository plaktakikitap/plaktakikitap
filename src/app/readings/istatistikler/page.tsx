import { redirect } from "next/navigation";

/** Eski / alternatif URL: /readings/istatistikler → /okuma-gunlugum/istatistikler */
export default function ReadingsIstatistiklerRedirect() {
  redirect("/okuma-gunlugum/istatistikler");
}
