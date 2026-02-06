interface AdminBentoCardProps {
  children: React.ReactNode;
  /** col-span-1 | col-span-2 | col-span-3 | col-span-4 */
  colSpan?: 1 | 2 | 3 | 4;
  /** row-span-1 | row-span-2 | row-span-3 */
  rowSpan?: 1 | 2 | 3;
  className?: string;
}

const colClasses = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  3: "col-span-1 md:col-span-3",
  4: "col-span-1 md:col-span-4",
} as const;
const rowClasses = {
  1: "row-span-1",
  2: "row-span-1 md:row-span-2",
  3: "row-span-1 md:row-span-3",
} as const;

export function AdminBentoCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = "",
}: AdminBentoCardProps) {
  return (
    <div
      className={`admin-bento-card p-6 ${colClasses[colSpan]} ${rowClasses[rowSpan]} ${className}`}
    >
      {children}
    </div>
  );
}
