import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { EditorCanvas } from "@/features/editor/components/EditorCanvas";
import { NoteAIBar } from "@/features/editor/components/NoteAIBar";
import { ArrowLeft, Check, Folder, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { safeFormat } from "@/shared/lib/utils";

type SaveState = "idle" | "saving" | "saved";

const ICONS = ["📄","📝","💡","🔖","🗒️","📊","🎯","💭","⭐","🔥","📌","🌟","🎨","🚀","💎","🏆","📚","🔬","🎵","🌈"];

export const NoteEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, folders, updateNote } = useNoteStore();

  const note = notes.find((n) => n.id === id);
  const [title, setTitle] = useState(note?.title ?? "");
  const [htmlContent, setHtmlContent] = useState(note?.content ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!note) return;
    setTitle(note.title);
    setHtmlContent(note.content ?? "");
  }, [note?.id]); // eslint-disable-line

  const save = useCallback(async (t: string, c: string) => {
    if (!id) return;
    setSaveState("saving");
    try {
      await updateNote(id, { title: t, content: c });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch { setSaveState("idle"); }
  }, [id, updateNote]);

  const schedule = useCallback((t: string, c: string) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(t, c), 1200);
  }, [save]);

  const onTitleChange = (v: string) => { setTitle(v); schedule(v, htmlContent); };
  const onContentChange = (html: string) => { setHtmlContent(html); schedule(title, html); };
  const onIconChange = async (icon: string) => {
    setShowIconPicker(false);
    if (!id) return;
    await updateNote(id, { icon });
  };
  const onMoveToFolder = async (folderId: string | null) => {
    if (!id) return;
    setShowMoreMenu(false);
    await updateNote(id, { folder_id: folderId });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        clearTimeout(saveTimer.current);
        save(title, htmlContent);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [save, title, htmlContent]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (!note) return (
    <div className="empty-state">
      <div className="empty-state-title">Note not found</div>
      <button className="btn-ghost mt-2" onClick={() => navigate("/notes")}>← Back to notes</button>
    </div>
  );

  const currentFolder = folders.find((f) => f.id === note.folder_id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/notes")} className="btn-ghost" style={{ fontSize: "0.8125rem" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Notes
          </button>
          {currentFolder && (
            <>
              <span style={{ color: "var(--color-text-tertiary)" }}>/</span>
              <span className="text-sm flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
                <Folder className="w-3.5 h-3.5" /> {currentFolder.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {saveState === "saving" ? "Saving…" : saveState === "saved"
              ? <span className="flex items-center gap-1 text-green-400"><Check className="w-3 h-3" /> Saved</span>
              : `Edited ${safeFormat(note.updated_at, "MMM d, h:mm a", "just now")}`}
          </span>

          {/* Move to folder menu */}
          <div className="relative">
            <button onClick={() => setShowMoreMenu((v) => !v)} className="btn-ghost p-1.5">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMoreMenu && (
              <div
                className="absolute right-0 top-8 z-20 w-48 rounded-xl py-1 shadow-2xl"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="px-3 py-1.5 text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
                  Move to folder
                </div>
                <button
                  onClick={() => onMoveToFolder(null)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5"
                  style={{ color: note.folder_id === null ? "var(--color-accent)" : "var(--color-text-primary)" }}
                >
                  📄 No folder
                </button>
                {folders.map((f) => (
                  <button key={f.id}
                    onClick={() => onMoveToFolder(f.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/5"
                    style={{ color: note.folder_id === f.id ? "var(--color-accent)" : "var(--color-text-primary)" }}
                  >
                    <Folder className="w-3.5 h-3.5" /> {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Icon + Title */}
      <div className="mb-6">
        <div className="relative inline-block mb-2">
          <button
            onClick={() => setShowIconPicker((v) => !v)}
            className="text-4xl hover:opacity-80 transition-opacity"
            title="Change icon"
          >
            {note.icon ?? "📄"}
          </button>
          {showIconPicker && (
            <div
              className="absolute left-0 top-12 z-20 p-3 rounded-xl shadow-2xl"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", width: 280 }}
            >
              <div className="grid grid-cols-8 gap-1.5">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => onIconChange(icon)}
                    className="text-xl p-1.5 rounded hover:bg-white/10 transition-colors"
                    style={{ background: note.icon === icon ? "var(--color-accent-dim)" : "transparent" }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none"
          style={{
            fontSize: "2rem", fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--color-text-primary)",
            display: "block",
          }}
          placeholder="Untitled"
        />
      </div>

      <NoteAIBar title={title} htmlContent={htmlContent} onInsert={(html) => setHtmlContent((p) => p + html)} />

      <div className="tiptap-editor mt-4">
        <EditorCanvas key={note.id} initialContent={note.content} onChange={onContentChange} />
      </div>
    </motion.div>
  );
};
