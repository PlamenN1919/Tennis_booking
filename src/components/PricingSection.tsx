"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-orange-600 font-semibold text-sm tracking-wide uppercase mb-2">
            Ценоразпис
          </p>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
            Прозрачни <span className="text-orange-600">цени</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Без скрити такси. Изберете плана, който отговаря на вашите нужди.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`rounded-2xl border-0 shadow-lg relative overflow-hidden ${
                plan.popular
                  ? "ring-2 ring-orange-500 shadow-xl scale-105"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  Популярен
                </div>
              )}
              <CardHeader className="pb-4">
                <CardDescription className="text-sm font-medium text-gray-500">
                  {plan.description}
                </CardDescription>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-sm text-gray-500">от</span>
                  <span className="text-4xl font-black text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-lg font-bold text-gray-900">€</span>
                  {plan.priceMax && (
                    <span className="text-sm text-gray-400">до {plan.priceMax}€</span>
                  )}
                  <span className="text-sm text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <Check className="w-4 h-4 text-orange-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/booking">
                  <Button
                    className={`w-full rounded-full font-semibold ${
                      plan.popular
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
