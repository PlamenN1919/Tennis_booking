/**
 * Calendar Integration Utilities
 *
 * Generates "Add to Calendar" links for Google Calendar, Apple Calendar (ICS),
 * and Outlook (ICS). All events include a 30-minute reminder (VALARM).
 */

export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Format a Date to the ICS-compatible UTC date-time string (YYYYMMDDTHHmmssZ).
 */
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Format a Date to Google Calendar compatible UTC string (YYYYMMDDTHHmmssZ).
 */
function toGoogleDate(date: Date): string {
  return toICSDate(date);
}

/**
 * Escape special characters for ICS format.
 */
function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Generate a Google Calendar URL for the event.
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleDate(event.startTime)}/${toGoogleDate(event.endTime)}`,
    details: event.description,
    location: event.location,
    // Set a 30-minute reminder
    // Google Calendar doesn't support reminders via URL params natively,
    // but we can add it via the description
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an ICS (iCalendar) file content string for Apple Calendar / Outlook.
 * Includes a VALARM (reminder) 30 minutes before the event.
 */
export function generateICSContent(event: CalendarEventData): string {
  const uid = `tennis-booking-${Date.now()}@tenniscluboasis.bg`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tennis Club Oasis//Booking//BG",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${toICSDate(event.startTime)}`,
    `DTEND:${toICSDate(event.endTime)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    `LOCATION:${escapeICS(event.location)}`,
    "STATUS:CONFIRMED",
    `DTSTAMP:${toICSDate(new Date())}`,
    // 30-minute reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Напомняне: Вашата тенис резервация е след 30 минути!",
    "END:VALARM",
    // 1-hour reminder
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Напомняне: Вашата тенис резервация е след 1 час!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Trigger download of an ICS file in the browser.
 */
export function downloadICSFile(event: CalendarEventData, filename: string = "tennis-booking.ics"): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generate an Outlook.com (web) calendar link.
 */
export function generateOutlookWebUrl(event: CalendarEventData): string {
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    location: event.location,
    path: "/calendar/action/compose",
    rru: "addevent",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Build CalendarEventData from booking details.
 */
export function buildCalendarEvent(opts: {
  date: Date;
  time: string;
  durationHours: number;
  courtName: string;
  bookingType: "court_rental" | "coaching_session";
  coachingLabel?: string;
  totalPrice: number;
  customerName: string;
}): CalendarEventData {
  const [hours] = opts.time.split(":").map(Number);

  const startTime = new Date(opts.date);
  startTime.setHours(hours, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + opts.durationHours);

  const typeLabel =
    opts.bookingType === "court_rental" ? "Наем на корт" : "Урок с треньор";

  const title = `🎾 Tennis Club Oasis — ${typeLabel}`;

  const descriptionParts = [
    `Резервация: ${typeLabel}`,
    opts.coachingLabel ? `Тип: ${opts.coachingLabel}` : null,
    `Корт: ${opts.courtName}`,
    `Час: ${opts.time} — ${String(hours + opts.durationHours).padStart(2, "0")}:00`,
    `Продължителност: ${opts.durationHours} ${opts.durationHours === 1 ? "час" : "часа"}`,
    `Цена: ${opts.totalPrice}€`,
    `Клиент: ${opts.customerName}`,
    "",
    "📍 Tennis Club Oasis",
    "📞 За промени: обадете се предварително",
  ].filter(Boolean);

  return {
    title,
    description: descriptionParts.join("\n"),
    location: "Tennis Club Oasis",
    startTime,
    endTime,
  };
}
