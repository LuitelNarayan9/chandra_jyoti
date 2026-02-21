import { FloatingParticles } from "@/components/landing/floating-particles";
import { ProtectedNavbar } from "@/components/shared/protected-navbar";
import { Sidebar } from "@/components/shared/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <ProtectedNavbar />
      <FloatingParticles />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
