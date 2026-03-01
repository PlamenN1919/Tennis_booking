"use client";

import React from 'react';
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const features = [
    "Ремонтирани кортове със специална настилка",
    "Професионално LED осветление за вечерна игра",
    "Луксозни съблекални и душове",
    "Уютна кафе-зона и тераса за релакс"
];

export default function GallerySection() {
    return (
        <section className="py-24 lg:py-32 relative overflow-hidden bg-white">
            {/* Decorative gradient background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-[#FF6600]/10 blur-[150px] rounded-[100%] pointer-events-none" />

            <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">

                {/* Header Text */}
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16 lg:mb-20 items-end">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.8)]" />
                            <span className="text-gray-600 text-sm font-bold uppercase tracking-wider">Нашата База</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                            className="text-4xl md:text-5xl lg:text-7xl font-black text-black uppercase tracking-tighter"
                        >
                            Оазис в <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">сърцето</span> на града
                        </motion.h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex-1 lg:pb-3"
                    >
                        <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-6">
                            Насладете се на премиум условия, създадени за вашата най-добра игра. Клуб "Oasis" предлага перфектно поддържани кортове и комфорт от най-високо ниво, преди и след мача.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#FF6600] shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bento Grid Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:h-[700px]">

                    {/* Main Large Image (Left) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="md:col-span-8 lg:col-span-8 rounded-3xl overflow-hidden relative group border border-black/10 h-[400px] md:h-auto shadow-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12 z-20 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <span className="text-[#FF6600] font-bold tracking-[0.2em] text-sm uppercase mb-3 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-md">Кортове</span>
                            <h3 className="text-white font-black text-3xl lg:text-4xl uppercase tracking-tight">Отлична настилка</h3>
                        </div>

                        <Image
                            src="/gallery-1.png"
                            alt="Main Tennis Court"
                            fill
                            unoptimized
                            className="object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                            priority
                        />
                        <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-noise pointer-events-none z-10"></div>
                    </motion.div>

                    {/* Right Column Stack */}
                    <div className="md:col-span-4 lg:col-span-4 grid grid-rows-2 gap-4 md:gap-6 h-[600px] md:h-auto">

                        {/* Top Right Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="rounded-3xl overflow-hidden relative group border border-black/10 h-full shadow-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none" />
                            <div className="absolute inset-x-0 bottom-0 p-6 z-20 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-[#FF6600] font-bold tracking-[0.2em] text-xs uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-md">Движение</span>
                                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-tight">Перфектна игра</h3>
                            </div>
                            <Image
                                src="/gallery-2.png"
                                alt="Tennis Details"
                                fill
                                unoptimized
                                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                            />
                        </motion.div>

                        {/* Bottom Right Image */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="rounded-3xl overflow-hidden relative group border border-[#FF6600]/30 h-full shadow-sm"
                        >
                            {/* Decorative glow to make it stand out subtly */}
                            <div className="absolute inset-0 bg-[#FF6600]/5 z-10 transition-colors duration-500 group-hover:bg-[#FF6600]/10 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 transition-opacity duration-500 group-hover:opacity-90 pointer-events-none" />

                            <div className="absolute inset-x-0 bottom-0 p-6 z-30 pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="text-[#FF6600] font-bold tracking-[0.2em] text-xs uppercase mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-md">Осветление</span>
                                <h3 className="text-white font-black text-xl lg:text-2xl uppercase tracking-tight">Вечерни мачове</h3>
                            </div>

                            <Image
                                src="/gallery-3.png"
                                alt="Tennis Equipment"
                                fill
                                unoptimized
                                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                            />
                        </motion.div>

                    </div>

                </div>

            </div>
        </section>
    );
}
