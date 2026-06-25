import { useEffect, useState } from "react";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import { Trash2, Plus, CheckSquare } from "lucide-react";
import { Task } from "../types/task";

const FILTERS = ["All", "Todo", "Done"] as const;
type Filter = typeof FILTERS[number];

export const TasksPage = () => {
  const { tasks, isLoading, fetchTasks, toggleTask, removeTask } = useTaskStore();
  const [filter, setFilter] = useState<Filter>("All");

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const visible = tasks.filter((t) => {
    if (filter === "Todo") return t.status !== "done";
    if (filter === "Done") return t.status === "done";
    return true;
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          {tasks.length > 0 && (
            <p className="page-subtitle">
              {doneCount} of {tasks.length} completed
            </p>
          )}
        </div>
        <CreateTaskDialog />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded text-xs font-medium transition-all",
              filter === f
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
            style={filter === f ? { background: "var(--color-overlay)", border: "1px solid var(--color-border)" } : {}}
          >
            {f}
            {f === "Todo" && tasks.filter((t) => t.status !== "done").length > 0 && (
              <span className="ml-1.5 text-[0.65rem] px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
                {tasks.filter((t) => t.status !== "done").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading && tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Loading…</div>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <CheckSquare className="empty-state-icon" />
          <div className="empty-state-title">
            {filter === "Done" ? "Nothing completed yet" : "No tasks"}
          </div>
          <div className="empty-state-desc">
            {filter === "All" ? "Add a task to get started." : ""}
          </div>
          {filter === "All" && (
            <CreateTaskDialog triggerClassName="btn-primary mt-2">
              <Plus className="w-3.5 h-3.5" /> Add task
            </CreateTaskDialog>
          )}
        </div>
      ) : (
        <div>
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

const TaskRow = ({
  task,
  onToggle,
  onRemove,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.15 }}
    className="doc-row group"
    style={{ borderBottom: "1px solid var(--color-border)", borderRadius: 0, padding: "0.5rem 0.25rem" }}
  >
    <button
      onClick={() => onToggle(task.id)}
      className={cn("check-box", task.status === "done" ? "checked" : "")}
    >
      {task.status === "done" && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>

    <span
      className={cn("flex-1 text-sm transition-colors duration-150", task.status === "done" && "line-through")}
      style={{ color: task.status === "done" ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
    >
      {task.title}
    </span>

    <span className={cn("priority-chip", `priority-${task.priority}`)}>
      {task.priority}
    </span>

    <button
      onClick={() => onRemove(task.id)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
    </button>
  </motion.div>
);
