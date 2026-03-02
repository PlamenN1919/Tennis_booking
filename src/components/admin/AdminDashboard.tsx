"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { groupTrainingsToVirtualBookings, setCourtIds } from "@/lib/booking-utils";
import { getCourts, getBookingsForDateRange } from "@/lib/actions";
import { format } from "date-fns";
import AdminSidebar, { type AdminView } from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import AdminCalendar from "./AdminCalendar";
import AdminBookingsList from "./AdminBookingsList";
import AdminCreateBooking from "./AdminCreateBooking";
import AdminGroupTrainings from "./AdminGroupTrainings";
import type { GroupTraining, GroupTrainingRegistration } from "@/lib/supabase";
import {
  getStoredGroupTrainings,
  saveGroupTrainings,
  getStoredRegistrations,
  saveRegistrations,
} from "@/lib/group-training-storage";

const viewTitles: Record<AdminView, string> = {
  overview: "Табло",
  calendar: "Календар",
  bookings: "Резервации",
  create: "Нова резервация",
  group_trainings: "Групови тренировки",
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>(mockBookings);
  const [groupTrainings, setGroupTrainings] = useState<GroupTraining[]>(() => getStoredGroupTrainings());
  const [groupRegistrations, setGroupRegistrations] = useState<GroupTrainingRegistration[]>(() => getStoredRegistrations());

  // Merge real bookings with virtual bookings generated from group trainings
  // so that AdminCalendar and AdminCreateBooking see group-training slots as occupied
  const allBookingsWithGT = useMemo(() => {
    const virtualBookings = groupTrainingsToVirtualBookings(groupTrainings, allBookings);
    return [...allBookings, ...virtualBookings];
  }, [allBookings, groupTrainings]);

  // On mount: load real courts from Supabase and set global court IDs
  useEffect(() => {
    getCourts()
      .then((serverCourts) => {
        if (serverCourts.length >= 2) {
          const sorted = [...serverCourts].sort((a, b) => a.name.localeCompare(b.name));
          setCourtIds(sorted[0].id, sorted[1].id);
        }
      })
      .catch(() => {
        // Supabase not available
      });

    // Load real bookings from server (60-day window for admin)
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
      .catch(() => {
        // Supabase not available — keep using mock bookings
      });
  }, []);

  // Persist group trainings to localStorage whenever they change
  useEffect(() => {
    saveGroupTrainings(groupTrainings);
  }, [groupTrainings]);

  useEffect(() => {
    saveRegistrations(groupRegistrations);
  }, [groupRegistrations]);

  // Listen for registration changes from user-facing calendar
  useEffect(() => {
    const handleRegistrationsUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as GroupTrainingRegistration[];
      setGroupRegistrations(detail);
    };
    window.addEventListener("group-registrations-updated", handleRegistrationsUpdate);
    return () => window.removeEventListener("group-registrations-updated", handleRegistrationsUpdate);
  }, []);

  // Prefill state for creating from calendar
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [prefillCourt, setPrefillCourt] = useState<string | undefined>();

  const handleCancelBooking = useCallback((id: string) => {
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  const handleBookingCreated = useCallback((booking: Booking) => {
    setAllBookings((prev) => [...prev, booking]);
    setCurrentView("bookings");
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

  const handleNavigate = useCallback((view: AdminView) => {
    setCurrentView(view);
  }, []);

  // Group training handlers
  const handleAddGroupTraining = useCallback((training: GroupTraining) => {
    setGroupTrainings((prev) => [...prev, training]);
  }, []);

  const handleRemoveGroupTraining = useCallback((id: string) => {
    setGroupTrainings((prev) => prev.filter((t) => t.id !== id));
    setGroupRegistrations((prev) => prev.filter((r) => r.group_training_id !== id));
  }, []);

  const handleToggleGroupTraining = useCallback((id: string) => {
    setGroupTrainings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
    );
  }, []);

  const handleCancelGroupRegistration = useCallback((id: string) => {
    setGroupRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "cancelled" as const } : r))
    );
  }, []);

  const todayBookings = allBookings.filter((b) => {
    const d = new Date(b.start_time);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      b.status === "confirmed"
    );
  }).length;

  const pendingCount = allBookings.filter((b) => b.status === "confirmed").length;

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return (
          <AdminOverview bookings={allBookings} onNavigate={handleNavigate} />
        );
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
            bookings={allBookings}
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
          />
        );
      case "group_trainings":
        return (
          <AdminGroupTrainings
            groupTrainings={groupTrainings}
            registrations={groupRegistrations}
            bookings={allBookingsWithGT}
            onAddTraining={handleAddGroupTraining}
            onRemoveTraining={handleRemoveGroupTraining}
            onToggleActive={handleToggleGroupTraining}
            onCancelRegistration={handleCancelGroupRegistration}
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
        <AdminSidebar
          currentView={currentView}
          onViewChange={(v) => {
            setCurrentView(v);
            setPrefillDate(undefined);
            setPrefillTime(undefined);
            setPrefillCourt(undefined);
          }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          stats={{ todayBookings, pendingCount }}
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
            <AdminSidebar
              currentView={currentView}
              onViewChange={(v) => {
                setCurrentView(v);
                setMobileOpen(false);
                setPrefillDate(undefined);
                setPrefillTime(undefined);
                setPrefillCourt(undefined);
              }}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              stats={{ todayBookings, pendingCount }}
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
              {todayBookings > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {todayBookings > 9 ? "9+" : todayBookings}
                </span>
              )}
            </Button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              A
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
