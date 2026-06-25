import { useState, useEffect } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  startOfWeek, endOfWeek, addMonths, subMonths, isToday, isValid,
} from "date-fns";
import { useCalendarStore } from "../store/calendarStore";
import { CreateEventDialog } from "./CreateEventDialog";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { events, fetchEvents, removeEvent } = useCalendarStore();

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{format(currentDate, "MMMM yyyy")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <button onClick={() => setCurrentDate((d) => subMonths(d, 1))} className="btn-ghost" style={{ padding: "0.4rem" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="btn-ghost">Today</button>
            <button onClick={() => setCurrentDate((d) => addMonths(d, 1))} className="btn-ghost" style={{ padding: "0.4rem" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <CreateEventDialog />
        </div>
      </div>

      <div className="grid grid-cols-7" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold py-2.5"
            style={{ color: "var(--color-text-tertiary)", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          const dayEvents = events.filter((e) => {
            const start = new Date(e.start_date);
            return isValid(start) && isSameDay(start, day);
          });
          const outsideMonth = !isSameMonth(day, monthStart);
          const today = isToday(day);
          const isLastCol = (idx + 1) % 7 === 0;

          return (
            <div key={idx}
              className="min-h-[110px] p-2 transition-colors hover:bg-white/[0.02] group/cell relative"
              style={{
                borderRight: isLastCol ? "none" : "1px solid var(--color-border)",
                borderBottom: "1px solid var(--color-border)",
                opacity: outsideMonth ? 0.35 : 1,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full"
                  style={today ? { background: "var(--color-accent)", color: "#fff" } : { color: "var(--color-text-secondary)" }}>
                  {format(day, "d")}
                </span>
                <CreateEventDialog
                  defaultDate={day}
                  triggerClassName="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 rounded text-xs"
                >
                  <span style={{ color: "var(--color-text-tertiary)" }}>+</span>
                </CreateEventDialog>
              </div>
              <div className="space-y-1 mt-1.5">
                {dayEvents.map((e) => (
                  <div key={e.id} className="group/event flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                    <span className="truncate flex-1">{e.title}</span>
                    <button
                      onClick={() => removeEvent(e.id)}
                      className="opacity-0 group-hover/event:opacity-100 flex-shrink-0"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
