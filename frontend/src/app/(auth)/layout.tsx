export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-beige flex min-h-full items-center justify-center">
      {children}
    </div>
  );
}
