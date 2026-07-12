"use client";

import { useState, useEffect } from "react";
import { UserPlus, Trash2, Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCoach, getCoaches, deleteCoach } from "@/lib/actions";
import { toast } from "sonner";

interface Coach {
  id: string;
  name: string;
  specialization: string | null;
  hourly_rate: number;
  // Only present for logged-in admins (getCoaches hides PINs otherwise)
  pin?: string | null;
  created_at: string;
}

export default function AdminCoachManager() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [hourlyRate, setHourlyRate] = useState("80");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCoaches = () => {
    getCoaches().then((data) => setCoaches(data as Coach[]));
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const generatePin = () => {
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    setPin(newPin);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Моля, въведете име на треньора.");
      return;
    }
    if (!pin || pin.length < 4) {
      toast.error("PIN кодът трябва да е поне 4 цифри.");
      return;
    }

    setLoading(true);
    const res = await createCoach({
      name: name.trim(),
      specialization: specialization.trim() || undefined,
      hourlyRate: Number(hourlyRate) || 80,
      pin,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Треньор "${name}" е създаден! PIN: ${pin}`);
      setName("");
      setSpecialization("");
      setHourlyRate("80");
      setPin("");
      setIsAdding(false);
      loadCoaches();
    }
    setLoading(false);
  };

  const handleDelete = async (coach: Coach) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете ${coach.name}?`)) return;
    const res = await deleteCoach(coach.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Треньорът е изтрит.");
      loadCoaches();
    }
  };

  const copyPin = (coachPin: string) => {
    navigator.clipboard.writeText(coachPin);
    toast.success("PIN кодът е копиран!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Треньори</h2>
          <p className="text-sm text-gray-500">Управлявайте треньорите и техните PIN кодове за достъп.</p>
        </div>
        <Button
          onClick={() => { setIsAdding(!isAdding); if (!isAdding) generatePin(); }}
          className="bg-orange-600 hover:bg-orange-700 text-white gap-2 w-full sm:w-auto h-10"
        >
          <UserPlus className="w-4 h-4" />
          Нов треньор
        </Button>
      </div>

      {isAdding && (
        <Card className="py-0 border border-orange-200 bg-orange-50/50 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Нов треньор</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Име *</label>
                <Input
                  placeholder="Иван Петров"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">PIN код за вход *</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="font-mono text-lg tracking-widest"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={generatePin}
                    title="Генерирай PIN"
                    className="shrink-0"
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Отказ</Button>
              <Button
                onClick={handleCreate}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {loading ? "Запазване..." : "Създай треньор"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coach List */}
      <div className="space-y-3">
        {coaches.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Няма добавени треньори.</p>
          </div>
        ) : (
          coaches.map((coach) => (
            <Card key={coach.id} className="py-0 border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                    {coach.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{coach.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {coach.pin && (
                    <button
                      onClick={() => copyPin(coach.pin!)}
                      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                      title="Копирай PIN"
                    >
                      <span className="font-mono font-bold text-sm text-gray-700">{coach.pin}</span>
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(coach)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
