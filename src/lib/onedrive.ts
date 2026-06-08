// Microsoft-OneDrive-Ablage über Microsoft Graph (App-only / Client Credentials).
//
// Benötigte Umgebungsvariablen:
//   MS_TENANT_ID       Azure-AD-Verzeichnis (Tenant) ID
//   MS_CLIENT_ID       App-Registrierung (Client ID)
//   MS_CLIENT_SECRET   Client-Secret der App-Registrierung
//   ONEDRIVE_USER_ID   UPN/E-Mail des OneDrive-Kontos (z. B. info@juckertreuhand.ch)
//                      ODER
//   ONEDRIVE_DRIVE_ID  Konkrete Drive-ID (z. B. SharePoint-/Teams-Bibliothek)
//   MS_AUTHORITY       optional, Standard: https://login.microsoftonline.com
//
// Die App-Registrierung benötigt die Application-Permission "Files.ReadWrite.All"
// (bzw. "Sites.ReadWrite.All" für SharePoint-Bibliotheken) mit Admin-Consent.

export interface OneDriveFile {
  name: string;
  type: string;
  content: Uint8Array;
}

export interface OneDriveResult {
  ok: boolean;
  uploaded: number;
  webUrl?: string;
  error?: string;
}

let tokenCache: { token: string; exp: number } | null = null;

export function isOneDriveConfigured(): boolean {
  return Boolean(
    process.env.MS_TENANT_ID &&
      process.env.MS_CLIENT_ID &&
      process.env.MS_CLIENT_SECRET &&
      (process.env.ONEDRIVE_DRIVE_ID || process.env.ONEDRIVE_USER_ID)
  );
}

function graphBase(): string {
  const driveId = process.env.ONEDRIVE_DRIVE_ID;
  if (driveId) return `https://graph.microsoft.com/v1.0/drives/${driveId}`;
  const userId = process.env.ONEDRIVE_USER_ID as string;
  return `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userId)}/drive`;
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.exp > now + 60_000) return tokenCache.token;

  const tenant = process.env.MS_TENANT_ID as string;
  const authority = process.env.MS_AUTHORITY || "https://login.microsoftonline.com";
  const res = await fetch(`${authority}/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID as string,
      client_secret: process.env.MS_CLIENT_SECRET as string,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`Token-Anfrage fehlgeschlagen (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = { token: data.access_token, exp: now + (data.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

function encodePath(segments: string[]): string {
  return segments.map((s) => encodeURIComponent(s)).join("/");
}

/** Legt die Ordnerhierarchie an (idempotent – bestehende Ordner werden belassen). */
async function ensureFolders(base: string, token: string, segments: string[]): Promise<void> {
  const parent: string[] = [];
  for (const seg of segments) {
    const childrenUrl =
      parent.length === 0
        ? `${base}/root/children`
        : `${base}/root:/${encodePath(parent)}:/children`;
    const res = await fetch(childrenUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: seg,
        folder: {},
        "@microsoft.graph.conflictBehavior": "fail",
      }),
    });
    // 201 = neu erstellt, 409 = existiert bereits – beides ist in Ordnung.
    if (!res.ok && res.status !== 409) {
      throw new Error(`Ordner "${seg}" konnte nicht erstellt werden (${res.status}): ${await res.text()}`);
    }
    parent.push(seg);
  }
}

async function uploadOne(
  base: string,
  token: string,
  segments: string[],
  file: OneDriveFile
): Promise<void> {
  const path = encodePath([...segments, file.name]);
  const url = `${base}/root:/${path}:/content?@microsoft.graph.conflictBehavior=rename`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    // Binär-Upload; Cast wegen der generischen Uint8Array-Typen in neueren TS-Libs.
    body: file.content as unknown as BodyInit,
  });
  if (!res.ok) {
    throw new Error(`Upload "${file.name}" fehlgeschlagen (${res.status}): ${await res.text()}`);
  }
}

async function getFolderWebUrl(
  base: string,
  token: string,
  segments: string[]
): Promise<string | undefined> {
  const res = await fetch(`${base}/root:/${encodePath(segments)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { webUrl?: string };
  return data.webUrl;
}

/**
 * Lädt die Dateien in den angegebenen Ordnerpfad in OneDrive hoch.
 * Wirft nie – Fehler werden im Resultat zurückgegeben, damit die Einreichung
 * (inkl. E-Mail-Versand) auch bei OneDrive-Problemen weiterläuft.
 */
export async function uploadToOneDrive(
  segments: string[],
  files: OneDriveFile[]
): Promise<OneDriveResult> {
  try {
    const base = graphBase();
    const token = await getToken();
    await ensureFolders(base, token, segments);

    let uploaded = 0;
    for (const file of files) {
      await uploadOne(base, token, segments, file);
      uploaded++;
    }

    const webUrl = await getFolderWebUrl(base, token, segments);
    return { ok: true, uploaded, webUrl };
  } catch (e) {
    console.error("OneDrive-Upload-Fehler:", e);
    return { ok: false, uploaded: 0, error: e instanceof Error ? e.message : String(e) };
  }
}
