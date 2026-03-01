"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Shield,
  Trophy,
  Wifi,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Clock,
    title: "Резервирай за секунди",
    description: "Бърза и лесна резервация. Дата, час и корт.",
  },
  {
    icon: Shield,
    title: "Гарантирано място",
    description: "Защита от двойни резервации.",
  },
  {
    icon: Trophy,
    title: "Професионални треньори",
    description: "Сертифицирани с дългогодишен опит.",
  },
  {
    icon: Zap,
    title: "Модерни съоръжения",
    description: "Глинени кортове с осветление.",
  },
  {
    icon: Wifi,
    title: "Онлайн достъп 24/7",
    description: "Управлявайте резервации навсякъде.",
  },
  {
    icon: CheckCircle,
    title: "Гъвкави часове",
    description: "Работно време от 07:00 до 22:00.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="py-28 bg-black relative overflow-hidden noise-overlay mesh-gradient-hero">
      {/* Animated mesh gradient blobs */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6600] tracking-[0.2em] uppercase mb-4">
            <span className="w-8 h-[2px] bg-gradient-to-r from-[#FF6600]/60 to-transparent" />
            Предимства
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]">
            Всичко, което <br />
            <span className="text-[#FF6600]">ви трябва</span>
          </h2>
        </motion.div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left Card – Glass card with features list */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card rounded-3xl p-8 lg:p-10 relative overflow-hidden"
          >
            {/* Tennis Club Oasis branding watermark */}
            <div className="absolute bottom-4 left-4 opacity-[0.03]">
              <span className="text-[6rem] font-black text-white leading-none">
                Oasis
              </span>
            </div>

            <div className="relative z-10 space-y-2">
              {features.slice(0, 4).map((feature, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-4 group rounded-2xl p-3 -mx-3 transition-all duration-500 hover:bg-white/[0.03]"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#FF6600]/15 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(255,102,0,0.1)]">
                    <feature.icon className="w-5 h-5 text-[#FF6600] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-0.5 group-hover:text-white transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/35 text-sm group-hover:text-white/50 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 relative z-10"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/booking">
                <Button className="rounded-full bg-white text-black hover:bg-gray-100 h-12 px-6 font-bold text-sm transition-all duration-400 hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] hover:scale-[1.02]">
                  Виж всички предимства
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Card – Orange accent card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="bg-[#FF6600] rounded-3xl p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between min-h-[450px] glow-warm"
          >
            {/* Animated decorative circles */}
            <motion.div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10"
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <div className="relative z-10">
              <motion.p
                className="text-white/70 text-xs font-bold uppercase tracking-[0.25em] mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Вашият тенис клуб
              </motion.p>
              <motion.h3
                className="text-4xl md:text-5xl font-black text-white leading-[0.95] uppercase tracking-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              >
                Подобри
                <br />
                нивото
                <br />
                си
              </motion.h3>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="grid grid-cols-2 gap-3">
                {features.slice(4).map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.5 + i * 0.12,
                      duration: 0.6,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className="bg-black/15 rounded-2xl p-4 backdrop-blur-sm border border-white/5 transition-all duration-500 hover:bg-black/25 hover:border-white/10 group cursor-default"
                  >
                    <feature.icon className="w-5 h-5 text-white/80 mb-2 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    <p className="text-white text-sm font-bold">
                      {feature.title}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5 group-hover:text-white/70 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Large tennis ball icon — more subtle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04]">
              <span className="text-[14rem] leading-none">🎾</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
