import React, { useState } from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  Trophy,
  Sparkles,
  Calendar,
  Edit2,
  Trash2,
  X,
  Droplet,
  Heart,
  Smile,
  Zap,
} from 'lucide-react';
import { Habit, Category } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';
import {
  calculateHabitStreak,
  calculateBestHabitStreak,
  getLast7DaysHabitStatus,
} from '../utils/habitUtils';
import { formatDateKey } from '../utils/dateUtils';

interface HabitsViewProps {
  habits: Habit[];
  categories: Category[];
  onToggleHabitToday: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  onUpdateHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  categories,
  onToggleHabitToday,
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'health');

  const todayKey = formatDateKey(new Date());

  const presetHabits = [
    { title: 'Drinking Water (2.5L)', categoryId: 'health', desc: 'Stay hydrated with at least 8 glasses of water' },
    { title: '10-min Morning Meditation', categoryId: 'personal', desc: 'Mindful breathing or silent reflection' },
    { title: 'Solve 1 Daily LeetCode', categoryId: 'coding', desc: 'Maintain technical problem-solving intuition' },
    { title: '15-min Tech Reading', categoryId: 'study', desc: 'Read articles, documentation, or book chapters' },
    { title: 'Evening Stretch & Mobility', categoryId: 'health', desc: 'Prevent posture fatigue from long coding sessions' },
  ];

  const openAddModal = (preset?: { title: string; categoryId: string; desc: string }) => {
    setEditingHabit(null);
    setTitle(preset?.title || '');
    setDescription(preset?.desc || '');
    setCategoryId(preset?.categoryId || categories[0]?.id || 'health');
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setDescription(habit.description || '');
    setCategoryId(habit.categoryId);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHabit) {
      onUpdateHabit({
        ...editingHabit,
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
      });
    } else {
      onAddHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        categoryId,
      });
    }

    setIsModalOpen(false);
  };

  // Metrics
  const completedTodayCount = habits.filter((h) => (h.completedDates || []).includes(todayKey)).length;
  const totalHabitsCount = habits.length;
  const todayRate = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Persistent Habit Streaks
              </span>
              <span className="text-xs text-slate-500">
                Non-scheduled daily routines
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Daily Habits & Streaks
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track essential habits like drinking water, meditation, coding practice, and reading with persistent day streaks.
            </p>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>

        {/* Today's Habits Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Today's Habit Target: {completedTodayCount} of {totalHabitsCount} completed
              </span>
              {todayRate === 100 && totalHabitsCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-3 h-3" /> Perfect Day!
                </span>
              )}
            </div>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
              {todayRate}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${todayRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Preset quick recommendations */}
      {habits.length < 5 && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/40">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Quick Add Popular Student Habits:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetHabits
              .filter((p) => !habits.some((h) => h.title.toLowerCase().includes(p.title.slice(0, 10).toLowerCase())))
              .slice(0, 3)
              .map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => openAddModal(p)}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 font-medium transition-all shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-indigo-500" />
                  <span>{p.title}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-3.5">
        {habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Flame className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No habits tracked yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add daily non-scheduled activities like Drinking Water, Meditation, or 1 Daily LeetCode problem to build streaks.
            </p>
            <button
              onClick={() => openAddModal()}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const category = getCategoryById(categories, habit.categoryId);
            const isDoneToday = (habit.completedDates || []).includes(todayKey);
            const streak = calculateHabitStreak(habit.completedDates || []);
            const bestStreak = calculateBestHabitStreak(habit.completedDates || []);
            const last7Days = getLast7DaysHabitStatus(habit);

            return (
              <div
                key={habit.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDoneToday
                    ? 'border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Left accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: category.color }}
                />

                {/* Habit details */}
                <div className="space-y-1.5 pl-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {habit.title}
                    </span>
                    <CategoryBadge category={category} size="sm" />
                  </div>

                  {habit.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {habit.description}
                    </p>
                  )}

                  {/* 7-Day Mini Dots */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                      7 Days:
                    </span>
                    {last7Days.map((d) => (
                      <div
                        key={d.dateKey}
                        className="flex flex-col items-center gap-0.5"
                        title={`${d.dateKey}: ${d.completed ? 'Completed' : 'Missed'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                            d.completed
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : d.isToday
                              ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {d.completed ? '✓' : ''}
                        </div>
                        <span className="text-[9px] text-slate-400">
                          {d.dayShort[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Streak metrics & Today's interactive button */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 justify-between sm:justify-end">
                  {/* Streak Pills */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-extrabold shadow-2xs">
                      <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                      <span>{streak} {streak === 1 ? 'day' : 'days'} streak</span>
                    </div>
                    {bestStreak > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Best: {bestStreak}d
                      </span>
                    )}
                  </div>

                  {/* Toggle Done Button */}
                  <button
                    onClick={() => onToggleHabitToday(habit.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-sm ${
                      isDoneToday
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isDoneToday ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Done Today!</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4" />
                        <span>Mark Done</span>
                      </>
                    )}
                  </button>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete habit "${habit.title}"?`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drinking Water (2.5L), 10-min Meditation, Daily LeetCode..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Goal (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 8 glasses daily; focus on hydration and posture..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category Tag
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-600/30 transition-all"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
