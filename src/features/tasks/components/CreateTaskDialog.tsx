import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/shared/components/ui/dialog";
import { useTaskStore } from "../store/taskStore";
import { Plus } from "lucide-react";
import { TaskPriority } from "../types/task";
import { cn } from "@/shared/lib/utils";

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
];

export const CreateTaskDialog = ({ children, triggerClassName }: { children?: React.ReactNode; triggerClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const addTask = useTaskStore((s) => s.addTask);

  const reset = () => { setTitle(""); setPriority("medium"); };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addTask({ title: title.trim(), description: null, status: "todo", priority, due_date: null });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New task</>)}
      </DialogTrigger>
      <DialogContent
        className="text-[var(--color-text-primary)] sm:max-w-[400px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New task</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input
              className="field-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="field-label">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 py-1.5 rounded text-xs font-medium transition-all priority-chip",
                    `priority-${p.value}`,
                    priority === p.value
                      ? "ring-1 ring-current"
                      : "opacity-40 hover:opacity-70"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Create task"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
