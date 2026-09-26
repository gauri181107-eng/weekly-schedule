import {
  ScheduleTask,
  DailyOneOffTask,
  CompletionRecord,
  ImportantNote,
  UserSettings,
  Category,
  Habit,
} from '../types';
import { DEFAULT_CATEGORIES } from './categories';
import { formatDateKey } from './dateUtils';

const STORAGE_KEYS = {
  SCHEDULE: 'weekly_schedule_tasks_v2',
  ONE_OFF: 'daily_one_off_tasks_v2',
  COMPLETIONS: 'daily_completions_records_v2',
  NOTES: 'important_notes_v2',
  SETTINGS: 'user_settings_v2',
  CATEGORIES: 'task_categories_v2',
  HABITS: 'habits_tracker_v2',
};

function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDateKey(d));
  }
  return dates;
}

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Drinking Water (2.5L)',
    description: 'Stay hydrated with at least 8 glasses / 2.5L throughout the day',
    categoryId: 'health',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    completedDates: getPastDates(5),
  },
  {
    id: 'habit-2',
    title: '10-min Meditation & Breathing',
    description: 'Mindful breathing or silent meditation before morning study',
    categoryId: 'personal',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    completedDates: getPastDates(3),
  },
  {
    id: 'habit-3',
    title: 'Solve 1 Daily LeetCode Problem',
    description: 'Keep problem-solving intuition sharp every single day',
    categoryId: 'coding',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    completedDates: getPastDates(6),
  },
  {
    id: 'habit-4',
    title: 'Read 15 mins (Tech Book / Articles)',
    description: 'Learn new concepts outside of class syllabus',
    categoryId: 'study',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    completedDates: getPastDates(2),
  },
];

