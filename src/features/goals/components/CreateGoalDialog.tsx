import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/shared/components/ui/dialog";
import { useGoalStore } from "../store/goalStore";
import { Plus } from "lucide-react";

export const CreateGoalDialog = ({ children, triggerClassName }: { children?: React.ReactNode; triggerClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const addGoal = useGoalStore((s) => s.addGoal);

  const reset = () => { setTitle(""); setTarget("100"); };

  const parsedTarget = parseInt(target, 10);
  const targetValid = Number.isFinite(parsedTarget) && parsedTarget > 0;

  const handleCreate = async () => {
    if (!title.trim() || !targetValid || submitting) return;
    setSubmitting(true);
    try {
      await addGoal({ title: title.trim(), progress: 0, target: parsedTarget, status: "active" });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New goal</>)}
      </DialogTrigger>
      <DialogContent className="text-[var(--color-text-primary)] sm:max-w-[380px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New goal</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="field-label">Goal</label>
            <input className="field-input" placeholder="e.g., Read 10 books" value={title}
              onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="field-label">Target value</label>
            <input className="field-input" type="number" min="1" placeholder="100" value={target}
              onChange={(e) => setTarget(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
            {target.length > 0 && !targetValid && (
              <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>Enter a number greater than 0.</p>
            )}
          </div>
        </div>
        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || !targetValid || submitting}>
            {submitting ? "Creating…" : "Create goal"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
