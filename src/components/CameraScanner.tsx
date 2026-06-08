"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";

interface CameraScannerProps {
  onComplete: (files: File[]) => void;
  onClose: () => void;
}

interface Page {
  url: string; // JPEG data-URL
  w: number;
  h: number;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(
    d.getMinutes()
  )}`;
}

/** Baut aus mehreren Seitenbildern ein A4-PDF (eine Seite pro Bild). */
function buildPdf(pages: Page[]): File {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  pages.forEach((page, i) => {
    if (i > 0) pdf.addPage();
    const ratio = Math.min(maxW / page.w, maxH / page.h);
    const drawW = page.w * ratio;
    const drawH = page.h * ratio;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;
    pdf.addImage(page.url, "JPEG", x, y, drawW, drawH);
  });

  const blob = pdf.output("blob");
  return new File([blob], `Scan_${timestamp()}.pdf`, { type: "application/pdf" });
}

export default function CameraScanner({ onComplete, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [building, setBuilding] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setFallback(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch {
        setFallback(true);
      }
    }

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  function capturePage() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.82);
    setPages((prev) => [...prev, { url, w: canvas.width, h: canvas.height }]);
  }

  function removePage(index: number) {
    setPages((prev) => prev.filter((_, i) => i !== index));
  }

  function finish() {
    if (pages.length === 0) return;
    setBuilding(true);
    try {
      const file = buildPdf(pages);
      stopStream();
      onComplete([file]);
    } catch (err) {
      console.error("PDF-Erstellung fehlgeschlagen", err);
      setBuilding(false);
    }
  }

  function cancel() {
    stopStream();
    onClose();
  }

  // Fallback: native Kamera-App des Geräts (ein Foto pro Auslösung).
  async function handleFallbackFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const loaded = await Promise.all(
      Array.from(fileList).map(
        (file) =>
          new Promise<Page>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () =>
                resolve({ url: String(reader.result), w: img.naturalWidth, h: img.naturalHeight });
              img.onerror = reject;
              img.src = String(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setPages((prev) => [...prev, ...loaded]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-heading text-sm tracking-heading uppercase text-charcoal">
            Dokument scannen
          </h3>
          <button onClick={cancel} className="text-gray-400 hover:text-charcoal" aria-label="Schliessen">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {!fallback ? (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4]">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                {!ready && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    Kamera wird gestartet…
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={capturePage}
                disabled={!ready}
                className="mt-3 w-full bg-navy text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors disabled:bg-gray-200 disabled:text-gray-400"
              >
                Seite aufnehmen
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">
                Direkter Kamerazugriff ist nicht verfügbar. Nutzen Sie die Kamera Ihres Geräts –
                für mehrere Seiten den Vorgang mehrmals wiederholen.
              </p>
              <label className="inline-block bg-navy text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors cursor-pointer">
                Foto aufnehmen
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFallbackFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}

          {/* Aufgenommene Seiten */}
          {pages.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">
                {pages.length} Seite{pages.length !== 1 ? "n" : ""} aufgenommen
              </p>
              <div className="grid grid-cols-4 gap-2">
                {pages.map((page, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={page.url}
                      alt={`Seite ${i + 1}`}
                      className="w-full aspect-[3/4] object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removePage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-red-500 flex items-center justify-center shadow-sm"
                      aria-label={`Seite ${i + 1} entfernen`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 text-[10px] bg-black/60 text-white rounded px-1">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-charcoal transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={pages.length === 0 || building}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 bg-navy text-white hover:bg-navy-dark"
          >
            {building
              ? "PDF wird erstellt…"
              : pages.length > 0
              ? `Als PDF übernehmen (${pages.length})`
              : "Als PDF übernehmen"}
          </button>
        </div>
      </div>
    </div>
  );
}
