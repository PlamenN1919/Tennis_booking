"use client";

import { useState } from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Въведете имейл и парола.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError(
          signInError?.message === "Invalid login credentials"
            ? "Грешен имейл или парола."
            : `Неуспешен вход: ${signInError?.message || "непозната грешка"}`
        );
        setLoading(false);
        return;
      }

      // Quick client-side role check for immediate feedback; the real gate is
      // server-side (admin page + server actions + RLS).
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("Този акаунт няма администраторски права.");
        setLoading(false);
        return;
      }

      // Session cookie is set — reload so the server re-renders the dashboard
      window.location.reload();
    } catch {
      setError("Неуспешна връзка със сървъра. Проверете дали Supabase проектът е активен.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white">
            TENNIS CLUB <span className="text-orange-400">OASIS</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Администраторски панел</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-2xl p-6 space-y-5 border border-gray-800"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-600/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 text-orange-400" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Вход за администратор</h2>
            <p className="text-sm text-gray-500 mt-1">Въведете вашия имейл и парола</p>
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="bg-gray-800 border-gray-700 text-white h-12 rounded-xl placeholder:text-gray-600"
              autoFocus
            />
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Парола"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="bg-gray-800 border-gray-700 text-white h-12 rounded-xl placeholder:text-gray-600"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center font-medium">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-base gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Влизане..." : "Вход"}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-4">
          Достъпът е само за администратори на клуба.
        </p>
      </div>
    </div>
  );
}
