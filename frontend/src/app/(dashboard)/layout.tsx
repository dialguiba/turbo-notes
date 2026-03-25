export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex h-full flex-1 flex-col">{children}</div>;
}
