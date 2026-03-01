"use client";

import { Sun, Layers, Award, Clock, Shield, Wifi } from "lucide-react";

const benefits = [
  {
    icon: Sun,
    title: "Професионално осветление",
    description:
      "LED осветление от ново поколение на двата ни корта, позволяващо игра до късно вечерта.",
  },
  {
    icon: Layers,
    title: "Глинена настилка",
    description:
      "Автентична глинена повърхност, поддържана ежедневно за оптимално качество и комфорт.",
  },
  {
    icon: Award,
    title: "Професионални треньори",
    description:
      "Сертифицирани треньори с международен опит, адаптиращи програмата към вашето ниво.",
  },
  {
    icon: Clock,
    title: "Онлайн резервации 24/7",
    description:
      "Резервирайте корт или тренировка по всяко време от телефона или компютъра си.",
  },
  {
    icon: Shield,
    title: "Безконфликтна система",
    description:
      "Интелигентна система, предотвратяваща двойни резервации и конфликти в графика.",
  },
  {
    icon: Wifi,
    title: "Модерни удобства",
    description:
      "Безплатен Wi-Fi, съблекални с душове, зона за релакс и безплатен паркинг.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-orange-600 font-semibold text-sm tracking-wide uppercase mb-2">
            Предимства
          </p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
            Защо да изберете <span className="text-orange-600">TopSpin</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Всичко необходимо за вашето развитие на едно място.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="group p-7 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-5 transition-colors">
                <benefit.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
