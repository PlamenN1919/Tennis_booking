"use client";

import React from 'react';
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ContactCard = ({ icon: Icon, title, details, delay }: { icon: any, title: string, details: React.ReactNode, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.6 }}
        className="group relative flex items-start gap-4 p-6 rounded-2xl bg-[#FF6600] shadow-xl hover:shadow-2xl shadow-[#FF6600]/20 border border-[#FF8833] transition-all duration-500 overflow-hidden hover:-translate-y-1"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-black transition-all duration-500 relative z-10">
            <Icon className="w-6 h-6 text-white group-hover:text-[#FF6600] transition-colors duration-500" />
        </div>
        <div className="relative z-10">
            <h3 className="text-white font-black text-xl mb-1">{title}</h3>
            <div className="text-white/90 leading-relaxed font-medium transition-colors duration-300">{details}</div>
        </div>
    </motion.div>
);

export default function LocationSection() {
    return (
        <section id="location" className="py-24 lg:py-32 relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#FF6600]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-[#FF6600]/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
                <div className="text-center mb-16 lg:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6"
                    >
                        <MapPin className="w-4 h-4 text-[#FF6600]" />
                        <span className="text-gray-600 text-sm font-bold uppercase tracking-wider">Къде се намираме</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-black uppercase tracking-tighter mb-6"
                    >
                        Локация & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#FF8833]">Контакти</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Открийте ни лесно. Очакваме ви на кортовете, готови за игра.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    <div className="space-y-6">
                        <ContactCard
                            icon={MapPin}
                            title="Адрес"
                            delay={0.1}
                            details={
                                <>
                                    <p>ул. „Царевски път“ 30</p>
                                    <p>8277 Лозенец, България</p>
                                </>
                            }
                        />

                        <div className="grid sm:grid-cols-1 gap-6">
                            <ContactCard
                                icon={Phone}
                                title="Телефон"
                                delay={0.2}
                                details={
                                    <a href="tel:+359886731212" className="hover:text-black transition-colors font-bold underline-offset-4 hover:underline">
                                        +359 88 6731212
                                    </a>
                                }
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="mt-8 p-8 border border-[#FF6600]/20 rounded-3xl bg-gradient-to-br from-[#FF6600]/10 to-transparent relative overflow-hidden group"
                        >
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF6600]/20 rounded-full blur-[50px] group-hover:bg-[#FF6600]/30 transition-colors duration-500" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-[#FF6600] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,102,0,0.3)]">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black text-black uppercase tracking-tight">Работно време</h3>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="flex justify-between items-center pb-4 border-b border-black/5">
                                    <span className="text-gray-700 font-medium">Понеделник - Петък</span>
                                    <span className="text-[#FF6600] font-bold text-lg bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">07:00 - 22:00</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-700 font-medium">Събота - Неделя</span>
                                    <span className="text-[#FF6600] font-bold text-lg bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">08:00 - 21:00</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                                <Link href="/booking" className="block">
                                    <Button className="w-full bg-white text-black hover:bg-gray-100 uppercase font-black text-sm h-14 rounded-xl flex items-center justify-center gap-2 group/btn transition-all duration-300">
                                        Резервирай корт
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="h-[500px] lg:h-full min-h-[500px] rounded-3xl border border-black/10 overflow-hidden relative group p-2 bg-black/[0.02]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10 pointer-events-none" />

                        <div className="w-full h-full rounded-2xl overflow-hidden relative z-0 bg-gray-100">
                            <iframe
                                src="https://maps.google.com/maps?q=ул.+%E2%80%9EЦаревски+път%E2%80%9C+30,+8277+Лозенец,+България&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(30%)', opacity: 0.9 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="transition-transform duration-1000 group-hover:scale-105"
                            ></iframe>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-16 h-16 bg-[#FF6600] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,102,0,0.6)] border-4 border-black"
                            >
                                <MapPin className="w-8 h-8 text-black fill-black" />
                            </motion.div>
                            <div className="w-8 h-2 bg-black/50 blur-sm rounded-full mt-4" />
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 z-20">
                            <a
                                href="https://maps.google.com/?q=ул.+Царевски+път+30,+8277+Лозенец,+България"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl text-white hover:bg-[#FF6600] hover:border-[#FF6600] hover:text-black transition-all duration-300 font-bold text-sm w-full sm:w-auto shadow-2xl justify-center sm:justify-start"
                            >
                                Отвори в Google Maps
                                <ArrowRight className="w-4 h-4 ml-auto sm:ml-2" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
