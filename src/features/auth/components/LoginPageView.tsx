import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/config/app.config";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Alert, Group, Stack, Text, Title } from "@mantine/core";
import styles from "./LoginPageView.module.css";
type LoginPageViewProps = {
  error?: string;
};

export function LoginPageView({ error }: LoginPageViewProps) {
  const errorMessage =
    error === "no-farm"
      ? "Tài khoản chưa được gán trang trại. Liên hệ quản trị viên."
      : error === "forbidden"
        ? "Bạn không có quyền truy cập khu vực này."
        : error === "session"
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : null;

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
        <Stack gap="sm" align="center" maw={420} w="100%">
          {errorMessage ? (
            <Alert color="orange" title="Không thể đăng nhập">
              {errorMessage}
            </Alert>
          ) : null}
          <LoginForm />
          <Link href="/app" className={styles.guestLink}>
            Tiếp tục xem thử không đăng nhập
          </Link>
        </Stack>
      </Group>
    </div>
  );
}
