"use client";

import { useLogout } from "@/features/auth/hooks/use-logout";
import { AdminShell } from "./AdminShell";

type AdminAppLayoutProps = {
  children: React.ReactNode;
  userName: string;
};

export function AdminAppLayout({ children, userName }: AdminAppLayoutProps) {
  const { logout: handleLogout } = useLogout();

  return (
    <AdminShell userName={userName} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}
