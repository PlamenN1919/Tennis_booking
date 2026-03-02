"use client";

import Link from "next/link";
import { Phone, MapPin, ArrowUpRight, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] text-white pt-24 pb-8 overflow-hidden">
      {/* Giant watermark text */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden">
        <div className="text-[18vw] font-black uppercase tracking-tighter leading-none text-white/[0.02] whitespace-nowrap translate-y-[30%]">
          Tennis Club Oasis
        </div>
      </div>

      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#FF6600]/[0.03] blur-[150px] rounded-full pointer-events-none" />

      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
          {/* Brand */}
          <div className="md:col-span-4">
            <h3 className="text-3xl font-black tracking-tighter mb-4 uppercase">
              Tennis Club{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
                Oasis
              </span>
            </h3>
            <p className="text-white/30 text-sm leading-relaxed max-w-sm mb-8">
              Вашият тенис клуб от ново поколение. Два професионални корта с
              глинена настилка, елитни треньори и модерни удобства в сърцето на
              Лозенец.
            </p>

          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
              Навигация
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Начало", href: "/" },
                { label: "Резервации", href: "/booking" },
                { label: "Ценоразпис", href: "#pricing" },
                { label: "За нас", href: "#about" },
                { label: "Локация", href: "#location" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-white/40 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
              Работно време
            </h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li className="flex justify-between">
                <span>Пон - Пет</span>
                <span className="text-white/60 font-medium">08:00 - 24:00</span>
              </li>
              <li className="flex justify-between">
                <span>Събота</span>
                <span className="text-white/60 font-medium">08:00 - 24:00</span>
              </li>
              <li className="flex justify-between">
                <span>Неделя</span>
                <span className="text-white/60 font-medium">08:00 - 24:00</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/20 mb-6">
              Контакти
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
                </div>
                <span className="text-sm text-white/50">+359 88 6731212</span>
              </li>

              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6600]" />
                </div>
                <span className="text-sm text-white/50">
                  ул. Царевски път 30, Лозенец
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.04]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs">
              © 2026 Tennis Club Oasis. Всички права запазени.
            </p>
            <p className="text-white/20 text-xs">
              Made by{" "}
              <a
                href="https://www.instagram.com/plamen_nikolovv/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FF6600] hover:text-[#FF6600]/80 transition-colors duration-300"
              >
                <Instagram className="w-3.5 h-3.5" />
                @plamen_nikolovv
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
