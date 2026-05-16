"use client";

import { cn } from "@/lib/utils";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type CoachView = "calendar" | "bookings" | "blocks";

interface CoachSidebarProps {
  currentView: CoachView;
  onViewChange: (view: CoachView) => void;
  collapsed: boolean;
  onToggle: () => void;
  stats?: {
    todayBookings: number;
    pendingCount: number;
  };
}

const navItems: { key: CoachView; label: string; icon: React.ElementType; description: string }[] = [
  { key: "calendar", label: "Календар", icon: CalendarDays, description: "Седмичен график" },
  { key: "bookings", label: "Моите резервации", icon: List, description: "Списък с уроци" },
  { key: "blocks", label: "Почивни часове", icon: CalendarDays, description: "Блокирай график" },
];

export default function CoachSidebar({
  currentView,
  onViewChange,
  collapsed,
  onToggle,
  stats,
}: CoachSidebarProps) {
  return (
    <aside
      className={cn(
        "h-screen bg-gray-950 text-white flex flex-col transition-all duration-300 sticky top-0 z-40",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter">
              TENNIS CLUB <span className="text-orange-400">OASIS</span>
            </span>
            <span className="text-[10px] font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Coach
            </span>
          </Link>
        )}
        {collapsed && (
          <span className="text-lg font-black tracking-tighter mx-auto">
            T<span className="text-orange-400">S</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
              {!collapsed && (
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium block">{item.label}</span>
                  {!isActive && (
                    <span className="text-[11px] text-gray-500 block">{item.description}</span>
                  )}
                </div>
              )}
              {!collapsed && item.key === "bookings" && stats?.todayBookings && stats.todayBookings > 0 ? (
                <span className="text-[11px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">
                  {stats.todayBookings}
                </span>
              ) : null}
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && (
          <Link href="/" target="_blank">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 rounded-xl gap-3 text-sm"
            >
              <ArrowUpRight className="w-4 h-4" />
              Към сайта
            </Button>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
