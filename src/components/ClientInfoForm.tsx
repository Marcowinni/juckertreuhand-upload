"use client";

import { useState } from "react";
import { ClientInfo, MandateType } from "@/lib/types";

interface ClientInfoFormProps {
  mandate: MandateType;
  onSubmit: (info: ClientInfo) => void;
  onBack: () => void;
}

export default function ClientInfoForm({ mandate, onSubmit, onBack }: ClientInfoFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [period, setPeriod] = useState("2025");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFirma = mandate.category === "firma";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => String(currentYear - i));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Bitte ausfüllen";
    if (!email.trim()) newErrors.email = "Bitte ausfüllen";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Ungültige E-Mail-Adresse";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim(), period, remarks: remarks.trim() });
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl sm:text-3xl text-charcoal tracking-heading uppercase mb-2">
          Angaben erfassen
        </h2>
        <p className="text-gray-500 text-sm">{mandate.label}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">
            {isFirma ? "Firmenname" : "Vor- und Nachname"} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy ${errors.name ? "border-red-400" : "border-gray-200"}`}
            placeholder={isFirma ? "Muster GmbH" : "Max Muster"}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">E-Mail *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy ${errors.email ? "border-red-400" : "border-gray-200"}`}
            placeholder="max@beispiel.ch"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Steuerjahr / Periode</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Bemerkungen</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
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
