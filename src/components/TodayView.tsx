import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { ScheduleTask, Category, CompletionRecord, DayOfWeek, UserSettings } from '../types';
import {
  getDayOfWeekFromDate,
  formatDateKey,
  formatFullDisplayDate,
  formatTimeString,
  DAY_NAMES,
} from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';

interface TodayViewProps {
  schedule: ScheduleTask[];
  categories: Category[];
  completions: CompletionRecord[];
  onToggleTaskCompletion: (taskId: string, dateStr: string) => void;
  onOpenAddTask: (defaultDay?: DayOfWeek) => void;
  settings: UserSettings;
}

export const TodayView: React.FC<TodayViewProps> = ({
  schedule,
  categories,
  completions,
  onToggleTaskCompletion,
  onOpenAddTask,
  settings,
}) => {
  // Allow date browsing (defaults to real today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDayOfWeek = getDayOfWeekFromDate(selectedDate);
  const isRealToday = formatDateKey(new Date()) === selectedDateKey;

  // Get tasks scheduled for this day of week
  const dayTasks = schedule
    .filter((t) => t.day === selectedDayOfWeek)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Set of completed task IDs for this date
  const completedTaskIds = new Set(
    completions.filter((c) => c.date === selectedDateKey).map((c) => c.taskId)
  );

  // Active (uncompleted) vs Completed
  const activeTasks = dayTasks.filter((t) => !completedTaskIds.has(t.id));
  const completedTasks = dayTasks.filter((t) => completedTaskIds.has(t.id));

  // Apply category filter if active
  const filteredActiveTasks =
    selectedCategoryFilter === 'all'
      ? activeTasks
      : activeTasks.filter((t) => t.categoryId === selectedCategoryFilter);

  const filteredCompletedTasks =
    selectedCategoryFilter === 'all'
      ? completedTasks
      : completedTasks.filter((t) => t.categoryId === selectedCategoryFilter);

  const totalTasksCount = dayTasks.length;
  const completedCount = completedTasks.length;
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Navigate date
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleResetToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header & Date Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Calendar className="w-3.5 h-3.5" />
                {isRealToday ? 'Today' : 'Daily Checklist'}
              </span>
              {!isRealToday && (
                <button
                  onClick={handleResetToToday}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Jump to Today
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              {formatFullDisplayDate(selectedDate)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Routine for {DAY_NAMES[selectedDayOfWeek]} • recurring weekly template
            </p>
          </div>

          {/* Date switcher */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-200">
              {DAY_NAMES[selectedDayOfWeek].slice(0, 3)}, {selectedDate.getDate()}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Progress: {completedCount} / {totalTasksCount} completed
              </span>
              {progressPercent === 100 && totalTasksCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold animate-bounce">
                  <Sparkles className="w-3 h-3" /> All Done!
                </span>
              )}
            </div>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category filter pills & Quick add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            All Tasks ({totalTasksCount})
          </button>
          {categories.map((cat) => {
            const count = dayTasks.filter((t) => t.categoryId === cat.id).length;
            if (count === 0) return null;
            const isSelected = selectedCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : cat.id)}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all border ${
                  isSelected
                    ? `${cat.bgLight} ${cat.textLight} ${cat.borderLight} ring-2 ring-indigo-500 ring-offset-1`
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenAddTask(selectedDayOfWeek)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add to {DAY_NAMES[selectedDayOfWeek]}
        </button>
      </div>

      {/* Active Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Tasks ({filteredActiveTasks.length})
          </h2>
          <span className="text-xs text-slate-400">
            Click checkbox to mark complete
          </span>
        </div>

        {filteredActiveTasks.length === 0 ? (
          <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            {totalTasksCount === 0 ? (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  No routine set for {DAY_NAMES[selectedDayOfWeek]}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Add recurring tasks like Study DSA, College lectures, Coding, or Gym to this day's routine.
                </p>
                <button
                  onClick={() => onOpenAddTask(selectedDayOfWeek)}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  + Add First Task
                </button>
              </div>
            ) : completedTasks.length > 0 && activeTasks.length === 0 ? (
              <div className="space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  All done for {DAY_NAMES[selectedDayOfWeek]}!
                </h3>
                <p className="text-xs text-slate-500">
                  You completed all {completedCount} tasks scheduled for this day. Outstanding work!
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active tasks match the selected category filter.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {filteredActiveTasks.map((task) => {
                const category = getCategoryById(categories, task.categoryId);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      x: 40,
                      transition: { duration: 0.28, ease: 'easeOut' },
                    }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white dark:bg-slate-900 hover:shadow-md rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 transition-all flex items-start gap-3.5 relative overflow-hidden"
                  >
                    {/* Left category accent strip */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: category.color }}
                    />

                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleTaskCompletion(task.id, selectedDateKey)}
                      aria-label={`Mark ${task.title} as completed`}
                      className="mt-0.5 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform active:scale-80 shrink-0"
                    >
                      <Circle className="w-5 h-5 transition-all group-hover:scale-110" />
                    </button>

                    {/* Task Content */}
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onToggleTaskCompletion(task.id, selectedDateKey)}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {task.title}
                        </span>
                        <CategoryBadge category={category} size="sm" />
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px] text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {formatTimeString(task.time, settings.timeFormat)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {DAY_NAMES[task.day]} routine
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <div className="flex items-center gap-2">
              {showCompleted ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
              <span>Completed Today ({completedTasks.length})</span>
            </div>
            <span className="text-slate-400 lowercase font-normal text-xs">
              Saved in history for {formatDateKey(selectedDate)}
            </span>
          </button>

          {showCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mt-2"
            >
              <AnimatePresence>
                {filteredCompletedTasks.map((task) => {
                  const category = getCategoryById(categories, task.categoryId);
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-sm group hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleTaskCompletion(task.id, selectedDateKey)}
                          title="Click to uncheck and move back to active"
                          className="text-emerald-500 hover:text-slate-400 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-600" />
                        </button>
                        <div className="flex flex-col">
                          <span className="line-through text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatTimeString(task.time, settings.timeFormat)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CategoryBadge category={category} size="sm" />
                        <button
                          onClick={() => onToggleTaskCompletion(task.id, selectedDateKey)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 rounded transition-opacity"
                        >
                          Restore
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      {/* Helpful Hint on Recurring behavior */}
      <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Recurring Routine Note:</strong> Tasks completed on this day are archived into your history for{' '}
          <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedDateKey}</span>. Next week on{' '}
          {DAY_NAMES[selectedDayOfWeek]}, the same routine task will appear fresh again!
        </p>
      </div>
    </div>
  );
};
