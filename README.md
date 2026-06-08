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

> Hinweis: Aktuell wird der Zielordner-Pfad in der Benachrichtigungs-E-Mail
> mitgeschickt (Ablage durch Jucker Treuhand). Eine automatische Ablage direkt
> in Google Drive ist als Folgeschritt möglich und würde Google-Zugangsdaten
> (Service-Account) voraussetzen.

## Umgebungsvariablen

In `.env.local` (lokal) bzw. in den Projekt­einstellungen (Vercel) setzen:

| Variable            | Zweck                                                              |
| ------------------- | ----------------------------------------------------------------- |
| `RESEND_API_KEY`    | Versand der E-Mails über [Resend](https://resend.com).            |
| `NOTIFY_EMAIL`      | Interne Empfängeradresse(n). Mehrere kommagetrennt möglich.       |
| `ANTHROPIC_API_KEY` | KI-gestützte Dokumentenprüfung (`/api/check-documents`).          |

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
npm run lint
```
