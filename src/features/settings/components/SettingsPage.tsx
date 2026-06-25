import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAIStore } from "@/features/ai/store/aiStore";
import { useThemeStore } from "@/shared/store/themeStore";
import { AIProvider } from "@/features/ai/types/ai";
import { cn } from "@/shared/lib/utils";
import {
  User, Sparkles, Palette, Database, LogOut, Check,
  RefreshCw, ChevronDown, Eye, EyeOff, Key, Globe, Loader2,
} from "lucide-react";

type Tab = "account" | "appearance" | "ai" | "data";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "account",    label: "Account",    icon: User     },
  { id: "appearance", label: "Appearance", icon: Palette  },
  { id: "ai",         label: "AI",         icon: Sparkles },
  { id: "data",       label: "Data",       icon: Database },
];

const PROVIDERS: { value: AIProvider; label: string; blurb: string }[] = [
  { value: "openrouter", label: "OpenRouter", blurb: "One key, hundreds of models — Claude, GPT, Gemini, Llama, and more" },
  { value: "openai",     label: "OpenAI",     blurb: "Direct connection to OpenAI's models" },
  { value: "ollama",     label: "Ollama",     blurb: "Run models locally, fully private, no API key needed" },
];

export const SettingsPage = () => {
  const [tab, setTab] = useState<Tab>("account");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account, appearance, and integrations.</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="w-40 flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-medium text-left transition-all",
                  tab === id
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                )}
                style={tab === id ? { background: "var(--color-overlay)", border: "1px solid var(--color-border)" } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0 max-w-lg">
          {tab === "account"    && <AccountTab />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "ai"         && <AITab />}
          {tab === "data"       && <DataTab />}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Account Tab ──────────────────────────────────────────────────────────────
const AccountTab = () => {
  const { user, updateProfile, changePassword, logout, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState(user?.username ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(username);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch { /* error shown from store */ }
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 2000);
    } catch { /* error shown from store */ }
  };

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">Username</label>
            <input className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" value={user?.email ?? ""} disabled style={{ opacity: 0.5 }} />
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Email cannot be changed in local accounts.</p>
          </div>
          {error && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</p>}
          <button onClick={handleSaveProfile} disabled={isLoading} className="btn-primary">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : profileSaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : "Save profile"}
          </button>
        </div>
      </section>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      {/* Change password */}
      <section>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Change password</h3>
        <div className="space-y-4">
          <div>
            <label className="field-label">Current password</label>
            <input className="field-input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <label className="field-label">New password</label>
            <div className="relative">
              <input className="field-input w-full" type={showNewPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} style={{ paddingRight: "2.5rem" }} />
              <button onClick={() => setShowNewPw(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }}>
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label">Confirm new password</label>
            <input className="field-input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          {pwError && <p className="text-xs" style={{ color: "var(--color-danger)" }}>{pwError}</p>}
          {pwSuccess && <p className="text-xs" style={{ color: "var(--color-success)" }}>Password updated.</p>}
          <button onClick={handleChangePassword} disabled={isLoading || !currentPw || !newPw} className="btn-primary">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Update password"}
          </button>
        </div>
      </section>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      {/* Sign out */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Session</h3>
        <button onClick={() => logout()} className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-danger)" }}>
          <LogOut className="w-4 h-4" /> Sign out
        </button>
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
          Signed in as {user?.email}
        </p>
      </section>
    </div>
  );
};

// ─── Appearance Tab ───────────────────────────────────────────────────────────
const AppearanceTab = () => {
  const { activeThemeId, themes, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Theme</h3>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-tertiary)" }}>
          Choose how Omnia looks. Contributor themes will appear here once installed.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className="p-3 rounded-lg text-left transition-all"
              style={{
                background: theme.colors.surface,
                border: `1px solid ${activeThemeId === theme.id ? "var(--color-accent)" : theme.colors.border}`,
                boxShadow: activeThemeId === theme.id ? `0 0 0 1px var(--color-accent)` : "none",
              }}
            >
              {/* Mini preview */}
              <div className="flex gap-1 mb-2">
                {[theme.colors.base, theme.colors.surface, theme.colors.accent].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: c }} />
                ))}
              </div>
              <div className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{theme.name}</div>
              <div className="text-[0.6875rem] mt-0.5 line-clamp-2" style={{ color: theme.colors.textTertiary }}>{theme.description}</div>
              {activeThemeId === theme.id && (
                <div className="mt-2 flex items-center gap-1 text-[0.6875rem] font-medium" style={{ color: "var(--color-accent)" }}>
                  <Check className="w-3 h-3" /> Active
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Want to build a theme?</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Themes are JSON files that implement the <code className="px-1 py-0.5 rounded" style={{ background: "var(--color-border)" }}>OmniaTheme</code> schema. Export your theme and share it with the community — contributor themes will be installable from the Omnia theme marketplace.
          </p>
        </div>
      </section>
    </div>
  );
};

