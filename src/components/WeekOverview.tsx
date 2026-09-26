import React from 'react';
import { CheckCircle2, Circle, Clock, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { ScheduleTask, Category, CompletionRecord, DayOfWeek, UserSettings } from '../types';
import {
  DAYS_ORDER,
  DAY_NAMES,
  formatDateKey,
  formatTimeString,
  getDayOfWeekFromDate,
  getDatesOfCurrentWeek,
} from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';

interface WeekOverviewProps {
  schedule: ScheduleTask[];
  categories: Category[];
  completions: CompletionRecord[];
  onToggleTaskCompletion: (taskId: string, dateStr: string) => void;
  onSelectDay: (day: DayOfWeek) => void;
  settings: UserSettings;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  schedule,
  categories,
  completions,
  onToggleTaskCompletion,
  onSelectDay,
  settings,
}) => {
  const currentDates = getDatesOfCurrentWeek(new Date());
  const todayDateKey = formatDateKey(new Date());
  const todayDayOfWeek = getDayOfWeekFromDate(new Date());

  const daysToShow = settings.includeSunday
    ? DAYS_ORDER
    : DAYS_ORDER.filter((d) => d !== 'sunday');

  // Overall week stats
  let totalWeekTasks = 0;
  let totalWeekCompleted = 0;

  daysToShow.forEach((day) => {
    const dayDateInfo = currentDates.find((cd) => cd.day === day);
    const dateStr = dayDateInfo?.dateStr || todayDateKey;
    const tasks = schedule.filter((t) => t.day === day);
    totalWeekTasks += tasks.length;
    const completedForDay = completions.filter(
      (c) => c.date === dateStr && tasks.some((t) => t.id === c.taskId)
    ).length;
    totalWeekCompleted += completedForDay;
  });

  const weekPercentage =
    totalWeekTasks > 0 ? Math.round((totalWeekCompleted / totalWeekTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Calendar className="w-3.5 h-3.5" />
                This Week Overview
              </span>
              <span className="text-xs text-slate-500">
                {daysToShow.length}-Day Grid
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Weekly Routine Board
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare each day's routine at a glance and track current week completions.
            </p>
          </div>

          {/* Mini progress tracker */}
          <div className="sm:text-right bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Week Completion
            </div>
            <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
              {totalWeekCompleted} / {totalWeekTasks} tasks ({weekPercentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Columns Grid: Monday to Saturday (and Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {daysToShow.map((day) => {
          const isToday = day === todayDayOfWeek;
          const dayDateInfo = currentDates.find((cd) => cd.day === day);
          const dateStr = dayDateInfo?.dateStr || todayDateKey;
          const tasks = schedule
            .filter((t) => t.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));

          const completedTaskIds = new Set(
            completions.filter((c) => c.date === dateStr).map((c) => c.taskId)
          );

          const dayCompletedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
          const dayTotalCount = tasks.length;
          const dayPercent =
            dayTotalCount > 0 ? Math.round((dayCompletedCount / dayTotalCount) * 100) : 0;

          return (
            <div
              key={day}
              className={`rounded-2xl border transition-all flex flex-col bg-white dark:bg-slate-900 ${
                isToday
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-4 border-b rounded-t-2xl flex items-center justify-between ${
                  isToday
                    ? 'bg-gradient-to-r from-indigo-50/80 to-sky-50/80 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/60'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {DAY_NAMES[day]}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-600 text-white uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  {dayDateInfo && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {dayDateInfo.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>

                {/* Day completion ratio */}
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {dayCompletedCount}/{dayTotalCount} completed
                  </span>
                  <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dayPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ width: `${dayPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Task Items in Column */}
              <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[420px]">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No routine tasks scheduled
                  </div>
                ) : (
                  tasks.map((task) => {
                    const isDone = completedTaskIds.has(task.id);
                    const category = getCategoryById(categories, task.categoryId);

                    return (
                      <div
                        key={task.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden flex items-start gap-2.5 ${
                          isDone
                            ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200/70 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 shadow-2xs'
                        }`}
                      >
                        {/* Tiny category accent pill */}
                        <div
                          className="w-1 self-stretch rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />

                        {/* Interactive Checkbox */}
                        <button
                          onClick={() => onToggleTaskCompletion(task.id, dateStr)}
                          className="mt-0.5 shrink-0 transition-transform active:scale-90"
                          title={isDone ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-indigo-600" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-semibold truncate ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {formatTimeString(task.time, settings.timeFormat)}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center justify-between">
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded"
                              style={{
                                color: category.color,
                                backgroundColor: `${category.color}15`,
                              }}
                            >
                              {category.name}
                            </span>
                            {task.description && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {task.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Day footer button to jump to full day */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
                <button
                  onClick={() => onSelectDay(day)}
                  className="w-full py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open {DAY_NAMES[day]} Routine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
