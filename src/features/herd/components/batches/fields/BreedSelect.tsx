"use client";

import { Autocomplete } from "@mantine/core";
import { GOAT_BREED_OPTIONS } from "../../../constants/goat-batch.constants";

type BreedSelectProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
};

export function BreedSelect({ value, onChange, onBlur, error, disabled }: BreedSelectProps) {
  return (
    <Autocomplete
      label="Giống"
      placeholder="Chọn hoặc nhập giống mới"
      data={[...GOAT_BREED_OPTIONS]}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      disabled={disabled}
      limit={20}
    />
  );
}
