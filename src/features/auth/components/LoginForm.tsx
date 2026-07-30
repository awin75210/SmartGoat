"use client";

import { useState } from "react";
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { loginAction } from "../actions/login.actions";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setPending(true);
      try {
        const result = await loginAction({ email, password, rememberMe });
        if (result.ok) {
          // Full navigation — do not setState after this or React 19 may warn during teardown.
          window.location.assign(result.data.redirectTo);
          return;
        }
        notifications.show({
          color: "red",
          title: "Đăng nhập thất bại",
          message: result.message,
        });
        setPending(false);
      } catch {
        setPending(false);
      }
    })();
  };

  return (
    <Paper radius="lg" p="xl" className={styles.form} shadow="sm">
      <Stack gap="md">
        <Title order={2} className={styles.title}>
          Đăng nhập
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <PasswordInput
              label="Mật khẩu"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Checkbox
              label="Ghi nhớ đăng nhập"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.currentTarget.checked)}
            />
            <Anchor size="sm" href="#" onClick={(e) => e.preventDefault()}>
              Quên mật khẩu?
            </Anchor>
            <Button type="submit" loading={pending} color="capraBlue" size="md">
              Đăng nhập
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
