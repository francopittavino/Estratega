"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const SECTIONS = [
  {
    title: null,
    links: [
      { href: "/", label: "Inicio" },
      { href: "/jugadores", label: "Jugadores" },
    ],
  },
  {
    title: "El Estratega",
    links: [
      { href: "/partidas", label: "Partidas" },
      { href: "/tops", label: "Tops" },
    ],
  },
  {
    title: "Truco",
    links: [
      { href: "/truco", label: "Partidas de truco" },
      { href: "/truco/tops", label: "Tops de truco" },
    ],
  },
];

const ALL_LINKS = SECTIONS.flatMap((section) => section.links);

export function SideNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Gana el link más específico: estando en /truco/tops se marca ese y no
  // también /truco.
  const activeHref =
    ALL_LINKS.filter(
      (link) =>
        pathname === link.href ||
        (link.href !== "/" && pathname.startsWith(`${link.href}/`))
    ).sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 flex flex-col justify-center gap-1.5 h-10 w-10 rounded-full bg-card/80 backdrop-blur border border-border shadow-lg"
      >
        <span className="block h-0.5 w-5 mx-auto bg-foreground rounded-full" />
        <span className="block h-0.5 w-5 mx-auto bg-foreground rounded-full" />
        <span className="block h-0.5 w-5 mx-auto bg-foreground rounded-full" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <nav className="w-64 bg-card border-r border-border p-4 flex flex-col gap-1 overflow-y-auto">
            <p className="text-xs uppercase tracking-wider text-muted px-2 mb-2">
              Menú
            </p>
            {SECTIONS.map((section, index) => (
              <div key={section.title ?? index} className="flex flex-col gap-1">
                {section.title && (
                  <p className="text-[10px] uppercase tracking-widest text-muted px-2 mt-3 mb-0.5">
                    {section.title}
                  </p>
                )}
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      activeHref === link.href
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/60"
          />
        </div>
      )}
    </>
  );
}
