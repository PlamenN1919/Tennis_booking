"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  List,
  Plus,
  MoreHorizontal,
  Users,
  GraduationCap,
  ArrowUpRight,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { AdminView } from "./AdminSidebar";

interface AdminBottomNavProps {
  currentView: AdminView;
  onViewChange: (view: AdminView) => void;
  onLogout: () => void;
  todayBookings?: number;
}

const moreViews: AdminView[] = ["group_trainings", "coaches"];

const moreItems: {
  key: AdminView;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    key: "group_trainings",
    label: "Групови тренировки",
    description: "Деца 5-8 и 8-11 г.",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    key: "coaches",
    label: "Треньори",
    description: "Управление и PIN кодове",
    icon: GraduationCap,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export default function AdminBottomNav({
  currentView,
  onViewChange,
  onLogout,
  todayBookings = 0,
}: AdminBottomNavProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const tabClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center gap-1 h-full transition-colors select-none",
      active ? "text-orange-600" : "text-gray-400 active:text-gray-600"
    );

  const handleSelect = (view: AdminView) => {
    setMoreOpen(false);
    onViewChange(view);
  };

  const moreActive = moreViews.includes(currentView);

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {/* Табло */}
          <button
            onClick={() => handleSelect("overview")}
            className={tabClass(currentView === "overview")}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Табло</span>
          </button>

          {/* Календар */}
          <button
            onClick={() => handleSelect("calendar")}
            className={tabClass(currentView === "calendar")}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Календар</span>
          </button>

          {/* Нова резервация — централен бутон */}
          <button
            onClick={() => handleSelect("create")}
            className="flex flex-col items-center justify-start h-full select-none"
            aria-label="Нова резервация"
          >
            <span
              className={cn(
                "w-12 h-12 -mt-4 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30 transition-all",
                currentView === "create"
                  ? "bg-orange-700 ring-4 ring-orange-200"
                  : "bg-orange-600 active:scale-95"
              )}
            >
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </span>
            <span
              className={cn(
                "text-[10px] font-medium leading-none mt-1",
                currentView === "create" ? "text-orange-600" : "text-gray-400"
              )}
            >
              Нова
            </span>
          </button>

          {/* Резервации */}
          <button
            onClick={() => handleSelect("bookings")}
            className={tabClass(currentView === "bookings")}
          >
            <span className="relative">
              <List className="w-5 h-5" />
              {todayBookings > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 bg-orange-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {todayBookings > 9 ? "9+" : todayBookings}
                </span>
              )}
            </span>
            <span className="text-[10px] font-medium leading-none">Резервации</span>
          </button>

          {/* Още */}
          <button onClick={() => setMoreOpen(true)} className={tabClass(moreActive)}>
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Още</span>
          </button>
        </div>
      </nav>

      {/* Bottom sheet с останалите секции */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-3xl pb-[calc(env(safe-area-inset-bottom)+1rem)] gap-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-gray-200" />
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base">Още</SheetTitle>
          </SheetHeader>

          <div className="px-4 space-y-1">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl p-3 text-left transition-colors",
                    isActive ? "bg-orange-50 ring-1 ring-orange-200" : "active:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      item.iconBg
                    )}
                  >
                    <Icon className={cn("w-5 h-5", item.iconColor)} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-gray-900">
                      {item.label}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              );
            })}

            <div className="border-t border-gray-100 my-2" />

            <Link
              href="/"
              target="_blank"
              onClick={() => setMoreOpen(false)}
              className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:bg-gray-50"
            >
              <span className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5 text-gray-500" />
              </span>
              <span className="flex-1 text-sm font-semibold text-gray-900">
                Към сайта
              </span>
            </Link>

            <button
              onClick={() => {
                setMoreOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 rounded-2xl p-3 text-left active:bg-red-50"
            >
              <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-red-500" />
              </span>
              <span className="flex-1 text-sm font-semibold text-red-600">Изход</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
