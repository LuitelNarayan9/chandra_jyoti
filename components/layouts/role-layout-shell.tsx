"use client";

import { Role, hasPermission } from "@/lib/roles";
import { MemberSidebar } from "@/components/layouts/member/member-sidebar";
import { MemberNavbar } from "@/components/layouts/member/member-navbar";
import { MemberMobileSidebar } from "@/components/layouts/member/member-mobile-sidebar";
import { AdminSidebar } from "@/components/layouts/admin/admin-sidebar";
import { AdminNavbar } from "@/components/layouts/admin/admin-navbar";
import { AdminMobileSidebar } from "@/components/layouts/admin/admin-mobile-sidebar";
import { SuperAdminSidebar } from "@/components/layouts/super-admin/super-admin-sidebar";
import { SuperAdminNavbar } from "@/components/layouts/super-admin/super-admin-navbar";
import { SuperAdminMobileSidebar } from "@/components/layouts/super-admin/super-admin-mobile-sidebar";

interface RoleLayoutShellProps {
  role: Role;
  firstName: string;
  lastName: string;
  avatar: string | null;
  children: React.ReactNode;
}

export function RoleLayoutShell({
  role,
  firstName,
  lastName,
  avatar,
  children,
}: RoleLayoutShellProps) {
  const isSuperAdmin = hasPermission(role, "SUPER_ADMIN");
  const isAdmin = !isSuperAdmin && hasPermission(role, "ADMIN");

  if (isSuperAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <SuperAdminNavbar
          firstName={firstName}
          lastName={lastName}
          avatar={avatar}
          mobileSidebar={<SuperAdminMobileSidebar />}
        />
        <div className="flex flex-1">
          <SuperAdminSidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <AdminNavbar
          firstName={firstName}
          lastName={lastName}
          avatar={avatar}
          mobileSidebar={<AdminMobileSidebar />}
        />
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  // Member / Moderator / Guest
  return (
    <div className="flex min-h-screen flex-col">
      <MemberNavbar
        firstName={firstName}
        lastName={lastName}
        avatar={avatar}
        mobileSidebar={<MemberMobileSidebar />}
      />
      <div className="flex flex-1">
        <MemberSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
