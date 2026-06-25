import { useEffect, useState } from "react";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { safeFormat } from "@/shared/lib/utils";
import {
  FileText, FolderOpen, Folder, Plus, Trash2,
  ChevronRight, ChevronDown, Edit2,
} from "lucide-react";

export const NotesPage = () => {
  const {
    notes, folders, activeFolderId, isLoading,
    fetchAllNotes, setActiveFolder,
    addNote, removeNote,
    addFolder, renameFolder, removeFolder,
  } = useNoteStore();
  const navigate = useNavigate();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  useEffect(() => { fetchAllNotes(); }, [fetchAllNotes]);

  const visibleNotes = activeFolderId === null
    ? notes
    : notes.filter((n) => n.folder_id === activeFolderId);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateNote = async () => {
    const note = await addNote({
      title: "Untitled",
      content: "",
      tags: null,
      folder_id: activeFolderId,
      icon: null,
    });
    navigate(`/notes/${note.id}`);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await addFolder({ name: newFolderName.trim(), parent_id: null });
    setNewFolderName("");
    setShowNewFolder(false);
  };

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameValue(current);
  };

  const commitRename = async (id: string) => {
    if (renameValue.trim()) await renameFolder(id, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn-primary" onClick={handleCreateNote}>
          <Plus className="w-3.5 h-3.5" /> New note
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          {/* All Notes */}
          <button
            onClick={() => setActiveFolder(null)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-colors mb-1"
            style={{
              background: activeFolderId === null ? "var(--color-accent-dim)" : "transparent",
              color: activeFolderId === null ? "var(--color-accent)" : "var(--color-text-secondary)",
            }}
          >
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left font-medium">All Notes</span>
            <span className="text-xs opacity-60">{notes.length}</span>
          </button>

          {/* Folder tree */}
          <div className="section-label mt-3" style={{ paddingLeft: "0.5rem" }}>Folders</div>
          <AnimatePresence initial={false}>
            {folders.map((folder) => {
              const isExpanded = expandedFolders.has(folder.id);
              const isActive = activeFolderId === folder.id;
              const count = notes.filter((n) => n.folder_id === folder.id).length;
              return (
                <motion.div key={folder.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div
                    className="group flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-sm transition-colors"
                    style={{
                      background: isActive ? "var(--color-accent-dim)" : "transparent",
                      color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                    }}
                  >
                    <button onClick={() => toggleFolder(folder.id)} className="flex-shrink-0 p-0.5">
                      {isExpanded
                        ? <ChevronDown className="w-3 h-3" />
                        : <ChevronRight className="w-3 h-3" />}
                    </button>
                    <button
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      onClick={() => { setActiveFolder(folder.id); setExpandedFolders(p => new Set([...p, folder.id])); }}
                    >
                      {isExpanded
                        ? <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                        : <Folder className="w-3.5 h-3.5 flex-shrink-0" />}
                      {renamingId === folder.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(folder.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") commitRename(folder.id); if (e.key === "Escape") setRenamingId(null); }}
                          className="flex-1 min-w-0 text-sm bg-transparent outline-none border-b"
                          style={{ borderColor: "var(--color-accent)", color: "var(--color-text-primary)" }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-1 text-left truncate font-medium">{folder.name}</span>
                      )}
                    </button>
                    <span className="text-xs opacity-50 flex-shrink-0">{count}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startRename(folder.id, folder.name)} className="p-0.5 rounded hover:bg-white/10">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFolder(folder.id)} className="p-0.5 rounded hover:bg-red-500/20" style={{ color: "var(--color-danger)" }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* New folder input */}
          {showNewFolder ? (
            <div className="px-2 mt-1">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                onBlur={() => { if (!newFolderName.trim()) setShowNewFolder(false); }}
                placeholder="Folder name"
                className="field-input text-xs w-full"
                style={{ padding: "0.3rem 0.5rem" }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-xs transition-colors mt-1"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Plus className="w-3 h-3" /> New folder
            </button>
          )}
        </aside>

        {/* Notes list */}
        <div className="flex-1 min-w-0">
          {isLoading && visibleNotes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-title">Loading…</div></div>
          ) : visibleNotes.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-state-icon" />
              <div className="empty-state-title">
                {activeFolderId ? "No notes in this folder" : "No notes yet"}
              </div>
              <div className="empty-state-desc">
                Create your first note to get started.
              </div>
              <button className="btn-primary mt-3" onClick={handleCreateNote}>
                <Plus className="w-3.5 h-3.5" /> New note
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleNotes.map((note) => (
                <motion.div
                  layout key={note.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="doc-row clickable group"
                  style={{ borderBottom: "1px solid var(--color-border)", borderRadius: 0, padding: "0.65rem 0.25rem" }}
                >
                  <span className="text-base flex-shrink-0">{note.icon ?? "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                      {note.title || "Untitled"}
                    </div>
                    {note.content && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-tertiary)" }}>
                        {note.content.replace(/<[^>]*>/g, " ").trim().slice(0, 80)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-text-tertiary)" }}>
                      {safeFormat(note.updated_at, "MMM d", "—")}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNote(note.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};
