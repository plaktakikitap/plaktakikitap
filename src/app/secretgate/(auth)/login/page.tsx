import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#faf7f2] text-[#1a1612] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e8e0d4] bg-white p-6">
        <h1 className="mb-2 text-xl font-semibold">Admin</h1>
        <p className="mb-2 text-sm text-[#6b6158]">E-posta ve şifre ile giriş yapın</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
