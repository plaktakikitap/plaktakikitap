import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-black text-white px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-2 text-xl font-semibold">Admin</h1>
        <p className="mb-2 text-sm text-white/60">E-posta ve şifre ile giriş yapın</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
