"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { MandateType, ClientInfo, UploadedFile, CheckResult, ChecklistItemStatus } from "@/lib/types";
import { clientDisplayName } from "@/lib/folders";

// Kamera-Scanner (inkl. jsPDF) erst bei Bedarf laden – hält das Initial-Bundle klein.
const CameraScanner = dynamic(() => import("@/components/CameraScanner"), { ssr: false });

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/tiff",
];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.heic,.tiff,.tif";
const ACCEPTED_EXT_LIST = ["pdf", "jpg", "jpeg", "png", "heic", "tiff", "tif"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 20;
const WARN_TOTAL_SIZE = 35 * 1024 * 1024; // 35MB

interface DocumentUploadProps {
  mandate: MandateType;
  clientInfo: ClientInfo;
  onSubmit: (files: File[], checkResult: CheckResult) => void;
  onBack: () => void;
}

const EMPTY_RESULT: CheckResult = { matched: [], missing: [], uncertain: [] };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({ mandate, clientInfo, onSubmit, onBack }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const requiredItems = mandate.checklist.filter((c) => c.required);
  const optionalItems = mandate.checklist.filter((c) => !c.required);

  // Alle Dokumente sind optional – eingereicht werden kann, sobald mindestens
  // eine Datei vorhanden ist und der Datenschutzhinweis akzeptiert wurde.
  const canSubmit = files.length > 0 && gdprAccepted && !submitting;

  const runCheck = useCallback(
    async (currentFiles: UploadedFile[]) => {
      if (currentFiles.length === 0) {
        setCheckResult(null);
        return;
      }

      setChecking(true);
      try {
        const res = await fetch("/api/check-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mandateType: mandate.label,
            filenames: currentFiles.map((f) => f.file.name),
            requiredItems: requiredItems.map((c) => c.label),
            optionalItems: optionalItems.map((c) => c.label),
          }),
        });
        const data: CheckResult = await res.json();
        setCheckResult(data);
      } catch {
        console.error("Document check failed");
      } finally {
        setChecking(false);
      }
    },
    [mandate.label, requiredItems, optionalItems]
  );

  function scheduleCheck(updatedFiles: UploadedFile[]) {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => runCheck(updatedFiles), 500);
  }

  function addFiles(newFiles: FileList | File[]) {
    const toAdd: UploadedFile[] = [];
    let skippedSize = 0;
    let skippedType = 0;
    let skippedMax = 0;

    for (const file of Array.from(newFiles)) {
      if (files.length + toAdd.length >= MAX_FILES) {
        skippedMax++;
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isAccepted = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT_LIST.includes(ext);
      if (!isAccepted) {
        skippedType++;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        skippedSize++;
        continue;
      }

      toAdd.push({ file, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
    }

    if (toAdd.length > 0) {
      const updated = [...files, ...toAdd];
      setFiles(updated);
      scheduleCheck(updated);
    }

    const messages: string[] = [];
    if (skippedSize) messages.push(`${skippedSize} Datei(en) über 20 MB übersprungen`);
    if (skippedType) messages.push(`${skippedType} Datei(en) mit nicht unterstütztem Format übersprungen`);
    if (skippedMax) messages.push(`maximal ${MAX_FILES} Dateien möglich`);
    setNotice(messages.join(" · "));
  }

  function removeFile(id: string) {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    scheduleCheck(updated);
  }

  function getItemStatus(item: typeof mandate.checklist[0]): ChecklistItemStatus {
    if (!checkResult) return { item, status: "missing" };

    const matched = checkResult.matched.find((m) => m.item === item.label);
    if (matched) return { item, status: "matched", filename: matched.filename };

    const uncertain = checkResult.uncertain.find((u) => u.item === item.label);
    if (uncertain) return { item, status: "uncertain", filename: uncertain.filename, reason: uncertain.reason };

    return { item, status: "missing" };
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const fileData = await Promise.all(
        files.map(async (f) => {
          const buffer = await f.file.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
          );
          return { name: f.file.name, type: f.file.type || "application/octet-stream", base64 };
        })
      );

      const result = checkResult ?? EMPTY_RESULT;
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandate: mandate.label,
          mandateCategory: mandate.category,
          clientInfo,
          files: fileData,
          checkResult: result,
        }),
      });

      if (!res.ok) throw new Error("Submit failed");

      onSubmit(
        files.map((f) => f.file),
        result
      );
    } catch (err) {
      console.error(err);
      alert("Fehler beim Einreichen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <p className="font-heading text-xs tracking-heading uppercase text-navy mb-2">
          Schritt 3 — Dokumente
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl text-charcoal tracking-heading uppercase mb-2">
          Dokumente hochladen
        </h2>
        <p className="text-gray-500 text-sm">
          {mandate.label} — {clientDisplayName(mandate.category, clientInfo)} — {clientInfo.period}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload zone */}
        <div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
            <p className="text-sm text-gray-500">
              Dateien hierher ziehen oder <span className="text-navy font-medium">durchsuchen</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG, HEIC, TIFF — max. 20 MB pro Datei
            </p>
          </div>

          {/* Kamera-Scan */}
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal hover:border-navy hover:text-navy transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            Mit Kamera scannen (mehrseitig)
          </button>

          {notice && <p className="mt-2 text-xs text-amber-600">{notice}</p>}

          {/* File chips */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-charcoal truncate flex-1">{f.file.name}</span>
                  <span className="text-xs text-gray-400 shrink-0">{formatSize(f.file.size)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400">
                {files.length} Datei{files.length !== 1 ? "en" : ""} — {formatSize(totalSize)} gesamt
              </p>
            </div>
          )}

          {/* 35MB warning */}
          {totalSize > WARN_TOTAL_SIZE && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700">
                Die Gesamtgrösse Ihrer Dokumente überschreitet 35 MB. Bitte komprimieren Sie grosse Dateien oder teilen Sie die Einreichung auf zwei Sendungen auf.
              </p>
            </div>
          )}
        </div>

        {/* Right: Checklist */}
        <div>
          <p className="font-heading text-xs tracking-heading uppercase text-navy mb-1">
            Dokumentenauswahl
          </p>
          <h3 className="font-heading text-sm tracking-heading uppercase text-charcoal mb-1">
            Empfohlene Dokumente
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Alle Dokumente sind optional – reichen Sie ein, was Sie zur Hand haben.
          </p>

          {checking && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 border-2 border-navy border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Dokumente werden geprüft...</span>
            </div>
          )}

          <div className="space-y-1.5">
            {requiredItems.map((item) => {
              const status = getItemStatus(item);
              return (
                <ChecklistRow
                  key={item.id}
                  status={status}
                  showTooltip={tooltipId === item.id}
                  onToggleTooltip={() => setTooltipId(tooltipId === item.id ? null : item.id)}
                />
              );
            })}
          </div>

          {optionalItems.length > 0 && (
            <>
              <h3 className="font-heading text-xs tracking-heading uppercase text-gray-400 mt-6 mb-4">
                Ergänzend
              </h3>
              <div className="space-y-1.5">
                {optionalItems.map((item) => {
                  const status = getItemStatus(item);
                  return (
                    <ChecklistRow
                      key={item.id}
                      status={status}
                      showTooltip={tooltipId === item.id}
                      onToggleTooltip={() => setTooltipId(tooltipId === item.id ? null : item.id)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* GDPR + Submit */}
      <div className="mt-10 max-w-lg mx-auto">
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={gdprAccepted}
            onChange={(e) => setGdprAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            Ihre Daten werden verschlüsselt übertragen und ausschliesslich zur Bearbeitung Ihres Mandats verwendet.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-sm text-gray-500 hover:text-charcoal transition-colors"
          >
            Zurück
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              canSubmit
                ? "bg-navy text-white hover:bg-navy-dark"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Wird gesendet...
              </span>
            ) : (
              "Unterlagen einreichen"
            )}
          </button>
        </div>
      </div>

      {showScanner && (
        <CameraScanner
          onComplete={(scanned) => {
            setShowScanner(false);
            addFiles(scanned);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

function ChecklistRow({
  status,
  showTooltip,
  onToggleTooltip,
}: {
  status: ChecklistItemStatus;
  showTooltip: boolean;
  onToggleTooltip: () => void;
}) {
  const { item } = status;

  return (
    <div className="relative">
      <div className="flex items-start gap-2 py-1.5">
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {status.status === "matched" && (
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status.status === "uncertain" && (
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 text-xs font-bold">?</span>
            </div>
          )}
          {status.status === "missing" && (
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${status.status === "matched" ? "text-charcoal" : "text-gray-500"}`}>
            {item.label}
          </span>
          {status.status === "matched" && status.filename && (
            <p className="text-xs text-green-600 truncate">{status.filename}</p>
          )}
          {status.status === "uncertain" && status.filename && (
            <p className="text-xs text-amber-600 truncate">
              {status.filename} — {status.reason}
            </p>
          )}
        </div>

        {/* Tooltip trigger */}
        <button
          onClick={onToggleTooltip}
          className="text-gray-300 hover:text-navy transition-colors shrink-0 mt-0.5"
          title="Warum brauchen wir das?"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
        </button>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="ml-7 mb-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
          {item.tooltip}
        </div>
      )}
    </div>
  );
}
