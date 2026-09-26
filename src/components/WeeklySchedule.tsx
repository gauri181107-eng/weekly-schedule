import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { ScheduleTask, DayOfWeek, Category, UserSettings } from '../types';
import { DAYS_ORDER, DAY_NAMES, formatTimeString } from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';

interface WeeklyScheduleProps {
  schedule: ScheduleTask[];
  categories: Category[];
  onAddTask: (task: Omit<ScheduleTask, 'id' | 'order'>) => void;
  onEditTask: (task: ScheduleTask) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (day: DayOfWeek, newOrder: ScheduleTask[]) => void;
  onOpenEditModal: (task: ScheduleTask) => void;
  onOpenAddModal: (defaultDay?: DayOfWeek) => void;
  settings: UserSettings;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  schedule,
  categories,
  onDeleteTask,
  onReorderTasks,
  onOpenEditModal,
  onOpenAddModal,
  settings,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<'day' | 'week'>('day');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const visibleDays = settings.includeSunday
    ? DAYS_ORDER
    : DAYS_ORDER.filter((d) => d !== 'sunday');

  const isSearching = searchQuery.trim().length > 0;

  // Search filter helper: checks name, description, or assigned category
  const matchesSearch = (task: ScheduleTask): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const category = getCategoryById(categories, task.categoryId);
    const titleMatch = task.title.toLowerCase().includes(q);
    const descMatch = (task.description || '').toLowerCase().includes(q);
    const categoryMatch = category.name.toLowerCase().includes(q);
    return titleMatch || descMatch || categoryMatch;
  };

  // Base list depending on searchScope
  const baseTasks =
    searchScope === 'week' && isSearching
      ? schedule.filter((t) => visibleDays.includes(t.day))
      : schedule.filter((t) => t.day === selectedDay);

  const currentDayTasks = schedule
    .filter((t) => t.day === selectedDay)
    .sort((a, b) => a.order - b.order || a.time.localeCompare(b.time));

  // Filter tasks with both search query and category filter
  const filteredTasks = baseTasks
    .filter((t) => {
      const matchCat = categoryFilter === 'all' || t.categoryId === categoryFilter;
      const matchQuery = matchesSearch(t);
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (searchScope === 'week' && isSearching) {
        // Sort by day order then by time
        const dayDiff = DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
      }
      return a.order - b.order || a.time.localeCompare(b.time);
    });

  // Calculate matching counts for search scope hints
  const dayMatchCount = currentDayTasks.filter(
    (t) =>
      (categoryFilter === 'all' || t.categoryId === categoryFilter) && matchesSearch(t)
  ).length;

  const weekMatchCount = schedule
    .filter((t) => visibleDays.includes(t.day))
    .filter(
      (t) =>
        (categoryFilter === 'all' || t.categoryId === categoryFilter) && matchesSearch(t)
    ).length;

  // Reorder handlers (active only when in day view without active search)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reordered = [...currentDayTasks];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    reordered.forEach((task, idx) => (task.order = idx + 1));
    onReorderTasks(selectedDay, reordered);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentDayTasks.length - 1) return;
    const reordered = [...currentDayTasks];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    reordered.forEach((task, idx) => (task.order = idx + 1));
    onReorderTasks(selectedDay, reordered);
  };

  const handleSortByTime = () => {
    const sorted = [...currentDayTasks].sort((a, b) => a.time.localeCompare(b.time));
    sorted.forEach((task, idx) => (task.order = idx + 1));
    onReorderTasks(selectedDay, sorted);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Calendar className="w-3.5 h-3.5" />
                Permanent Template
              </span>
              <span className="text-xs text-slate-500">
                Total Routine: {schedule.length} tasks
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              My Weekly Schedule
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure your master schedule once for Monday to Saturday. It automatically repeats every week.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddModal(selectedDay)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Search Bar at Top of Weekly Schedule */}
        <div className="pt-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by name, description, or category (e.g. DSA, LeetCode, Study, College)..."
              className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
            {isSearching && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search scope toggles when query is active */}
          {isSearching && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 px-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Search Scope:</span>
                <button
                  onClick={() => setSearchScope('day')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    searchScope === 'day'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {DAY_NAMES[selectedDay]} ({dayMatchCount})
                </button>
                <button
                  onClick={() => setSearchScope('week')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    searchScope === 'week'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Days ({weekMatchCount})
                </button>
              </div>

              <span className="text-slate-400">
                Filtering by name, description & category
              </span>
            </div>
          )}
        </div>

        {/* Day selection tabs */}
        <div className="flex overflow-x-auto gap-2 pt-4 pb-1 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
          {visibleDays.map((day) => {
            const isSelected = selectedDay === day;
            const dayCount = schedule.filter((t) => t.day === day).length;
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  if (searchScope === 'week') {
                    setSearchScope('day');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected && (!isSearching || searchScope === 'day')
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{DAY_NAMES[day]}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected && (!isSearching || searchScope === 'day')
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {dayCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isSearching && searchScope === 'week'
              ? 'All Days Matching Routine'
              : `${DAY_NAMES[selectedDay]} Routine`}
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'})
          </span>
          {isSearching && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              Query: &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Sort by Time (when viewing single day) */}
          {currentDayTasks.length > 1 && !isSearching && (
            <button
              onClick={handleSortByTime}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              title="Automatically arrange tasks chronologically by time"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              Sort by Time
            </button>
          )}

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-medium bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Tags</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">
            {isSearching
              ? 'No matching tasks found'
              : `No tasks scheduled for ${DAY_NAMES[selectedDay]}`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {isSearching
              ? `No tasks match "${searchQuery}" by name, description, or category.`
              : 'Add recurring study sessions, college lectures, workouts, or hostel routines for this day.'}
          </p>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Clear Search
              </button>
              {searchScope === 'day' && weekMatchCount > 0 && (
                <button
                  onClick={() => setSearchScope('week')}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  Search Across All Days ({weekMatchCount})
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAddModal(selectedDay)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              + Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => {
            const category = getCategoryById(categories, task.categoryId);
            const isWeekSearch = isSearching && searchScope === 'week';

            return (
              <div
                key={task.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden"
              >
                {/* Left accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: category.color }}
                />

                {/* Left info: Time, Day (if week search), Title, Description, Category */}
                <div className="flex items-start sm:items-center gap-3.5 pl-1.5">
                  {/* Time box */}
                  <div className="flex flex-col items-center justify-center w-20 py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0 text-center font-mono">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatTimeString(task.time, settings.timeFormat)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isWeekSearch && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {DAY_NAMES[task.day]}
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {task.title}
                      </span>
                      <CategoryBadge category={category} size="sm" />
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Reorder up/down, Edit, Delete */}
                <div className="flex items-center gap-1 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  {/* Reorder Buttons (only in day view without active query) */}
                  {!isSearching && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-500"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === currentDayTasks.length - 1}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-500"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => onOpenEditModal(task)}
                    className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${task.title}" from ${DAY_NAMES[task.day]} routine?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

