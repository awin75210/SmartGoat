"use client";

import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconPrinter } from "@tabler/icons-react";
import { formatBirthDateVi } from "../../utils/age.utils";
import styles from "./BarcodeLabel.module.css";

type BarcodeLabelProps = {
  tagCode: string;
  barcode: string;
  name: string;
  breed: string;
  birthDate: string;
};

function barsFromCode(code: string): number[] {
  const bars: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const n = code.charCodeAt(i);
    bars.push((n % 3) + 1, (n % 2) + 1, 1);
  }
  return bars;
}

export function BarcodeLabel({ tagCode, barcode, name, breed, birthDate }: BarcodeLabelProps) {
  const bars = barsFromCode(barcode);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Stack gap="md" className={styles.root}>
      <Paper withBorder radius="md" p="md" className={styles.label} id="barcode-label">
        <Stack gap={4} align="center">
          <Text fw={700} size="sm">
            SmartGoat — Dê sinh sản
          </Text>
          <Text fw={800} size="lg">
            {name}
          </Text>
          <Text size="xs" c="dimmed">
            {breed} · Sinh {formatBirthDateVi(birthDate)}
          </Text>
          <svg
            className={styles.bars}
            viewBox={`0 0 ${bars.length * 4} 40`}
            role="img"
            aria-label={`Mã vạch ${tagCode}`}
          >
            {bars.map((w, i) => {
              let x = 0;
              for (let j = 0; j < i; j++) x += bars[j]! * 2 + 1;
              return (
                <rect
                  key={`${i}-${w}`}
                  x={x}
                  y={4}
                  width={w * 2}
                  height={32}
                  fill="#111"
                />
              );
            })}
          </svg>
          <Text ff="monospace" fw={600}>
            {tagCode}
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {barcode}
          </Text>
        </Stack>
      </Paper>
      <Group>
        <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
          In tem
        </Button>
      </Group>
    </Stack>
  );
}
