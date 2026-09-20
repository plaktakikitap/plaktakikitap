"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  subscribeAdminToast,
  type AdminToastDetail,
} from "./admin-toast-events";

const DEFAULT_OK = "Kaydedildi ✓";

export function AdminToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function show(detail: AdminToastDetail) {
    if (detail.type === "error") {
      setErrorMsg(detail.message);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(detail.message);
      setErrorMsg(null);
    }
    setVisible(true);
    setEntering(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(true));
    });
    const hideMs = detail.type === "error" ? 5000 : 3200;
    window.setTimeout(() => setEntering(false), hideMs - 280);
    window.setTimeout(() => {
      setVisible(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }, hideMs);
  }

  useEffect(() => subscribeAdminToast(show), []);

  useEffect(() => {
    const toast = searchParams.get("toast");
    const err = searchParams.get("err");
    const msg = searchParams.get("msg");

    if (toast === "saved") {
      show({
        type: "success",
        message: msg ? decodeURIComponent(msg) : DEFAULT_OK,
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("toast");
      url.searchParams.delete("msg");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
    } else if (err) {
      show({
        type: "error",
        message: msg
          ? decodeURIComponent(msg)
          : "Kayıt sırasında bir hata oluştu.",
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("err");
      url.searchParams.delete("msg");
      router.replace(url.pathname + (url.search || ""), { scroll: false });
    }
  }, [searchParams, router]);

  if (!visible) return null;

  return (
    <div
      className="fixed right-4 top-20 z-[100] transition-all duration-300 ease-out lg:top-4"
      style={{
        opacity: entering ? 1 : 0,
        transform: entering
          ? "translateY(0) scale(1)"
          : "translateY(-8px) scale(0.96)",
      }}
      role="alert"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-lg backdrop-blur-xl ${
          errorMsg
            ? "border-red-400/40 bg-red-950/80"
            : "border-emerald-400/30 bg-emerald-950/80"
        }`}
      >
        <p className="text-sm font-medium text-white">
          {errorMsg ?? successMsg ?? DEFAULT_OK}
        </p>
      </div>
    </div>
  );
}
