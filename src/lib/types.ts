export interface ChecklistItem {
  id: string;
  label: string;
  tooltip: string;
  required: boolean;
}

export interface MandateType {
  id: string;
  label: string;
  category: "privatperson" | "firma";
  checklist: ChecklistItem[];
}

export interface ClientInfo {
  name: string;
  email: string;
  period: string;
  remarks: string;
}

export interface UploadedFile {
  file: File;
  id: string;
}

export type CheckStatus = "matched" | "uncertain" | "missing";

export interface CheckResult {
  matched: { item: string; filename: string }[];
  missing: string[];
  uncertain: { item: string; filename: string; reason: string }[];
}

export interface ChecklistItemStatus {
  item: ChecklistItem;
  status: CheckStatus;
  filename?: string;
  reason?: string;
}
