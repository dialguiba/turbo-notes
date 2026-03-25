import { AuthPageTransition } from "./auth-page-transition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-beige flex flex-1 items-center justify-center px-4 py-8">
      <AuthPageTransition>{children}</AuthPageTransition>
    </div>
  );
}
