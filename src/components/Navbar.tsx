"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8 lg:px-10 lg:py-10">
      <div className="max-w-[1440px] mx-auto">
        <Link href="/" className="group relative inline-flex rounded-full px-6 py-2.5 mt-6">
          {/* Gradient border */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              padding: "1px",
              background: "linear-gradient(135deg, rgba(139, 90, 60, 0.7), rgba(255, 255, 255, 0.25) 50%, rgba(139, 90, 60, 0.7))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
          <span className="text-white text-xs font-medium tracking-[0.25em] uppercase">
            Tennis Club Oasis
          </span>
        </Link>
      </div>
    </nav>
  );
}
