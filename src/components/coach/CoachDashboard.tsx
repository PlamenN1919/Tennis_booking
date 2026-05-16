"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/supabase";
import { setCourtIds } from "@/lib/booking-utils";
import { getCourts, getBookingsForDateRange, getUserCoachInfo, getCoachBlocks } from "@/lib/actions";
import { format } from "date-fns";
import CoachSidebar, { type CoachView } from "./CoachSidebar";
import AdminCalendar from "../admin/AdminCalendar";
import AdminBookingsList from "../admin/AdminBookingsList";
import CoachBlocksList from "./CoachBlocksList";

const viewTitles: Record<CoachView, string> = {
  calendar: "График на кортовете",
  bookings: "Моите резервации",
  blocks: "Почивни часове",
};

export default function CoachDashboard() {
  const [currentView, setCurrentView] = useState<CoachView>("calendar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [coachName, setCoachName] = useState<string>("T");
  const [coachBlocks, setCoachBlocks] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Get coach info
    getUserCoachInfo().then((res) => {
      if (res.coach) {
        setCoachId(res.coach.id);
        setCoachName(res.coach.name);
        refreshBlocks(res.coach.id);
      }
    });

    getCourts()
      .then((serverCourts) => {
        if (serverCourts.length >= 2) {
          const sorted = [...serverCourts].sort((a, b) => a.name.localeCompare(b.name));
          setCourtIds(sorted[0].id, sorted[1].id);
        }
      })
      .catch(() => {});

    // Load real bookings from server (60-day window)
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 30);

    getBookingsForDateRange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"))
      .then((serverBookings) => {
        if (serverBookings.length > 0) {
          setAllBookings(serverBookings);
        }
      })
      .catch(() => {});
  }, []);

  const refreshBlocks = (id: string) => {
    const startStr = format(new Date(), "yyyy-MM-dd");
    const endD = new Date();
    endD.setMonth(endD.getMonth() + 3); // next 3 months
    const endStr = format(endD, "yyyy-MM-dd");
    getCoachBlocks(startStr, endStr, id).then(setCoachBlocks);
  };

  const handleCancelBooking = useCallback((id: string) => {
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  // Filter bookings for the list view to only show the coach's own sessions
  const myBookings = useMemo(() => {
    if (!coachId) return [];
    return allBookings.filter((b) => b.coach_id === coachId);
  }, [allBookings, coachId]);

  const todayMyBookingsCount = isHydrated ? myBookings.filter((b) => {
    const d = new Date(b.start_time);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      b.status === "confirmed"
    );
  }).length : 0;

  const pendingCount = myBookings.filter((b) => b.status === "confirmed").length;

  const renderView = () => {
    if (!coachId && isHydrated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <p>Зареждане на треньорски профил... (или нямате достъп)</p>
        </div>
      );
    }

    switch (currentView) {
      case "calendar":
        return (
          <AdminCalendar
            bookings={allBookings}
            onCancelBooking={handleCancelBooking}
            onCreateFromSlot={() => {}} // Disabled for coach
          />
        );
      case "bookings":
        return (
          <AdminBookingsList
            bookings={myBookings}
            onCancelBooking={handleCancelBooking}
          />
        );
      case "blocks":
        return (
          <CoachBlocksList 
            blocks={coachBlocks} 
            onBlocksUpdated={() => {
              if (coachId) refreshBlocks(coachId);
            }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <CoachSidebar
          currentView={currentView}
          onViewChange={(v) => {
            setCurrentView(v);
          }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          stats={{ todayBookings: todayMyBookingsCount, pendingCount }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full w-[260px] animate-in slide-in-from-left duration-300">
            <CoachSidebar
              currentView={currentView}
              onViewChange={(v) => {
                setCurrentView(v);
                setMobileOpen(false);
              }}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              stats={{ todayBookings: todayMyBookingsCount, pendingCount }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {viewTitles[currentView]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Търси..."
                className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-32 lg:w-48"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {isHydrated && todayMyBookingsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {todayMyBookingsCount > 9 ? "9+" : todayMyBookingsCount}
                </span>
              )}
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              {coachName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
