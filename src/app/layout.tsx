import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { SideNav } from "@/components/side-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Estratega de la UTN",
  description: "Anotador para partidas de El Estratega",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div
          aria-hidden
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondo-estratega.jpg')" }}
        />
        <div aria-hidden className="fixed inset-0 -z-10 bg-background/65" />
        <SideNav />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-16 pb-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
