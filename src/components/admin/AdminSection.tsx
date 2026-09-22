interface AdminSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminSection({ title, description, children }: AdminSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="admin-heading text-2xl font-semibold tracking-tight text-[#1a1612]">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-[#6b6158] max-w-2xl">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
