import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-7xl font-black text-[#c6f135]">404</p>
        <h2 className="text-2xl font-bold text-white">
          Страницата не е намерена
        </h2>
        <p className="text-white/40">
          Страницата, която търсите, не съществува или е била преместена.
        </p>
        <Link href="/">
          <Button className="bg-[#c6f135] hover:bg-[#a5d610] text-gray-900 rounded-full px-8 font-bold shadow-lg shadow-[#c6f135]/20">
            Към началото
          </Button>
        </Link>
      </div>
    </div>
  );
}
