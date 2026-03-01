"use client";

import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-4">
              TOP<span className="text-orange-400">S</span>PIN
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Вашият тенис клуб от ново поколение. Два професионални корта,
              елитни треньори и модерни удобства.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">
              Бързи връзки
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Начало", href: "/" },
                { label: "Резервации", href: "/booking" },
                { label: "Ценоразпис", href: "#pricing" },
                { label: "За нас", href: "#about" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">
              Работно време
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Понеделник - Петък: 07:00 - 22:00</li>
              <li>Събота: 08:00 - 20:00</li>
              <li>Неделя: 08:00 - 18:00</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wide mb-4">
              Контакти
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-orange-500" />
                +359 888 123 456
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-orange-500" />
                TopSpin@info.bg
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-orange-500" />
                София, бул. Витоша 100
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 TopSpin Tennis Club. Всички права запазени.
          </p>
          <div className="flex items-center gap-5">
            {["Nike", "Adidas", "NB", "UA"].map((brand) => (
              <span
                key={brand}
                className="text-gray-600 text-xs font-bold tracking-wider"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
