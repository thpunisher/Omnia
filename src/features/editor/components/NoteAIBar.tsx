import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, FileText, Wand2, PenLine, X } from "lucide-react";
import { useAIStore } from "@/features/ai/store/aiStore";
import DOMPurify from "dompurify";

interface NoteAIBarProps {
  title: string;
  htmlContent: string;
  /** Appends generated HTML to the note body. */
  onInsert: (html: string) => void;
}

type Action = "summarize" | "improve" | "continue" | "fix-grammar";

const ACTIONS: { id: Action; label: string; icon: React.ElementType; prompt: string }[] = [
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    prompt: "Summarize the following note in 2-3 concise sentences. Return plain text only, no preamble.",
  },
  {
    id: "improve",
    label: "Improve writing",
    icon: Wand2,
    prompt: "Rewrite the following note to be clearer and more polished, keeping the same meaning and length roughly the same. Return only the rewritten text as plain HTML paragraphs, no preamble or explanation.",
  },
  {
    id: "continue",
    label: "Continue writing",
    icon: PenLine,
    prompt: "Continue writing this note naturally for one or two more paragraphs, matching its tone and topic. Return only the new continuation as plain HTML paragraphs, no preamble.",
  },
  {
    id: "fix-grammar",
    label: "Fix spelling & grammar",
    icon: Sparkles,
    prompt: "Fix any spelling and grammar mistakes in the following note, making minimal other changes. Return only the corrected text as plain HTML paragraphs, no preamble.",
  },
];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const NoteAIBar = ({ title, htmlContent, onInsert }: NoteAIBarProps) => {
  const { ask, settings } = useAIStore();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState<Action | null>(null);
  const [result, setResult] = useState<{ action: Action; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plainText = stripHtml(htmlContent);
  const hasContent = plainText.length > 0;

  const run = async (action: typeof ACTIONS[number]) => {
    setOpen(false);
    setError(null);
    setRunning(action.id);
    setResult(null);
    try {
      const input = `Title: ${title || "Untitled"}\n\nContent:\n${plainText || "(empty note)"}`;
      const output = await ask(action.prompt, input);
      setResult({ action: action.id, text: output });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(null);
    }
  };

  const insertResult = () => {
    if (!result) return;
    const isHtmlAction = result.action === "improve" || result.action === "continue" || result.action === "fix-grammar";
    const raw = isHtmlAction
      ? (result.action === "continue" ? result.text : `<p>${result.text.replace(/\n\n+/g, "</p><p>")}</p>`)
      : `<p><em>${result.text}</em></p>`;
    // Sanitize before inserting — AI output could theoretically contain
    // XSS payloads (e.g. <img onerror=...>) that get stored and replayed.
    const html = DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    onInsert(html);
    setResult(null);
  };

  if (!settings.apiKey && settings.provider !== "ollama") {
    return null; // Don't clutter the editor with an AI bar that can't work yet.
  }

  return (
    <div className="relative mb-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            disabled={!hasContent || running !== null}
            className="btn-ghost-sm"
            style={{ opacity: !hasContent ? 0.4 : 1 }}
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {running ? ACTIONS.find((a) => a.id === running)?.label : "Ask AI"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {open && (
            <div
              className="absolute z-10 mt-1 w-56 rounded-lg overflow-hidden shadow-2xl py-1"
              style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}
            >
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => run(action)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-white/5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "var(--color-text-tertiary)" }} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {!hasContent && (
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Write something first
          </span>
        )}
      </div>

      {error && (
        <div
          className="mt-2 text-xs px-3 py-2 rounded-lg flex items-center justify-between"
          style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-danger)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          {error}
          <button onClick={() => setError(null)}><X className="w-3 h-3" /></button>
        </div>
      )}

      {result && (
        <div
          className="mt-2 p-3 rounded-lg"
          style={{ background: "var(--color-accent-dim)", border: "1px solid var(--color-accent)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
              <Sparkles className="w-3 h-3" /> {ACTIONS.find((a) => a.id === result.action)?.label}
            </span>
            <button onClick={() => setResult(null)} style={{ color: "var(--color-text-tertiary)" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm whitespace-pre-wrap mb-3" style={{ color: "var(--color-text-primary)" }}>
            {result.text}
          </p>
          <div className="flex gap-2">
            <button onClick={insertResult} className="btn-primary" style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}>
              Insert into note
            </button>
            <button onClick={() => setResult(null)} className="btn-ghost" style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
