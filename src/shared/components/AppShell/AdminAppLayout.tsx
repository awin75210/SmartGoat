"use client";

import { AdminShell } from "./AdminShell";
import { logoutAction } from "@/features/auth/actions/login.actions";

type AdminAppLayoutProps = {
  children: React.ReactNode;
  userName: string;
};

export function AdminAppLayout({ children, userName }: AdminAppLayoutProps) {
  const handleLogout = () => {
    void logoutAction();
  };

  return (
    <AdminShell userName={userName} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}
