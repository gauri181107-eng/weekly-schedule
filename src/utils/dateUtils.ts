import { DayOfWeek, ScheduleTask, CompletionRecord } from '../types';

export const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

/** Returns 'monday', 'tuesday', etc. for a given Date */
export function getDayOfWeekFromDate(d: Date): DayOfWeek {
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday ...
  if (dayIndex === 0) return 'sunday';
  if (dayIndex === 1) return 'monday';
  if (dayIndex === 2) return 'tuesday';
  if (dayIndex === 3) return 'wednesday';
  if (dayIndex === 4) return 'thursday';
  if (dayIndex === 5) return 'friday';
  return 'saturday';
}

/** Returns "YYYY-MM-DD" in local time */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" into Date in local time */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format for display: e.g. "Monday, September 28" */
export function formatFullDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Format short: e.g. "Sep 28" */
export function formatShortDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Converts "17:30" or "05:00" to "5:00 PM" if format is 12h, or keeps "17:30" if 24h */
export function formatTimeString(timeStr: string, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  if (format === '24h') return timeStr;

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/** Get greeting according to hour */
export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon ⛅';
  return 'Good Evening 👋';
}

/** Return dates for the current week (Monday through Sunday) */
export function getDatesOfCurrentWeek(referenceDate: Date = new Date()): { day: DayOfWeek; dateStr: string; date: Date }[] {
  const curr = new Date(referenceDate);
  const currentDayIndex = curr.getDay(); // 0 is Sun, 1 is Mon
  // Distance to Monday (if Sun 0, distance is -6)
  const distanceToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;

  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const day = getDayOfWeekFromDate(d);
    result.push({
      day,
      dateStr: formatDateKey(d),
      date: d,
    });
  }
  return result;
}

/** Find the next upcoming task today given current time */
export function getNextUpcomingTask(tasks: ScheduleTask[], completedTaskIds: Set<string>): ScheduleTask | null {
  if (!tasks.length) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Sort tasks by time
  const sorted = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  // Find first uncompleted task after current time
  for (const t of sorted) {
    if (completedTaskIds.has(t.id)) continue;
    const [h, m] = t.time.split(':').map(Number);
    const taskMinutes = (h || 0) * 60 + (m || 0);
    if (taskMinutes >= currentMinutes) {
      return t;
    }
  }

  // If all upcoming are done, return first uncompleted task of the day
  return sorted.find((t) => !completedTaskIds.has(t.id)) || null;
}

/** Calculate current streak in consecutive days with at least 1 completed task */
export function calculateStreak(completedRecords: CompletionRecord[], referenceDate: Date = new Date()): number {
  if (!completedRecords.length) return 0;

  // Set of dates with at least one completed task
  const activeDates = new Set(completedRecords.map((r) => r.date));

  const checkDate = new Date(referenceDate);
  checkDate.setHours(0, 0, 0, 0);

  let streak = 0;
  const todayKey = formatDateKey(checkDate);

  // If today has completions, count today and go backwards
  // If today doesn't have completions yet, check yesterday to continue yesterday's active streak
  if (activeDates.has(todayKey)) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayKey = formatDateKey(checkDate);
    if (!activeDates.has(yesterdayKey)) {
      return 0; // streak broken
    }
  }

  // Count consecutive past days
  while (true) {
    const key = formatDateKey(checkDate);
    if (activeDates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
