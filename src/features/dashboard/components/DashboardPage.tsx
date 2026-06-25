import { useEffect } from "react";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { useGoalStore } from "@/features/goals/store/goalStore";
import { CreateTaskDialog } from "@/features/tasks/components/CreateTaskDialog";
import { CreateNoteDialog } from "@/features/notes/components/CreateNoteDialog";
import { AIAssistant } from "@/features/ai/components/AIAssistant";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn, safeFormat } from "@/shared/lib/utils";
import { format } from "date-fns";
import { Plus, ArrowRight, FileText } from "lucide-react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const DashboardPage = () => {
  const { tasks, fetchTasks, toggleTask } = useTaskStore();
  const { notes, fetchRecentNotes } = useNoteStore();
  const { goals, fetchGoals } = useGoalStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchRecentNotes();
    fetchGoals();
  }, [fetchTasks, fetchRecentNotes, fetchGoals]);

  const activeTasks = tasks.filter((t) => t.status !== "done");
  const completedToday = tasks.filter((t) => t.status === "done").length;
  const today = new Date();

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-10 pb-16">
      {/* Hero greeting */}
      <motion.div variants={fadeUp}>
        <p className="text-sm mb-1" style={{ color: "var(--color-text-tertiary)" }}>
          {format(today, "EEEE, MMMM d")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
          {greeting()}
        </h1>
      </motion.div>

      {/* Stat strip */}
      <motion.div variants={fadeUp} className="flex gap-6">
        {[
          { label: "Tasks left",    value: activeTasks.length },
          { label: "Done today",    value: completedToday },
          { label: "Notes",         value: notes.length },
          { label: "Active goals",  value: goals.filter((g) => g.status === "active").length },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
              {value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              {label}
            </div>
          </div>
        ))}
      </motion.div>

      <div
        className="w-full h-px"
        style={{ background: "var(--color-border)" }}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_340px] gap-10">
        {/* Left — tasks + notes */}
        <div className="space-y-8">
          {/* Tasks */}
          <motion.section variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <span className="section-label" style={{ margin: 0 }}>Today's tasks</span>
              <div className="flex items-center gap-2">
                <Link to="/tasks" className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
                <CreateTaskDialog triggerClassName="btn-ghost-sm">
                  <Plus className="w-3 h-3" /> Add
                </CreateTaskDialog>
              </div>
            </div>
            <div className="space-y-0.5">
              {activeTasks.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                  <div className="empty-state-title">All clear</div>
                  <div className="empty-state-desc">No tasks left for today.</div>
                </div>
              ) : (
                activeTasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="doc-row group">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={cn("check-box flex-shrink-0", task.status === "done" ? "checked" : "")}
                    >
                      {task.status === "done" && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <span className="flex-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {task.title}
                    </span>
                    {task.priority === "high" && (
                      <span className="priority-chip priority-high">High</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.section>

          {/* Notes */}
          <motion.section variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <span className="section-label" style={{ margin: 0 }}>Recent notes</span>
              <div className="flex items-center gap-2">
                <Link to="/notes" className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
                <CreateNoteDialog triggerClassName="btn-ghost-sm">
                  <Plus className="w-3 h-3" /> New
                </CreateNoteDialog>
              </div>
            </div>
            <div className="space-y-0.5">
              {notes.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                  <div className="empty-state-title">No notes yet</div>
                  <div className="empty-state-desc">Create your first note to get started.</div>
                </div>
              ) : (
                notes.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    className="doc-row clickable group"
                    onClick={() => navigate(`/notes/${note.id}`)}
                  >
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
                    <span className="flex-1 text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
                      {note.title}
                    </span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-text-tertiary)" }}>
                      {safeFormat(note.updated_at, "MMM d", "—")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* Right — goals + AI */}
        <div className="space-y-6">
          {/* Goals */}
          <motion.section variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <span className="section-label" style={{ margin: 0 }}>Goals</span>
              <Link to="/goals" className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-sm" style={{ color: "var(--color-text-tertiary)", padding: "0.5rem" }}>
                  No active goals.
                </div>
              ) : (
                goals.slice(0, 3).map((goal) => {
                  const pct = Math.min(100, Math.round((goal.progress / goal.target) * 100));
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm truncate pr-2" style={{ color: "var(--color-text-primary)" }}>
                          {goal.title}
                        </span>
                        <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--color-accent)" }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.section>

          {/* AI Assistant */}
          <motion.section variants={fadeUp}>
            <AIAssistant />
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
};
