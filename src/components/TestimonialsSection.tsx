"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const testimonials = [
  {
    name: "Ventseslav Semov",
    role: "Google отзив",
    rating: 5,
    text: "Ако искате да научите нещо повече за тениса или само да поиграете това е Вашето място. Пълен професионализъм от страна на треньора. Успех в бъдещите начинания!",
    avatar: "VS",
    featured: true,
  },
  {
    name: "Диян Николов",
    role: "Google отзив",
    rating: 5,
    text: "Уникално местенце с професионални кортове и обслужване. Треньорът е отзивчив и много полезен както за начинаещи така и за напреднали. Горещо препоръчвам!",
    avatar: "ДН",
    featured: false,
  },
  {
    name: "Plamena Ganeva",
    role: "Google отзив",
    rating: 5,
    text: "Впечатлена съм от професионализма на треньора и подхода му към децата. Отново ще посетим това зареждащо място при първа възможност!",
    avatar: "PG",
    featured: false,
  },
];

export default function TestimonialsSection() {
  const featured = testimonials[0];
  const others = testimonials.slice(1);

  return (
    <section className="py-28 lg:py-36 relative" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-bold text-[#FF6600] tracking-[0.25em] uppercase mb-5">
            <span className="w-8 h-[2px] bg-[#FF6600]" />
            Отзиви от клиенти
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95]">
            Какво казват нашите{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">
              членове
            </span>
          </h2>
        </motion.div>

        {/* Main Testimonial Layout */}
        <div className="grid lg:grid-cols-12 gap-5">
          {/* Featured testimonial — large card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 relative rounded-[28px] bg-white/[0.06] backdrop-blur-md border border-white/[0.1] p-10 lg:p-14 overflow-hidden group"
          >
            {/* Google badge */}
            <div className="absolute top-8 right-8 lg:top-10 lg:right-10 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/[0.08]">
                <GoogleLogo className="w-5 h-5" />
                <span className="text-white/50 text-xs font-medium">Google Review</span>
              </div>
            </div>

            {/* Subtle glow */}
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#FF6600]/[0.04] blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-8">
                {Array.from({ length: featured.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-5 h-5 fill-[#FF6600] text-[#FF6600]"
                  />
                ))}
              </div>

              {/* Quote text */}
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug tracking-tight mb-10">
                &ldquo;{featured.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#FF8833] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#FF6600]/20">
                  {featured.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-base">
                    {featured.name}
                  </p>
                  <p className="text-white/30 text-sm">{featured.role}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side column — other testimonials */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {others.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.15 + i * 0.1,
                  duration: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="flex-1 relative rounded-[28px] bg-white/[0.06] backdrop-blur-md border border-white/[0.1] p-8 lg:p-10 overflow-hidden group hover:border-white/[0.18] transition-colors duration-500"
              >
                <div className="relative z-10">
                  {/* Stars */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4 fill-[#FF6600]/60 text-[#FF6600]/60"
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.05] rounded-full px-3 py-1.5 border border-white/[0.06]">
                      <GoogleLogo className="w-3.5 h-3.5" />
                      <span className="text-white/40 text-[10px] font-medium">Google</span>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 font-bold text-xs">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{t.name}</p>
                      <p className="text-white/25 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
