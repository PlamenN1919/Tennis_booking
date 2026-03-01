"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  {
    value: 500,
    suffix: "+",
    label: "Активни играчи",
    description: "доверяват се на Tennis Club Oasis",
    accent: true,
  },
  {
    value: 98,
    suffix: "%",
    label: "Удовлетвореност",
    description: "от нашите клиенти",
    accent: false,
  },
  {
    value: 2,
    suffix: "",
    label: "Професионални корта",
    description: "глинена настилка",
    accent: false,
  },
];

// Counting animation hook
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
  const count = useCountUp(value, 2000, shouldCount);
  return (
    <span className="counter-glow">
      {count}{suffix}
    </span>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 bg-[#FAFAF8] overflow-hidden">
      {/* Very subtle warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAF8F5] to-white" />

      <div ref={sectionRef} className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6600] tracking-[0.2em] uppercase mb-4">
            <span className="w-8 h-[2px] bg-gradient-to-r from-[#FF6600]/60 to-transparent" />
            В цифри
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight leading-[0.95]">
            Опознай <br />
            <span className="text-[#FF6600]">Tennis Club Oasis</span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1],
              }}
              className={`rounded-3xl p-8 lg:p-10 relative overflow-hidden card-lift cursor-default ${stat.accent
                ? "bg-[#FF6600] text-white glow-warm"
                : "bg-white text-black border border-gray-100 shadow-sm"
                }`}
            >
              {/* Decorative circle — now animated */}
              <motion.div
                className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${stat.accent ? "bg-white/10" : "bg-black/[0.02]"
                  }`}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />

              {/* Second decorative element */}
              <div
                className={`absolute -bottom-4 -left-4 w-20 h-20 rounded-full ${stat.accent ? "bg-black/10" : "bg-[#FF6600]/[0.03]"
                  }`}
              />

              <p className="text-5xl lg:text-6xl font-black mb-2 tracking-tight relative z-10">
                <CountingNumber value={stat.value} suffix={stat.suffix} shouldCount={isInView} />
              </p>
              <p
                className={`text-sm font-bold mb-1 relative z-10 ${stat.accent ? "text-white/90" : "text-black"
                  }`}
              >
                {stat.label}
              </p>
              <p
                className={`text-xs relative z-10 ${stat.accent ? "text-white/60" : "text-gray-400"
                  }`}
              >
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
