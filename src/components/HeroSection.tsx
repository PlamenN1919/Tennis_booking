"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Animated moving background gradient */}
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
        className="absolute w-[650px] h-[650px] rounded-full opacity-[0.12] blur-[120px] animate-[float_18s_ease-in-out_infinite]"
        style={{
          background: "radial-gradient(circle, #5c3a2a, transparent 70%)",
          top: "8%",
          left: "2%",
        }}
      />
      <div
        className="absolute w-[550px] h-[550px] rounded-full opacity-[0.09] blur-[100px] animate-[float_22s_ease-in-out_infinite_reverse]"
        style={{
          background: "radial-gradient(circle, #4e2e1c, transparent 70%)",
          bottom: "2%",
          right: "8%",
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] rounded-full opacity-[0.07] blur-[90px] animate-[float_15s_ease-in-out_infinite_2s]"
        style={{
          background: "radial-gradient(circle, #402418, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(92, 58, 42, 0.4) 30%, rgba(139, 90, 60, 0.6) 50%, rgba(92, 58, 42, 0.4) 70%, transparent 90%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 pt-24 pb-8 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column - Main Heading */}
            <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 relative z-20">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-[0.95] tracking-tight uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                <div className="overflow-hidden pb-2 -mb-2">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  >
                    Твоето
                  </motion.div>
                </div>
                <div className="overflow-hidden pb-2 -mb-2">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    място за
                  </motion.div>
                </div>
                <div className="overflow-hidden pb-2 -mb-2">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  >
                    <motion.span
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                      className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-200 to-orange-400 inline-block pr-4"
                      style={{ backgroundSize: "200% auto" }}
                    >
                      тенис.
                    </motion.span>
                  </motion.div>
                </div>
              </h1>
            </div>

            {/* Center Column - Oval Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="lg:col-span-4 lg:col-start-5 lg:row-start-1 flex justify-center z-0"
            >
              {/* Outer glow behind the image */}
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-[210px] blur-[40px] opacity-60"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(139, 90, 60, 0.4), rgba(92, 58, 42, 0.2) 50%, transparent 80%)",
                  }}
                />
                <div
                  className="relative w-[350px] h-[560px] lg:w-[400px] lg:h-[660px] rounded-[200px] overflow-hidden"
                  style={{
                    boxShadow:
                      "0 0 60px rgba(139, 90, 60, 0.35), 0 0 120px rgba(109, 70, 45, 0.2), 0 0 200px rgba(92, 58, 42, 0.12), 0 25px 50px rgba(0,0,0,0.4)",
                  }}
                >
                  <img
                    src="/hero-tennis.jpg"
                    alt="Tennis player"
                    className="w-full h-full object-cover object-center scale-110"
                  />
                  {/* Inner border glow */}
                  <div
                    className="absolute inset-0 rounded-[200px] pointer-events-none"
                    style={{
                      boxShadow: "inset 0 0 40px rgba(139, 90, 60, 0.15)",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Column - Stats & Description */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="lg:col-span-4 lg:col-start-9 lg:row-start-1 flex flex-col gap-8"
            >
              {/* Stats Row */}
              <div className="flex items-start gap-6 lg:gap-8">
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-black text-white">500+</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium mt-1">Членове</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-black text-white">12</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium mt-1">Корта</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-black text-white">98%</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-medium mt-1 leading-tight">
                    Доволни
                    <br />
                    клиенти
                  </p>
                </div>
              </div>

              {/* Decorative separator line */}
              <div
                className="w-16 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, rgba(139, 90, 60, 0.6), transparent)",
                }}
              />

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                Ние ви предлагаме професионални условия за тренировки, частни уроци и турнири. Резервирайте кортове и тренировки с няколко клика.
              </p>

              {/* CTA Button */}
              <Link href="/booking">
                <button className="group flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider rounded-full px-8 py-4 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50">
                  Резервирай
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="flex items-end justify-between mt-auto pt-8"
        >
          {/* Left - Avatar badges */}
          <div
            className="flex items-center gap-4 px-5 py-3 rounded-full backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, rgba(92, 58, 42, 0.15), rgba(45, 28, 18, 0.25))",
              border: "1px solid rgba(139, 90, 60, 0.15)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            }}
          >
            <div className="flex -space-x-2">
              {[
                { letter: "М", bg: "from-orange-500 to-orange-700" },
                { letter: "А", bg: "from-amber-600 to-amber-800" },
                { letter: "К", bg: "from-orange-600 to-red-700" },
                { letter: "С", bg: "from-amber-500 to-orange-700" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${item.bg} flex items-center justify-center text-white text-xs font-semibold tracking-wide ring-2 ring-black/30 shadow-md`}
                  style={{
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3), 0 0 12px rgba(139, 90, 60, 0.15)",
                  }}
                >
                  {item.letter}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-white/90 text-sm font-medium tracking-wide">500+ членове</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest">доволни клиенти</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom decorative accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 15%, rgba(92, 58, 42, 0.3) 40%, rgba(92, 58, 42, 0.3) 60%, transparent 85%)",
          }}
        />
      </div>
    </section>
  );
}
