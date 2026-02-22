import { PublicNavbar } from "@/components/shared/public-navbar";
import { Footer } from "@/components/shared/footer";
import { FloatingParticles } from "@/components/landing/floating-particles";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <FloatingParticles />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
