# Jucker Treuhand – Dokumenten-Upload-Portal

Webportal, über das Kundinnen und Kunden ihre Steuer- und Buchhaltungs­unterlagen
sicher an Jucker Treuhand übermitteln. Next.js (App Router) + Tailwind CSS.

## Ablauf

1. **Dokumentenauswahl** – Mandatstyp wählen (Privatperson oder Firma).
2. **Angaben** – Kundenbeziehung (Neukunde / bestehend), Name (Vor-/Nachname bzw.
   Firmenname), E-Mail, Telefon, Adresse (Strasse, PLZ, Ort), Periode, Bemerkungen.
   **Alle Felder sind optional.**
3. **Dokumente** – Dateien hochladen (Drag & Drop / Datei­auswahl) oder **mit der
   Kamera mehrseitig scannen** (wird zu einem PDF zusammengefügt). Eine
   KI-Prüfung ordnet die Dateien der Checkliste zu (rein informativ – nichts ist
   Pflicht).
4. **Bestätigung** – interne Benachrichtigung an Jucker Treuhand sowie optionale
   Bestätigungs-E-Mail an die Kundin / den Kunden.

## Automatische Ordner-Zuordnung

Bei der Einreichung wird ein Zielordner berechnet und in der internen E-Mail
ausgewiesen (`src/lib/folders.ts`):

```
Dokumente Jucker Treuhand/
├─ Natürliche Personen ZH/        (Privatperson, PLZ im Kanton Zürich)
│  └─ <Nachname Vorname>/
│     └─ Unverarbeitete Dokumente/
├─ Ausserkantonal/                (Privatperson, PLZ ausserhalb ZH)
│  └─ <Nachname Vorname>/
│     └─ Unverarbeitete Dokumente/
└─ <Firmenname>/                  (Firma direkt unter dem Firmennamen)
   └─ Unverarbeitete Dokumente/
```

Die ZH-/Ausserkantonal-Erkennung erfolgt über die PLZ (`src/lib/zurich-plz.ts`).
Eine unbekannte PLZ wird als Zürich behandelt; massgeblich bleibt der in der
E-Mail genannte Zielordner, den Jucker Treuhand jederzeit korrigieren kann.

## OneDrive-Ablage (optional)

Sind die Microsoft-Variablen gesetzt, werden die Dateien bei der Einreichung
zusätzlich automatisch in die obige Ordnerstruktur in **OneDrive** hochgeladen
(`src/lib/onedrive.ts`, via Microsoft Graph). Der Status (inkl. Link zum Ordner)
erscheint in der internen E-Mail. Schlägt der Upload fehl oder ist OneDrive nicht
konfiguriert, bleibt der E-Mail-Versand inkl. Dateianhänge als Fallback bestehen.

**Einrichtung in Azure / Entra ID:**

1. App-Registrierung erstellen → `MS_CLIENT_ID` und `MS_TENANT_ID` notieren.
2. Unter *Zertifikate & Geheimnisse* ein Client-Secret erzeugen → `MS_CLIENT_SECRET`.
3. Unter *API-Berechtigungen* die **Application**-Permission `Files.ReadWrite.All`
   (für SharePoint-Bibliotheken zusätzlich `Sites.ReadWrite.All`) hinzufügen und
   **Administratorzustimmung** erteilen.
4. Zielablage festlegen: `ONEDRIVE_USER_ID` (UPN/E-Mail des OneDrive-Kontos, z. B.
   `info@juckertreuhand.ch`) **oder** `ONEDRIVE_DRIVE_ID` (konkrete Drive-ID einer
   SharePoint-/Teams-Bibliothek).

## Umgebungsvariablen

In `.env.local` (lokal) bzw. in den Projekt­einstellungen (Vercel) setzen:

| Variable            | Zweck                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `RESEND_API_KEY`    | Versand der E-Mails über [Resend](https://resend.com).            |
| `NOTIFY_EMAIL`      | Interne Empfängeradresse(n). Mehrere kommagetrennt möglich.       |
| `ANTHROPIC_API_KEY` | KI-gestützte Dokumentenprüfung (`/api/check-documents`).          |
| `MS_TENANT_ID`      | OneDrive (optional): Azure-AD-/Entra-Tenant-ID.                   |
| `MS_CLIENT_ID`      | OneDrive (optional): Client-ID der App-Registrierung.            |
| `MS_CLIENT_SECRET`  | OneDrive (optional): Client-Secret der App-Registrierung.        |
| `ONEDRIVE_USER_ID`  | OneDrive (optional): UPN/E-Mail des Ziel-OneDrive-Kontos.        |
| `ONEDRIVE_DRIVE_ID` | OneDrive (optional): alternativ konkrete Drive-ID.              |

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
npm run lint
```
