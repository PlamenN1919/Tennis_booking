"use client";

import { useState } from "react";
import { KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginCoachByPin } from "@/lib/actions";

interface CoachLoginProps {
  onLogin: (coach: { id: string; name: string; pin: string }) => void;
}

export default function CoachLogin({ onLogin }: CoachLoginProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError("PIN кодът трябва да е поне 4 цифри.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await loginCoachByPin(pin);
    if (res.error) {
      setError(res.error);
    } else if (res.coach) {
      // Keep the PIN in the session — server actions (block/unblock hours)
      // re-verify it, since coaches don't have a Supabase auth session.
      const session = { id: res.coach.id, name: res.coach.name, pin };
      localStorage.setItem("coach_session", JSON.stringify(session));
      onLogin(session);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            TENNIS CLUB <span className="text-orange-400">OASIS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Портал за треньори</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7 text-blue-400" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Вход за треньор</h2>
            <p className="text-sm text-gray-500 mt-1">Въведете вашия персонален PIN код</p>
          </div>

          <div className="space-y-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • •"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="text-center text-2xl tracking-[0.5em] font-bold bg-gray-800 border-gray-700 text-white h-14 rounded-xl placeholder:text-gray-600 placeholder:tracking-[0.5em]"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Влизане..." : "Вход"}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          Ако нямате PIN, свържете се с администратора на клуба.
        </p>
      </div>
    </div>
  );
}
