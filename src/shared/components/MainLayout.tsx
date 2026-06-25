import React from "react";
import {
  LayoutDashboard, CheckSquare, FileText, CalendarDays,
  Repeat2, Target, BellRing, Settings, Search, LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { useSearchStore } from "@/shared/store/searchStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useThemeStore } from "@/shared/store/themeStore";

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

const PRIMARY_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Home", to: "/" },
];

const SPACE_NAV: NavItem[] = [
  { icon: CheckSquare,  label: "Tasks",     to: "/tasks" },
  { icon: FileText,     label: "Notes",     to: "/notes" },
  { icon: CalendarDays, label: "Calendar",  to: "/calendar" },
  { icon: Repeat2,      label: "Habits",    to: "/habits" },
  { icon: Target,       label: "Goals",     to: "/goals" },
  { icon: BellRing,     label: "Reminders", to: "/reminders" },
];

const SidebarLink = ({ icon: Icon, label, to }: NavItem) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[0.8125rem] font-medium transition-all duration-100",
        active
          ? "bg-white/[0.07] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]"
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
};

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const toggleSearch = useSearchStore((s) => s.toggle);
  const { user, logout } = useAuthStore();
  const { activeThemeId, setTheme } = useThemeStore();

  return (
  <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-base)", color: "var(--color-text-primary)" }}>
    {/* Sidebar */}
    <aside
      className="w-56 flex-shrink-0 flex flex-col py-4 px-3 overflow-y-auto"
      style={{ borderRight: "1px solid var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-2 mb-5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-accent)" }}
        >
          <span className="text-[11px] font-black text-white select-none">O</span>
        </div>
        <div>
          <div className="text-[0.8125rem] font-semibold leading-none">Omnia</div>
          <div className="text-[0.6875rem] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Personal workspace
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <div className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
        <button
          onClick={toggleSearch}
          className="flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded text-[0.8125rem] font-medium transition-all duration-100 text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)]"
        >
          <span className="flex items-center gap-2.5">
            <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
            Search
          </span>
          <span className="text-[0.625rem] opacity-60">⌘K</span>
        </button>
      </div>

      {/* Space section */}
      <div
        className="text-[0.6875rem] font-semibold uppercase tracking-widest mt-5 mb-1 px-2.5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Space
      </div>
      <div className="flex flex-col gap-0.5">
        {SPACE_NAV.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>

      {/* Bottom: settings, theme toggle, user */}
      <div className="mt-auto pt-4 flex flex-col gap-1">
        <SidebarLink icon={Settings} label="Settings" to="/settings" />

        {/* Theme quick-toggle */}
        <button
          onClick={() => setTheme(activeThemeId === "dark" ? "light" : "dark")}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[0.8125rem] font-medium transition-all duration-100 text-[var(--color-text-tertiary)] hover:bg-white/[0.04] hover:text-[var(--color-text-secondary)] w-full"
        >
          {activeThemeId === "dark"
            ? <span className="w-3.5 h-3.5 text-xs">☀️</span>
            : <span className="w-3.5 h-3.5 text-xs">🌙</span>}
          {activeThemeId === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {/* User row */}
        {user && (
          <div className="flex items-center gap-2 px-2 pt-2 mt-1"
            style={{ borderTop: "1px solid var(--color-border)" }}>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: "var(--color-accent)" }}
            >
              {user.username[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.75rem] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                {user.username}
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1 rounded hover:bg-white/5 flex-shrink-0"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Main content */}
    <main className="flex-1 overflow-y-auto">
      <div className="px-16 py-12 max-w-[900px]">
        {children}
      </div>
    </main>
  </div>
  );
};
