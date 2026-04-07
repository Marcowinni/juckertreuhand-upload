import { NextResponse } from "next/server";
import { Resend } from "resend";

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "info@juckertreuhand.ch";

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
  clientInfo: {
    name: string;
    email: string;
    period: string;
    remarks: string;
  };
  files: FilePayload[];
  checkResult: {
    matched: { item: string; filename: string }[];
    missing: string[];
    uncertain: { item: string; filename: string; reason: string }[];
  };
}

export async function POST(request: Request) {
  try {
    const body: SubmitBody = await request.json();
    const { mandate, clientInfo, files, checkResult } = body;

    const attachments = files.map((f) => ({
      filename: f.name,
      content: f.base64,
    }));

    // Build internal email HTML
    const matchedList = checkResult.matched
      .map((m) => `<li>&#10003; ${m.item} &rarr; ${m.filename}</li>`)
      .join("");
    const uncertainList = checkResult.uncertain
      .map((u) => `<li>&#63; ${u.item} &rarr; ${u.filename} (${u.reason})</li>`)
      .join("");
    const missingList = checkResult.missing
      .map((m) => `<li>&#10007; ${m}</li>`)
      .join("");

    const internalHtml = `
      <div style="font-family: Inter, system-ui, sans-serif; color: #161922; max-width: 600px;">
        <h2 style="font-family: Oswald, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #114c81; font-size: 18px;">
          Neue Unterlagen eingereicht
        </h2>
        <table style="width: 100%; font-size: 14px; margin: 16px 0;">
          <tr><td style="color: #999; padding: 4px 12px 4px 0;">Name</td><td>${clientInfo.name}</td></tr>
          <tr><td style="color: #999; padding: 4px 12px 4px 0;">E-Mail</td><td><a href="mailto:${clientInfo.email}">${clientInfo.email}</a></td></tr>
          <tr><td style="color: #999; padding: 4px 12px 4px 0;">Mandat</td><td>${mandate}</td></tr>
          <tr><td style="color: #999; padding: 4px 12px 4px 0;">Periode</td><td>${clientInfo.period}</td></tr>
          ${clientInfo.remarks ? `<tr><td style="color: #999; padding: 4px 12px 4px 0;">Bemerkungen</td><td>${clientInfo.remarks}</td></tr>` : ""}
        </table>
        <h3 style="font-size: 14px; color: #114c81; margin-top: 24px;">AI-Prüfbericht</h3>
        ${matchedList ? `<p style="font-size: 13px; margin: 8px 0 4px;"><strong>Erkannt:</strong></p><ul style="font-size: 13px;">${matchedList}</ul>` : ""}
        ${uncertainList ? `<p style="font-size: 13px; margin: 8px 0 4px; color: #b45309;"><strong>Unklar:</strong></p><ul style="font-size: 13px; color: #b45309;">${uncertainList}</ul>` : ""}
        ${missingList ? `<p style="font-size: 13px; margin: 8px 0 4px; color: #dc2626;"><strong>Fehlend:</strong></p><ul style="font-size: 13px; color: #dc2626;">${missingList}</ul>` : ""}
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #999;">${files.length} Datei(en) im Anhang</p>
      </div>
    `;

    // Build client confirmation email
    const fileListHtml = files
      .map((f) => `<li>${f.name}</li>`)
      .join("");

    const clientHtml = `
      <div style="font-family: Inter, system-ui, sans-serif; color: #161922; max-width: 600px;">
        <h2 style="font-family: Oswald, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; color: #114c81; font-size: 18px;">
          Ihre Unterlagen wurden übermittelt
        </h2>
        <p style="font-size: 14px; margin: 16px 0;">
          Guten Tag ${clientInfo.name},
        </p>
        <p style="font-size: 14px;">
          Wir haben Ihre Unterlagen für <strong>${mandate}</strong> (Periode ${clientInfo.period}) erhalten.
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

    // Send both emails
    const resend = getResend();
    await Promise.all([
      resend.emails.send({
        from: "Jucker Treuhand <noreply@juckertreuhand.ch>",
        to: [NOTIFY_EMAIL],
        subject: `Neue Unterlagen: ${mandate} — ${clientInfo.name} (${clientInfo.period})`,
        html: internalHtml,
        attachments,
      }),
      resend.emails.send({
        from: "Jucker Treuhand <noreply@juckertreuhand.ch>",
        to: [clientInfo.email],
        subject: "Ihre Unterlagen wurden übermittelt — Jucker Treuhand",
        html: clientHtml,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Submit failed" }, { status: 500 });
  }
}
