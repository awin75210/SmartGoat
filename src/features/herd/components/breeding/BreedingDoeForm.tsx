"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { createBreedingDoeAction } from "../../actions/herd-extended.actions";
import { BreedSelect } from "../batches/fields/BreedSelect";
import type { Barn } from "../../types/barn.types";
import type { GoatBatch } from "../../types/goat-batch.types";

type BreedingDoeFormProps = {
  barns: Barn[];
  batches: GoatBatch[];
};

export function BreedingDoeForm({ barns, batches }: BreedingDoeFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(new Date());
  const [batchId, setBatchId] = useState<string | null>(null);
  const [barnId, setBarnId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = () => {
    if (!birthDate || !name.trim() || !breed.trim()) return;
    void (async () => {
      setPending(true);
      try {
        const result = await createBreedingDoeAction({
          name,
          breed,
          birth_date: birthDate,
          batch_id: batchId,
          barn_id: barnId,
          notes: notes || null,
        });
        if (result.ok) {
          router.push(`/app/herd/breeding/${result.data.id}`);
          router.refresh();
        }
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <Paper radius="lg" shadow="sm" p="lg">
      <Stack gap="lg">
        <div>
          <Title order={4}>Thêm dê cái sinh sản</Title>
          <Text size="sm" c="dimmed">
            Hệ thống tự sinh mã tem DOE-xxx để in và đeo
          </Text>
        </div>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <TextInput label="Tên dê" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <BreedSelect value={breed} onChange={setBreed} />
          <DateInput
            label="Ngày sinh"
            required
            value={birthDate}
            onChange={(next) => {
              if (!next) {
                setBirthDate(null);
                return;
              }
              const parsed = new Date(next);
              setBirthDate(Number.isNaN(parsed.getTime()) ? null : parsed);
            }}
            maxDate={new Date()}
          />
          <Select
            label="Lứa gốc (tuỳ chọn)"
            clearable
            data={batches.map((b) => ({ value: b.id, label: b.name }))}
            value={batchId}
            onChange={setBatchId}
          />
          <Select
            label="Chuồng (tuỳ chọn)"
            clearable
            data={barns.map((b) => ({ value: b.id, label: b.name }))}
            value={barnId}
            onChange={setBarnId}
          />
        </SimpleGrid>
        <Textarea label="Ghi chú" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => router.push("/app/herd")}>
            Huỷ
          </Button>
          <Button loading={pending} onClick={handleSubmit}>
            Lưu & in tem
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
