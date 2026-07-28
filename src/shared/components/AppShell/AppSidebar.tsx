"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, ScrollArea, Stack, Text } from "@mantine/core";
import { APP_NAME, APP_TAGLINE } from "@/lib/config/app.config";
import type { AppNavItem } from "@/shared/constants/navigation";
import { GoatLogoMark } from "@/shared/components/brand/GoatLogoMark";
import { SidebarPastoralScene } from "@/shared/components/decor/SidebarPastoralScene";
import styles from "./AppSidebar.module.css";

type AppSidebarProps = {
  items: AppNavItem[];
  footer?: React.ReactNode;
  variant?: "farm" | "admin";
};

export function AppSidebar({ items, footer, variant = "farm" }: AppSidebarProps) {
  const pathname = usePathname();
  const isFarm = variant === "farm";

  return (
    <Stack
      className={isFarm ? `${styles.root} ${styles.rootFarm}` : styles.root}
      gap="md"
      h="100%"
    >
      <div className={styles.brand}>
        <div className={styles.brandRow}>
          <GoatLogoMark size={36} className={styles.logoSvg} />
          <div>
            <Text fw={700} className={isFarm ? styles.brandTitleLight : styles.brandTitle}>
              {APP_NAME}
            </Text>
            <Text size="xs" className={isFarm ? styles.taglineLight : undefined} c={isFarm ? undefined : "dimmed"}>
              {APP_TAGLINE}
            </Text>
          </div>
        </div>
      </div>
      <ScrollArea flex={1} type="auto" offsetScrollbars className={styles.navScroll}>
        <Stack gap={6}>
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/app" &&
                item.href !== "/admin" &&
                pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={19} stroke={1.65} />}
                active={active}
                className={isFarm ? styles.navLinkFarm : styles.navLink}
              />
            );
          })}
        </Stack>
      </ScrollArea>
      {footer ?? (isFarm ? <SidebarPastoralScene /> : <div className={styles.sidebarFooter} aria-hidden />)}
    </Stack>
  );
}