// ─── AI Tab ───────────────────────────────────────────────────────────────────
const AITab = () => {
  const { settings, updateSettings, models, modelsLoading, fetchModels } = useAIStore();
  const [modelQuery, setModelQuery] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState(settings.apiKey ?? "");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => { if (models.length === 0) fetchModels(); }, []); // eslint-disable-line

  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    if (!q) return models.slice(0, 60);
    return models.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)).slice(0, 60);
  }, [models, modelQuery]);

  const activeModel = models.find(m => m.id === settings.model);

  const saveKey = () => {
    updateSettings({ apiKey: keyDraft });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Provider */}
      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Provider</h3>
        <div className="space-y-2">
          {PROVIDERS.map(p => (
            <button key={p.value} onClick={() => updateSettings({ provider: p.value, model: "" })}
              className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all"
              style={{ background: settings.provider === p.value ? "var(--color-accent-dim)" : "var(--color-overlay)", border: `1px solid ${settings.provider === p.value ? "var(--color-accent)" : "var(--color-border)"}` }}>
              <div className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                style={{ border: `1.5px solid ${settings.provider === p.value ? "var(--color-accent)" : "var(--color-muted)"}`, background: settings.provider === p.value ? "var(--color-accent)" : "transparent" }}>
                {settings.provider === p.value && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{p.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{p.blurb}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Model picker */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Model</h3>
          <button onClick={fetchModels} className="btn-ghost-sm">
            <RefreshCw className={cn("w-3 h-3", modelsLoading && "animate-spin")} />
            {modelsLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
        <div className="relative">
          <button onClick={() => setModelMenuOpen(v => !v)}
            className="field-input w-full flex items-center justify-between">
            <span className={activeModel || settings.model ? "" : "opacity-50"}>
              {activeModel?.name ?? settings.model ?? "Select a model…"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
          </button>
          {modelMenuOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-lg overflow-hidden shadow-2xl"
              style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}>
              <input autoFocus placeholder="Search models…" value={modelQuery}
                onChange={e => setModelQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-transparent outline-none"
                style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-primary)" }} />
              <div className="max-h-64 overflow-y-auto">
                {filteredModels.length === 0
                  ? <div className="px-3 py-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>No models found.</div>
                  : filteredModels.map(m => (
                    <button key={m.id}
                      onClick={() => { updateSettings({ model: m.id }); setModelMenuOpen(false); setModelQuery(""); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-white/5"
                      style={{ color: settings.model === m.id ? "var(--color-accent)" : "var(--color-text-primary)" }}>
                      <span className="truncate">{m.name}</span>
                      {m.contextLength && <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--color-text-tertiary)" }}>{Math.round(m.contextLength / 1000)}K</span>}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* API key */}
      {settings.provider !== "ollama" && (
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            <Key className="w-3.5 h-3.5 inline mr-1.5" />API key
          </h3>
          <div className="flex gap-2">
            <input type="password" className="field-input flex-1" value={keyDraft} onChange={e => setKeyDraft(e.target.value)}
              placeholder={settings.provider === "openrouter" ? "sk-or-…" : "sk-…"} />
            <button onClick={saveKey} className="btn-primary flex-shrink-0">
              {keySaved ? <Check className="w-3.5 h-3.5" /> : "Save"}
            </button>
          </div>
          {settings.provider === "openrouter" && (
            <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
              Get a key at{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)" }}>openrouter.ai/keys</a>
            </p>
          )}
        </section>
      )}

      {/* Ollama base URL */}
      {settings.provider === "ollama" && (
        <section>
          <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />Base URL
          </h3>
          <input className="field-input" value={settings.baseUrl || ""} onChange={e => updateSettings({ baseUrl: e.target.value })} placeholder="http://localhost:11434" />
        </section>
      )}
    </div>
  );
};

// ─── Data Tab ─────────────────────────────────────────────────────────────────
const DataTab = () => {

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Cloud sync</h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          All your data is stored locally on this machine. Cloud sync is coming in a future release and will let you access Omnia from any device.
        </p>
        <div className="p-3 rounded-lg flex items-center gap-2.5" style={{ background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}>
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-success)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Local only — data synced to disk at <code className="opacity-70">~/.local/share/omnia/omnia.db</code></span>
        </div>
      </section>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      <section>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Export</h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          Export a copy of your data. Coming soon.
        </p>
        <button className="btn-ghost" disabled style={{ opacity: 0.4 }}>
          Export to JSON
        </button>
      </section>

      <div style={{ height: 1, background: "var(--color-border)" }} />

      <section>
        <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-danger)" }}>Danger zone</h3>
        <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button className="text-sm font-medium" style={{ color: "var(--color-danger)" }} disabled>
          Delete account
        </button>
      </section>
    </div>
  );
};
