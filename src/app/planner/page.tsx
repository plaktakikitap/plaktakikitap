import { redirect } from "next/navigation";

/** Ajanda artık ana sayfada (/home#ajanda). Eski /planner linkleri ana sayfaya yönlendirilir. */
export default function PlannerPage() {
  redirect("/home#ajanda");
}
