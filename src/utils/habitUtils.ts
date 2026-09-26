import { Habit } from '../types';
import { formatDateKey, parseDateKey, DAY_SHORT_NAMES, getDayOfWeekFromDate } from './dateUtils';

/** Calculates current consecutive streak of a habit ending today or yesterday */
export function calculateHabitStreak(completedDates: string[], referenceDate: Date = new Date()): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const dateSet = new Set(completedDates);
  const checkDate = new Date(referenceDate);
  checkDate.setHours(0, 0, 0, 0);

  const todayKey = formatDateKey(checkDate);
  let streak = 0;

  if (dateSet.has(todayKey)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = formatDateKey(checkDate);
    if (!dateSet.has(yesterdayKey)) {
      return 0; // Streak broken
    }
  }

  // Count backwards
  while (true) {
    const key = formatDateKey(checkDate);
    if (dateSet.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/** Calculates the best (longest) streak across all history */
export function calculateBestHabitStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  const sorted = Array.from(new Set(completedDates)).sort();
  if (sorted.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseDateKey(sorted[i - 1]);
    const currDate = parseDateKey(sorted[i]);

    // Difference in calendar days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/** Get status across last 7 days (including today) */
export function getLast7DaysHabitStatus(
  habit: Habit,
  referenceDate: Date = new Date()
): { dateKey: string; dayShort: string; completed: boolean; isToday: boolean }[] {
  const result = [];
  const completedSet = new Set(habit.completedDates || []);

  const todayKey = formatDateKey(referenceDate);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const dateKey = formatDateKey(d);
    const dayOfWeek = getDayOfWeekFromDate(d);
    result.push({
      dateKey,
      dayShort: DAY_SHORT_NAMES[dayOfWeek],
      completed: completedSet.has(dateKey),
      isToday: dateKey === todayKey,
    });
  }

  return result;
}
