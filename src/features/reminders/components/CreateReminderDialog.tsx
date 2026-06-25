import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/shared/components/ui/dialog";
import { useReminderStore } from "../store/reminderStore";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export const CreateReminderDialog = ({ children, triggerClassName }: { children?: React.ReactNode; triggerClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [submitting, setSubmitting] = useState(false);
  const addReminder = useReminderStore((s) => s.addReminder);

  const reset = () => { setTitle(""); setDueDate(format(new Date(), "yyyy-MM-dd'T'HH:mm")); };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addReminder({ title: title.trim(), due_date: new Date(dueDate).toISOString() });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New reminder</>)}
      </DialogTrigger>
      <DialogContent className="text-[var(--color-text-primary)] sm:max-w-[380px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New reminder</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input className="field-input" placeholder="e.g., Call the doctor" value={title}
              onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          </div>
          <div>
            <label className="field-label">Due</label>
            <input className="field-input" type="datetime-local" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Create reminder"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
