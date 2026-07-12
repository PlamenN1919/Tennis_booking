"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { groupTrainingsToVirtualBookings, setCourtIds } from "@/lib/booking-utils";
import { getCourts, getBookingsForDateRange, cancelBooking } from "@/lib/actions";
import { getStoredBookings, saveBookings } from "@/lib/booking-storage";
import { format } from "date-fns";
import AdminSidebar, { type AdminView } from "./AdminSidebar";
import AdminBottomNav from "./AdminBottomNav";
import AdminOverview from "./AdminOverview";
import AdminCalendar from "./AdminCalendar";
import AdminBookingsList from "./AdminBookingsList";
import AdminCreateBooking from "./AdminCreateBooking";
import AdminGroupTrainings from "./AdminGroupTrainings";
import AdminCoachManager from "./AdminCoachManager";
import type { GroupTraining, GroupTrainingRegistration } from "@/lib/supabase";
import {
  getGroupTrainings,
  getGroupRegistrations,
  createGroupTrainingAction,
  deleteGroupTrainingAction,
  toggleGroupTrainingAction,
  cancelGroupRegistrationAction,
} from "@/lib/actions";

const viewTitles: Record<AdminView, string> = {
  overview: "Табло",
  calendar: "Календар",
  bookings: "Резервации",
  create: "Нова резервация",
  group_trainings: "Групови тренировки",
  coaches: "Треньори",
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>(() => getStoredBookings());
  const [groupTrainings, setGroupTrainings] = useState<GroupTraining[]>([]);
  const [groupRegistrations, setGroupRegistrations] = useState<GroupTrainingRegistration[]>([]);
  
  // Add hydration flag to avoid SSR/client mismatch for date-based calculations
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

    // Load real bookings from server (210-day window for admin)
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 180);

    getBookingsForDateRange(format(start, "yyyy-MM-dd"), format(end, "yyyy-MM-dd"))
      .then((serverBookings) => {
        const localBookings = getStoredBookings();
        const unsyncedBookings = localBookings.filter(
          (b) => b.id.startsWith("admin-") || b.id.startsWith("booking-")
        );

        // Combine server bookings with unsynced local bookings (Smart Merge)
        const mergedBookings = [...serverBookings];
        unsyncedBookings.forEach((localB) => {
          if (!mergedBookings.some((b) => b.id === localB.id)) {
            mergedBookings.push(localB);
          }
        });

        setAllBookings(mergedBookings);
        saveBookings(mergedBookings);
      })
      .catch(() => {
        // Supabase not available — keep using stored bookings
      });

    getGroupTrainings()
      .then((data) => {
        setGroupTrainings(data as GroupTraining[]);
      })
      .catch(() => {});

    getGroupRegistrations()
      .then((data) => {
        setGroupRegistrations(data as GroupTrainingRegistration[]);
      })
      .catch(() => {});
  }, []);

  // Persist real and local bookings to localStorage whenever they change
  useEffect(() => {
    saveBookings(allBookings);
  }, [allBookings]);

  // Listen for booking changes from booking flow

  // Prefill state for creating from calendar
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [prefillCourt, setPrefillCourt] = useState<string | undefined>();

  const handleCancelBooking = useCallback((id: string) => {
    // 1. Immediately update local state (optimistic update)
    setAllBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );

    // 2. If it's a real server booking (doesn't start with admin- or booking-), sync cancellation to database
    if (!id.startsWith("admin-") && !id.startsWith("booking-")) {
      cancelBooking(id)
        .then((result) => {
          if (result && "error" in result && result.error) {
            alert(`Грешка при отмяна в базата данни: ${result.error}`);
            // Rollback optimistic update
            setAllBookings((prev) =>
              prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b))
            );
          }
        })
        .catch((err) => {
          console.error("Failed to cancel booking on server:", err);
          alert("Неуспешно свързване със сървъра за отмяна на резервацията.");
          // Rollback optimistic update
          setAllBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b))
          );
        });
    }
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

  const handleLogout = useCallback(async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Supabase unreachable/unconfigured — still reload to the login gate
    } finally {
      window.location.reload();
    }
  }, []);

  // Group training handlers
  const handleAddGroupTraining = useCallback(async (training: GroupTraining) => {
    try {
      const result = await createGroupTrainingAction({
        ageGroup: training.age_group,
        date: training.date,
        startTime: training.start_time,
        endTime: training.end_time,
        maxParticipants: training.max_participants || 10,
      });
      if (result && "error" in result && result.error) {
        alert(result.error);
        return;
      }
      const updatedTrainings = await getGroupTrainings();
      setGroupTrainings(updatedTrainings as GroupTraining[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert("Възникна грешка при създаване на групова тренировка: " + msg);
    }
  }, []);

  const handleRemoveGroupTraining = useCallback(async (id: string) => {
    try {
      const result = await deleteGroupTrainingAction(id);
      if (result && "error" in result && result.error) {
        alert(result.error);
        return;
      }
      const updatedTrainings = await getGroupTrainings();
      setGroupTrainings(updatedTrainings as GroupTraining[]);
      const updatedRegs = await getGroupRegistrations();
      setGroupRegistrations(updatedRegs as GroupTrainingRegistration[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert("Възникна грешка при изтриване: " + msg);
    }
  }, []);

  const handleToggleGroupTraining = useCallback(async (id: string) => {
    try {
      const result = await toggleGroupTrainingAction(id);
      if (result && "error" in result && result.error) {
        alert(result.error);
        return;
      }
      const updatedTrainings = await getGroupTrainings();
      setGroupTrainings(updatedTrainings as GroupTraining[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert("Възникна грешка при промяна на статуса: " + msg);
    }
  }, []);

  const handleCancelGroupRegistration = useCallback(async (id: string) => {
    try {
      const result = await cancelGroupRegistrationAction(id);
      if (result && "error" in result && result.error) {
        alert(result.error);
        return;
      }
      const updatedRegs = await getGroupRegistrations();
      setGroupRegistrations(updatedRegs as GroupTrainingRegistration[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      alert("Възникна грешка при отмяна на регистрацията: " + msg);
    }
  }, []);

  // Calculate stats only after hydration to avoid SSR/client mismatches
  const todayBookings = isHydrated ? allBookings.filter((b) => {
    const d = new Date(b.start_time);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      b.status === "confirmed"
    );
  }).length : 0;

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
      case "coaches":
        return <AdminCoachManager />;
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

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          setPrefillDate(undefined);
          setPrefillTime(undefined);
          setPrefillCourt(undefined);
        }}
        onLogout={handleLogout}
        todayBookings={isHydrated ? todayBookings : 0}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="lg:hidden text-base font-black tracking-tighter shrink-0">
              T<span className="text-orange-500">C</span>
            </span>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {viewTitles[currentView]}
            </h1>
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
              {isHydrated && todayBookings > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {todayBookings > 9 ? "9+" : todayBookings}
                </span>
              )}
            </Button>

            {/* User Avatar */}
            <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center text-white text-sm font-bold cursor-pointer">
              A
            </div>

            {/* Logout — на телефон е в меню „Още" */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex rounded-full text-gray-400 hover:text-red-500"
              onClick={handleLogout}
              title="Изход"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content Area — долен отстъп на телефон заради навигационната лента */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 lg:pb-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
