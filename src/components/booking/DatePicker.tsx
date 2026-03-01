"use client";

import { useState } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { bg } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  const today = startOfDay(new Date());
  const [startDate, setStartDate] = useState(today);

  // Show 7 days starting from startDate
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const goBack = () => {
    const newStart = addDays(startDate, -7);
    if (!isBefore(newStart, today)) {
      setStartDate(newStart);
    } else {
      setStartDate(today);
    }
  };

  const goForward = () => {
    setStartDate(addDays(startDate, 7));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-gray-900">
            {format(selectedDate, "MMMM yyyy", { locale: bg })}
          </h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goBack}
            disabled={isBefore(startDate, addDays(today, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={goForward}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day buttons */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected =
            format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isToday =
            format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

          return (
            <button
              key={day.toISOString()}
              disabled={isPast}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center py-3 px-2 rounded-xl transition-all text-center",
                isSelected
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                  : isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-700",
                isToday && !isSelected && "ring-2 ring-orange-300"
              )}
            >
              <span className="text-[10px] font-medium uppercase">
                {format(day, "EEE", { locale: bg })}
              </span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
