export default function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
        <p className="font-heading text-charcoal text-xs tracking-heading uppercase mb-3">
          Jucker Treuhand
        </p>
        <p>Hochstrasse 191 | 8330 Pfäffikon ZH | 044 951 06 36</p>
        <p className="mt-1">
          <a href="mailto:info@juckertreuhand.ch" className="text-navy hover:underline">
            info@juckertreuhand.ch
          </a>
        </p>
      </div>
    </footer>
  );
}