export const INITIAL_SCHEDULE: ScheduleTask[] = [
  // Monday
  { id: 'm-1', day: 'monday', time: '05:00', title: 'Wake up & Morning Routine', description: 'Hydrate, stretch, get ready for deep work', categoryId: 'personal', order: 1 },
  { id: 'm-2', day: 'monday', time: '05:30', title: 'Study DSA', description: 'Trees & Dynamic Programming LeetCode problems', categoryId: 'study', order: 2 },
  { id: 'm-3', day: 'monday', time: '08:40', title: 'College', description: 'Lectures and afternoon computer lab', categoryId: 'college', order: 3 },
  { id: 'm-4', day: 'monday', time: '17:00', title: 'Return to hostel', description: 'Tea break, freshen up, quick rest', categoryId: 'personal', order: 4 },
  { id: 'm-5', day: 'monday', time: '18:00', title: 'Coding', description: 'Full-stack web application development', categoryId: 'coding', order: 5 },
  { id: 'm-6', day: 'monday', time: '20:00', title: 'Dinner', description: 'Hostel mess with friends', categoryId: 'health', order: 6 },
  { id: 'm-7', day: 'monday', time: '21:00', title: 'Revision', description: 'Revise notes taken today and prep for tomorrow', categoryId: 'revision', order: 7 },

  // Tuesday
  { id: 't-1', day: 'tuesday', time: '05:00', title: 'Wake up & Workout', description: 'Core workout and morning jog', categoryId: 'health', order: 1 },
  { id: 't-2', day: 'tuesday', time: '05:30', title: 'Practice Python', description: 'Scripting, decorators, and data pipelines', categoryId: 'coding', order: 2 },
  { id: 't-3', day: 'tuesday', time: '08:40', title: 'College', description: 'Operating Systems & Networking theory', categoryId: 'college', order: 3 },
  { id: 't-4', day: 'tuesday', time: '17:00', title: 'Return to hostel', description: 'Snacks & 30-min break', categoryId: 'personal', order: 4 },
  { id: 't-5', day: 'tuesday', time: '18:00', title: 'OS Concepts & Coding', description: 'Process synchronization and thread coding', categoryId: 'study', order: 5 },
  { id: 't-6', day: 'tuesday', time: '20:00', title: 'Dinner', description: 'Healthy meal', categoryId: 'health', order: 6 },
  { id: 't-7', day: 'tuesday', time: '21:00', title: 'Revise Digital Logic', description: 'Boolean algebra and combinational circuits', categoryId: 'revision', order: 7 },

  // Wednesday
  { id: 'w-1', day: 'wednesday', time: '05:00', title: 'Wake up', description: 'Quick meditation & water', categoryId: 'personal', order: 1 },
  { id: 'w-2', day: 'wednesday', time: '05:30', title: 'Study DSA', description: 'Graphs: BFS, DFS & Dijkstra algorithms', categoryId: 'study', order: 2 },
  { id: 'w-3', day: 'wednesday', time: '08:40', title: 'College', description: 'DBMS & Software Engineering lectures', categoryId: 'college', order: 3 },
  { id: 'w-4', day: 'wednesday', time: '17:00', title: 'Return to hostel', description: 'Rest and evening walk', categoryId: 'personal', order: 4 },
  { id: 'w-5', day: 'wednesday', time: '18:00', title: 'Project Development', description: 'Backend API implementation', categoryId: 'coding', order: 5 },
  { id: 'w-6', day: 'wednesday', time: '20:00', title: 'Dinner', description: 'Dinner break', categoryId: 'health', order: 6 },
  { id: 'w-7', day: 'wednesday', time: '21:00', title: 'Revision & Lab Records', description: 'Complete lab write-ups for Thursday', categoryId: 'revision', order: 7 },

  // Thursday
  { id: 'th-1', day: 'thursday', time: '05:00', title: 'Wake up & Stretch', description: 'Morning yoga and stretching', categoryId: 'health', order: 1 },
  { id: 'th-2', day: 'thursday', time: '05:30', title: 'Complete Java assignment', description: 'OOP polymorphism and collection framework', categoryId: 'coding', order: 2 },
  { id: 'th-3', day: 'thursday', time: '08:40', title: 'College', description: 'Hardware lab and presentations', categoryId: 'college', order: 3 },
  { id: 'th-4', day: 'thursday', time: '17:00', title: 'Return to hostel', description: 'Freshen up and relaxation', categoryId: 'personal', order: 4 },
  { id: 'th-5', day: 'thursday', time: '18:00', title: 'DBMS Query Practice', description: 'Complex SQL joins, indexing, transactions', categoryId: 'study', order: 5 },
  { id: 'th-6', day: 'thursday', time: '20:00', title: 'Dinner', description: 'Dinner', categoryId: 'health', order: 6 },
  { id: 'th-7', day: 'thursday', time: '21:00', title: 'Revision', description: 'Review weekly notes and flashcards', categoryId: 'revision', order: 7 },

  // Friday
  { id: 'f-1', day: 'friday', time: '05:00', title: 'Wake up', description: 'Fresh start to the last weekday', categoryId: 'personal', order: 1 },
  { id: 'f-2', day: 'friday', time: '05:30', title: 'Study DSA', description: 'Sliding window and two pointer problems', categoryId: 'study', order: 2 },
  { id: 'f-3', day: 'friday', time: '08:40', title: 'College', description: 'Tutorial sessions and club meetings', categoryId: 'college', order: 3 },
  { id: 'f-4', day: 'friday', time: '17:00', title: 'Return to hostel', description: 'Friday evening downtime', categoryId: 'personal', order: 4 },
  { id: 'f-5', day: 'friday', time: '18:00', title: 'Mock Coding Contest', description: 'Timed 90-minute problem solving', categoryId: 'coding', order: 5 },
  { id: 'f-6', day: 'friday', time: '20:00', title: 'Dinner', description: 'Hostel special dinner', categoryId: 'health', order: 6 },
  { id: 'f-7', day: 'friday', time: '21:00', title: 'Weekly Review', description: 'Review completed items and plan weekend', categoryId: 'revision', order: 7 },

  // Saturday
  { id: 's-1', day: 'saturday', time: '06:00', title: 'Wake up & Morning Run', description: '5km outdoor run on college track', categoryId: 'health', order: 1 },
  { id: 's-2', day: 'saturday', time: '07:30', title: 'Deep Work: Major Project', description: 'Build feature milestone and commit code', categoryId: 'coding', order: 2 },
  { id: 's-3', day: 'saturday', time: '10:30', title: 'College Assignment', description: 'Finalize and submit weekly project reports', categoryId: 'college', order: 3 },
  { id: 's-4', day: 'saturday', time: '14:00', title: 'Self Study & Tech Articles', description: 'Read system design papers & docs', categoryId: 'study', order: 4 },
  { id: 's-5', day: 'saturday', time: '21:30', title: 'Weekly Progress Wrap-up', description: 'Backup code and set up Sunday priorities', categoryId: 'revision', order: 5 },

  // Sunday (optional/free)
  { id: 'sun-1', day: 'sunday', time: '08:00', title: 'Relaxed Wake up & Breakfast', description: 'Sleep in and recharge', categoryId: 'personal', order: 1 },
  { id: 'sun-2', day: 'sunday', time: '10:00', title: 'Laundry & Room Cleaning', description: 'Tidy up study desk and hostel room', categoryId: 'personal', order: 2 },
  { id: 'sun-3', day: 'sunday', time: '15:00', title: 'Hobby Project / Reading', description: 'Casual coding or read a book', categoryId: 'coding', order: 3 },
  { id: 'sun-4', day: 'sunday', time: '19:00', title: 'Prepare for Monday', description: 'Pack bag and review upcoming week', categoryId: 'study', order: 4 },
];

