"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";


export default function Footer() {
  return (
    <footer className="bg-black text-white relative overflow-hidden noise-overlay mesh-gradient-hero">
      {/* Animated mesh gradient blobs */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />

      {/* CTA Section – Orange banner with glow */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-20 pb-16 relative z-10">
        <motion.div
          className="bg-[#FF6600] rounded-3xl p-10 lg:p-14 mb-20 relative overflow-hidden glow-warm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Animated decorative circles */}
          <motion.div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-black/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <motion.p
                className="text-white/70 text-xs font-bold uppercase tracking-[0.25em] mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Готови за тениса?
              </motion.p>
              <motion.h3
                className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[0.95] uppercase tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              >
                Вземете контрол
                <br />
                над играта си
              </motion.h3>
            </div>
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link href="/booking">
                <Button className="rounded-full bg-white text-[#FF6600] hover:bg-gray-100 h-13 px-8 font-bold text-base shadow-xl shadow-black/20 transition-all duration-400 hover:shadow-2xl hover:scale-[1.03]">
                  Резервирай сега
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#FF6600] transition-all duration-500 group-hover:drop-shadow-[0_0_10px_rgba(255,102,0,0.3)]">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M6 3.5C9.5 7 9.5 17 6 20.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18 3.5C14.5 7 14.5 17 18 20.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-xl font-black tracking-tight">
                TENNIS CLUB <span className="text-[#FF6600] accent-script text-2xl">Oasis</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Професионален тенис клуб с модерни съоръжения и квалифицирани
              треньори. Вашето място за тенис.
            </p>
            {/* Social — with hover glow */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Youtube, label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.04] flex items-center justify-center hover:bg-[#FF6600]/10 hover:border-[#FF6600]/20 transition-all duration-500 group hover:shadow-[0_0_20px_rgba(255,102,0,0.08)]"
                >
                  <social.icon className="w-4 h-4 text-gray-500 group-hover:text-[#FF6600] transition-colors duration-300" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-[0.15em] mb-5 text-white/25">
              Навигация
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/booking", label: "Резервация" },
                { href: "/#pricing", label: "Цени" },
                { href: "/#benefits", label: "Предимства" },
                { href: "/#testimonials", label: "Отзиви" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-[#FF6600] text-sm transition-all duration-400 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-4 h-px bg-gradient-to-r from-[#FF6600] to-transparent transition-all duration-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-[0.15em] mb-5 text-white/25">
              Контакти
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#FF6600]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500 group-hover:bg-[#FF6600]/20 group-hover:shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                  <MapPin className="w-4 h-4 text-[#FF6600]" />
                </div>
                <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors duration-300">
                  ул. „Царевски път“ 30, 8277 Лозенец
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#FF6600]/10 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500 group-hover:bg-[#FF6600]/20 group-hover:shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                  <Phone className="w-4 h-4 text-[#FF6600]" />
                </div>
                <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors duration-300">
                  +359 88 6731212
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-bold text-sm uppercase tracking-[0.15em] mb-5 text-white/25">
              Работно време
            </h3>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 group">
                <Clock className="w-4 h-4 text-[#FF6600] shrink-0 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,102,0,0.3)]" />
                <div>
                  <span className="text-gray-500 text-sm block">
                    Понеделник - Петък
                  </span>
                  <span className="text-white text-sm font-semibold">
                    07:00 - 22:00
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <Clock className="w-4 h-4 text-[#FF6600] shrink-0 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,102,0,0.3)]" />
                <div>
                  <span className="text-gray-500 text-sm block">
                    Събота - Неделя
                  </span>
                  <span className="text-white text-sm font-semibold">
                    08:00 - 21:00
                  </span>
                </div>
              </li>
            </ul>

          </motion.div>
        </div>

        {/* Bottom bar — with gradient line */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Tennis Club Oasis. Всички права
            запазени.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-gray-600 hover:text-white/50 text-sm transition-colors duration-400"
            >
              Условия за ползване
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-white/50 text-sm transition-colors duration-400"
            >
              Поверителност
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
