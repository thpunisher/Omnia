import { useEffect } from "react";
import { Target, Trash2, Plus } from "lucide-react";
import { useGoalStore } from "@/features/goals/store/goalStore";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { motion, AnimatePresence } from "framer-motion";

export const GoalsPage = () => {
  const { goals, isLoading, fetchGoals, updateGoalProgress, removeGoal } = useGoalStore();

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">Set targets, track progress.</p>
        </div>
        <CreateGoalDialog />
      </div>

      {isLoading && goals.length === 0 ? (
        <div className="empty-state"><div className="empty-state-title">Loading…</div></div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <Target className="empty-state-icon" />
          <div className="empty-state-title">No goals yet</div>
          <div className="empty-state-desc">Define what you're working toward and track your progress.</div>
          <CreateGoalDialog triggerClassName="btn-primary mt-2">
            <Plus className="w-3.5 h-3.5" /> Add goal
          </CreateGoalDialog>
        </div>
      ) : (
        <div className="space-y-px">
          <AnimatePresence mode="popLayout" initial={false}>
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
              const done = pct >= 100;
              return (
                <motion.div
                  layout key={goal.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="group py-4"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {goal.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {!done && (
                        <>
                          <button onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 1))}
                            className="btn-ghost text-xs" style={{ padding: "0.15rem 0.5rem" }} disabled={goal.progress === 0}>−1</button>
                          <button onClick={() => updateGoalProgress(goal.id, goal.progress + 1)}
                            className="btn-ghost text-xs" style={{ padding: "0.15rem 0.5rem" }}>+1</button>
                          <button onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                            className="btn-ghost text-xs" style={{ padding: "0.15rem 0.5rem" }}>+10</button>
                        </>
                      )}
                      {done && (
                        <>
                          <span className="text-xs font-medium" style={{ color: "var(--color-success)" }}>Complete ✓</span>
                          <button onClick={() => updateGoalProgress(goal.id, goal.progress - 1)}
                            className="btn-ghost text-xs" style={{ padding: "0.15rem 0.5rem" }}>Reopen</button>
                        </>
                      )}
                      <button onClick={() => removeGoal(goal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ color: "var(--color-text-tertiary)" }}>
                        <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 progress-track">
                      <motion.div className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%`, background: done ? "var(--color-success)" : "var(--color-accent)" }}
                        transition={{ duration: 0.5, ease: "easeOut" }} />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right flex-shrink-0"
                      style={{ color: done ? "var(--color-success)" : "var(--color-text-secondary)" }}>
                      {pct}%
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};
