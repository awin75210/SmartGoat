"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCloudRain,
  IconDoorEnter,
  IconDoorExit,
  IconPower,
} from "@tabler/icons-react";
import { runWithNotification } from "@/shared/utils/async-notification";
import { IOT_RELAY_ACTUATORS, IOT_SERVO_ROOF_KEY } from "../constants/iot-device.constants";
import { setRelayAction, setServoRoofAction } from "../actions/iot-control.actions";
import type { IotActuatorState, IotGatewayStatus } from "../types/iot.types";
import styles from "./IotDeviceControl.module.css";

type IotDeviceControlProps = {
  actuators: IotActuatorState[];
  gateway: IotGatewayStatus | null;
  readOnly?: boolean;
  onChanged?: () => void;
};

export function IotDeviceControl({
  actuators,
  gateway,
  readOnly = false,
  onChanged,
}: IotDeviceControlProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const actuatorMap = new Map(actuators.map((a) => [a.actuatorKey, a]));
  const servo = actuatorMap.get(IOT_SERVO_ROOF_KEY);

  const handleRelay = (actuatorKey: string, isOn: boolean) => {
    if (readOnly) return;
    setPendingKey(actuatorKey);
    void (async () => {
      const meta = IOT_RELAY_ACTUATORS.find((r) => r.key === actuatorKey);
      const result = await runWithNotification(
        `relay-${actuatorKey}`,
        {
          loading: `Đang ${isOn ? "bật" : "tắt"} ${meta?.name ?? "thiết bị"}…`,
          success: `Đã gửi lệnh ${isOn ? "BẬT" : "TẮT"} tới ESP32`,
          error: "Không gửi được lệnh relay",
        },
        () => setRelayAction(actuatorKey, isOn),
      );
      setPendingKey(null);
      if (result.ok) onChanged?.();
    })();
  };

  const handleServo = (open: boolean) => {
    if (readOnly) return;
    setPendingKey(IOT_SERVO_ROOF_KEY);
    void (async () => {
      const result = await runWithNotification(
        "servo-roof",
        {
          loading: open ? "Đang mở mái che…" : "Đang đóng mái che…",
          success: open ? "Đã gửi lệnh MỞ mái che" : "Đã gửi lệnh ĐÓNG mái che",
          error: "Không gửi được lệnh servo",
        },
        () => setServoRoofAction(open),
      );
      setPendingKey(null);
      if (result.ok) onChanged?.();
    })();
  };

  return (
    <Paper radius="lg" shadow="sm" p="lg" className={styles.card}>
      <Group justify="space-between" mb="md" wrap="wrap">
        <div>
          <Title order={4}>Điều khiển thiết bị ESP32</Title>
          <Text size="sm" c="dimmed">
            Relay 4 kênh · Servo mái che · GPIO mapping theo sơ đồ lắp đặt
          </Text>
        </div>
        <Badge color={gateway?.online ? "green" : "gray"} variant="light" size="lg">
          {gateway?.deviceName ?? "Gateway ESP32"} — {gateway?.online ? "Online" : "Offline"}
        </Badge>
      </Group>

      <Stack gap="lg">
        <div>
          <Text fw={700} mb="sm">
            Relay 4CH
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {IOT_RELAY_ACTUATORS.map((relay) => {
              const state = actuatorMap.get(relay.key);
              const isOn = state?.isOn ?? false;
              const loading = pendingKey === relay.key;
              return (
                <Paper key={relay.key} withBorder radius="md" p="md" className={styles.relayCard}>
                  <Stack gap="xs">
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text fw={600}>{relay.name}</Text>
                        <Text size="xs" c="dimmed">
                          {relay.channel} · GPIO {relay.gpio}
                        </Text>
                      </div>
                      <Badge color={isOn ? "green" : "gray"} variant={isOn ? "filled" : "light"}>
                        {isOn ? "Đang BẬT" : "Đang TẮT"}
                      </Badge>
                    </Group>
                    {!readOnly ? (
                      <Group grow>
                        <Button
                          color="green"
                          variant={isOn ? "filled" : "light"}
                          leftSection={<IconPower size={16} />}
                          loading={loading}
                          onClick={() => handleRelay(relay.key, true)}
                        >
                          Bật
                        </Button>
                        <Button
                          color="gray"
                          variant={!isOn ? "filled" : "light"}
                          leftSection={<IconPower size={16} />}
                          loading={loading}
                          onClick={() => handleRelay(relay.key, false)}
                        >
                          Tắt
                        </Button>
                      </Group>
                    ) : null}
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        </div>

        <Paper withBorder radius="md" p="md" className={styles.servoCard}>
          <Group justify="space-between" align="flex-start" wrap="wrap" mb="sm">
            <div>
              <Group gap="xs">
                <IconCloudRain size={20} stroke={1.5} />
                <Text fw={700}>Servo mái che thông minh</Text>
              </Group>
              <Text size="sm" c="dimmed" mt={4}>
                Mở khi nắng/mưa · Đóng bảo vệ chuồng
              </Text>
            </div>
            <Badge color={servo?.isOn ? "blue" : "gray"} variant="light">
              {servo?.positionPct ?? 0}% · {servo?.isOn ? "Đang mở" : "Đang đóng"}
            </Badge>
          </Group>
          {!readOnly ? (
            <Group grow maw={420}>
              <Button
                color="capraBlue"
                leftSection={<IconDoorEnter size={16} />}
                loading={pendingKey === IOT_SERVO_ROOF_KEY}
                onClick={() => handleServo(true)}
              >
                Mở mái che
              </Button>
              <Button
                variant="light"
                leftSection={<IconDoorExit size={16} />}
                loading={pendingKey === IOT_SERVO_ROOF_KEY}
                onClick={() => handleServo(false)}
              >
                Đóng mái che
              </Button>
            </Group>
          ) : null}
        </Paper>
      </Stack>
    </Paper>
  );
}
