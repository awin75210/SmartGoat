import type { JournalEntryType } from "../constants/journal.constants";

export type JournalEntryRow = {
  id: string;
  farm_id: string;
  entry_type: JournalEntryType;
  batch_id: string | null;
  doe_id: string | null;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  recorded_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  farmId: string;
  entryType: JournalEntryType;
  batchId: string | null;
  doeId: string | null;
  batchName?: string;
  doeName?: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  recordedAt: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateJournalEntryInput = {
  entryType: JournalEntryType;
  batchId?: string | null;
  doeId?: string | null;
  title: string;
  body?: string | null;
  metadata?: Record<string, unknown>;
  recordedAt?: string;
};

export type JournalListFilter = {
  batchId?: string;
  doeId?: string;
  entryType?: JournalEntryType | "all";
  fromDate?: string;
  toDate?: string;
  limit?: number;
};
