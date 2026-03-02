"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Наем на корт",
    price: "15",
    priceMax: "25",
    period: "час",
    description: "Перфектно за свободна игра",
    features: [
      "08:00–12:00 → 20€/час",
      "12:00–16:00 → 15€/час",
      "16:00–19:00 → 20€/час",
      "19:00–24:00 → 25€/час",
    ],
    cta: "Запази час",
    popular: false,
  },
  {
    name: "Тренировки",
    price: "20",
    priceMax: "49",
    period: "сесия",
    description: "С професионален треньор",
    features: [
      "Индивидуална тренировка → 45€",
      "Екипна за двама → 49€",
      "Спаринг тренировка → 49€",
      "Групово за деца (5–8 / 8–11 г.) → 20€",
      "Корт + ракета включени",
    ],
    cta: "Резервирай урок",
    popular: true,
  },
  {
    name: "Допълнителни услуги",
    price: "10",
    priceMax: null,
    period: "наем",
    description: "Допълнения към резервацията",
    features: [
      "Наем на кош → 10€",
      "Достъп до съблекални",
      "Безплатен паркинг",
      "Онлайн резервация",
    ],
    cta: "Запази час",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section className="py-28 lg:py-36 relative" id="pricing">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF6600] tracking-[0.25em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-[#FF6600]" />
            Ценоразпис
            <span className="w-8 h-[2px] bg-[#FF6600]" />
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] mb-5">
            Прозрачни{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
              цени
            </span>
          </h2>
          <p className="text-white/40 text-base lg:text-lg max-w-lg mx-auto">
            Без скрити такси. Изберете плана, който отговаря на вашите нужди.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-[1200px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.12,
                duration: 0.7,
                ease: [0.23, 1, 0.32, 1],
              }}
              className={`group relative rounded-[28px] overflow-hidden transition-all duration-500 ${
                plan.popular
                  ? "bg-gradient-to-b from-[#FF6600] via-[#FF6600]/60 to-[#FF6600]/20 p-[1px] shadow-[0_0_40px_rgba(255,102,0,0.15)]"
                  : "bg-white/[0.06] backdrop-blur-md border border-white/[0.1] hover:border-white/[0.18] hover:bg-white/[0.09]"
              }`}
            >
              {/* Inner content */}
              <div
                className={`relative rounded-[27px] p-8 lg:p-10 h-full flex flex-col ${
                  plan.popular ? "bg-black/70 backdrop-blur-md" : ""
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-6 right-6">
                    <div className="flex items-center gap-1.5 bg-[#FF6600] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Популярен
                    </div>
                  </div>
                )}

                {/* Plan info */}
                <div className="mb-8">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">
                    {plan.description}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-5">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white/30 text-sm">от</span>
                    <span className="text-5xl lg:text-6xl font-black text-white tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-xl font-bold text-white">€</span>
                    {plan.priceMax && (
                      <span className="text-white/30 text-sm ml-1">
                        до {plan.priceMax}€
                      </span>
                    )}
                    <span className="text-white/20 text-sm">/{plan.period}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-[1px] mb-8 ${plan.popular ? "bg-[#FF6600]/25" : "bg-white/[0.08]"}`} />

                {/* Features */}
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? "bg-[#FF6600]/20" : "bg-white/[0.08]"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? "text-[#FF6600]" : "text-white/50"}`} />
                      </div>
                      <span className="text-white/60 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="/booking" className="block">
                  <button
                    className={`w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-sm uppercase tracking-wider py-4 px-6 transition-all duration-300 ${
                      plan.popular
                        ? "bg-[#FF6600] hover:bg-[#FF7722] text-white shadow-lg shadow-[#FF6600]/25 hover:shadow-xl hover:shadow-[#FF6600]/30"
                        : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] hover:border-white/[0.2]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
