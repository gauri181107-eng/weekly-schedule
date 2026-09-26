export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind color token or hex
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  iconName: string;
}

export interface ScheduleTask {
  id: string;
  day: DayOfWeek;
  title: string;
  time: string; // "05:00", "08:40", "18:00" in 24h format for sorting
  description?: string;
  categoryId: string;
  order: number;
}

export interface DailyOneOffTask {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time?: string;
  description?: string;
  categoryId: string;
}

// Stores completed status per date: key is `${date}_${taskId}` -> timestamp
export interface CompletionRecord {
  taskId: string;
  date: string; // "YYYY-MM-DD"
  completedAt: string; // ISO string
}

export interface ImportantNote {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  deadline?: string; // YYYY-MM-DD or ISO
  isPinned: boolean;
  categoryId?: string;
  color?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  includeSunday: boolean;
  timeFormat: '12h' | '24h';
  userName: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  createdAt: string; // ISO string
  completedDates: string[]; // List of YYYY-MM-DD
  color?: string;
}

export type ActiveTab = 'dashboard' | 'today' | 'weekly-schedule' | 'week-overview' | 'habits' | 'progress' | 'notes' | 'settings';
