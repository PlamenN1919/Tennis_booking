"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/#benefits", label: "Предимства" },
    { href: "/#pricing", label: "Цени" },
    { href: "/#testimonials", label: "Отзиви" },
    { href: "/booking", label: "Резервация" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        isScrolled
          ? "bg-black/85 backdrop-blur-2xl shadow-[0_2px_40px_rgba(0,0,0,0.4)] border-b border-white/[0.04]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#FF6600] transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(255,102,0,0.4)]" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M6 3.5C9.5 7 9.5 17 6 20.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M18 3.5C14.5 7 14.5 17 18 20.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-xl font-black tracking-tight text-white">
              TENNIS CLUB <span className="text-[#FF6600] accent-script text-2xl">Oasis</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-1.5 py-1 transition-all duration-500",
                isScrolled
                  ? "bg-white/[0.04] backdrop-blur-sm"
                  : "bg-white/[0.04] backdrop-blur-sm"
              )}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link-luxury text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full text-white/55 hover:text-white hover:bg-white/[0.06]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full text-sm px-4">
                Админ Панел
              </Button>
            </Link>
            <Link href="/booking">
              <Button className="btn-shimmer rounded-full bg-[#FF6600] text-white hover:bg-[#E55C00] text-sm px-6 font-bold shadow-lg shadow-[#FF6600]/20 transition-all duration-400 hover:shadow-[#FF6600]/35 hover:scale-[1.03]">
                Резервирай
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu — with entrance animation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden bg-[#111]/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-5 mt-2 space-y-1 border border-white/[0.06]"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-white/60 hover:bg-[#FF6600]/8 hover:text-[#FF6600] rounded-2xl transition-all duration-300"
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-white/15" />
                  </Link>
                </motion.div>
              ))}
              <div className="border-t border-white/[0.06] pt-3 mt-3 space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 text-center"
                >
                  Админ Панел
                </Link>
                <Link
                  href="/booking"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-white bg-[#FF6600] hover:bg-[#E55C00] rounded-2xl transition-all duration-300 text-center btn-shimmer"
                >
                  Резервирай
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
