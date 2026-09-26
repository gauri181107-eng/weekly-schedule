import React from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Target,
  BarChart,
} from 'lucide-react';
import { ScheduleTask, Category, CompletionRecord, UserSettings } from '../types';
import {
  DAYS_ORDER,
  DAY_NAMES,
  DAY_SHORT_NAMES,
  formatDateKey,
  getDayOfWeekFromDate,
  getDatesOfCurrentWeek,
} from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';

interface ProgressViewProps {
  schedule: ScheduleTask[];
  categories: Category[];
  completions: CompletionRecord[];
  streak: number;
  settings: UserSettings;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  schedule,
  categories,
  completions,
  streak,
  settings,
}) => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const todayDayOfWeek = getDayOfWeekFromDate(today);

  // Today's tasks & stats
  const todayScheduledTasks = schedule.filter((t) => t.day === todayDayOfWeek);
  const todayCompletedCount = completions.filter(
    (c) => c.date === todayKey && todayScheduledTasks.some((t) => t.id === c.taskId)
  ).length;
  const todayTotalCount = todayScheduledTasks.length;
  const todayPercentage =
    todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  // Weekly stats
  const currentWeekDates = getDatesOfCurrentWeek(today);
  const daysIncluded = settings.includeSunday
    ? DAYS_ORDER
    : DAYS_ORDER.filter((d) => d !== 'sunday');

  let totalWeekScheduled = 0;
  let totalWeekCompleted = 0;

  const dayActivity = daysIncluded.map((day) => {
    const dateInfo = currentWeekDates.find((d) => d.day === day);
    const dateKey = dateInfo?.dateStr || todayKey;
    const dayTasks = schedule.filter((t) => t.day === day);
    const dayCompleted = completions.filter(
      (c) => c.date === dateKey && dayTasks.some((t) => t.id === c.taskId)
    ).length;

    totalWeekScheduled += dayTasks.length;
    totalWeekCompleted += dayCompleted;

    const percent = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;

    return {
      day,
      dayShort: DAY_SHORT_NAMES[day],
      total: dayTasks.length,
      completed: dayCompleted,
      percent,
      isToday: day === todayDayOfWeek,
    };
  });

  const weeklyPercentage =
    totalWeekScheduled > 0
      ? Math.round((totalWeekCompleted / totalWeekScheduled) * 100)
      : 0;

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const tasksInCat = schedule.filter((t) => t.categoryId === cat.id);
    const completedInCat = completions.filter((c) =>
      tasksInCat.some((t) => t.id === c.taskId)
    ).length;
    return {
      category: cat,
      taskCount: tasksInCat.length,
      completedCount: completedInCat,
    };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" />
            Performance & Consistency
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
          Progress & Consistency Tracker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor your daily discipline, weekly routine adherence, and habit streaks.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {streak}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {streak === 1 ? 'day in a row' : 'consecutive days'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {streak > 0
              ? 'Awesome discipline! Keep completing your daily routine.'
              : 'Complete your first task today to build your streak!'}
          </p>
        </div>

        {/* Today's completion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Completion
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {todayPercentage}%
            </span>
            <span className="text-sm font-semibold text-slate-500">
              ({todayCompletedCount} / {todayTotalCount} tasks)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${todayPercentage}%` }}
            />
          </div>
        </div>

        {/* Weekly completion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Weekly Completion
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {weeklyPercentage}%
            </span>
            <span className="text-sm font-semibold text-slate-500">
              ({totalWeekCompleted} / {totalWeekScheduled} tasks)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${weeklyPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Weekly Visual Progress Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              This Week Routine Adherence
            </h2>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {totalWeekCompleted} of {totalWeekScheduled} tasks
            </span>
          </div>

          {/* Large ASCII / visual bar as requested in prompt */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>This Week</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">
                {weeklyPercentage}%
              </span>
            </div>
            {/* Visual block bar */}
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${weeklyPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>Tasks completed: <strong className="text-slate-800 dark:text-slate-200">{totalWeekCompleted} / {totalWeekScheduled}</strong></span>
              <span>Target: 100% routine perfection</span>
            </div>
          </div>
        </div>

        {/* 7-Day Day-by-Day Bar Chart */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Day-by-Day Activity
          </h3>
          <div className="grid grid-cols-6 sm:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3">
            {dayActivity.map((dayData) => (
              <div
                key={dayData.day}
                className={`p-3 rounded-xl border text-center transition-all ${
                  dayData.isToday
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {dayData.dayShort}
                </div>
                <div className="my-2 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex flex-col justify-end p-1 overflow-hidden">
                  <div
                    className={`w-full rounded-md transition-all ${
                      dayData.percent === 100
                        ? 'bg-emerald-500'
                        : dayData.percent > 0
                        ? 'bg-indigo-600'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(dayData.percent, 4)}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                  {dayData.completed}/{dayData.total}
                </div>
                <div className="text-[10px] text-slate-400">
                  {dayData.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Routine Breakdown by Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryStats.map((stat) => (
              <div
                key={stat.category.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <CategoryBadge category={stat.category} size="sm" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {stat.taskCount} weekly sessions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
