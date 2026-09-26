import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  Pin,
  Plus,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { ScheduleTask, Category, CompletionRecord, ImportantNote, UserSettings, ActiveTab, DayOfWeek, Habit } from '../types';
import {
  formatDateKey,
  formatFullDisplayDate,
  formatTimeString,
  getDayOfWeekFromDate,
  getGreeting,
  getNextUpcomingTask,
  DAY_NAMES,
  getDatesOfCurrentWeek,
} from '../utils/dateUtils';
import { calculateHabitStreak } from '../utils/habitUtils';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';

interface DashboardProps {
  schedule: ScheduleTask[];
  categories: Category[];
  completions: CompletionRecord[];
  notes: ImportantNote[];
  habits: Habit[];
  streak: number;
  settings: UserSettings;
  onToggleTaskCompletion: (taskId: string, dateStr: string) => void;
  onToggleHabitToday: (habitId: string) => void;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAddTask: (defaultDay?: DayOfWeek) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  schedule,
  categories,
  completions,
  notes,
  habits,
  streak,
  settings,
  onToggleTaskCompletion,
  onToggleHabitToday,
  onNavigate,
  onOpenAddTask,
}) => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const todayDayOfWeek = getDayOfWeekFromDate(today);

  // Scheduled tasks for today
  const todayTasks = schedule
    .filter((t) => t.day === todayDayOfWeek)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Completed IDs for today
  const todayCompletedSet = new Set(
    completions.filter((c) => c.date === todayKey).map((c) => c.taskId)
  );

  const activeTodayTasks = todayTasks.filter((t) => !todayCompletedSet.has(t.id));
  const completedTodayTasks = todayTasks.filter((t) => todayCompletedSet.has(t.id));

  const totalTodayCount = todayTasks.length;
  const completedTodayCount = completedTodayTasks.length;
  const todayPercentage =
    totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  // Next upcoming task
  const nextTask = getNextUpcomingTask(todayTasks, todayCompletedSet);
  const nextTaskCategory = nextTask ? getCategoryById(categories, nextTask.categoryId) : null;

  // Pinned notes preview
  const pinnedNotes = notes.filter((n) => n.isPinned).slice(0, 3);
  const topNotes = pinnedNotes.length > 0 ? pinnedNotes : notes.slice(0, 2);

  // Weekly progress calculation
  const currentWeekDates = getDatesOfCurrentWeek(today);
  let weekScheduledCount = 0;
  let weekCompletedCount = 0;

  currentWeekDates.forEach((cd) => {
    const dayTasks = schedule.filter((t) => t.day === cd.day);
    weekScheduledCount += dayTasks.length;
    weekCompletedCount += completions.filter(
      (c) => c.date === cd.dateStr && dayTasks.some((t) => t.id === c.taskId)
    ).length;
  });

  const weeklyPercentage =
    weekScheduledCount > 0
      ? Math.round((weekCompletedCount / weekScheduledCount) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Welcome Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-indigo-200">
                {getGreeting()}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {streak} Day Streak
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Today: {formatFullDisplayDate(today)}
            </h1>

            <p className="text-sm text-indigo-200/90 max-w-xl">
              Your recurring weekly routine is active for{' '}
              <strong className="text-white">{DAY_NAMES[todayDayOfWeek]}</strong>. Check off your tasks as you complete them throughout the day.
            </p>
          </div>

          {/* Today's quick progress meter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 shrink-0 min-w-[220px]">
            <div className="text-xs font-medium text-indigo-200">
              Today's Progress
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white">
                {completedTodayCount}/{totalTodayCount}
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {todayPercentage}% completed
              </span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Tasks + Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Tasks Checklist */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Today's Tasks</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {DAY_NAMES[todayDayOfWeek]}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Click any task checkbox to complete it and update your progress
              </p>
            </div>

            <button
              onClick={() => onNavigate('today')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group"
            >
              Full Today View
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Active Tasks Checklist */}
          {activeTodayTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-xs">
              {totalTodayCount === 0 ? (
                <div className="space-y-3">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No tasks scheduled for {DAY_NAMES[todayDayOfWeek]}
                  </p>
                  <button
                    onClick={() => onOpenAddTask(todayDayOfWeek)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add a task to this day's routine
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    All tasks completed for today! 🎉
                  </h3>
                  <p className="text-xs text-slate-500">
                    You've finished all {completedTodayCount} tasks. Relax and recharge for tomorrow!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {activeTodayTasks.map((task) => {
                  const category = getCategoryById(categories, task.categoryId);
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start gap-3.5 relative overflow-hidden"
                    >
                      {/* Left accent strip */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: category.color }}
                      />

                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleTaskCompletion(task.id, todayKey)}
                        className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform active:scale-75 shrink-0"
                        title="Mark complete"
                      >
                        <Circle className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </button>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onToggleTaskCompletion(task.id, todayKey)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {task.title}
                          </span>
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {formatTimeString(task.time, settings.timeFormat)}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <CategoryBadge category={category} size="sm" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Quick preview of completed tasks if any */}
          {completedTodayTasks.length > 0 && (
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Completed Today ({completedTodayTasks.length})</span>
                <button
                  onClick={() => onNavigate('today')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline normal-case text-xs"
                >
                  Manage history
                </button>
              </div>
              <div className="space-y-1.5 opacity-80">
                {completedTodayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs text-slate-400"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="line-through">{task.title}</span>
                    </div>
                    <span className="font-mono text-[10px]">
                      {formatTimeString(task.time, settings.timeFormat)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Next Up, Weekly Progress & Important Notes */}
        <div className="space-y-6">
          {/* Next Upcoming Task Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Next Upcoming Task
              </span>
            </div>

            {nextTask && nextTaskCategory ? (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {nextTask.title}
                  </h4>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md shadow-2xs">
                    {formatTimeString(nextTask.time, settings.timeFormat)}
                  </span>
                </div>
                {nextTask.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {nextTask.description}
                  </p>
                )}
                <div className="pt-1">
                  <CategoryBadge category={nextTaskCategory} size="sm" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                No upcoming uncompleted tasks for today.
              </p>
            )}
          </div>

          {/* Weekly Progress Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Weekly Progress
              </span>
              <button
                onClick={() => onNavigate('progress')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Details
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Total Routine</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {weekCompletedCount} / {weekScheduledCount} ({weeklyPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Habit Streaks Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Daily Habits ({habits.filter((h) => (h.completedDates || []).includes(todayKey)).length}/{habits.length})
              </span>
              <button
                onClick={() => onNavigate('habits')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                All Habits
              </button>
            </div>

            <div className="space-y-2">
              {habits.slice(0, 3).map((h) => {
                const isDone = (h.completedDates || []).includes(todayKey);
                const hStreak = calculateHabitStreak(h.completedDates || []);
                return (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={() => onToggleHabitToday(h.id)}
                        className="shrink-0 transition-transform active:scale-75"
                        title={isDone ? 'Mark undone' : 'Mark done today'}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                        )}
                      </button>
                      <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {h.title}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {hStreak}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Notes Preview Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                Important Notes
              </span>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                View all ({notes.length})
              </button>
            </div>

            {topNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No notes yet. Add exam dates or assignment deadlines.
              </p>
            ) : (
              <div className="space-y-2.5">
                {topNotes.map((note) => {
                  const category = getCategoryById(categories, note.categoryId);
                  return (
                    <div
                      key={note.id}
                      onClick={() => onNavigate('notes')}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {note.title}
                        </span>
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {note.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
