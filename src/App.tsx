/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  ScheduleTask,
  CompletionRecord,
  ImportantNote,
  UserSettings,
  Category,
  DayOfWeek,
  Habit,
} from './types';
import {
  loadSchedule,
  saveSchedule,
  loadCompletions,
  saveCompletions,
  loadNotes,
  saveNotes,
  loadSettings,
  saveSettings,
  loadCategories,
  saveCategories,
  loadHabits,
  saveHabits,
  resetAllData,
  INITIAL_SCHEDULE,
  INITIAL_NOTES,
  INITIAL_SETTINGS,
  INITIAL_HABITS,
} from './utils/storage';
import { DEFAULT_CATEGORIES } from './utils/categories';
import {
  formatDateKey,
  getDayOfWeekFromDate,
  calculateStreak,
} from './utils/dateUtils';

import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TodayView } from './components/TodayView';
import { WeeklySchedule } from './components/WeeklySchedule';
import { WeekOverview } from './components/WeekOverview';
import { HabitsView } from './components/HabitsView';
import { ProgressView } from './components/ProgressView';
import { NotesView } from './components/NotesView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { ScheduleAction } from '../server/geminiHandler';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistent States
  const [schedule, setSchedule] = useState<ScheduleTask[]>(() => loadSchedule());
  const [completions, setCompletions] = useState<CompletionRecord[]>(() => loadCompletions());
  const [notes, setNotes] = useState<ImportantNote[]>(() => loadNotes());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [defaultTaskDay, setDefaultTaskDay] = useState<DayOfWeek>('monday');

  // AI Assistant Modal state
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);

  // Apply Theme (light / dark) to document element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Save changes to localStorage automatically
  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveCompletions(completions);
  }, [completions]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  // Derived current metrics
  const today = useMemo(() => new Date(), []);
  const todayDateKey = useMemo(() => formatDateKey(today), [today]);
  const todayDayOfWeek = useMemo(() => getDayOfWeekFromDate(today), [today]);

  const streak = useMemo(() => calculateStreak(completions, today), [completions, today]);

  const todayTasks = useMemo(() => {
    return schedule.filter((t) => t.day === todayDayOfWeek);
  }, [schedule, todayDayOfWeek]);

  const todayCompletedCount = useMemo(() => {
    return completions.filter(
      (c) => c.date === todayDateKey && todayTasks.some((t) => t.id === c.taskId)
    ).length;
  }, [completions, todayDateKey, todayTasks]);

  const todayTotalCount = todayTasks.length;

  // Task Completion Handler (Recurring-safe date based storage!)
  const handleToggleTaskCompletion = (taskId: string, dateStr: string) => {
    setCompletions((prev) => {
      const exists = prev.some((c) => c.taskId === taskId && c.date === dateStr);
      if (exists) {
        // Uncheck / restore
        return prev.filter((c) => !(c.taskId === taskId && c.date === dateStr));
      } else {
        // Complete for this specific date
        return [
          ...prev,
          {
            taskId,
            date: dateStr,
            completedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  // Schedule task management
  const handleSaveScheduleTask = (
    taskData: Omit<ScheduleTask, 'id' | 'order'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Update existing
      setSchedule((prev) =>
        prev.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t))
      );
    } else {
      // Create new task
      const dayTasks = schedule.filter((t) => t.day === taskData.day);
      const newOrder = dayTasks.length + 1;
      const newTask: ScheduleTask = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order: newOrder,
      };
      setSchedule((prev) => [...prev, newTask]);
    }
  };

  const handleDeleteScheduleTask = (id: string) => {
    setSchedule((prev) => prev.filter((t) => t.id !== id));
    // Also clean up any completion records for this task if desired
    setCompletions((prev) => prev.filter((c) => c.taskId !== id));
  };

  const handleReorderTasks = (day: DayOfWeek, newOrder: ScheduleTask[]) => {
    setSchedule((prev) => {
      const otherDayTasks = prev.filter((t) => t.day !== day);
      return [...otherDayTasks, ...newOrder];
    });
  };

  const handleOpenAddModal = (defaultDay?: DayOfWeek) => {
    setEditingTask(null);
    setDefaultTaskDay(defaultDay || todayDayOfWeek);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: ScheduleTask) => {
    setEditingTask(task);
    setDefaultTaskDay(task.day);
    setIsTaskModalOpen(true);
  };

  // Notes management
  const handleAddNote = (noteData: Omit<ImportantNote, 'id' | 'createdAt'>) => {
    const newNote: ImportantNote = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: ImportantNote) => {
    setNotes((prev) => prev.map((n) => (n.id === updatedNote.id ? updatedNote : n)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Categories management
  const handleAddCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Habits handlers
  const handleToggleHabitToday = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const dates = h.completedDates || [];
        const exists = dates.includes(todayDateKey);
        return {
          ...h,
          completedDates: exists
            ? dates.filter((d) => d !== todayDateKey)
            : [...dates, todayDateKey],
        };
      })
    );
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedDates: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleUpdateHabit = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Reset & Data Export/Import
  const handleResetAllData = () => {
    resetAllData();
    setSchedule(INITIAL_SCHEDULE);
    setNotes(INITIAL_NOTES);
    setCategories(DEFAULT_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    setHabits(INITIAL_HABITS);
    setCompletions([]);
  };

  const handleExportData = () => {
    const data = {
      version: 2,
      exportDate: new Date().toISOString(),
      schedule,
      completions,
      notes,
      categories,
      settings,
      habits,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `routinely_backup_${formatDateKey(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.schedule && Array.isArray(parsed.schedule)) {
        setSchedule(parsed.schedule);
      }
      if (parsed.completions && Array.isArray(parsed.completions)) {
        setCompletions(parsed.completions);
      }
      if (parsed.notes && Array.isArray(parsed.notes)) {
        setNotes(parsed.notes);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      if (parsed.habits && Array.isArray(parsed.habits)) {
        setHabits(parsed.habits);
      }
      if (parsed.settings) {
        setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
      }
      return true;
    } catch {
      return false;
    }
  };

  // Apply actions suggested by Gemini AI directly to the schedule
  const handleApplyAIActions = (actions: ScheduleAction[]) => {
    setSchedule((prev) => {
      let updated = [...prev];
      actions.forEach((act) => {
        if (act.type === 'ADD') {
          const day = ((act.day || 'monday').toLowerCase()) as DayOfWeek;
          const newTask: ScheduleTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            day,
            title: act.title || 'New Task',
            time: act.time || '08:00',
            description: act.description,
            categoryId: act.categoryId || 'study',
            order: updated.filter((t) => t.day === day).length + 1,
          };
          updated.push(newTask);
        } else if (act.type === 'UPDATE') {
          updated = updated.map((t) => {
            const matchById = act.id && t.id === act.id;
            const matchByTitle = act.title && t.title.toLowerCase() === act.title.toLowerCase();
            const matchByDay = !act.day || t.day === act.day;
            if ((matchById || matchByTitle) && matchByDay) {
              return {
                ...t,
                title: act.title || t.title,
                time: act.time || t.time,
                description: act.description !== undefined ? act.description : t.description,
                categoryId: act.categoryId || t.categoryId,
                day: (act.day as DayOfWeek) || t.day,
              };
            }
            return t;
          });
        } else if (act.type === 'DELETE') {
          updated = updated.filter((t) => {
            const matchById = act.id && t.id === act.id;
            const matchByTitle = act.title && t.title.toLowerCase().includes(act.title.toLowerCase());
            const matchByDay = !act.day || t.day === act.day;
            if (matchById || (matchByTitle && matchByDay)) {
              return false;
            }
            return true;
          });
        }
      });
      return updated;
    });
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings({ ...settings, theme: newTheme });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onOpenAIAssistant={() => setIsGeminiModalOpen(true)}
        streak={streak}
        todayCompletedCount={todayCompletedCount}
        todayTotalCount={todayTotalCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            schedule={schedule}
            categories={categories}
            completions={completions}
            notes={notes}
            habits={habits}
            streak={streak}
            settings={settings}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onToggleHabitToday={handleToggleHabitToday}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAddTask={handleOpenAddModal}
          />
        )}

        {activeTab === 'today' && (
          <TodayView
            schedule={schedule}
            categories={categories}
            completions={completions}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onOpenAddTask={handleOpenAddModal}
            settings={settings}
          />
        )}

        {activeTab === 'weekly-schedule' && (
          <WeeklySchedule
            schedule={schedule}
            categories={categories}
            onAddTask={handleSaveScheduleTask}
            onEditTask={(task) => handleSaveScheduleTask(task)}
            onDeleteTask={handleDeleteScheduleTask}
            onReorderTasks={handleReorderTasks}
            onOpenEditModal={handleOpenEditModal}
            onOpenAddModal={handleOpenAddModal}
            settings={settings}
          />
        )}

        {activeTab === 'week-overview' && (
          <WeekOverview
            schedule={schedule}
            categories={categories}
            completions={completions}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            onSelectDay={(day) => {
              setDefaultTaskDay(day);
              setActiveTab('weekly-schedule');
            }}
            settings={settings}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            categories={categories}
            onToggleHabitToday={handleToggleHabitToday}
            onAddHabit={handleAddHabit}
            onUpdateHabit={handleUpdateHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            schedule={schedule}
            categories={categories}
            completions={completions}
            streak={streak}
            settings={settings}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            categories={categories}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onResetAllData={handleResetAllData}
            onExportData={handleExportData}
            onImportData={handleImportData}
            totalScheduleTasks={schedule.length}
            totalNotes={notes.length}
            totalCompletions={completions.length}
          />
        )}
      </main>

      {/* Floating AI Routine Assistant Button */}
      <button
        onClick={() => setIsGeminiModalOpen(true)}
        className="fixed bottom-16 md:bottom-6 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
        title="Open Routinely AI Schedule Assistant"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
        <span>Ask AI Schedule Assistant</span>
      </button>

      {/* Gemini AI Schedule Assistant Modal */}
      <GeminiAssistantModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        schedule={schedule}
        categories={categories}
        onApplyActions={handleApplyAIActions}
      />

      {/* Reusable Add/Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveScheduleTask}
        onDelete={editingTask ? handleDeleteScheduleTask : undefined}
        initialTask={editingTask}
        defaultDay={defaultTaskDay}
        categories={categories}
        includeSunday={settings.includeSunday}
      />
    </div>
  );
}
