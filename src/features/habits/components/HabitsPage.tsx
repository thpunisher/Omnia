import { useEffect } from "react";
import { Repeat2, Trash2, Plus, Flame, Check } from "lucide-react";
import { useHabitStore } from "@/features/habits/store/habitStore";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export const HabitsPage = () => {
  const { habits, isLoading, fetchHabits, toggleToday, removeHabit, isDoneToday, getStreak } = useHabitStore();

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">Track what you do consistently.</p>
        </div>
        <CreateHabitDialog />
      </div>

      {isLoading && habits.length === 0 ? (
        <div className="empty-state"><div className="empty-state-title">Loading…</div></div>
      ) : habits.length === 0 ? (
        <div className="empty-state">
          <Repeat2 className="empty-state-icon" />
          <div className="empty-state-title">No habits yet</div>
          <div className="empty-state-desc">Add habits you want to build and check in daily.</div>
          <CreateHabitDialog triggerClassName="btn-primary mt-2">
            <Plus className="w-3.5 h-3.5" /> Add habit
          </CreateHabitDialog>
        </div>
      ) : (
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            {habits.map((habit) => {
              const done = isDoneToday(habit.id);
              const streak = getStreak(habit.id);
              return (
                <motion.div
                  layout key={habit.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="doc-row group"
                  style={{ borderBottom: "1px solid var(--color-border)", borderRadius: 0, padding: "0.6rem 0.25rem" }}
                >
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className={cn("check-box flex-shrink-0", done && "checked")}
                  >
                    {done && <Check className="w-2.5 h-2.5 text-white" />}
                  </button>

                  <span className={cn("flex-1 text-sm transition-colors", done && "opacity-60")} style={{ color: "var(--color-text-primary)" }}>
                    {habit.title}
                  </span>

                  {streak > 0 && (
                    <span className="text-xs flex items-center gap-1 font-medium flex-shrink-0" style={{ color: "var(--color-warning)" }}>
                      <Flame className="w-3 h-3" /> {streak}
                    </span>
                  )}

                  <span className="text-xs px-2 py-0.5 rounded flex-shrink-0" style={{ background: "var(--color-overlay)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}>
                    {habit.frequency}
                  </span>

                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
