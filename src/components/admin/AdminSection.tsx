interface AdminSectionProps {
  title: string;
  children: React.ReactNode;
}

export function AdminSection({ title, children }: AdminSectionProps) {
  return (
    <section className="space-y-6">
      <h2 className="admin-heading text-xl font-medium tracking-tight text-white/95">
        {title}
      </h2>
      {children}
    </section>
  );
}
