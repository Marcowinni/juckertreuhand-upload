"use client";

import { mandateTypes } from "@/lib/mandates";
import { MandateType } from "@/lib/types";

interface MandateSelectionProps {
  onSelect: (mandate: MandateType) => void;
}

export default function MandateSelection({ onSelect }: MandateSelectionProps) {
  const privatperson = mandateTypes.filter((m) => m.category === "privatperson");
  const firma = mandateTypes.filter((m) => m.category === "firma");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="font-heading text-2xl sm:text-3xl text-charcoal tracking-heading uppercase mb-2">
          Mandat wählen
        </h2>
        <p className="text-gray-500 text-sm">
          Wählen Sie den passenden Auftragstyp für Ihre Unterlagen.
        </p>
      </div>

      <Section title="Privatperson" mandates={privatperson} onSelect={onSelect} />
      <Section title="Firma / Selbständig" mandates={firma} onSelect={onSelect} />
    </div>
  );
}

function Section({
  title,
  mandates,
  onSelect,
}: {
  title: string;
  mandates: MandateType[];
  onSelect: (m: MandateType) => void;
}) {
  return (
    <div className="mb-10">
      <h3 className="font-heading text-xs tracking-heading uppercase text-gray-400 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mandates.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className="text-left border border-gray-200 rounded-lg px-5 py-4 hover:border-navy hover:bg-navy/5 transition-colors group"
          >
            <span className="text-charcoal group-hover:text-navy font-medium text-sm">
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
