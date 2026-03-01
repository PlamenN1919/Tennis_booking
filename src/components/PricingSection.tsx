"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Наем на корт",
    description: "Цени за свободна игра според часовия пояс",
    price: 15,
    priceNote: "от",
    unit: "час",
    currency: "€",
    features: [
      "08:00 – 12:00 → 20€ / час",
      "12:00 – 16:00 → 15€ / час",
      "16:00 – 19:00 → 20€ / час",
      "19:00 – 24:00 → 25€ / час",
      "Включва наем на корт + ракета",
    ],
    cta: "Резервирай корт",
    popular: false,
    href: "/booking",
    style: "dark",
  },
  {
    name: "Тренировки",
    description: "За всички възрасти и нива на игра",
    price: 45,
    priceNote: "от",
    unit: "сесия",
    currency: "€",
    features: [
      "Индивидуална тренировка → 45€",
      "Екипна за двама → 49€",
      "Спаринг с треньор → 49€",
      "Група деца (5–8 г.) → 20€",
      "Група деца (8–11 г.) → 20€",
      "Всички цени включват корт и ракета",
    ],
    cta: "Запиши се",
    popular: true,
    href: "/booking",
    style: "orange",
  },
  {
    name: "Допълнителни услуги",
    description: "Всичко необходимо за вашата игра",
    price: 10,
    unit: "услуга",
    currency: "€",
    features: [
      "Наем на кош с топки → 10€",
      "Професионални ракети включени",
      "Осветление през нощта",
      "Съблекални и душове",
      "Безплатен паркинг",
    ],
    cta: "Разгледай",
    popular: false,
    href: "/booking",
    badge: "Удобства",
    style: "dark",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 bg-[#FAFAF8] relative overflow-hidden">
      {/* Subtle warm background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAF8F5] to-white" />

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
            Ценоразпис
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight leading-[0.95]">
            Прозрачни <br />
            <span className="text-[#FF6600]">цени</span>
          </h2>
          <p className="text-gray-400 max-w-md mt-4">
            Без скрити такси. Изберете услугата, която отговаря на вашите нужди.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl">
          {plans.map((plan, i) => (
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
              className={cn(
                "relative rounded-3xl p-8 overflow-hidden group",
                "transition-all duration-600",
                plan.style === "orange"
                  ? "bg-[#FF6600] text-white shadow-xl shadow-[#FF6600]/15"
                  : "bg-[#111] text-white shadow-xl shadow-black/20",
                // Card lift on hover
                "hover:translate-y-[-6px] hover:shadow-2xl",
                plan.style === "orange"
                  ? "hover:shadow-[#FF6600]/25"
                  : "hover:shadow-black/30"
              )}
            >
              {/* Animated popular badge */}
              {plan.popular && (
                <motion.div
                  className="absolute top-5 right-5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                >
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider pulse-glow">
                    <Sparkles className="w-3 h-3" />
                    Популярен
                  </span>
                </motion.div>
              )}

              {plan.badge && !plan.popular && (
                <motion.div
                  className="absolute top-5 right-5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <span className="bg-[#FF6600] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </span>
                </motion.div>
              )}

              {/* Animated decorative circle */}
              <motion.div
                className={cn(
                  "absolute -top-10 -right-10 w-32 h-32 rounded-full",
                  plan.style === "orange" ? "bg-white/10" : "bg-white/[0.03]"
                )}
                animate={{
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              />

              {/* Second decorative element */}
              <div
                className={cn(
                  "absolute -bottom-6 -left-6 w-24 h-24 rounded-full",
                  plan.style === "orange" ? "bg-black/10" : "bg-[#FF6600]/[0.03]"
                )}
              />

              <div className="relative z-10">
                <div className="mb-7">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p
                    className={cn(
                      "text-sm transition-colors duration-300",
                      plan.style === "orange"
                        ? "text-white/70"
                        : "text-white/40 group-hover:text-white/55"
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  {plan.priceNote && (
                    <span className="text-sm text-white/50">
                      {plan.priceNote}
                    </span>
                  )}
                  <span className="text-5xl font-black tracking-tight counter-glow">
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-white/50">
                    {plan.currency}/{plan.unit}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <motion.li
                      key={j}
                      className="flex items-start gap-2.5"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.3 + i * 0.1 + j * 0.06,
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300",
                          plan.style === "orange"
                            ? "bg-white/20"
                            : "bg-[#FF6600]/20 group-hover:bg-[#FF6600]/30"
                        )}
                      >
                        <Check
                          className={cn(
                            "w-3 h-3",
                            plan.style === "orange"
                              ? "text-white"
                              : "text-[#FF6600]"
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm transition-colors duration-300",
                          plan.style === "orange"
                            ? "text-white/80"
                            : "text-white/50 group-hover:text-white/65"
                        )}
                      >
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className={cn(
                      "w-full rounded-full h-12 font-bold transition-all duration-400",
                      plan.style === "orange"
                        ? "bg-white text-[#FF6600] hover:bg-gray-100 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
                        : "bg-[#FF6600] text-white hover:bg-[#E55C00] btn-shimmer hover:shadow-[0_8px_30px_rgba(255,102,0,0.25)]"
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}