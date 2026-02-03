export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-black text-white">
      <form
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6"
        action="/api/admin/login"
        method="POST"
      >
        <h1 className="mb-2 text-xl font-semibold">Admin</h1>
        <p className="mb-6 text-sm text-white/60">Giriş yap</p>

        <input
          name="password"
          type="password"
          placeholder="Şifre"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
          required
        />
        <button
          className="mt-4 w-full rounded-xl bg-white py-3 font-medium text-black hover:opacity-90"
          type="submit"
        >
          Gir
        </button>
      </form>
    </div>
  );
}