export const INITIAL_NOTES: ImportantNote[] = [
  {
    id: 'note-1',
    title: 'Mid-Semester Exam Schedule',
    content: 'Mid-term exams start October 12th. Subjects: Data Structures & Algorithms (Units 1-3), Operating Systems (Processes & Memory), and DBMS (SQL & Normalization). Prepare cheat sheets!',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    deadline: '2026-10-12',
    isPinned: true,
    categoryId: 'college',
  },
  {
    id: 'note-2',
    title: 'Java Assignment 3 Submission Deadline',
    content: 'Submit OOP project report with GitHub repository link on the college portal by 11:59 PM. Must include unit tests and README setup instructions.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    deadline: '2026-10-02',
    isPinned: true,
    categoryId: 'coding',
  },
  {
    id: 'note-3',
    title: 'LeetCode 75 Goal for the Month',
    content: 'Focus areas: Binary Tree BFS/DFS, Two Pointers, and Binary Search. Goal is 3 problems every day before college and 2 during evening coding.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    isPinned: false,
    categoryId: 'study',
  },
  {
    id: 'note-4',
    title: 'Digital Logic Revision Notes',
    content: 'Check page 42 for Master-Slave JK Flip-Flop race condition explanation. Need to clarify state transitions with professor during office hours.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isPinned: false,
    categoryId: 'revision',
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'system',
  includeSunday: false,
  timeFormat: '12h',
  userName: 'Student',
};

// Seed initial completions for today so that the app looks alive immediately
function getInitialCompletions(): CompletionRecord[] {
  const today = new Date();
  const todayKey = formatDateKey(today);
  
  // Also seed yesterday to demonstrate streak
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  return [
    { taskId: 'm-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 'm-2', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 't-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 'w-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 'th-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 'f-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 's-1', date: todayKey, completedAt: new Date().toISOString() },
    { taskId: 'sun-1', date: todayKey, completedAt: new Date().toISOString() },
    // Yesterday completions
    { taskId: 'm-1', date: yesterdayKey, completedAt: new Date(yesterday).toISOString() },
    { taskId: 'm-2', date: yesterdayKey, completedAt: new Date(yesterday).toISOString() },
    { taskId: 'm-3', date: yesterdayKey, completedAt: new Date(yesterday).toISOString() },
  ];
}

export function loadSchedule(): ScheduleTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) {
      saveSchedule(INITIAL_SCHEDULE);
      return INITIAL_SCHEDULE;
    }
    const parsed: ScheduleTask[] = JSON.parse(raw);
    const filtered = parsed.filter(
      (t) =>
        !t.title.toLowerCase().includes('gym & sports') &&
        !t.title.toLowerCase().includes('gym and sports') &&
        !t.title.toLowerCase().includes('dinner & social') &&
        !t.title.toLowerCase().includes('dinner and social')
    );
    if (filtered.length !== parsed.length) {
      saveSchedule(filtered);
    }
    return filtered;
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveSchedule(schedule: ScheduleTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error('Failed to save schedule to localStorage', e);
  }
}

export function loadCompletions(): CompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
    if (!raw) {
      const initial = getInitialCompletions();
      saveCompletions(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCompletions(completions: CompletionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
  } catch (e) {
    console.error('Failed to save completions to localStorage', e);
  }
}

export function loadNotes(): ImportantNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: ImportantNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories to localStorage', e);
  }
}

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(INITIAL_HABITS);
      return INITIAL_HABITS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits to localStorage', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
  localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
  localStorage.removeItem(STORAGE_KEYS.NOTES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.ONE_OFF);
  localStorage.removeItem(STORAGE_KEYS.HABITS);
}
