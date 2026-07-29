"use client";

import { AppShell } from "@mantine/core";
import { logoutAction } from "@/features/auth/actions/login.actions";
import { FARM_NAV_ITEMS } from "@/shared/constants/navigation";
import { AppHeader } from "./AppHeader";
import { SidebarBrand, SidebarDecorFooter, SidebarNavMenu } from "./AppSidebar";
import { MobileNavBackdrop } from "./MobileNavBackdrop";
import { useMobileNav } from "./use-mobile-nav";
import styles from "./AppLayoutShell.module.css";

const FARM_NAVBAR = {
  width: 268,
  breakpoint: "md" as const,
};

type FarmAppLayoutProps = {
  children: React.ReactNode;
  userName: string;
  farmName: string;
  notificationCount?: number;
  isGuest?: boolean;
};

export function FarmAppLayout({
  children,
  userName,
  farmName,
  notificationCount = 0,
  isGuest = false,
}: FarmAppLayoutProps) {
  const { opened, toggle, close } = useMobileNav();
  const handleLogout = () => {
    void logoutAction();
  };

  return (
    <>
      <MobileNavBackdrop opened={opened} onClose={close} />
      <AppShell
        layout="alt"
        withBorder={false}
        header={{ height: 60 }}
        navbar={{
          ...FARM_NAVBAR,
          collapsed: { mobile: !opened },
        }}
        padding={0}
        className={styles.shell}
      >
        <AppShell.Header className={styles.header}>
          <AppHeader
            title="CapraCare"
            userName={userName}
            farmName={farmName}
            opened={opened}
            onToggle={toggle}
            onLogout={isGuest ? undefined : handleLogout}
            loginHref={isGuest ? "/login" : undefined}
            notificationCount={notificationCount}
          />
        </AppShell.Header>
        <AppShell.Navbar className={styles.navbar} withBorder={false}>
          <AppShell.Section className={styles.navbarBrandSection}>
            <SidebarBrand variant="farm" />
          </AppShell.Section>
          <AppShell.Section grow className={styles.navbarMenuSection}>
            <SidebarNavMenu items={FARM_NAV_ITEMS} variant="farm" />
          </AppShell.Section>
          <AppShell.Section className={styles.navbarFooterSection}>
            <SidebarDecorFooter variant="farm" />
          </AppShell.Section>
        </AppShell.Navbar>
        <AppShell.Main className={styles.main}>
          <div className={styles.mainInner}>{children}</div>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
