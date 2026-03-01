"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroScroll() {
  // Track entire document scroll for text fade-out
  const { scrollYProgress } = useScroll();
  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.1], [0, -60]);

  return (
    <section className="relative h-screen w-full">
      {/* Hero text overlay — fades out on scroll */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="absolute inset-0 z-10 flex flex-col justify-center px-6 lg:px-16 max-w-[1440px] mx-auto"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2.5 mb-8 w-fit">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs text-white/70 font-medium tracking-[0.15em] uppercase">
            Присъединете се към общността на шампионите
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[8rem] font-black text-white leading-[0.9] tracking-tight mb-6">
          Подобри
          <br />
          <span className="text-white/90">играта си</span>
          <br />
          <span className="italic text-orange-500">днес</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/50 text-base lg:text-lg max-w-md mb-10 leading-relaxed tracking-wide">
          Отключете потенциала си и постигнете майсторство на корта с нашите
          професионални сесии.
        </p>

        {/* CTA Button */}
        <a
          href="/booking"
          className="group inline-flex items-center gap-3 bg-white text-black rounded-full px-8 py-4 text-sm font-semibold tracking-[0.08em] w-fit hover:bg-white/90 transition-colors"
        >
          Запази час
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-white/30 tracking-[0.15em] uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}
