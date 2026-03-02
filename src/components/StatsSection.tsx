"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, Trophy } from "lucide-react";

const stats = [
  {
    value: 2,
    suffix: "",
    label: "глинени корта",
    description: "Професионална глинена настилка, поддържана ежедневно за перфектна игра на всяко ниво.",
    icon: Trophy,
  },
  {
    value: 200,
    suffix: "+",
    label: "Резервации месечно",
    description: "активна общност всеки сезон",
    icon: TrendingUp,
  },
  {
    value: 24,
    suffix: "/7",
    label: "Наличност",
    description: "резервирайте по всяко време",
    icon: Trophy,
  },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      setCount(Math.round(easedProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

function CountingNumber({ value, suffix, shouldCount }: { value: number; suffix: string; shouldCount: boolean }) {
  const count = useCountUp(value, 2200, shouldCount);
  return <span>{count}{suffix}</span>;
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-28 lg:py-36 bg-white overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF6600]/[0.06] blur-[150px] rounded-full pointer-events-none" />

      <div ref={sectionRef} className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Label */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF6600] tracking-[0.25em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-[#FF6600]" />
            В цифри
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight leading-[0.95]">
            Опознай{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
              Tennis Club Oasis
            </span>
          </h2>
        </motion.div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {/* Large stat card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="md:col-span-6 relative rounded-[28px] bg-[#FF6600] p-10 lg:p-12 overflow-hidden group"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-black/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-black/[0.07]" />
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-white/80" />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-none mb-4">
                <CountingNumber value={stats[0].value} suffix={stats[0].suffix} shouldCount={isInView} />
              </p>
              <p className="text-white/90 text-lg font-bold uppercase tracking-wider mb-2">
                {stats[0].label}
              </p>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                {stats[0].description}
              </p>
            </div>
          </motion.div>

          {/* Right column — two cards */}
          <div className="md:col-span-6 grid grid-cols-2 gap-4 lg:gap-5">
            {stats.slice(1).map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15 + i * 0.1,
                  duration: 0.7,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="relative rounded-[28px] bg-[#FAFAFA] border border-black/[0.06] p-6 md:p-8 lg:p-10 overflow-hidden group hover:border-black/[0.12] transition-colors duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-black/[0.04] flex items-center justify-center">
                    <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-[#FF6600]/70" />
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tighter leading-none mb-3">
                    <CountingNumber value={stat.value} suffix={stat.suffix} shouldCount={isInView} />
                  </p>
                  <p className="text-black/50 text-sm font-bold uppercase tracking-wider mb-1">
                    {stat.label}
                  </p>
                  <p className="text-black/30 text-xs">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
