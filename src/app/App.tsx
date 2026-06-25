import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/shared/components/MainLayout";
import { QuickSearch } from "@/shared/components/QuickSearch";
import { AppEntrance } from "@/shared/components/AppEntrance";
import { AuthPage } from "@/features/auth/components/AuthPage";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useThemeStore } from "@/shared/store/themeStore";
import { applyThemeById } from "@/shared/themes/themeLoader";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

// Route-based code splitting
import { lazy, Suspense } from "react";
const DashboardPage  = lazy(() => import("@/features/dashboard/components/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TasksPage      = lazy(() => import("@/features/tasks/components/TasksPage").then(m => ({ default: m.TasksPage })));
const NotesPage      = lazy(() => import("@/features/notes/components/NotesPage").then(m => ({ default: m.NotesPage })));
const NoteEditorPage = lazy(() => import("@/features/notes/components/NoteEditorPage").then(m => ({ default: m.NoteEditorPage })));
const CalendarPage   = lazy(() => import("@/features/calendar/components/CalendarPage").then(m => ({ default: m.CalendarPage })));
const HabitsPage     = lazy(() => import("@/features/habits/components/HabitsPage").then(m => ({ default: m.HabitsPage })));
const GoalsPage      = lazy(() => import("@/features/goals/components/GoalsPage").then(m => ({ default: m.GoalsPage })));
const RemindersPage  = lazy(() => import("@/features/reminders/components/RemindersPage").then(m => ({ default: m.RemindersPage })));
const SettingsPage   = lazy(() => import("@/features/settings/components/SettingsPage").then(m => ({ default: m.SettingsPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-text-tertiary)" }} />
  </div>
);

function App() {
  const { user, checkSession } = useAuthStore();
  const { loadSavedTheme } = useThemeStore();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Apply saved theme immediately (before first paint flash)
    const cached = localStorage.getItem("omnia-theme") ?? "dark";
    applyThemeById(cached);

    // Then restore session and load the real persisted theme from DB
    Promise.all([checkSession(), loadSavedTheme()])
      .finally(() => setBooting(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (booting) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--color-base)" }}
      >
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--color-text-tertiary)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <AuthPage />
      </ErrorBoundary>
    );
  }

  return (
    <AppEntrance>
      <ErrorBoundary>
        <BrowserRouter>
          <MainLayout>
            <QuickSearch />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/:id" element={<NoteEditorPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </MainLayout>
        </BrowserRouter>
      </ErrorBoundary>
    </AppEntrance>
  );
}

export default App;
