"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/lib/supabase";
import { formatTimeRange } from "@/lib/booking-utils";

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlotGrid({
  slots,
  selectedTime,
  onTimeSelect,
}: TimeSlotGridProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#FF6600]" />
        <h3 className="font-bold text-white">Изберете час</h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" />
          <span>Свободен</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#FF6600]/20 border border-[#FF6600]/30" />
          <span>Един корт свободен</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
          <span>Зает</span>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const bothFree = slot.courtA && slot.courtB;
          const oneFree = slot.available && !bothFree;

          return (
            <button
              key={slot.time}
              disabled={!slot.available}
              onClick={() => onTimeSelect(slot.time)}
              className={cn(
                "relative flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium",
                isSelected
                  ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-[#FF6600]/20"
                  : !slot.available
                  ? "bg-red-500/10 text-red-400 border-red-500/10 cursor-not-allowed"
                  : bothFree
                  ? "bg-green-500/10 text-green-400 border-green-500/20 hover:border-green-400 hover:shadow-md"
                  : "bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/20 hover:border-orange-400 hover:shadow-md"
              )}
            >
              <span className="font-bold">{slot.time}</span>
              <span className={cn(
                "text-[10px] mt-0.5",
                isSelected ? "text-white/80" : ""
              )}>
                {!slot.available
                  ? "Зает"
                  : bothFree
                  ? "2 корта"
                  : oneFree
                  ? "1 корт"
                  : ""}
              </span>

              {/* Court indicators */}
              {slot.available && !isSelected && (
                <div className="flex gap-1 mt-1">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      slot.courtA ? "bg-green-500/100" : "bg-red-400"
                    )}
                    title={slot.courtA ? "Корт A свободен" : "Корт A зает"}
                  />
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      slot.courtB ? "bg-green-500/100" : "bg-red-400"
                    )}
                    title={slot.courtB ? "Корт B свободен" : "Корт B зает"}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
