import { useState, useRef, useEffect, Component, type ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Settings, Trash2, AlertCircle, X } from "lucide-react";
import { useAIStore } from "../store/aiStore";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { Link, useNavigate } from "react-router-dom";

// ─── Local error boundary so a markdown crash never takes down the dashboard ──
class MarkdownBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
          (could not render message)
        </span>
      );
    }
    return this.props.children;
  }
}

// ─── Markdown components — v10 API uses standard HTML element props ────────────
const mdComponents = {
  // Block code: <pre><code className="language-js">…</code></pre>
  pre: ({ children }: { children?: ReactNode }) => (
    <pre
      className="text-xs p-2.5 rounded-lg mt-1.5 mb-1 overflow-x-auto"
      style={{ background: "var(--color-base)", border: "1px solid var(--color-border)", fontFamily: "var(--font-mono)" }}
    >
      {children}
    </pre>
  ),
  // Inline code: `foo` — no className set by remark
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    // Inside a pre block, remark-gfm sets className="language-*"
    // We just render the content plainly here; <pre> handles the block styling
    if (className) return <code style={{ fontFamily: "var(--font-mono)" }}>{children}</code>;
    return (
      <code
        className="text-xs px-1 py-0.5 rounded"
        style={{ background: "var(--color-border)", fontFamily: "var(--font-mono)" }}
      >
        {children}
      </code>
    );
  },
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2" style={{ color: "var(--color-accent)" }}>
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote
      className="pl-3 italic my-1"
      style={{ borderLeft: "3px solid var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ borderColor: "var(--color-border)", margin: "0.5rem 0" }} />,
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="text-sm font-bold mb-1 mt-2" style={{ color: "var(--color-text-primary)" }}>{children}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="text-sm font-semibold mb-1 mt-2" style={{ color: "var(--color-text-primary)" }}>{children}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="text-xs font-semibold mb-0.5 mt-1.5" style={{ color: "var(--color-text-primary)" }}>{children}</h3>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto my-1.5">
      <table className="text-xs w-full" style={{ borderCollapse: "collapse" }}>{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="text-left px-2 py-1 text-xs font-semibold" style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-2 py-1" style={{ borderBottom: "1px solid var(--color-border)" }}>{children}</td>
  ),
};

// ─── Main component ───────────────────────────────────────────────────────────
export const AIAssistant = () => {
  const { messages, sendMessage, cancelMessage, isLoading, clearHistory, error, settings } = useAIStore();
  const { addTask } = useTaskStore();
  const { addNote } = useNoteStore();
  const [input, setInput] = useState("");
  const [dismissedError, setDismissedError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const needsSetup = settings.provider !== "ollama" && !settings.apiKey;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, error]);

  useEffect(() => { setDismissedError(false); }, [error]);

  // ── System prompt ──────────────────────────────────────────────────────────
  const buildSystemPrompt = () =>
    `You are Omnia's AI assistant inside a personal productivity desktop app.

You can have conversations AND take actions. When a user asks you to create something or navigate, respond with a friendly message AND include an action block.

Action block format:
\`\`\`action
{"type":"create_task","title":"Buy groceries","priority":"medium"}
\`\`\`

\`\`\`action
{"type":"create_note","title":"Meeting notes","content":""}
\`\`\`

\`\`\`action
{"type":"navigate","path":"/tasks"}
\`\`\`

Action types: create_task, create_note, navigate
Task priorities: low, medium, high
Valid paths: /, /tasks, /notes, /calendar, /habits, /goals, /reminders, /settings

Rules:
- Always respond in markdown
- Keep responses concise and helpful
- When creating something, confirm it with a brief message like "Done! I've created that task for you."
- Never show the raw action block in your response — it's invisible to the user`;

  // ── Action executor ────────────────────────────────────────────────────────
  const executeAction = async (actionStr: string) => {
    try {
      const action = JSON.parse(actionStr.trim());
      switch (action.type) {
        case "create_task":
          await addTask({
            title: action.title || "New task",
            description: null,
            status: "todo",
            priority: ["low","medium","high"].includes(action.priority) ? action.priority : "medium",
            due_date: null,
          });
          break;
        case "create_note": {
          const note = await addNote({
            title: action.title || "New note",
            content: action.content || "",
            tags: null,
            folder_id: null,
            icon: null,
          });
          if (action.open) navigate(`/notes/${note.id}`);
          break;
        }
        case "navigate":
          if (action.path && action.path.startsWith("/")) navigate(action.path);
          break;
      }
    } catch (err) {
      console.error("[AI action] parse/execute failed:", err);
    }
  };

  const parseAndExecuteActions = (content: string) => {
    const re = /```action\n([\s\S]*?)\n```/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      executeAction(m[1]);
    }
  };

  // ── Watch for new assistant messages ──────────────────────────────────────
  const lastMsgRef = useRef<string>("");
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.content !== lastMsgRef.current) {
      lastMsgRef.current = last.content;
      parseAndExecuteActions(last.content);
    }
  }, [messages]); // eslint-disable-line

  // ── Send ───────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    const alreadyHasSystem = messages.some(m => m.role === "system");
    await sendMessage(text, alreadyHasSystem ? undefined : buildSystemPrompt());
  };

  // ── Render message (strip action blocks before passing to markdown) ────────
  const renderContent = (content: string) => {
    const cleaned = content.replace(/```action[\s\S]*?```/g, "").trim();
    if (!cleaned) return null;
    return (
      <MarkdownBoundary>
        <Markdown remarkPlugins={[remarkGfm]} components={mdComponents as any}>
          {cleaned}
        </Markdown>
      </MarkdownBoundary>
    );
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="widget flex flex-col" style={{ height: 440 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>Assistant</span>
          {settings.model && (
            <span
              className="text-[0.6rem] px-1.5 py-0.5 rounded font-medium max-w-[120px] truncate"
              style={{ background: "var(--color-overlay)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}
            >
              {settings.model.split("/").pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link to="/settings" className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: "var(--color-text-tertiary)" }}>
            <Settings className="w-3.5 h-3.5" />
          </Link>
          <button onClick={clearHistory} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: "var(--color-text-tertiary)" }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Empty states */}
        {messages.length === 0 && !needsSetup && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-2 py-8">
            <Sparkles className="w-7 h-7 mb-1" style={{ color: "var(--color-text-tertiary)", opacity: 0.25 }} />
            <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              What can I help with?
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Ask questions or give commands — "add a task to call the dentist" or "create a note about today's meeting".
            </p>
          </div>
        )}

        {messages.length === 0 && needsSetup && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-3 py-8">
            <Sparkles className="w-7 h-7" style={{ color: "var(--color-text-tertiary)", opacity: 0.25 }} />
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Connect an AI provider to get started.
            </p>
            <Link
              to="/settings"
              className="btn-primary"
              style={{ fontSize: "0.75rem", padding: "0.3rem 0.875rem" }}
            >
              Open Settings
            </Link>
          </div>
        )}

        {/* Message bubbles — filter system messages from display */}
        {messages
          .filter((m) => m.role !== "system")
          .map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="px-3 py-2 rounded-2xl text-xs max-w-[90%] min-w-0"
                style={
                  msg.role === "user"
                    ? { background: "var(--color-accent)", color: "#fff", lineHeight: 1.5 }
                    : { background: "var(--color-overlay)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", lineHeight: 1.6 }
                }
              >
                {msg.role === "user"
                  ? msg.content
                  : renderContent(msg.content)}
              </div>
            </div>
          ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-2xl flex items-center gap-1.5"
              style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-tertiary)", animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-tertiary)", animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--color-text-tertiary)", animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Error */}
        {error && !dismissedError && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(248,113,113,0.08)", color: "var(--color-danger)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
            <button onClick={() => setDismissedError(true)} className="flex-shrink-0 mt-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="flex items-end gap-2 px-3 py-2.5"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <textarea
          rows={1}
          placeholder={needsSetup ? "Set up AI in Settings first…" : "Message… (Enter to send, Shift+Enter for newline)"}
          disabled={needsSetup}
          className="flex-1 text-xs bg-transparent outline-none resize-none leading-relaxed"
          style={{
            color: "var(--color-text-primary)",
            opacity: needsSetup ? 0.5 : 1,
            minHeight: "1.25rem",
            maxHeight: "4rem",
          }}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-grow
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 64) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        {isLoading ? (
          <button
            onClick={cancelMessage}
            className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
            style={{ background: "rgba(248,113,113,0.12)", color: "var(--color-danger)" }}
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || needsSetup}
            className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
            style={{
              background: input.trim() && !needsSetup ? "var(--color-accent)" : "transparent",
              color: input.trim() && !needsSetup ? "#fff" : "var(--color-text-tertiary)",
            }}
            title="Send (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
