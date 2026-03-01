"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Мария Петрова",
    role: "Любител тенисист",
    rating: 5,
    text: "TopSpin промени играта ми напълно! Кортовете са в перфектно състояние, а треньорите са невероятни. Препоръчвам на всеки, който иска да подобри уменията си.",
    avatar: "МП",
  },
  {
    name: "Георги Иванов",
    role: "Състезател",
    rating: 5,
    text: "След 3 месеца тренировки в TopSpin, резултатите ми на турнири се подобриха значително. Освен това, системата за резервации е много удобна.",
    avatar: "ГИ",
  },
  {
    name: "Елена Димитрова",
    role: "Начинаеща",
    rating: 5,
    text: "Като начинаещ, бях притеснена, но треньорите ме направиха да се чувствам комфортно от първия ден. Глинената настилка е щадяща за ставите.",
    avatar: "ЕД",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50" id="testimonials">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-orange-600 font-semibold text-sm tracking-wide uppercase mb-2">
            Отзиви
          </p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
            Какво казват нашите <span className="text-orange-600">членове</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Присъединете се към стотици доволни тенисисти, които вече тренират с нас.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl"
            >
              <CardContent className="p-7">
                <Quote className="w-8 h-8 text-orange-200 mb-4" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-orange-400 text-orange-400"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
