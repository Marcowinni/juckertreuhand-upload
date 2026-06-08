"use client";

import { useState } from "react";
import { ClientInfo, CustomerType, MandateType } from "@/lib/types";

interface ClientInfoFormProps {
  mandate: MandateType;
  initial?: ClientInfo;
  onSubmit: (info: ClientInfo) => void;
  onBack: () => void;
}

const EMPTY: ClientInfo = {
  customerType: "neu",
  vorname: "",
  nachname: "",
  firmenname: "",
  email: "",
  telefon: "",
  strasse: "",
  plz: "",
  ort: "",
  period: String(new Date().getFullYear() - 1),
  remarks: "",
};

export default function ClientInfoForm({ mandate, initial, onSubmit, onBack }: ClientInfoFormProps) {
  const [info, setInfo] = useState<ClientInfo>(initial ?? EMPTY);
  const [emailError, setEmailError] = useState("");

  const isFirma = mandate.category === "firma";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => String(currentYear - i));

  function set<K extends keyof ClientInfo>(key: K, value: ClientInfo[K]) {
    setInfo((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Alle Felder sind optional. Einzige sanfte Prüfung: falls eine E-Mail
    // angegeben wurde, muss sie ein gültiges Format haben (sonst kann keine
    // Bestätigung verschickt werden).
    const email = info.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ungültige E-Mail-Adresse");
      return;
    }
    setEmailError("");

    onSubmit({
      ...info,
      vorname: info.vorname.trim(),
      nachname: info.nachname.trim(),
      firmenname: info.firmenname.trim(),
      email,
      telefon: info.telefon.trim(),
      strasse: info.strasse.trim(),
      plz: info.plz.trim(),
      ort: info.ort.trim(),
      remarks: info.remarks.trim(),
    });
  }

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy";

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="font-heading text-xs tracking-heading uppercase text-navy mb-2">
          Schritt 2 — Ihre Angaben
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl text-charcoal tracking-heading uppercase mb-2">
          Angaben erfassen
        </h2>
        <p className="text-gray-500 text-sm">{mandate.label}</p>
        <p className="text-gray-400 text-xs mt-1">Alle Felder sind optional.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Neukunde oder bestehend */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Kundenbeziehung</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "neu", label: "Neukunde" },
                { value: "bestehend", label: "Bestehender Kunde" },
              ] as { value: CustomerType; label: string }[]
            ).map((opt) => {
              const active = info.customerType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("customerType", opt.value)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium border transition-colors ${
                    active
                      ? "border-navy bg-navy/5 text-navy"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name: Firma ODER Vor-/Nachname separat */}
        {isFirma ? (
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Firmenname</label>
            <input
              type="text"
              value={info.firmenname}
              onChange={(e) => set("firmenname", e.target.value)}
              className={inputClass}
              placeholder="Muster GmbH"
              autoComplete="organization"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Vorname</label>
              <input
                type="text"
                value={info.vorname}
                onChange={(e) => set("vorname", e.target.value)}
                className={inputClass}
                placeholder="María del Carmen"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Nachname</label>
              <input
                type="text"
                value={info.nachname}
                onChange={(e) => set("nachname", e.target.value)}
                className={inputClass}
                placeholder="García Hernández"
                autoComplete="family-name"
              />
            </div>
          </div>
        )}

        {/* Kontakt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">E-Mail</label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => {
                set("email", e.target.value);
                if (emailError) setEmailError("");
              }}
              className={`${inputClass} ${emailError ? "border-red-400" : ""}`}
              placeholder="max@beispiel.ch"
              autoComplete="email"
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Telefonnummer</label>
            <input
              type="tel"
              value={info.telefon}
              onChange={(e) => set("telefon", e.target.value)}
              className={inputClass}
              placeholder="079 123 45 67"
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Strasse und Nr.</label>
          <input
            type="text"
            value={info.strasse}
            onChange={(e) => set("strasse", e.target.value)}
            className={inputClass}
            placeholder="Hochstrasse 191"
            autoComplete="street-address"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">PLZ</label>
            <input
              type="text"
              inputMode="numeric"
              value={info.plz}
              onChange={(e) => set("plz", e.target.value)}
              className={inputClass}
              placeholder="8330"
              autoComplete="postal-code"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-1">Ort</label>
            <input
              type="text"
              value={info.ort}
              onChange={(e) => set("ort", e.target.value)}
              className={inputClass}
              placeholder="Pfäffikon ZH"
              autoComplete="address-level2"
            />
          </div>
        </div>

        {/* Periode */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Steuerjahr / Periode</label>
          <select
            value={info.period}
            onChange={(e) => set("period", e.target.value)}
            className={`${inputClass} bg-white`}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Bemerkungen */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Bemerkungen</label>
          <textarea
            value={info.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Optionale Hinweise an Jucker Treuhand..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-sm text-gray-500 hover:text-charcoal transition-colors"
          >
            Zurück
          </button>
          <button
            type="submit"
            className="flex-1 bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
          >
            Weiter zu den Dokumenten
          </button>
        </div>
      </form>
    </div>
  );
}
