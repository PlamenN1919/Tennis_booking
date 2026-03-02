"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  "Ремонтирани кортове със специална настилка",
  "Професионално LED осветление за вечерна игра",
  "Луксозни съблекални и душове",
  "Уютна кафе-зона и тераса за релакс",
];

export default function GallerySection() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden bg-white">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6600]/[0.04] blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16 lg:mb-20 items-end">
          <div className="flex-1">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF6600] tracking-[0.25em] uppercase mb-5"
            >
              <span className="w-8 h-[2px] bg-[#FF6600]" />
              Нашата база
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-black uppercase tracking-tighter"
            >
              Създадено за{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
                играта
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-1 lg:pb-3"
          >
            <p className="text-black/50 text-lg md:text-xl leading-relaxed mb-8">
              Насладете се на премиум условия, създадени за вашата най-добра игра.
              Клуб &ldquo;Oasis&rdquo; предлага перфектно поддържани кортове и комфорт от
              най-високо ниво.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-black/60">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bento Grid Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 lg:h-[700px]">
          {/* Main Large Image (Left) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-8 rounded-[28px] overflow-hidden relative group border border-black/[0.08] shadow-lg h-[400px] md:h-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 z-20 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-[#FF6600] font-bold tracking-[0.2em] text-xs uppercase mb-3 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Кортове
              </span>
              <h3 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tight">
                Отлична настилка
              </h3>
            </div>

            <Image
              src="/gallery-1.png"
              alt="Main Tennis Court"
              fill
              unoptimized
              className="object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              priority
            />
          </motion.div>

          {/* Right Column Stack */}
          <div className="md:col-span-4 grid grid-rows-2 gap-4 md:gap-5 h-[600px] md:h-auto">
            {/* Top Right Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="rounded-[28px] overflow-hidden relative group border border-black/[0.08] shadow-lg h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-6 z-20 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-[#FF6600] font-bold tracking-[0.2em] text-xs uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  Движение
                </span>
                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-tight">
                  Перфектна игра
                </h3>
              </div>
              <Image
                src="/gallery-2.png"
                alt="Tennis Details"
                fill
                unoptimized
                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              />
            </motion.div>

            {/* Bottom Right — CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="rounded-[28px] overflow-hidden relative group border border-[#FF6600]/20 shadow-lg h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />
              <div className="absolute inset-0 bg-[#FF6600]/[0.05] z-10 pointer-events-none" />

              <div className="absolute inset-x-0 bottom-0 p-6 z-30 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-[#FF6600] font-bold tracking-[0.2em] text-xs uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  Осветление
                </span>
                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-tight">
                  Вечерни мачове
                </h3>
              </div>

              <Image
                src="/gallery-3.png"
                alt="Tennis Equipment"
                fill
                unoptimized
                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-[28px] bg-[#FAFAFA] border border-black/[0.06]"
        >
          <div>
            <p className="text-black font-bold text-lg">Готови ли сте за мач?</p>
            <p className="text-black/40 text-sm">Резервирайте вашия корт с няколко клика</p>
          </div>
          <Link href="/booking">
            <button className="flex items-center gap-3 bg-[#FF6600] hover:bg-[#FF7722] text-white font-bold text-sm uppercase tracking-wider rounded-2xl px-8 py-4 transition-all duration-300 shadow-lg shadow-[#FF6600]/20 group/btn">
              Резервирай
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
