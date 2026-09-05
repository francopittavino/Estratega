import Image from "next/image";
import Link from "next/link";
import { SideNav } from "@/components/side-nav";

export function SiteHeader() {
  return (
    <header className="bg-utn-blue text-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image
            src="/utn-logo.jpg"
            alt="Logo UTN"
            width={28}
            height={28}
            className="rounded bg-white p-0.5 shrink-0"
            priority
          />
          <span className="font-bold text-sm truncate">El Estratega</span>
        </Link>
        <SideNav />
      </div>
    </header>
  );
}
