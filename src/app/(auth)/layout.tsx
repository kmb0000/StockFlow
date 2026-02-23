export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-auth-gradient flex justify-center">
      {children}
    </div>
  );
}
