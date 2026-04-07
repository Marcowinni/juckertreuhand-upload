import { MandateType } from "./types";

export const mandateTypes: MandateType[] = [
  // === PRIVATPERSON ===
  {
    id: "steuer-privat",
    label: "Steuererklärung Privatperson",
    category: "privatperson",
    checklist: [
      { id: "lohnausweis", label: "Lohnausweis (alle Arbeitgeber)", tooltip: "Nachweis Ihres Einkommens für die Steuerberechnung.", required: true },
      { id: "ahv-ausweis", label: "AHV-Ausweis / Rentenausweis (falls Rentner)", tooltip: "Zur Erfassung Ihrer Rentenleistungen.", required: true },
      { id: "krankenkasse", label: "Krankenkassenprämienabrechnung", tooltip: "Prämien sind steuerlich abzugsfähig.", required: true },
      { id: "kontoauszuege", label: "Kontoauszüge (31. Dezember)", tooltip: "Stichtagsbeleg für Ihr Vermögen per Jahresende.", required: true },
      { id: "vorjahr-steuer", label: "Vorjährige Steuererklärung / Veranlagungsverfügung", tooltip: "Referenz für Vorjahresvergleich und Überträge.", required: true },
      { id: "schuldzins", label: "Schuldzinsbescheinigung (Hypothek)", tooltip: "Hypothekarzinsen können vom Einkommen abgezogen werden.", required: false },
      { id: "wertschriften", label: "Wertschriftenverzeichnis / Depotauszug", tooltip: "Für die Deklaration Ihrer Kapitalanlagen.", required: false },
      { id: "spenden", label: "Spendenquittungen", tooltip: "Spenden an gemeinnützige Organisationen sind abzugsfähig.", required: false },
      { id: "weiterbildung", label: "Weiterbildungskosten-Belege", tooltip: "Berufliche Weiterbildung kann steuerlich geltend gemacht werden.", required: false },
      { id: "krankheit", label: "Krankheitskosten-Belege", tooltip: "Hohe Krankheitskosten können als Abzug geltend gemacht werden.", required: false },
    ],
  },
  {
    id: "steuer-wertschriften",
    label: "Steuererklärung mit Wertschriften / Liegenschaften",
    category: "privatperson",
    checklist: [
      { id: "lohnausweis", label: "Lohnausweis", tooltip: "Nachweis Ihres Einkommens.", required: true },
      { id: "depotauszug", label: "Depotauszug per 31.12. (alle Banken)", tooltip: "Stichtagsbeleg aller Wertschriftendepots.", required: true },
      { id: "wertschriften", label: "Wertschriftenverzeichnis", tooltip: "Detaillierte Aufstellung aller Kapitalanlagen.", required: true },
      { id: "schuldzins", label: "Schuldzinsabrechnung / Hypothekarvertrag", tooltip: "Hypothekarzinsen sind steuerlich abzugsfähig.", required: true },
      { id: "krankenkasse", label: "Krankenkassenprämienabrechnung", tooltip: "Prämien sind steuerlich abzugsfähig.", required: true },
      { id: "liegenschaft-unterhalt", label: "Liegenschaftsunterhaltskosten-Belege", tooltip: "Unterhaltskosten für Liegenschaften können abgezogen werden.", required: true },
      { id: "mieteinnahmen", label: "Mieteinnahmen-Aufstellung", tooltip: "Erträge aus Vermietung müssen deklariert werden.", required: false },
      { id: "renovation", label: "Renovation/Unterhalt-Rechnungen", tooltip: "Werterhaltende Investitionen können abgezogen werden.", required: false },
      { id: "spenden", label: "Spendenquittungen", tooltip: "Spenden an gemeinnützige Organisationen sind abzugsfähig.", required: false },
    ],
  },
  {
    id: "erbschaft",
    label: "Erbschaft / Nachlassregelung",
    category: "privatperson",
    checklist: [
      { id: "erbschein", label: "Erbschein / Erbenausweis", tooltip: "Legitimation als Erbe gegenüber Behörden und Banken.", required: true },
      { id: "steuerbescheid", label: "Letzter Steuerbescheid des Verstorbenen", tooltip: "Grundlage für die Nachlassbesteuerung.", required: true },
      { id: "konto-depot", label: "Kontoauszüge und Depotauszüge", tooltip: "Vermögensübersicht des Nachlasses.", required: true },
      { id: "liegenschaft", label: "Liegenschaftsbewertung (falls vorhanden)", tooltip: "Amtliche oder geschätzte Bewertung von Immobilien.", required: true },
      { id: "testament", label: "Testament / Erbvertrag (falls vorhanden)", tooltip: "Bestimmt die Aufteilung des Nachlasses.", required: true },
      { id: "schulden", label: "Schuldenübersicht", tooltip: "Verbindlichkeiten werden vom Nachlass abgezogen.", required: false },
      { id: "versicherung", label: "Versicherungspolicen", tooltip: "Lebensversicherungen und weitere Policen gehören zum Nachlass.", required: false },
    ],
  },

  // === FIRMA / SELBSTÄNDIG ===
  {
    id: "buchhaltung",
    label: "Buchhaltung & Jahresabschluss (GmbH / AG)",
    category: "firma",
    checklist: [
      { id: "fibu", label: "FIBU-Daten / Buchungsjournal (Export aus Abacus/Banana/etc.)", tooltip: "Grundlage für den Jahresabschluss.", required: true },
      { id: "kontoauszuege", label: "Kontoauszüge aller Geschäftskonten (gesamtes Jahr)", tooltip: "Abstimmung der Buchhaltung mit den Bankbewegungen.", required: true },
      { id: "debitoren", label: "Offene Debitoren per 31.12.", tooltip: "Ausstehende Forderungen per Stichtag.", required: true },
      { id: "kreditoren", label: "Offene Kreditoren per 31.12.", tooltip: "Ausstehende Verbindlichkeiten per Stichtag.", required: true },
      { id: "lohnjournal", label: "Lohnjournal / Lohnabrechnung", tooltip: "Übersicht aller Lohnzahlungen im Geschäftsjahr.", required: true },
      { id: "kasse", label: "Kassenbestand per 31.12.", tooltip: "Barbestand am Ende des Geschäftsjahres.", required: true },
      { id: "anlagenspiegel", label: "Anlagenspiegel", tooltip: "Übersicht der Sachanlagen und Abschreibungen.", required: false },
      { id: "vorjahresabschluss", label: "Vorjahresabschluss", tooltip: "Vergleichszahlen für den aktuellen Abschluss.", required: false },
      { id: "budget", label: "Budgetplanung", tooltip: "Falls vorhanden, für Soll-Ist-Vergleich.", required: false },
    ],
  },
  {
    id: "steuer-firma",
    label: "Steuererklärung juristische Person",
    category: "firma",
    checklist: [
      { id: "jahresabschluss", label: "Genehmigter Jahresabschluss (Bilanz + ER)", tooltip: "Pflichtbeilage zur Steuererklärung juristischer Personen.", required: true },
      { id: "eigenkapital", label: "Eigenkapitalnachweis", tooltip: "Nachweis der Veränderung des Eigenkapitals.", required: true },
      { id: "vorjahr-steuer", label: "Vorjährige Steuererklärung", tooltip: "Referenz für Vorjahresvergleich.", required: true },
      { id: "beteiligungen", label: "Beteiligungsverzeichnis", tooltip: "Für den Beteiligungsabzug relevant.", required: false },
      { id: "rueckstellungen", label: "Rückstellungsnachweis", tooltip: "Begründung und Berechnung der Rückstellungen.", required: false },
    ],
  },
  {
    id: "lohnbuchhaltung",
    label: "Lohnbuchhaltung",
    category: "firma",
    checklist: [
      { id: "personalstamm", label: "Personalstamm (Neu- und Austritte, Mutationen)", tooltip: "Aktuelle Mitarbeiterdaten für die Lohnverarbeitung.", required: true },
      { id: "stundennachweise", label: "Stundennachweise / Arbeitszeiterfassung", tooltip: "Grundlage für Stundenlöhne und Überzeitabrechnung.", required: true },
      { id: "spesen", label: "Spesenabrechnungen", tooltip: "Spesenerstattungen müssen korrekt erfasst werden.", required: true },
      { id: "ahv-anmeldungen", label: "AHV-Anmeldungen", tooltip: "Für neue Mitarbeitende bei der Ausgleichskasse.", required: false },
      { id: "quellensteuer", label: "Quellensteuer-Belege", tooltip: "Für quellensteuerpflichtige Mitarbeitende.", required: false },
    ],
  },
  {
    id: "mwst",
    label: "MwSt-Abrechnung",
    category: "firma",
    checklist: [
      { id: "umsatz", label: "Umsatzübersicht pro Quartal", tooltip: "Grundlage für die MwSt-Deklaration.", required: true },
      { id: "vorsteuer", label: "Vorsteuernachweise (Eingangsrechnungen)", tooltip: "Vorsteuerabzug erfordert korrekte Belege.", required: true },
      { id: "kontoauszuege", label: "Kontoauszüge", tooltip: "Zur Abstimmung der deklarierten Umsätze.", required: true },
      { id: "korrekturen", label: "Korrekturbuchungen Vorperiode", tooltip: "Falls Anpassungen aus früheren Perioden nötig sind.", required: false },
    ],
  },
  {
    id: "neugruendung",
    label: "Neugründung / Gesellschaftsgründung",
    category: "firma",
    checklist: [
      { id: "ausweis", label: "Ausweiskopie aller Gesellschafter (Pass/ID)", tooltip: "Identifikation der Gründer für das Handelsregister.", required: true },
      { id: "wohnsitz", label: "Wohnsitzbestätigung", tooltip: "Nachweis des Wohnsitzes der Gesellschafter.", required: true },
      { id: "geschaeftszweck", label: "Geplanter Geschäftszweck (schriftlich)", tooltip: "Wird im Handelsregister eingetragen.", required: true },
      { id: "stammeinlage", label: "Stammeinlage-Nachweis (Bankbestätigung)", tooltip: "Beleg der Kapitaleinzahlung bei der Bank.", required: true },
      { id: "businessplan", label: "Businessplan", tooltip: "Empfohlen für Bankgespräche und Planung.", required: false },
      { id: "gesellschaftervertrag", label: "Gesellschaftervertrag-Entwurf", tooltip: "Regelt die Rechte und Pflichten der Gesellschafter.", required: false },
    ],
  },
];

export function getMandateById(id: string): MandateType | undefined {
  return mandateTypes.find((m) => m.id === id);
}
