"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/partidas", label: "Partidas" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/tops", label: "Tops" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-utn-blue text-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/partidas" className="flex items-center gap-3 min-w-0">
          <Image
            src="/utn-logo.jpg"
            alt="Logo UTN"
            width={40}
            height={40}
            className="rounded bg-white p-0.5 shrink-0"
            priority
          />
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate">El Estratega</p>
            <p className="text-xs text-blue-100 leading-tight truncate">
              de la UTN
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-utn-blue"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
