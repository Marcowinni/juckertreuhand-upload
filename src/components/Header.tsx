import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Jucker Treuhand"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-heading text-charcoal text-lg tracking-heading uppercase hidden sm:inline">
            JUCKER TREUHAND
          </span>
        </div>
        <span className="font-heading text-navy text-sm tracking-heading uppercase">
          Unterlagen einreichen
        </span>
      </div>
    </header>
  );
}
