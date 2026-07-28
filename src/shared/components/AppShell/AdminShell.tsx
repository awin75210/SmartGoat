"use client";

import { AppShell } from "@mantine/core";
import { ADMIN_NAV_ITEMS } from "@/shared/constants/navigation";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { MobileNavBackdrop } from "./MobileNavBackdrop";
import { useMobileNav } from "./use-mobile-nav";
import styles from "./AdminShell.module.css";

const ADMIN_NAVBAR = {
  width: 252,
  breakpoint: "md" as const,
};

type AdminShellProps = {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
};

export function AdminShell({ children, userName, onLogout }: AdminShellProps) {
  const { opened, toggle, close } = useMobileNav();

  return (
    <>
      <MobileNavBackdrop opened={opened} onClose={close} />
      <AppShell
        layout="alt"
        mode="static"
        withBorder={false}
        header={{ height: 56 }}
        navbar={{
          ...ADMIN_NAVBAR,
          collapsed: { mobile: !opened },
        }}
        padding="md"
        className={styles.shell}
      >
        <AppShell.Header className={styles.header}>
          <AppHeader
            title="Quản trị CapraCare"
            userName={userName}
            opened={opened}
            onToggle={toggle}
            onLogout={onLogout}
          />
        </AppShell.Header>
        <AppShell.Navbar withBorder={false} className={styles.navbar}>
          <AppSidebar items={ADMIN_NAV_ITEMS} />
        </AppShell.Navbar>
        <AppShell.Main className={styles.main}>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
