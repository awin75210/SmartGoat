"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, ScrollArea, Text } from "@mantine/core";
import { APP_NAME, APP_TAGLINE } from "@/lib/config/app.config";
import type { AppNavItem } from "@/shared/constants/navigation";
import { GoatLogoMark } from "@/shared/components/brand/GoatLogoMark";
import { SidebarPastoralScene } from "@/shared/components/decor/SidebarPastoralScene";
import styles from "./AppSidebar.module.css";

type SidebarVariant = "farm" | "admin";

export function SidebarBrand({ variant = "farm" }: { variant?: SidebarVariant }) {
  const isFarm = variant === "farm";

  return (
    <header className={`${styles.brand} ${isFarm ? "" : styles.brandAdmin}`}>
      <div className={styles.brandRow}>
        <GoatLogoMark size={30} className={styles.logoSvg} />
        <div className={styles.brandText}>
          <Text component="span" fw={700} className={isFarm ? styles.brandTitleLight : styles.brandTitle}>
            {APP_NAME}
          </Text>
          <Text
            component="span"
            size="xs"
            className={isFarm ? styles.taglineLight : styles.tagline}
            c={isFarm ? undefined : "dimmed"}
          >
            {APP_TAGLINE}
          </Text>
        </div>
      </div>
    </header>
  );
}

export function SidebarNavMenu({
  items,
  variant = "farm",
}: {
  items: AppNavItem[];
  variant?: SidebarVariant;
}) {
  const pathname = usePathname();
  const isFarm = variant === "farm";

  return (
    <div className={styles.navScrollWrap}>
      <ScrollArea className={styles.navScroll} type="auto" offsetScrollbars scrollbars="y">
        <div className={styles.navInner}>
        <Text size="xs" fw={700} className={isFarm ? styles.navSectionFarm : styles.navSection} tt="uppercase">
          Chức năng
        </Text>
        <nav className={styles.navList} aria-label="Điều hướng chính">
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
                leftSection={<Icon size={18} stroke={1.65} />}
                active={active}
                className={isFarm ? styles.navLinkFarm : styles.navLink}
              />
            );
          })}
        </nav>
      </div>
    </ScrollArea>
    </div>
  );
}

export function SidebarDecorFooter({
  variant = "farm",
  footer,
}: {
  variant?: SidebarVariant;
  footer?: React.ReactNode;
}) {
  const isFarm = variant === "farm";

  return (
    <div className={`${styles.footer} ${isFarm ? "" : styles.footerAdmin}`}>
      {footer ?? (isFarm ? <SidebarPastoralScene /> : <div className={styles.sidebarFooter} aria-hidden />)}
    </div>
  );
}

type AppSidebarProps = {
  items: AppNavItem[];
  footer?: React.ReactNode;
  variant?: SidebarVariant;
};

/** Full sidebar column (e.g. admin drawer) — brand + scroll menu + footer. */
export function AppSidebar({ items, footer, variant = "farm" }: AppSidebarProps) {
  const isFarm = variant === "farm";
  const rootClass = isFarm ? `${styles.root} ${styles.rootFarm}` : styles.root;

  return (
    <div className={rootClass}>
      <SidebarBrand variant={variant} />
      <SidebarNavMenu items={items} variant={variant} />
      <SidebarDecorFooter variant={variant} footer={footer} />
    </div>
  );
}
