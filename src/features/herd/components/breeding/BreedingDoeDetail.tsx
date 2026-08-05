"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge/StatusBadge";
import { recordKiddingAction, recordMatingAction } from "../../actions/herd-extended.actions";
import {
  BREEDING_DOE_STATUS_LABELS,
  REPRODUCTIVE_CYCLE_STATUS_LABELS,
} from "../../constants/breeding-doe.constants";
import { formatBirthDateVi, formatAgeVi } from "../../utils/age.utils";
import { formatDateVi } from "../../utils/stage.utils";
import type { BreedingDoe, ReproductiveCycle } from "../../types/breeding-doe.types";
import { BarcodeLabel } from "../barcode/BarcodeLabel";

type BreedingDoeDetailProps = {
  doe: BreedingDoe;
  cycles: ReproductiveCycle[];
};

export function BreedingDoeDetail({ doe, cycles }: BreedingDoeDetailProps) {
  const router = useRouter();
  const [matingDate, setMatingDate] = useState<Date | null>(new Date());
  const [matingNotes, setMatingNotes] = useState("");
  const [kiddingDate, setKiddingDate] = useState<Date | null>(new Date());
  const [kidsCount, setKidsCount] = useState(1);
  const [kiddingNotes, setKiddingNotes] = useState("");
  const [pending, setPending] = useState(false);

  const activeCycle = cycles.find((c) => c.status === "pregnant" || c.status === "planned");

  const handleMating = () => {
    if (!matingDate) return;
    void (async () => {
      setPending(true);
      try {
        await recordMatingAction({
          doe_id: doe.id,
          mating_date: matingDate,
          notes: matingNotes || null,
        });
        router.refresh();
      } finally {
        setPending(false);
      }
    })();
  };

  const handleKidding = () => {
    if (!kiddingDate || !activeCycle) return;
    void (async () => {
      setPending(true);
      try {
        await recordKiddingAction({
          cycle_id: activeCycle.id,
          actual_kidding_date: kiddingDate,
          kids_count: kidsCount,
          notes: kiddingNotes || null,
        });
        router.refresh();
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <Stack gap="lg">
      <PageHeader
        title={doe.name}
        description={`${doe.tagCode} · ${doe.breed} · ${formatAgeVi(doe.birthDate)}`}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <StatusBadge label={BREEDING_DOE_STATUS_LABELS[doe.status]} color="#7950f2" />
            <Text size="sm">Ngày sinh: {formatBirthDateVi(doe.birthDate)}</Text>
            {doe.expectedKiddingDate ? (
              <Text size="sm" fw={600} c="violet">
                Dự kiến đẻ: {formatDateVi(doe.expectedKiddingDate)}
              </Text>
            ) : null}
            {doe.notes ? <Text size="sm" c="dimmed">{doe.notes}</Text> : null}
          </Stack>
        </Paper>
        <BarcodeLabel
          tagCode={doe.tagCode}
          barcode={doe.barcode}
          name={doe.name}
          breed={doe.breed}
          birthDate={doe.birthDate}
        />
      </SimpleGrid>

      <Paper withBorder radius="md" p="md">
        <Title order={5} mb="md">
          Chu kỳ sinh sản
        </Title>
        <Timeline active={cycles.length - 1} bulletSize={20} lineWidth={2}>
          {cycles.map((cycle) => (
            <Timeline.Item
              key={cycle.id}
              title={`Chu kỳ #${cycle.cycleNumber} — ${REPRODUCTIVE_CYCLE_STATUS_LABELS[cycle.status]}`}
            >
              {cycle.matingDate ? (
                <Text size="sm">Phối: {formatDateVi(cycle.matingDate)}</Text>
              ) : null}
              {cycle.expectedKiddingDate ? (
                <Text size="sm">Dự kiến đẻ: {formatDateVi(cycle.expectedKiddingDate)}</Text>
              ) : null}
              {cycle.actualKiddingDate ? (
                <Text size="sm">
                  Đẻ: {formatDateVi(cycle.actualKiddingDate)} · {cycle.kidsCount ?? 0} con
                </Text>
              ) : null}
            </Timeline.Item>
          ))}
        </Timeline>
      </Paper>

      {!activeCycle || activeCycle.status === "kidded" ? (
        <Paper withBorder radius="md" p="md">
          <Title order={5} mb="md">
            Ghi nhận phối giống
          </Title>
          <Stack gap="sm">
            <DateInput
              label="Ngày phối"
              value={matingDate}
              onChange={(next) => {
                if (!next) {
                  setMatingDate(null);
                  return;
                }
                const parsed = new Date(next);
                setMatingDate(Number.isNaN(parsed.getTime()) ? null : parsed);
              }}
              maxDate={new Date()}
            />
            <Textarea label="Ghi chú" value={matingNotes} onChange={(e) => setMatingNotes(e.currentTarget.value)} />
            <Button loading={pending} onClick={handleMating}>
              Lưu phối giống
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {activeCycle && activeCycle.status === "pregnant" ? (
        <Paper withBorder radius="md" p="md">
          <Title order={5} mb="md">
            Ghi nhận đẻ
          </Title>
          <Stack gap="sm">
            <DateInput
              label="Ngày đẻ"
              value={kiddingDate}
              onChange={(next) => {
                if (!next) {
                  setKiddingDate(null);
                  return;
                }
                const parsed = new Date(next);
                setKiddingDate(Number.isNaN(parsed.getTime()) ? null : parsed);
              }}
              maxDate={new Date()}
            />
            <TextInput
              type="number"
              label="Số con"
              min={0}
              value={kidsCount}
              onChange={(e) => setKidsCount(Number(e.currentTarget.value) || 0)}
            />
            <Textarea label="Ghi chú" value={kiddingNotes} onChange={(e) => setKiddingNotes(e.currentTarget.value)} />
            <Button loading={pending} onClick={handleKidding}>
              Lưu đẻ
            </Button>
          </Stack>
        </Paper>
      ) : null}

      <Group>
        <Button variant="default" onClick={() => router.push("/app/herd")}>
          Quay lại
        </Button>
      </Group>
    </Stack>
  );
}
