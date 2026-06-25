import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/shared/components/ui/dialog";
import { useNoteStore } from "../store/noteStore";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CreateNoteDialog = ({ children, triggerClassName }: { children?: React.ReactNode; triggerClassName?: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const addNote = useNoteStore((s) => s.addNote);
  const navigate = useNavigate();

  const reset = () => setTitle("");

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const note = await addNote({ title: title.trim(), content: "", tags: null, folder_id: null, icon: null });
      reset();
      setOpen(false);
      navigate(`/notes/${note.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger className={triggerClassName ?? "btn-primary"}>
        {children ?? (<><Plus className="w-3.5 h-3.5" /> New note</>)}
      </DialogTrigger>
      <DialogContent
        className="text-[var(--color-text-primary)] sm:max-w-[380px]"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">New note</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <label className="field-label">Title</label>
          <input
            className="field-input"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter className="bg-transparent border-t-0 -mx-0 -mb-0 p-0 pt-2 rounded-none">
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Create & open"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
