import { RoleLayoutShell } from "@/components/layouts/role-layout-shell";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/roles";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  return (
    <RoleLayoutShell
      role={user.role as Role}
      firstName={user.firstName}
      lastName={user.lastName}
      avatar={user.avatar}
    >
      {children}
    </RoleLayoutShell>
  );
}
