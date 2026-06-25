import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/shared/components/ui/dialog";
import { useHabitStore } from "../store/habitStore";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const FREQUENCIES = ["daily", "weekly", "monthly"] as const;
type Freq = typeof FREQUENCIES[number];

export const CreateHabitDialog = ({ children, triggerClassName }: { children?: React.ReactNode; triggerClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<Freq>("daily");
  const [submitting, setSubmitting] = useState(false);
  const addHabit = useHabitStore((s) => s.addHabit);

  const reset = () => { setTitle(""); setFrequency("daily"); };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addHabit({ title: title.trim(), frequency });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New habit</>)}
      </DialogTrigger>
      <DialogContent className="text-[var(--color-text-primary)] sm:max-w-[380px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New habit</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="field-label">Habit</label>
            <input className="field-input" placeholder="e.g., Morning meditation" value={title}
              onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          </div>
          <div>
            <label className="field-label">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map((f) => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={cn("flex-1 py-1.5 rounded text-xs font-medium transition-all capitalize",
                    frequency === f
                      ? "text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]")}
                  style={frequency === f ? { background: "var(--color-overlay)", border: "1px solid var(--color-accent)" } : { border: "1px solid var(--color-border)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Add habit"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
