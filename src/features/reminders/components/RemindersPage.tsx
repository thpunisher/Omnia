import { useEffect } from "react";
import { BellRing, Trash2, Plus, Check } from "lucide-react";
import { useReminderStore } from "@/features/reminders/store/reminderStore";
import { CreateReminderDialog } from "./CreateReminderDialog";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast, isToday } from "date-fns";

export const RemindersPage = () => {
  const { reminders, isLoading, fetchReminders, toggleReminder, removeReminder } = useReminderStore();

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const active = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">{active.length} active</p>
        </div>
        <CreateReminderDialog />
      </div>

      {isLoading && reminders.length === 0 ? (
        <div className="empty-state"><div className="empty-state-title">Loading…</div></div>
      ) : reminders.length === 0 ? (
        <div className="empty-state">
          <BellRing className="empty-state-icon" />
          <div className="empty-state-title">No reminders</div>
          <div className="empty-state-desc">Set a reminder so nothing slips through.</div>
          <CreateReminderDialog triggerClassName="btn-primary mt-2">
            <Plus className="w-3.5 h-3.5" /> Add reminder
          </CreateReminderDialog>
        </div>
      ) : (
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            {active.map((reminder) => {
              const due = reminder.due_date ? new Date(reminder.due_date) : null;
              const overdue = due && isPast(due) && !isToday(due);
              return (
                <motion.div layout key={reminder.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="doc-row group"
                  style={{ borderBottom: "1px solid var(--color-border)", borderRadius: 0, padding: "0.6rem 0.25rem" }}
                >
                  <button onClick={() => toggleReminder(reminder.id, 1)} className="check-box flex-shrink-0">
                  </button>
                  <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
                    {reminder.title}
                  </span>
                  {due && (
                    <span className="text-xs px-2 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: overdue ? "rgba(248,113,113,0.12)" : "var(--color-overlay)",
                        color: overdue ? "var(--color-danger)" : "var(--color-text-tertiary)",
                        border: `1px solid ${overdue ? "transparent" : "var(--color-border)"}`,
                      }}>
                      {format(due, "MMM d, h:mm a")}
                    </span>
                  )}
                  <button onClick={() => removeReminder(reminder.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {done.length > 0 && (
            <>
              <div className="section-label">Completed</div>
              <AnimatePresence mode="popLayout" initial={false}>
                {done.map((reminder) => (
                  <motion.div layout key={reminder.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    className="doc-row group"
                    style={{ borderBottom: "1px solid var(--color-border)", borderRadius: 0, padding: "0.6rem 0.25rem" }}
                  >
                    <button
                      onClick={() => toggleReminder(reminder.id, 0)}
                      className="check-box checked flex-shrink-0"
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </button>
                    <span className="flex-1 text-sm line-through" style={{ color: "var(--color-text-tertiary)" }}>
                      {reminder.title}
                    </span>
                    <button onClick={() => removeReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: "var(--color-text-tertiary)" }}>
                      <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};
