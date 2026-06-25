import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, Loader2, Settings, Trash2, AlertCircle, X } from "lucide-react";
import { useAIStore } from "../store/aiStore";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { Link, useNavigate } from "react-router-dom";

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

  const buildSystemPrompt = () => `You are Omnia's AI assistant, embedded in a personal productivity app. You can:
- Answer questions and have conversations
- Help with tasks, notes, goals, habits, reminders
- Take ACTIONS when asked by responding with special JSON commands

When the user asks you to CREATE something, respond with BOTH a friendly message AND an action block.
Action block format (include this literally in your response):
\`\`\`action
{"type":"create_task","title":"Task title here","priority":"medium"}
\`\`\`
or:
\`\`\`action
{"type":"create_note","title":"Note title here","content":"Optional initial content"}
\`\`\`
or:
\`\`\`action
{"type":"navigate","path":"/tasks"}
\`\`\`

Available action types: create_task, create_note, navigate
Priorities for tasks: low, medium, high
Navigate paths: /, /tasks, /notes, /calendar, /habits, /goals, /reminders, /settings

Always be concise, helpful, and respond in markdown format.`;

  const executeAction = async (actionStr: string) => {
    try {
      const action = JSON.parse(actionStr);
      switch (action.type) {
        case "create_task":
          await addTask({
            title: action.title || "New task",
            description: null,
            status: "todo",
            priority: action.priority || "medium",
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
          if (action.navigate) navigate(`/notes/${note.id}`);
          break;
        }
        case "navigate":
          navigate(action.path || "/");
          break;
      }
    } catch (err) {
      console.error("AI action failed:", err);
    }
  };

  const parseAndExecuteActions = (content: string) => {
    const actionRegex = /```action\n([\s\S]*?)\n```/g;
    let match;
    while ((match = actionRegex.exec(content)) !== null) {
      executeAction(match[1].trim());
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    // Inject system prompt context once per conversation
    const systemInjected = messages.some(m => m.role === "system");
    if (!systemInjected) {
      await sendMessage(text, buildSystemPrompt());
    } else {
      await sendMessage(text);
    }
  };

  // Watch for new assistant messages and execute any actions in them
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant") {
      parseAndExecuteActions(lastMsg.content);
    }
  }, [messages]); // eslint-disable-line

  const renderMessage = (content: string) => {
    // Hide action blocks from the rendered output
    const cleaned = content.replace(/```action\n[\s\S]*?\n```/g, "").trim();
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            return isBlock ? (
              <pre className="text-xs p-2 rounded mt-1 overflow-x-auto" style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}>
                <code>{children}</code>
              </pre>
            ) : (
              <code className="text-xs px-1 rounded" style={{ background: "var(--color-overlay)" }}>{children}</code>
            );
          },
          ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} className="underline" style={{ color: "var(--color-accent)" }}>{children}</a>
          ),
        }}
      >
        {cleaned}
      </ReactMarkdown>
    );
  };

  return (
    <div className="widget flex flex-col" style={{ height: 420 }}>
      <div className="flex items-center justify-between px-3.5 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-primary)" }}>Assistant</span>
          {settings.model && (
            <span className="text-[0.625rem] px-1.5 py-0.5 rounded" style={{ background: "var(--color-overlay)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}>
              {settings.model.split("/").pop()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link to="/settings?tab=ai" className="p-1 rounded hover:bg-white/5" style={{ color: "var(--color-text-tertiary)" }}>
            <Settings className="w-3.5 h-3.5" />
          </Link>
          <button onClick={clearHistory} className="p-1 rounded hover:bg-white/5" style={{ color: "var(--color-text-tertiary)" }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
        {messages.length === 0 && !needsSetup && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-2">
            <Sparkles className="w-6 h-6" style={{ color: "var(--color-text-tertiary)", opacity: 0.3 }} />
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Ask me anything. I can also take actions — try "add a task to buy groceries" or "create a note about my project".
            </p>
          </div>
        )}

        {messages.length === 0 && needsSetup && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-3">
            <Sparkles className="w-6 h-6" style={{ color: "var(--color-text-tertiary)", opacity: 0.3 }} />
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Connect an AI provider to start chatting.
            </p>
            <Link to="/settings?tab=ai" className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}>
              Set up in Settings
            </Link>
          </div>
        )}

        {messages.filter(m => m.role !== "system").map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="px-3 py-2 rounded-xl text-xs max-w-[88%] leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "var(--color-accent)", color: "#fff" }
                  : { background: "var(--color-overlay)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }
              }
            >
              {msg.role === "user" ? msg.content : renderMessage(msg.content)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Thinking…</span>
          </div>
        )}

        {error && !dismissedError && (
          <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs"
            style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-danger)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
            <button onClick={() => setDismissedError(true)}><X className="w-3 h-3" /></button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: "1px solid var(--color-border)" }}>
        <input
          placeholder={needsSetup ? "Set up AI in Settings first…" : "Ask or give a command…"}
          disabled={needsSetup}
          className="flex-1 text-xs bg-transparent outline-none"
          style={{ color: "var(--color-text-primary)", opacity: needsSetup ? 0.5 : 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
        />
        {isLoading ? (
          <button onClick={cancelMessage} className="p-1.5 rounded flex-shrink-0"
            style={{ background: "rgba(248,113,113,0.15)", color: "var(--color-danger)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button onClick={handleSend} disabled={!input.trim() || needsSetup}
            className="p-1.5 rounded flex-shrink-0 transition-colors"
            style={{ background: !input.trim() || needsSetup ? "transparent" : "var(--color-accent)", color: !input.trim() || needsSetup ? "var(--color-text-tertiary)" : "#fff" }}>
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
