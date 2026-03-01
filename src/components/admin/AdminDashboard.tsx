"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockBookings } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import AdminSidebar, { type AdminView } from "./AdminSidebar";
import AdminOverview from "./AdminOverview";
import AdminCalendar from "./AdminCalendar";
import AdminBookingsList from "./AdminBookingsList";
import AdminCreateBooking from "./AdminCreateBooking";

const viewTitles: Record<AdminView, string> = {
  overview: "Табло",
  calendar: "Календар",
  bookings: "Резервации",
  create: "Нова резервация",
};

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<AdminView>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allBookings, setAllBookings] = useState<Booking[]>(mockBookings);

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
            bookings={allBookings}
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
            bookings={allBookings}
            onBookingCreated={handleBookingCreated}
            prefillDate={prefillDate}
            prefillTime={prefillTime}
            prefillCourt={prefillCourt}
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
