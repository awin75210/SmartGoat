import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/config/app.config";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Group, Stack, Text, Title } from "@mantine/core";
import styles from "./LoginPageView.module.css";

export function LoginPageView() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroArt} aria-hidden />
        <Stack gap="xs" className={styles.heroText}>
          <Title order={1} className={styles.brand}>
            {APP_NAME}
          </Title>
          <Text c="dimmed">{APP_TAGLINE}</Text>
          <Text size="sm" maw={360}>
            Quản lý chuồng, cảm biến IoT và sức khỏe đàn dê trên một nền tảng thống nhất.
          </Text>
        </Stack>
      </div>
      <Group justify="center" align="center" className={styles.formWrap}>
        <Stack gap="sm" align="center">
          <LoginForm />
          <Link href="/app" className={styles.guestLink}>
            Tiếp tục xem thử không đăng nhập
          </Link>
        </Stack>
      </Group>
    </div>
  );
}
