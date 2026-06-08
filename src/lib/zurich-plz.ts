// Postleitzahlen des Kantons Zürich (für die automatische Ordner-Zuordnung
// "Natürliche Personen ZH" vs. "Ausserkantonal").
//
// Der gesamte Block 8000–8099 (Stadt Zürich) wird per Bereichsprüfung erkannt.
// Die übrigen Zürcher PLZ stehen in ZH_PLZ. Die Liste ist bewusst grosszügig,
// aber an den Kantonsgrenzen (SZ/SG/TG/SH/AG) nicht garantiert lückenlos –
// im Zweifel landet eine Einreichung in "Ausserkantonal" und kann von
// Jucker Treuhand anhand des in der E-Mail genannten Zielordners korrigiert
// werden. Bekannte Stolpersteine wie 8808 Pfäffikon SZ sind hier korrekt
// NICHT enthalten (8330 Pfäffikon ZH dagegen schon).
const ZH_PLZ: ReadonlySet<string> = new Set([
  // Limmattal / Furttal / westliche Agglomeration
  "8102", "8103", "8104", "8105", "8106", "8107", "8108", "8109",
  "8112", "8113", "8114", "8115",
  // Pfannenstiel / rechtes Seeufer / Forch
  "8121", "8122", "8123", "8124", "8125", "8126", "8127",
  "8132", "8133", "8134", "8135", "8136",
  "8142", "8143",
  // Glattal / Dielsdorf / Wehntal
  "8152", "8153", "8154", "8155", "8156", "8157", "8158",
  "8162", "8164", "8165", "8166", "8169",
  "8172", "8173", "8174", "8175",
  // Unterland / Bülach / Rafzerfeld
  "8180", "8181", "8182", "8184", "8185", "8187",
  "8192", "8193", "8194", "8195", "8196", "8197",
  // Zürcher Weinland (Andelfingen) inkl. ZH-Exklaven bei Schaffhausen
  "8245", "8247", "8248",
  // Kloten / Bassersdorf / Effretikon / Embrachertal
  "8302", "8303", "8304", "8305", "8306", "8307", "8308", "8309",
  "8310", "8311", "8312", "8314", "8315", "8316",
  // Fehraltorf / Pfäffikon ZH
  "8320", "8322", "8330", "8331", "8332", "8335",
  // Zürcher Oberland (Hinwil)
  "8340", "8342", "8344", "8345",
  // Winterthur Stadt & Umgebung
  "8400", "8401", "8402", "8403", "8404", "8405", "8406", "8408",
  "8409", "8410", "8411", "8412", "8413", "8414", "8415", "8416", "8418",
  "8421", "8422", "8423", "8424", "8425", "8426", "8427", "8428",
  // Weinland / Andelfingen
  "8442", "8444", "8447", "8450", "8451", "8452", "8453", "8457", "8459",
  "8461", "8462", "8463", "8465", "8466", "8467", "8468",
  "8472", "8473", "8474", "8475", "8476", "8477", "8479",
  // Tösstal / Weisslingen / Turbenthal
  "8482", "8483", "8484", "8486", "8487", "8488", "8489",
  "8492", "8493", "8494", "8495", "8496", "8498",
  // Winterthur Land Richtung TG (ZH-Anteil)
  "8523", "8542", "8543", "8544", "8545", "8548",
  // Glattal-Ost / Dübendorf / Uster / Greifensee / Grüningen
  "8600", "8602", "8603", "8604", "8605", "8606", "8607", "8608",
  "8610", "8614", "8615", "8616", "8617", "8618",
  "8620", "8623", "8624", "8625", "8626", "8627",
  "8630", "8632", "8633", "8634", "8635", "8636", "8637",
  // Linkes & rechtes Seeufer (Meilen)
  "8700", "8702", "8703", "8704", "8706", "8707", "8708",
  "8712", "8713", "8714",
  // Zimmerberg / Horgen (ohne SZ-Gemeinden wie 8806/8807/8808/8832)
  "8800", "8802", "8803", "8804", "8805", "8810", "8815",
  "8820", "8824", "8825", "8833",
  // Knonaueramt (Affoltern) – ohne AG-Gemeinden wie 8916/8917
  "8902", "8903", "8904", "8906", "8907", "8908", "8909",
  "8910", "8911", "8912", "8913", "8914", "8915",
  "8925", "8926", "8932", "8933", "8934",
  // Dietikon / Limmattal Süd
  "8942", "8951", "8952", "8953", "8954", "8955",
]);

/**
 * Gibt true zurück, wenn die PLZ zum Kanton Zürich gehört.
 * Eine leere/unbekannte PLZ wird als Zürich behandelt (Standard-Ablage);
 * der Zielordner wird in der Benachrichtigungs-E-Mail ausgewiesen, sodass
 * Jucker Treuhand die Zuordnung jederzeit prüfen kann.
 */
export function isZurichPlz(plz: string): boolean {
  const digits = (plz || "").trim().match(/\d{4}/)?.[0];
  if (!digits) return true;
  const n = parseInt(digits, 10);
  if (n >= 8000 && n <= 8099) return true;
  return ZH_PLZ.has(digits);
}
