"use client";

import { useState } from "react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { Calendar, Clock, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createCoachBlock, deleteCoachBlock } from "@/lib/actions";
import { toast } from "sonner";

interface CoachBlock {
  id: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

interface CoachBlocksListProps {
  blocks: CoachBlock[];
  coachAuth?: { coachId: string; pin: string };
  onBlocksUpdated: () => void;
}

export default function CoachBlocksList({ blocks, coachAuth, onBlocksUpdated }: CoachBlocksListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!date || !startTime || !endTime) {
      toast.error("Моля, попълнете дата и часове.");
      return;
    }
    setLoading(true);
    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();
    
    const res = await createCoachBlock(startIso, endIso, reason, coachAuth);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Времето е успешно блокирано.");
      setIsAdding(false);
      setDate("");
      setReason("");
      onBlocksUpdated();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете това блокиране?")) return;
    const res = await deleteCoachBlock(id, coachAuth);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Блокирането е изтрито.");
      onBlocksUpdated();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Почивни часове / Отсъствия</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
          <PlusCircle className="w-4 h-4" />
          Добави
        </Button>
      </div>

      {isAdding && (
        <Card className="border border-orange-200 bg-orange-50/50 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Ново отсъствие</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Дата</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Начален час</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Краен час</label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Причина (опционално)</label>
                <Input type="text" placeholder="Напр. Личен ангажимент" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Отказ</Button>
              <Button onClick={handleAdd} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                {loading ? "Запазване..." : "Запази"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Нямате предстоящи блокирани часове.</p>
          </div>
        ) : (
          blocks.map((block) => {
            const start = new Date(block.start_time);
            const end = new Date(block.end_time);
            return (
              <Card key={block.id} className="border-0 shadow-sm border-l-4 border-l-red-500">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {format(start, "d MMMM yyyy", { locale: bg })}
                      </p>
                      <p className="text-sm text-gray-500">
                        От {format(start, "HH:mm")} до {format(end, "HH:mm")}
                        {block.reason && ` • ${block.reason}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(block.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
