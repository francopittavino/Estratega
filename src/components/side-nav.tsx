"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/partidas", label: "Partidas" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/tops", label: "Tops" },
];

export function SideNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center gap-1.5 h-9 w-9 shrink-0"
      >
        <span className="block h-0.5 w-6 bg-white rounded-full" />
        <span className="block h-0.5 w-6 bg-white rounded-full" />
        <span className="block h-0.5 w-6 bg-white rounded-full" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="flex-1 bg-black/60"
          />
          <nav className="w-64 bg-card border-l border-border p-4 flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wider text-muted px-2 mb-2">
              Menú
            </p>
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-utn-blue text-white"
                      : "text-foreground hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
