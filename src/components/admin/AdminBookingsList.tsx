"use client";

import { useState, useMemo } from "react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { bg } from "date-fns/locale";
import {
  Search,
  Filter,
  X,
  Users,
  MapPin,
  Calendar,
  ChevronDown,
  Phone,
  Mail,
  StickyNote,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockCourts, mockCoaches } from "@/lib/mock-data";
import type { Booking } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface AdminBookingsListProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
}

type SortField = "date" | "price" | "type";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "confirmed" | "cancelled" | "completed";
type TypeFilter = "all" | "court_rental" | "coaching_session";
type CourtFilter = "all" | "court-a" | "court-b";
type TimeFilter = "all" | "today" | "tomorrow" | "this_week" | "past" | "future";

export default function AdminBookingsList({ bookings, onCancelBooking }: AdminBookingsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [courtFilter, setCourtFilter] = useState<CourtFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => {
        const courtName = mockCourts.find((c) => c.id === b.court_id)?.name || "";
        const coachName = b.coach_id ? mockCoaches.find((c) => c.id === b.coach_id)?.name || "" : "";
        const customerName = (b as any).customer_name || "";
        const customerPhone = (b as any).customer_phone || "";
        const notes = b.notes || "";
        return (
          courtName.toLowerCase().includes(q) ||
          coachName.toLowerCase().includes(q) ||
          customerName.toLowerCase().includes(q) ||
          customerPhone.includes(q) ||
          notes.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((b) => b.booking_type === typeFilter);
    }

    // Court filter
    if (courtFilter !== "all") {
      result = result.filter((b) => b.court_id === courtFilter);
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      result = result.filter((b) => {
        const d = new Date(b.start_time);
        switch (timeFilter) {
          case "today": return isToday(d);
          case "tomorrow": return isTomorrow(d);
          case "this_week": {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            return d >= weekStart && d < weekEnd;
          }
          case "past": return d < now;
          case "future": return d >= now;
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case "price":
          cmp = a.total_price - b.total_price;
          break;
        case "type":
          cmp = a.booking_type.localeCompare(b.booking_type);
          break;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [bookings, searchQuery, statusFilter, typeFilter, courtFilter, timeFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const activeFiltersCount = [statusFilter, typeFilter, courtFilter, timeFilter].filter(
    (f) => f !== "all"
  ).length;

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setCourtFilter("all");
    setTimeFilter("all");
    setSearchQuery("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">Потвърдена</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-0 text-[10px]">Отменена</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px]">Завършена</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Резервации</h2>
          <p className="text-sm text-gray-500">
            {filteredBookings.length} от {bookings.length} резервации
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Търси по име, телефон, бележки..."
                className="pl-10 rounded-xl border-gray-200 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full gap-2 h-10",
                showFilters && "bg-orange-600 hover:bg-orange-700 text-white"
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Филтри
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Sort */}
            <Select value={`${sortField}-${sortOrder}`} onValueChange={(v) => {
              const [field, order] = v.split("-") as [SortField, SortOrder];
              setSortField(field);
              setSortOrder(order);
            }}>
              <SelectTrigger className="w-auto rounded-full h-10 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Дата (нови първо)</SelectItem>
                <SelectItem value="date-asc">Дата (стари първо)</SelectItem>
                <SelectItem value="price-desc">Цена (↓)</SelectItem>
                <SelectItem value="price-asc">Цена (↑)</SelectItem>
                <SelectItem value="type-asc">Тип (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                <SelectTrigger className="w-auto rounded-full h-9 min-w-[130px] text-xs">
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички дати</SelectItem>
                  <SelectItem value="today">Днес</SelectItem>
                  <SelectItem value="tomorrow">Утре</SelectItem>
                  <SelectItem value="this_week">Тази седмица</SelectItem>
                  <SelectItem value="future">Бъдещи</SelectItem>
                  <SelectItem value="past">Минали</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-auto rounded-full h-9 min-w-[130px] text-xs">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички статуси</SelectItem>
                  <SelectItem value="confirmed">Потвърдени</SelectItem>
                  <SelectItem value="cancelled">Отменени</SelectItem>
                  <SelectItem value="completed">Завършени</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="w-auto rounded-full h-9 min-w-[130px] text-xs">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички типове</SelectItem>
                  <SelectItem value="court_rental">Наем на корт</SelectItem>
                  <SelectItem value="coaching_session">Урок с треньор</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courtFilter} onValueChange={(v) => setCourtFilter(v as CourtFilter)}>
                <SelectTrigger className="w-auto rounded-full h-9 min-w-[120px] text-xs">
                  <SelectValue placeholder="Корт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички кортове</SelectItem>
                  <SelectItem value="court-a">Корт A</SelectItem>
                  <SelectItem value="court-b">Корт B</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={clearFilters}
                >
                  <X className="w-3 h-3 mr-1" />
                  Изчисти
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Няма намерени резервации</p>
              <p className="text-xs mt-1">Опитайте с различни филтри</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_100px_100px_100px_80px] gap-4 items-center px-5 py-3 bg-gray-50/80 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <span>Резервация</span>
                <span>Дата и час</span>
                <span>Корт</span>
                <span>Тип</span>
                <span>Статус</span>
                <span className="text-right">Цена</span>
              </div>

              {/* Table Rows */}
              {filteredBookings.map((booking) => {
                const startTime = new Date(booking.start_time);
                const endTime = new Date(booking.end_time);
                const courtName =
                  mockCourts.find((c) => c.id === booking.court_id)?.name || booking.court_id;
                const isCoaching = booking.booking_type === "coaching_session";
                const coachName = booking.coach_id
                  ? mockCoaches.find((c) => c.id === booking.coach_id)?.name
                  : null;
                const isCancelled = booking.status === "cancelled";
                const isInPast = isPast(startTime);
                const customerName = (booking as any).customer_name;

                return (
                  <div
                    key={booking.id}
                    className={cn(
                      "grid grid-cols-[1fr_120px_100px_100px_100px_80px] gap-4 items-center px-5 py-3.5 hover:bg-gray-50/80 transition-colors cursor-pointer group",
                      isCancelled && "opacity-50"
                    )}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {/* Booking Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          isCoaching ? "bg-purple-100" : "bg-blue-100"
                        )}
                      >
                        {isCoaching ? (
                          <Users className="w-4 h-4 text-purple-600" />
                        ) : (
                          <MapPin className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {customerName || (isCoaching ? "Урок с треньор" : "Наем на корт")}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {coachName && `${coachName} • `}
                          {booking.notes ? booking.notes.split("\n")[0].substring(0, 30) : `ID: ${booking.id.substring(0, 8)}`}
                        </p>
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {isToday(startTime)
                          ? "Днес"
                          : isTomorrow(startTime)
                          ? "Утре"
                          : format(startTime, "d MMM", { locale: bg })}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {format(startTime, "HH:mm")} – {format(endTime, "HH:mm")}
                      </p>
                    </div>

                    {/* Court */}
                    <div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] border-0 font-semibold",
                          booking.court_id === "court-a"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        )}
                      >
                        {courtName}
                      </Badge>
                    </div>

                    {/* Type */}
                    <div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] border-0",
                          isCoaching
                            ? "bg-purple-50 text-purple-700"
                            : "bg-orange-50 text-orange-700"
                        )}
                      >
                        {isCoaching ? "Урок" : "Наем"}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div>{getStatusBadge(booking.status)}</div>

                    {/* Price + Actions */}
                    <div className="text-right flex items-center justify-end gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {booking.total_price} лв
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedBooking?.booking_type === "coaching_session"
                    ? "bg-purple-100"
                    : "bg-blue-100"
                )}
              >
                {selectedBooking?.booking_type === "coaching_session" ? (
                  <Users className="w-4 h-4 text-purple-600" />
                ) : (
                  <MapPin className="w-4 h-4 text-blue-600" />
                )}
              </div>
              Детайли за резервацията
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Customer Info */}
              {(selectedBooking as any).customer_name && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Клиент</p>
                  <p className="text-sm font-bold text-gray-900">{(selectedBooking as any).customer_name}</p>
                  {(selectedBooking as any).customer_phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <Phone className="w-3 h-3" />
                      {(selectedBooking as any).customer_phone}
                    </div>
                  )}
                  {(selectedBooking as any).customer_email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      {(selectedBooking as any).customer_email}
                    </div>
                  )}
                </div>
              )}

              {/* Booking Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Тип</span>
                  <Badge className={cn(
                    "text-xs border-0",
                    selectedBooking.booking_type === "coaching_session"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  )}>
                    {selectedBooking.booking_type === "coaching_session" ? "Урок с треньор" : "Наем на корт"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Дата и час</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {format(new Date(selectedBooking.start_time), "d MMM yyyy, HH:mm", { locale: bg })}
                    {" – "}
                    {format(new Date(selectedBooking.end_time), "HH:mm")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Корт</span>
                  <Badge variant="secondary" className="text-xs">
                    {mockCourts.find((c) => c.id === selectedBooking.court_id)?.name || selectedBooking.court_id}
                  </Badge>
                </div>
                {selectedBooking.coach_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Треньор</span>
                    <span className="text-sm font-medium">
                      {mockCoaches.find((c) => c.id === selectedBooking.coach_id)?.name || "—"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Статус</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Цена</span>
                  <span className="text-xl font-black text-orange-600">
                    {selectedBooking.total_price} лв
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Създадена на</span>
                  <span className="text-xs text-gray-600">
                    {format(new Date(selectedBooking.created_at), "d MMM yyyy, HH:mm", { locale: bg })}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-amber-50 rounded-xl p-3">
                  <StickyNote className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setSelectedBooking(null)}
                >
                  Затвори
                </Button>
                {selectedBooking.status === "confirmed" && !isPast(new Date(selectedBooking.start_time)) && (
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-full gap-2"
                    onClick={() => {
                      onCancelBooking(selectedBooking.id);
                      setSelectedBooking(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                    Отмени резервация
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
