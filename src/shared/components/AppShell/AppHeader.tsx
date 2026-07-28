"use client";

import { ActionIcon, Avatar, Burger, Group, Menu, Text } from "@mantine/core";
import { IconBell, IconHome, IconLogin, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  title: string;
  userName?: string;
  farmName?: string;
  opened: boolean;
  onToggle: () => void;
  onLogout?: () => void;
  loginHref?: string;
  showBurger?: boolean;
  notificationCount?: number;
};

export function AppHeader({
  title,
  userName,
  farmName,
  opened,
  onToggle,
  onLogout,
  loginHref,
  showBurger = true,
  notificationCount = 0,
}: AppHeaderProps) {
  return (
    <Group justify="space-between" className={styles.root} wrap="nowrap">
      <Group gap="sm" wrap="nowrap" className={styles.left}>
        {showBurger ? (
          <Burger opened={opened} onClick={onToggle} hiddenFrom="md" size="sm" className={styles.burger} />
        ) : null}
        {farmName ? (
          <Group gap="xs" className={styles.farmChip} wrap="nowrap">
            <IconHome size={16} stroke={1.6} className={styles.farmIcon} />
            <Text fw={600} size="sm" className={styles.farmName}>
              {farmName}
            </Text>
          </Group>
        ) : (
          <Text fw={700} className={styles.title}>
            {title}
          </Text>
        )}
      </Group>
      <Group gap="sm" wrap="nowrap" className={styles.right}>
        <ActionIcon variant="subtle" radius="xl" size="lg" aria-label="Thông báo" pos="relative">
          <IconBell size={20} stroke={1.5} />
          {notificationCount > 0 ? (
            <span className={styles.notifBadge}>{notificationCount > 9 ? "9+" : notificationCount}</span>
          ) : null}
        </ActionIcon>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" radius="xl" size="lg" aria-label="Tài khoản">
              <Avatar radius="xl" size="md" color="capraGreen" className={styles.avatar}>
                {(userName ?? "K").charAt(0).toUpperCase()}
              </Avatar>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {userName ? <Menu.Label>{userName}</Menu.Label> : null}
            {onLogout ? (
              <Menu.Item leftSection={<IconLogout size={16} />} onClick={onLogout}>
                Đăng xuất
              </Menu.Item>
            ) : null}
            {loginHref ? (
              <Menu.Item component={Link} href={loginHref} leftSection={<IconLogin size={16} />}>
                Đăng nhập
              </Menu.Item>
            ) : null}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
