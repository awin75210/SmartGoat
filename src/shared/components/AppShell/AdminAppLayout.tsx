"use client";

import { useTransition } from "react";
import { AdminShell } from "./AdminShell";
import { logoutAction } from "@/features/auth/actions/login.actions";

type AdminAppLayoutProps = {
  children: React.ReactNode;
  userName: string;
};

export function AdminAppLayout({ children, userName }: AdminAppLayoutProps) {
  const [, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      void logoutAction();
    });
  };

  return (
    <AdminShell userName={userName} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}
