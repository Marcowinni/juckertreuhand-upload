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

export type CustomerType = "neu" | "bestehend";

export interface ClientInfo {
  customerType: CustomerType;
  // Privatperson (separat erfasst, unterstützt auch lange/mehrteilige Namen)
  vorname: string;
  nachname: string;
  // Firma
  firmenname: string;
  // Kontakt & Adresse
  email: string;
  telefon: string;
  strasse: string;
  plz: string;
  ort: string;
  // Auftrag
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
