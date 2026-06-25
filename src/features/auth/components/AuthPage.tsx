import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "@/shared/store/themeStore";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";

type Tab = "login" | "register";

const InputField = ({
  label, type = "text", value, onChange, placeholder, error,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="field-input w-full"
          style={{ paddingRight: isPassword ? "2.5rem" : undefined }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}
    </div>
  );
};

export const AuthPage = () => {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, register, isLoading, error, clearError } = useAuthStore();
  const { activeThemeId, setTheme } = useThemeStore();

  useEffect(() => { clearError(); setFieldErrors({}); }, [tab, clearError]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Must be at least 8 characters.";
    if (tab === "register") {
      if (!username.trim()) errs.username = "Username is required.";
      if (confirmPassword !== password) errs.confirmPassword = "Passwords don't match.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (tab === "login") await login(email, password);
      else await register(username, email, password);
    } catch { /* errors handled by store */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ background: "var(--color-base)" }}
    >
      {/* Theme toggle top-right */}
      <button
        onClick={() => setTheme(activeThemeId === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 p-2 rounded-lg btn-ghost"
        title="Toggle theme"
      >
        {activeThemeId === "dark"
          ? <Sun className="w-4 h-4" />
          : <Moon className="w-4 h-4" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
        style={{ padding: "0 1rem" }}
      >
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-accent)" }}
          >
            <span className="text-lg font-black text-white select-none">O</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 pb-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color: tab === t ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                borderBottom: tab === t ? `2px solid var(--color-accent)` : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === "login" ? -8 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
            onKeyDown={handleKeyDown}
          >
            {tab === "register" && (
              <InputField
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="Your name"
                error={fieldErrors.username}
              />
            )}
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              error={fieldErrors.email}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Min. 8 characters"
              error={fieldErrors.password}
            />
            {tab === "register" && (
              <InputField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Same password again"
                error={fieldErrors.confirmPassword}
              />
            )}

            {error && (
              <div
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: "rgba(248,113,113,0.1)", color: "var(--color-danger)", border: "1px solid rgba(248,113,113,0.2)" }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {tab === "login" ? "Signing in…" : "Creating account…"}</>
              ) : (
                tab === "login" ? "Sign in" : "Create account"
              )}
            </button>

            {tab === "login" && (
              <p className="text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Don't have an account?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="underline"
                  style={{ color: "var(--color-accent)" }}
                >
                  Create one
                </button>
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
