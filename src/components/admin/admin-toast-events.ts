export type AdminToastDetail = {
  type: "success" | "error";
  message: string;
};

const EVENT = "admin-toast";

export function showAdminToast(type: "success" | "error", message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AdminToastDetail>(EVENT, { detail: { type, message } })
  );
}

export function subscribeAdminToast(
  handler: (detail: AdminToastDetail) => void
): () => void {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<AdminToastDetail>;
    if (ce.detail) handler(ce.detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
