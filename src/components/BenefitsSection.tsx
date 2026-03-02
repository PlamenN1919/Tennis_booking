"use client";

import { motion } from "framer-motion";
import { Sun, Layers, Award, Clock, Shield, Wifi, ArrowUpRight } from "lucide-react";

const benefits = [
  {
    icon: Sun,
    title: "Професионално осветление",
    description:
      "LED осветление от ново поколение на двата ни корта, позволяващо игра до късно вечерта.",
    span: "md:col-span-4",
  },
  {
    icon: Layers,
    title: "Глинена настилка",
    description:
      "Автентична глинена повърхност, поддържана ежедневно за оптимално качество и комфорт.",
    span: "md:col-span-4",
  },
  {
    icon: Award,
    title: "Треньор",
    description:
      "Индивидуален подход, насочен към реален прогрес и уверена игра.",
    span: "md:col-span-4",
  },
  {
    icon: Clock,
    title: "Онлайн резервации 24/7",
    description:
      "Резервирайте корт или тренировка по всяко време от телефона или компютъра си.",
    span: "md:col-span-6",
  },
  {
    icon: Shield,
    title: "Безконфликтна система",
    description:
      "Интелигентна система, предотвратяваща двойни резервации и конфликти в графика.",
    span: "md:col-span-3",
  },
  {
    icon: Award,
    title: "Приятелска среда",
    description:
      "Създаваме атмосфера, в която всеки се чувства добре дошъл и подкрепен в своето развитие.",
    span: "md:col-span-3",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden" id="about">
      {/* Hero-style animated background */}
      <div
        className="absolute inset-0 animate-[gradientShift_12s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 30% 50%, #331c10 0%, #21120a 32%, #150d07 58%, #0d0b08 100%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Animated gradient orbs */}
      <div
        className="absolute w-[550px] h-[550px] rounded-full opacity-[0.10] blur-[120px] animate-[float_18s_ease-in-out_infinite]"
        style={{
          background: "radial-gradient(circle, #5c3a2a, transparent 70%)",
          top: "10%",
          right: "5%",
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] rounded-full opacity-[0.07] blur-[100px] animate-[float_22s_ease-in-out_infinite_reverse]"
        style={{
          background: "radial-gradient(circle, #4e2e1c, transparent 70%)",
          bottom: "5%",
          left: "10%",
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF6600]/[0.03] blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF6600] tracking-[0.25em] uppercase mb-5">
              <span className="w-8 h-[2px] bg-[#FF6600]" />
              Предимства
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]">
              Всичко на едно място{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
                за вашата игра
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-white/40 text-base lg:text-lg max-w-md leading-relaxed lg:text-right"
          >
            Открийте защо Tennis Club Oasis е предпочитаният избор за стотици играчи — от начинаещи до професионалисти.
          </motion.p>
        </div>

        {/* Benefits Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.23, 1, 0.32, 1],
              }}
              className={`${benefit.span} group relative rounded-[24px] bg-white/[0.06] backdrop-blur-md border border-white/[0.1] p-8 lg:p-10 overflow-hidden hover:border-[#FF6600]/30 hover:bg-white/[0.1] transition-all duration-500 cursor-default`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Top row: icon & arrow */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#FF6600]/15 border border-[#FF6600]/25 flex items-center justify-center group-hover:bg-[#FF6600]/25 group-hover:border-[#FF6600]/40 transition-all duration-500 shadow-[0_0_20px_rgba(255,102,0,0.08)]">
                  <benefit.icon className="w-6 h-6 text-[#FF6600]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <ArrowUpRight className="w-4 h-4 text-white/50" />
                </div>
              </div>

              {/* Text */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
