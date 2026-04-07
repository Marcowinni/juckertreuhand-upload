"use client";

interface SuccessScreenProps {
  mandate: string;
  clientName: string;
  fileNames: string[];
  onReset: () => void;
}

export default function SuccessScreen({ mandate, clientName, fileNames, onReset }: SuccessScreenProps) {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl text-charcoal tracking-heading uppercase mb-3">
        Vielen Dank
      </h2>
      <p className="text-gray-500 text-sm mb-8">
        Ihre Unterlagen wurden erfolgreich übermittelt. Wir melden uns bei Fragen.
      </p>

      <div className="text-left bg-gray-50 rounded-lg p-5 mb-8">
        <h3 className="font-heading text-xs tracking-heading uppercase text-gray-400 mb-3">
          Übermittelte Dokumente
        </h3>
        <p className="text-sm text-charcoal font-medium mb-1">{mandate}</p>
        <p className="text-sm text-gray-500 mb-3">{clientName}</p>
        <ul className="space-y-1">
          {fileNames.map((name, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
              <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {name}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 rounded-lg p-5 mb-8 text-left">
        <h3 className="font-heading text-xs tracking-heading uppercase text-gray-400 mb-3">
          Kontakt
        </h3>
        <p className="text-sm text-charcoal">Jucker Treuhand</p>
        <p className="text-sm text-gray-500">Hochstrasse 191, 8330 Pfäffikon ZH</p>
        <p className="text-sm text-gray-500">044 951 06 36</p>
        <p className="text-sm">
          <a href="mailto:info@juckertreuhand.ch" className="text-navy hover:underline">
            info@juckertreuhand.ch
          </a>
        </p>
      </div>

      <button
        onClick={onReset}
        className="bg-navy text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
      >
        Neue Einreichung
      </button>
    </div>
  );
}
