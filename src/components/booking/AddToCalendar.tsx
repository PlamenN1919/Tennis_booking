"use client";

import { useState } from "react";
import { CalendarPlus, ChevronDown, Download, ExternalLink } from "lucide-react";
import {
  type CalendarEventData,
  generateGoogleCalendarUrl,
  generateOutlookWebUrl,
  downloadICSFile,
} from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

interface AddToCalendarProps {
  event: CalendarEventData;
}

export default function AddToCalendar({ event }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
    setDownloaded("google");
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleAppleCalendar = () => {
    downloadICSFile(event, "tennis-oasis-booking.ics");
    setDownloaded("apple");
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleOutlook = () => {
    const url = generateOutlookWebUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
    setDownloaded("outlook");
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleDownloadICS = () => {
    downloadICSFile(event, "tennis-oasis-booking.ics");
    setDownloaded("ics");
    setTimeout(() => setDownloaded(null), 3000);
  };

  const calendarOptions = [
    {
      id: "google",
      label: "Google Calendar",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#4285F4" />
          <rect x="5" y="5" width="14" height="14" rx="1" fill="white" />
          <rect x="7" y="9.5" width="3" height="3" rx="0.5" fill="#EA4335" />
          <rect x="10.5" y="9.5" width="3" height="3" rx="0.5" fill="#FBBC04" />
          <rect x="14" y="9.5" width="3" height="3" rx="0.5" fill="#34A853" />
          <rect x="7" y="13" width="3" height="3" rx="0.5" fill="#4285F4" />
          <rect x="10.5" y="13" width="3" height="3" rx="0.5" fill="#EA4335" />
          <rect x="14" y="13" width="3" height="3" rx="0.5" fill="#FBBC04" />
          <rect x="7" y="6" width="10" height="2.5" rx="0.5" fill="#4285F4" />
        </svg>
      ),
      action: handleGoogleCalendar,
      external: true,
    },
    {
      id: "apple",
      label: "Apple Calendar",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#1a1a1a" />
          <path
            d="M15.5 8.5c-.7-.8-1.8-1-2.5-1-.9 0-1.5.4-2 .4s-1.2-.4-2-.4c-1.5 0-3 1.2-3 3.5 0 1.4.5 2.8 1.2 3.8.6.7 1.1 1.2 1.8 1.2s1-.4 1.8-.4c.8 0 1.1.4 1.9.4s1.2-.5 1.7-1.1c.3-.4.5-.7.7-1.1-1.5-.7-1.7-2.8-.2-3.7-.5-.7-1.3-1.1-2-1.1-.4 0-.7.1-1 .2.3-.1.5-.2 1-.2.8 0 1.6.4 2.1 1.1l.5-.6z"
            fill="white"
          />
          <circle cx="13.5" cy="7" r="1" fill="white" />
        </svg>
      ),
      action: handleAppleCalendar,
      external: false,
    },
    {
      id: "outlook",
      label: "Outlook",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#0078D4" />
          <ellipse cx="10" cy="13" rx="3.5" ry="3" fill="white" />
          <path d="M14 10h5v8h-5z" fill="#0053A6" />
          <path d="M14 10h5l-2.5 3.5L14 10z" fill="#0072C6" />
          <path d="M19 10v8l-2.5-3.5L19 10z" fill="#0053A6" />
        </svg>
      ),
      action: handleOutlook,
      external: true,
    },
    {
      id: "ics",
      label: "Свали .ics файл",
      sublabel: "За всеки друг календар",
      icon: <Download className="w-5 h-5 text-gray-600" />,
      action: handleDownloadICS,
      external: false,
    },
  ];

  return (
    <div className="w-full">
      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl border-2 transition-all duration-300 font-bold text-sm",
          isOpen
            ? "bg-orange-50 border-orange-300 text-orange-700 shadow-md"
            : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm"
        )}
      >
        <CalendarPlus className="w-5 h-5" />
        <span>Добави в календар</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300 ml-auto",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Calendar options - animated dropdown */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-400 ease-in-out",
          isOpen ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        )}
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden divide-y divide-gray-100">
          {/* Reminder info banner */}
          <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50">
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">🔔</span>
              <div>
                <p className="text-xs font-bold text-orange-800">
                  Автоматично напомняне
                </p>
                <p className="text-[11px] text-orange-600/80">
                  Ще получите напомняне 1 час и 30 мин. преди часа
                </p>
              </div>
            </div>
          </div>

          {/* Calendar options */}
          {calendarOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              className={cn(
                "w-full flex items-center gap-3.5 px-4 py-3.5 transition-all duration-200 text-left group",
                downloaded === option.id
                  ? "bg-green-50"
                  : "hover:bg-gray-50 active:bg-gray-100"
              )}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center shrink-0 border border-gray-100 group-hover:border-gray-200 transition-all group-hover:shadow-sm">
                {option.icon}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                  {option.label}
                </p>
                {"sublabel" in option && option.sublabel && (
                  <p className="text-[11px] text-gray-400">{option.sublabel}</p>
                )}
              </div>

              {/* Action indicator */}
              <div className="shrink-0">
                {downloaded === option.id ? (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-bold">Готово!</span>
                  </div>
                ) : option.external ? (
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                ) : (
                  <Download className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
