import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare, StickyNote, LayoutDashboard, CalendarDays, Target, Bell, Repeat2, Settings,
} from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/shared/components/ui/command";
import { useTaskStore } from "@/features/tasks/store/taskStore";
import { useNoteStore } from "@/features/notes/store/noteStore";
import { useGoalStore } from "@/features/goals/store/goalStore";
import { useReminderStore } from "@/features/reminders/store/reminderStore";
import { useHabitStore } from "@/features/habits/store/habitStore";
import { useSearchStore } from "@/shared/store/searchStore";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Tasks", icon: CheckSquare, path: "/tasks" },
  { label: "Notes", icon: StickyNote, path: "/notes" },
  { label: "Calendar", icon: CalendarDays, path: "/calendar" },
  { label: "Habits", icon: Repeat2, path: "/habits" },
  { label: "Goals", icon: Target, path: "/goals" },
  { label: "Reminders", icon: Bell, path: "/reminders" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export function QuickSearch() {
  const { open, setOpen, toggle } = useSearchStore();
  const [query, setQuery] = React.useState("");
  const navigate = useNavigate();

  const { tasks, fetchTasks, toggleTask } = useTaskStore();
  const { notes, fetchAllNotes } = useNoteStore();
  const { goals, fetchGoals } = useGoalStore();
  const { reminders, fetchReminders } = useReminderStore();
  const { habits, fetchHabits } = useHabitStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  // Ensure every searchable domain is actually loaded the first time search opens,
  // not just whatever pages happen to have been visited already.
  React.useEffect(() => {
    if (!open) return;
    fetchTasks();
    fetchAllNotes();
    fetchGoals();
    fetchReminders();
    fetchHabits();
  }, [open, fetchTasks, fetchAllNotes, fetchGoals, fetchReminders, fetchHabits]);

  const run = (cmd: () => void) => {
    setOpen(false);
    setQuery("");
    cmd();
  };

  const q = query.trim().toLowerCase();

  const matchedTasks = q
    ? tasks.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 6)
    : tasks.slice(0, 5);

  const matchedNotes = q
    ? notes.filter((n) => n.title.toLowerCase().includes(q) || stripHtml(n.content ?? "").toLowerCase().includes(q)).slice(0, 6)
    : notes.slice(0, 5);

  const matchedGoals = q ? goals.filter((g) => g.title.toLowerCase().includes(q)).slice(0, 5) : [];
  const matchedReminders = q ? reminders.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 5) : [];
  const matchedHabits = q ? habits.filter((h) => h.title.toLowerCase().includes(q)).slice(0, 5) : [];
  const matchedNav = q ? NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q)) : NAV_ITEMS;

  const noResults =
    q.length > 0 &&
    matchedTasks.length === 0 &&
    matchedNotes.length === 0 &&
    matchedGoals.length === 0 &&
    matchedReminders.length === 0 &&
    matchedHabits.length === 0 &&
    matchedNav.length === 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <CommandInput placeholder="Search tasks, notes, goals, anything…" value={query} onValueChange={setQuery} />
      <CommandList>
        {noResults && <CommandEmpty>No results for "{query}"</CommandEmpty>}

        {matchedNav.length > 0 && (
          <CommandGroup heading="Navigation">
            {matchedNav.map(({ label, icon: Icon, path }) => (
              <CommandItem key={path} onSelect={() => run(() => navigate(path))}>
                <Icon className="mr-2 h-4 w-4 text-zinc-400" />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {matchedTasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {matchedTasks.map((task) => (
                <CommandItem key={task.id} onSelect={() => run(() => toggleTask(task.id))}>
                  <CheckSquare className={`mr-2 h-4 w-4 ${task.status === "done" ? "text-blue-500" : "text-zinc-500"}`} />
                  <span className={task.status === "done" ? "line-through opacity-40" : ""}>{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedNotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Notes">
              {matchedNotes.map((note) => (
                <CommandItem key={note.id} onSelect={() => run(() => navigate(`/notes/${note.id}`))}>
                  <StickyNote className="mr-2 h-4 w-4 text-purple-400" />
                  {note.title || "Untitled"}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedGoals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Goals">
              {matchedGoals.map((goal) => (
                <CommandItem key={goal.id} onSelect={() => run(() => navigate("/goals"))}>
                  <Target className="mr-2 h-4 w-4 text-orange-400" />
                  {goal.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedReminders.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Reminders">
              {matchedReminders.map((reminder) => (
                <CommandItem key={reminder.id} onSelect={() => run(() => navigate("/reminders"))}>
                  <Bell className="mr-2 h-4 w-4 text-amber-400" />
                  {reminder.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {matchedHabits.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Habits">
              {matchedHabits.map((habit) => (
                <CommandItem key={habit.id} onSelect={() => run(() => navigate("/habits"))}>
                  <Repeat2 className="mr-2 h-4 w-4 text-emerald-400" />
                  {habit.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
