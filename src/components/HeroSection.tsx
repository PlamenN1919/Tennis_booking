"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "500+", label: "ЧЛЕНОВЕ" },
  { value: "2", label: "КОРТА" },
  { value: "98%", label: "ДОВОЛНИ\nКЛИЕНТИ" },
];

const avatarColors = ["#FF6600", "#E55C00", "#FF8533", "#CC5200"];
const avatarInitials = ["М", "А", "И", "С"];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax effects
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden bg-black noise-overlay mesh-gradient-hero"
    >
      {/* Animated mesh gradient blobs */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 pt-16 pb-6 min-h-screen flex flex-col">

        {/* Top Badge — with subtle glow animation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mb-12"
        >
          <span className="inline-block px-5 py-2 rounded-full border border-white/10 text-white/50 text-xs font-medium tracking-[0.25em] uppercase border-glow-animate">
            Tennis Club Oasis
          </span>
        </motion.div>

        {/* Central Layout — Image centered, text around it */}
        <div className="flex-1 relative flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-0 mt-8 lg:mt-0">

          {/* CENTER — Tall Oval Image with parallax + vignette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ y: imageY, scale: imageScale }}
            className="relative z-10 order-2 lg:order-none"
          >
            <div className="relative w-[280px] h-[400px] sm:w-[320px] sm:h-[480px] lg:w-[380px] lg:h-[650px] xl:w-[420px] xl:h-[730px] rounded-[220px] overflow-hidden border border-white/8 shadow-2xl shadow-black/50 vignette glow-warm">
              <Image
                src="/hero-tennis.jpg"
                alt="Tennis court with racket"
                fill
                className="object-cover"
                priority
              />
              {/* Enhanced gradient overlay with depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 z-[1]" />
              {/* Warm lens flare effect */}
              <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-bl from-[#FF6600]/[0.06] to-transparent z-[1]" />
            </div>
          </motion.div>



          {/* LEFT — Large Heading with parallax + script font accent */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{ y: textY, opacity: opacityFade }}
            className="relative lg:absolute lg:-left-24 xl:-left-32 z-20 order-1 lg:order-none w-full lg:w-auto flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-black text-white leading-[0.92] tracking-tight uppercase flex flex-col items-center lg:items-start">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                Твоето
              </motion.span>
              <motion.span
                className="block mt-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.23, 1, 0.32, 1] }}
              >
                място за
              </motion.span>
              <motion.span
                className="block mt-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
              >
                <span className="text-[#FF6600]">
                  тенис
                </span>
              </motion.span>
            </h1>
          </motion.div>

          {/* RIGHT — Stats + Description */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ opacity: opacityFade }}
            className="relative lg:absolute lg:-right-24 xl:-right-32 flex flex-col items-center lg:items-start order-3 lg:order-none w-full lg:w-auto pb-8 lg:pb-0"
          >
            {/* Stats Row — staggered */}
            <div className="flex w-full max-w-[360px] justify-between mb-8 gap-4 sm:gap-6 lg:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center lg:text-left"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight counter-glow">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-[9px] sm:text-[10px] text-white/35 font-medium tracking-[0.12em] uppercase whitespace-pre-line leading-tight">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Divider — warm gradient line */}
            <div className="w-full max-w-[260px] lg:max-w-none h-px bg-gradient-to-r from-transparent via-[#FF6600]/30 to-transparent lg:from-white/10 lg:via-[#FF6600]/15 lg:to-transparent mb-6" />

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-white/35 text-center lg:text-left text-sm leading-relaxed max-w-[300px] lg:max-w-sm mx-auto lg:mx-0"
            >
              Перфектни условия. Дигитално удобство. Резервирай корт или
              персонален треньор бързо, лесно и безпроблемно.
            </motion.p>

            {/* CTA Button — with shimmer effect */}
            <Link href="/booking" className="mt-6 inline-block">
              <button className="btn-shimmer group flex items-center gap-3 bg-[#FF6600] hover:bg-[#E55C00] text-white rounded-full h-14 px-8 font-bold text-sm uppercase tracking-wide shadow-2xl shadow-[#FF6600]/20 transition-all duration-500 hover:shadow-[#FF6600]/35 hover:scale-[1.03]">
                Резервирай
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Row — Avatars + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="relative lg:absolute mt-8 lg:mt-0 lg:bottom-12 xl:bottom-16 left-0 lg:left-12 xl:left-16 flex items-center justify-center lg:justify-start w-full lg:w-auto pb-12 lg:pb-0"
        >
          {/* Overlapping Avatars — with stagger */}
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {avatarColors.map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-white shadow-lg"
                  style={{ backgroundColor: color }}
                >
                  {avatarInitials[i]}
                </motion.div>
              ))}
            </div>
            <span className="ml-4 text-white/40 text-xs font-medium">
              500+ доволни членове
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
