import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/shared/components/ui/dialog";
import { useCalendarStore } from "../store/calendarStore";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface CreateEventDialogProps {
  children?: React.ReactNode;
  triggerClassName?: string;
  /** Pre-fill the date when created from clicking a specific calendar day. */
  defaultDate?: Date;
}

export const CreateEventDialog = ({ children, triggerClassName, defaultDate }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => format(defaultDate ?? new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const addEvent = useCalendarStore((s) => s.addEvent);

  const reset = () => {
    setTitle("");
    setDate(format(defaultDate ?? new Date(), "yyyy-MM-dd'T'HH:mm"));
    setLocation("");
  };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addEvent({
        title: title.trim(),
        start_date: new Date(date).toISOString(),
        end_date: null,
        location: location.trim() || null,
        description: null,
      });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setDate(format(defaultDate ?? new Date(), "yyyy-MM-dd'T'HH:mm"));
        if (!v) reset();
      }}
    >
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New event</>)}
      </DialogTrigger>
      <DialogContent className="text-[var(--color-text-primary)] sm:max-w-[380px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New event</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="field-label">Title</label>
            <input className="field-input" placeholder="e.g., Team standup" value={title}
              onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} autoFocus />
          </div>
          <div>
            <label className="field-label">When</label>
            <input className="field-input" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Location <span style={{ color: "var(--color-text-tertiary)" }}>(optional)</span></label>
            <input className="field-input" placeholder="e.g., Conference room" value={location}
              onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Create event"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
