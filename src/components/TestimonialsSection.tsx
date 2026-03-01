"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Георги Маринов",
    role: "Любител на тениса",
    rating: 5,
    text: "Страхотен клуб с отлично поддържани кортове! Онлайн резервационната система е много удобна - резервирам за секунди.",
    avatar: "ГМ",
  },
  {
    name: "Мария Кирилова",
    role: "Състезателка",
    rating: 5,
    text: "Треньорите са на невероятно ниво. Подобрих играта си значително за 3 месеца. Препоръчвам на всеки, който иска да се развива.",
    avatar: "МК",
  },
  {
    name: "Димитър Стоянов",
    role: "Родител",
    rating: 5,
    text: "Записах детето си на тенис уроци и съм впечатлен. Треньор Ана е страхотна с децата - на всяко занятие идва с усмивка!",
    avatar: "ДС",
  },
  {
    name: "Елена Тодорова",
    role: "Начинаеща",
    rating: 5,
    text: "Започнах от нулата и за 2 месеца вече играя с приятели. Кортовете са прекрасни, особено вечер с осветлението.",
    avatar: "ЕТ",
  },
  {
    name: "Николай Петков",
    role: "Бизнесмен",
    rating: 4,
    text: "Идеално място за бизнес среща на корта. Резервирам всяка седмица за 18:00. Системата за повтарящи се резервации е top.",
    avatar: "НП",
  },
  {
    name: "Анна Василева",
    role: "Фитнес ентусиаст",
    rating: 5,
    text: "Тенисът стана любимият ми спорт благодарение на Tennis Club Oasis. Кондиционните тренировки с Петър са изключителни!",
    avatar: "АВ",
  },
];

export default function TestimonialsSection() {
  const featured = testimonials[1]; // Featured testimonial

  return (
    <section
      id="testimonials"
      className="py-28 bg-black relative overflow-hidden noise-overlay mesh-gradient-hero"
    >
      {/* Animated mesh gradient blobs */}
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
        {/* Featured Testimonial – Large Quote */}
        <motion.div
          className="mb-20 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Big orange watermark text behind the quote */}
          <div className="absolute -bottom-8 left-0 right-0 overflow-hidden pointer-events-none opacity-[0.03]">
            <span className="text-[10rem] md:text-[16rem] font-black text-[#FF6600] leading-none whitespace-nowrap block">
              Tennis Club Oasis
            </span>
          </div>

          <div className="relative z-10 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <Quote className="w-12 h-12 text-[#FF6600] mb-6 drop-shadow-[0_0_20px_rgba(255,102,0,0.2)]" />
            </motion.div>

            <motion.blockquote
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight italic mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              &ldquo;{featured.text}&rdquo;
            </motion.blockquote>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-14 h-14 rounded-full bg-[#FF6600] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[#FF6600]/20">
                {featured.avatar}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{featured.name}</p>
                <p className="text-white/35 text-sm">{featured.role}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Other Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials
            .filter((_, i) => i !== 1)
            .map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.7,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={cn(
                  "group p-7 rounded-3xl overflow-hidden card-lift cursor-default",
                  i === 0
                    ? "bg-[#FF6600] shadow-lg shadow-[#FF6600]/15"
                    : "glass-card"
                )}
              >
                {/* Stars — animated stagger */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          delay: i * 0.1 + j * 0.06,
                          duration: 0.3,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        <Star
                          className={`w-4 h-4 ${j < t.rating
                            ? i === 0
                              ? "text-white fill-white"
                              : "text-[#FF6600] fill-[#FF6600]"
                            : "text-white/10"
                            }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <p
                  className={cn(
                    "leading-relaxed mb-7 text-[15px] transition-colors duration-500",
                    i === 0
                      ? "text-white/90"
                      : "text-white/45 group-hover:text-white/65"
                  )}
                >
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                      i === 0
                        ? "bg-white/20 text-white"
                        : "bg-[#FF6600]/15 text-[#FF6600] group-hover:bg-[#FF6600]/25 group-hover:shadow-[0_0_15px_rgba(255,102,0,0.1)]"
                    )}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        i === 0 ? "text-white" : "text-white"
                      )}
                    >
                      {t.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs transition-colors duration-300",
                        i === 0 ? "text-white/60" : "text-white/25 group-hover:text-white/40"
                      )}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
