"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/lib/supabase";
import { setCourtIds } from "@/lib/booking-utils";
import { getCourts, getBookingsForDateRange, getCoachBlocks, getGroupTrainings } from "@/lib/actions";
import { format } from "date-fns";
import CoachSidebar, { type CoachView } from "./CoachSidebar";
import CoachLogin from "./CoachLogin";
import AdminCalendar from "../admin/AdminCalendar";
import AdminBookingsList from "../admin/AdminBookingsList";
import AdminCreateBooking from "../admin/AdminCreateBooking";
import CoachBlocksList from "./CoachBlocksList";
import { groupTrainingsToVirtualBookings } from "@/lib/booking-utils";
import type { GroupTraining } from "@/lib/supabase";

const viewTitles: Record<CoachView, string> = {
  calendar: "График на кортовете",
  bookings: "Моите резервации",
  create: "Нова резервация",
  blocks: "Почивни часове",
};

interface CoachSession {
  id: string;
  name: string;
}

export default function CoachDashboard() {
  const [coach, setCoach] = useState<CoachSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<CoachView>("calendar");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [groupTrainings, setGroupTrainings] = useState<GroupTraining[]>([]);
  const [coachBlocks, setCoachBlocks] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [prefillCourt, setPrefillCourt] = useState<string | undefined>();

  // Merge real bookings with virtual bookings generated from group trainings
  const allBookingsWithGT = useMemo(() => {
    const virtualBookings = groupTrainingsToVirtualBookings(groupTrainings, allBookings);
    return [...allBookings, ...virtualBookings];
  }, [allBookings, groupTrainings]);

  // Check for existing session on mount
  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem("coach_session");
    if (stored) {
      try {
        setCoach(JSON.parse(stored));
      } catch {
        localStorage.removeItem("coach_session");
      }
    }
    setIsLoading(false);
  }, []);

  // Load data when coach is authenticated
  useEffect(() => {
    getCourts()
      .then((serverCourts) => {
        if (serverCourts.length >= 2) {
          const sorted = [...serverCourts].sort((a, b) => a.name.localeCompare(b.name));
          setCourtIds(sorted[0].id, sorted[1].id);
        }
      })
      .catch(() => {});

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 180);

    getBookingsForDateRange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"))
      .then((serverBookings) => {
        if (serverBookings.length > 0) {
          setAllBookings(serverBookings);
        }
      })
      .catch(() => {});

    getGroupTrainings()
      .then((data) => {
        setGroupTrainings(data as GroupTraining[]);
      })
      .catch(() => {});
  }, []);

  const refreshBlocks = useCallback((id: string) => {
    const startStr = format(new Date(), "yyyy-MM-dd");
    const endD = new Date();
    endD.setMonth(endD.getMonth() + 3);
    const endStr = format(endD, "yyyy-MM-dd");
    getCoachBlocks(startStr, endStr, id).then(setCoachBlocks);
  }, []);

  // Load blocks when coach changes
  useEffect(() => {
    if (coach?.id) {
      refreshBlocks(coach.id);
    }
  }, [coach, refreshBlocks]);

  const handleCancelBooking = useCallback((id: string) => {
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  const handleBookingCreated = useCallback((newBooking: Booking) => {
    setAllBookings((prev) => [...prev, newBooking]);
    setCurrentView("calendar");
  }, []);

  const handleCreateFromCalendar = useCallback(
    (date: string, time: string, court: string) => {
      setPrefillDate(date);
      setPrefillTime(time);
      setPrefillCourt(court);
      setCurrentView("create");
    },
    []
  );

  const handleLogout = () => {
    localStorage.removeItem("coach_session");
    setCoach(null);
  };

  const myBookings = useMemo(() => {
    if (!coach) return [];
    return allBookings.filter((b) => b.coach_id === coach.id);
  }, [allBookings, coach]);

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

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  // Show login if no coach session
  if (!coach) {
    return <CoachLogin onLogin={(c) => setCoach(c)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case "calendar":
        return (
          <AdminCalendar
            bookings={allBookingsWithGT}
            onCancelBooking={handleCancelBooking}
            onCreateFromSlot={handleCreateFromCalendar}
          />
        );
      case "bookings":
        return (
          <AdminBookingsList
            bookings={myBookings}
            onCancelBooking={handleCancelBooking}
          />
        );
      case "create":
        return (
          <AdminCreateBooking
            bookings={allBookingsWithGT}
            onBookingCreated={handleBookingCreated}
            prefillDate={prefillDate}
            prefillTime={prefillTime}
            prefillCourt={prefillCourt}
            prefillCoachId={coach.id}
          />
        );
      case "blocks":
        return (
          <CoachBlocksList
            blocks={coachBlocks}
            onBlocksUpdated={() => {
              if (coach?.id) refreshBlocks(coach.id);
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
          onViewChange={(v) => setCurrentView(v)}
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
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Търси..."
                className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none w-32 lg:w-48"
              />
            </div>

            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {isHydrated && todayMyBookingsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {todayMyBookingsCount > 9 ? "9+" : todayMyBookingsCount}
                </span>
              )}
            </Button>

            {/* Coach name + logout */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {coach.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{coach.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-400 hover:text-red-500"
                onClick={handleLogout}
                title="Изход"
              >
                <LogOut className="w-4 h-4" />
              </Button>
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
