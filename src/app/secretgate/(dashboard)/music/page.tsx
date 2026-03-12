import { redirect } from "next/navigation";

/** Müzik yönetimi artık "Şu an dinliyorum" sayfasında. */
export default function AdminMusicPage() {
  redirect("/secretgate/now-playing");
}
