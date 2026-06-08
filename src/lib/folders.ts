import { ClientInfo, MandateType } from "./types";
import { isZurichPlz } from "./zurich-plz";

// Wurzelordner – hier hinein kommen sämtliche Einreichungen.
export const ROOT_FOLDER = "Dokumente Jucker Treuhand";
// Unterordner pro Kunde, in dem die frisch eingereichten Dateien landen.
export const UNPROCESSED_FOLDER = "Unverarbeitete Dokumente";

// Hauptordner für Privatpersonen, abhängig vom Kanton.
export const FOLDER_NATUERLICHE_PERSONEN_ZH = "Natürliche Personen ZH";
export const FOLDER_AUSSERKANTONAL = "Ausserkantonal";

type Category = MandateType["category"];

function sanitize(part: string): string {
  // In OneDrive/SharePoint unzulässige Zeichen ersetzen; Akzente und sonstige
  // Buchstaben (inkl. langer spanischer Namen) bleiben erhalten. Namen dürfen
  // zudem nicht auf Punkt/Leerzeichen enden.
  return part
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/, "");
}

/** Anzeigename des Kunden – Firmenname bzw. "Vorname Nachname". */
export function clientDisplayName(category: Category, info: ClientInfo): string {
  if (category === "firma") {
    return info.firmenname.trim() || "—";
  }
  return [info.vorname, info.nachname].map((s) => s.trim()).filter(Boolean).join(" ") || "—";
}

/** Ordnername des Kunden – "Nachname Vorname" für saubere Sortierung. */
function clientFolderName(category: Category, info: ClientInfo): string {
  if (category === "firma") {
    return sanitize(info.firmenname) || "Unbenannte Firma";
  }
  const name = [info.nachname, info.vorname].map((s) => s.trim()).filter(Boolean).join(" ");
  return sanitize(name) || "Unbenannte Person";
}

/**
 * Baut den Zielordner als Pfad-Segmente auf.
 *
 * Privatpersonen:
 *   Dokumente Jucker Treuhand / Natürliche Personen ZH | Ausserkantonal /
 *   <Nachname Vorname> / Unverarbeitete Dokumente
 *
 * Firmen (direkt unter dem Firmennamen):
 *   Dokumente Jucker Treuhand / <Firmenname> / Unverarbeitete Dokumente
 */
export function buildTargetFolder(category: Category, info: ClientInfo): string[] {
  if (category === "firma") {
    return [ROOT_FOLDER, clientFolderName(category, info), UNPROCESSED_FOLDER];
  }
  const region = isZurichPlz(info.plz) ? FOLDER_NATUERLICHE_PERSONEN_ZH : FOLDER_AUSSERKANTONAL;
  return [ROOT_FOLDER, region, clientFolderName(category, info), UNPROCESSED_FOLDER];
}

/** Stellt den Ordnerpfad als lesbaren String dar. */
export function folderPathString(parts: string[]): string {
  return parts.join(" / ");
}
