import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ClientInfo, MandateType } from "@/lib/types";
import { buildTargetFolder, clientDisplayName, folderPathString } from "@/lib/folders";
import { isOneDriveConfigured, uploadToOneDrive, OneDriveResult } from "@/lib/onedrive";

// OneDrive-Upload braucht Node-Runtime und ggf. etwas mehr Zeit.
export const runtime = "nodejs";
export const maxDuration = 60;

// Eine oder mehrere (kommagetrennte) interne Empfängeradressen.
const NOTIFY_EMAILS = (process.env.NOTIFY_EMAIL || "info@juckertreuhand.ch")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface FilePayload {
  name: string;
  type: string;
  base64: string;
}

interface SubmitBody {
  mandate: string;
  mandateCategory: MandateType["category"];
  clientInfo: ClientInfo;
  files: FilePayload[];
  checkResult: {
    matched: { item: string; filename: string }[];
    missing: string[];
    uncertain: { item: string; filename: string; reason: string }[];
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body: SubmitBody = await request.json();
    const { mandate, mandateCategory, clientInfo, files, checkResult } = body;

    const displayName = clientDisplayName(mandateCategory, clientInfo);
    const folderParts = buildTargetFolder(mandateCategory, clientInfo);
    const folderPath = folderPathString(folderParts);
    const customerTypeLabel = clientInfo.customerType === "bestehend" ? "Bestehender Kunde" : "Neukunde";

    const attachments = files.map((f) => ({
      filename: f.name,
      content: f.base64,
    }));

    // Optionaler Upload in die OneDrive-Ordnerstruktur (falls konfiguriert).
    let oneDrive: OneDriveResult | null = null;
    if (isOneDriveConfigured()) {
      oneDrive = await uploadToOneDrive(
        folderParts,
        files.map((f) => ({
          name: f.name,
          type: f.type,
          content: Buffer.from(f.base64, "base64"),
        }))
      );
    }

    // Statusblock OneDrive für die interne E-Mail.
    let oneDriveHtml = "";
    if (oneDrive?.ok) {
      const link = oneDrive.webUrl
        ? ` &middot; <a href="${escapeHtml(oneDrive.webUrl)}" style="color: #114c81;">Ordner öffnen</a>`
        : "";
      oneDriveHtml = `<div style="background: #ecfdf3; border: 1px solid #abefc6; border-radius: 8px; padding: 10px 16px; margin: 12px 0; font-size: 13px; color: #067647;">&#10003; In OneDrive abgelegt (${oneDrive.uploaded} Datei(en))${link}</div>`;
    } else if (oneDrive && !oneDrive.ok) {
      oneDriveHtml = `<div style="background: #fef3f2; border: 1px solid #fecdca; border-radius: 8px; padding: 10px 16px; margin: 12px 0; font-size: 13px; color: #b42318;">&#9888; OneDrive-Upload fehlgeschlagen – bitte Dateien aus dem Anhang manuell ablegen.<br /><span style="color: #999;">${escapeHtml(oneDrive.error || "Unbekannter Fehler")}</span></div>`;
    }

    // Kundendaten-Zeilen für die interne E-Mail (nur ausgefüllte Felder).
    const addressLine = [clientInfo.strasse, [clientInfo.plz, clientInfo.ort].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
    const rows: { label: string; value: string; html?: boolean }[] = [
      { label: "Kundentyp", value: customerTypeLabel },
      { label: mandateCategory === "firma" ? "Firma" : "Name", value: displayName },
      {
        label: "E-Mail",
        value: clientInfo.email
          ? `<a href="mailto:${escapeHtml(clientInfo.email)}">${escapeHtml(clientInfo.email)}</a>`
          : "—",
        html: true,
      },
      { label: "Telefon", value: clientInfo.telefon || "—" },
      { label: "Adresse", value: addressLine || "—" },
      { label: "Mandat", value: mandate },
      { label: "Periode", value: clientInfo.period },
    ];
    if (clientInfo.remarks) rows.push({ label: "Bemerkungen", value: clientInfo.remarks });

    const dataRows = rows
      .map(
        (r) =>
          `<tr><td style="color: #999; padding: 4px 12px 4px 0; vertical-align: top;">${r.label}</td><td>${
            r.html ? r.value : escapeHtml(r.value)
          }</td></tr>`
      )
      .join("");

    // AI-Prüfbericht
    const matchedList = checkResult.matched
      .map((m) => `<li>&#10003; ${escapeHtml(m.item)} &rarr; ${escapeHtml(m.filename)}</li>`)
      .join("");
    const uncertainList = checkResult.uncertain
      .map((u) => `<li>&#63; ${escapeHtml(u.item)} &rarr; ${escapeHtml(u.filename)} (${escapeHtml(u.reason)})</li>`)
      .join("");
    const missingList = checkResult.missing
      .map((m) => `<li>&#10007; ${escapeHtml(m)}</li>`)
      .join("");

    const internalHtml = `
      <div style="font-family: Inter, system-ui, sans-serif; color: #161922; max-width: 600px;">
        <h2 style="font-family: Oswald, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #114c81; font-size: 18px;">
          Neue Unterlagen eingereicht
        </h2>

        <div style="background: #f3f6fa; border: 1px solid #d8e2ee; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
          <p style="font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #114c81; margin: 0 0 4px;">Zielordner</p>
          <p style="font-size: 14px; margin: 0; color: #161922;">${escapeHtml(folderPath)}</p>
        </div>

        ${oneDriveHtml}

        <table style="width: 100%; font-size: 14px; margin: 16px 0;">
          ${dataRows}
        </table>

        <h3 style="font-size: 14px; color: #114c81; margin-top: 24px;">AI-Prüfbericht</h3>
        ${matchedList ? `<p style="font-size: 13px; margin: 8px 0 4px;"><strong>Erkannt:</strong></p><ul style="font-size: 13px;">${matchedList}</ul>` : ""}
        ${uncertainList ? `<p style="font-size: 13px; margin: 8px 0 4px; color: #b45309;"><strong>Unklar:</strong></p><ul style="font-size: 13px; color: #b45309;">${uncertainList}</ul>` : ""}
        ${missingList ? `<p style="font-size: 13px; margin: 8px 0 4px; color: #dc2626;"><strong>Fehlend:</strong></p><ul style="font-size: 13px; color: #dc2626;">${missingList}</ul>` : ""}
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">${files.length} Datei(en) im Anhang</p>
      </div>
    `;

    const resend = getResend();
    const sends: Promise<unknown>[] = [
      resend.emails.send({
        from: "Jucker Treuhand <noreply@juckertreuhand.ch>",
        to: NOTIFY_EMAILS,
        subject: `Neue Unterlagen: ${mandate} — ${displayName} (${clientInfo.period})`,
        html: internalHtml,
        attachments,
      }),
    ];

    // Bestätigung an die Kundin/den Kunden nur, wenn eine gültige E-Mail vorliegt.
    if (clientInfo.email && isValidEmail(clientInfo.email)) {
      const fileListHtml = files.map((f) => `<li>${escapeHtml(f.name)}</li>`).join("");
      const greetingName = displayName !== "—" ? ` ${escapeHtml(displayName)}` : "";
      const clientHtml = `
        <div style="font-family: Inter, system-ui, sans-serif; color: #161922; max-width: 600px;">
          <h2 style="font-family: Oswald, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #114c81; font-size: 18px;">
            Ihre Unterlagen wurden übermittelt
          </h2>
          <p style="font-size: 14px; margin: 16px 0;">
            Guten Tag${greetingName},
          </p>
          <p style="font-size: 14px;">
            Wir haben Ihre Unterlagen für <strong>${escapeHtml(mandate)}</strong> (Periode ${escapeHtml(clientInfo.period)}) erhalten.
          </p>
          <p style="font-size: 14px; margin: 16px 0 8px;"><strong>Übermittelte Dokumente:</strong></p>
          <ul style="font-size: 14px;">${fileListHtml}</ul>
          <p style="font-size: 14px; margin: 16px 0;">
            Bei Fragen melden wir uns direkt bei Ihnen.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 13px; color: #666;">
            Jucker Treuhand<br />
            Hochstrasse 191, 8330 Pfäffikon ZH<br />
            044 951 06 36<br />
            <a href="mailto:info@juckertreuhand.ch" style="color: #114c81;">info@juckertreuhand.ch</a>
          </p>
        </div>
      `;
      sends.push(
        resend.emails.send({
          from: "Jucker Treuhand <noreply@juckertreuhand.ch>",
          to: [clientInfo.email],
          subject: "Ihre Unterlagen wurden übermittelt — Jucker Treuhand",
          html: clientHtml,
        })
      );
    }

    await Promise.all(sends);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
