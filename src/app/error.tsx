"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <div className="max-w-md text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Нещо се обърка</h2>
        <p className="text-white/40">
          Възникна неочаквана грешка. Моля, опитайте отново.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#c6f135] hover:bg-[#a5d610] text-gray-900 rounded-full px-6 font-bold"
          >
            Опитай отново
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="rounded-full px-6"
          >
            Към началото
          </Button>
        </div>
      </div>
    </div>
  );
}
