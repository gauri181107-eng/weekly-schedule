import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'study',
    name: 'Study',
    color: '#6366f1', // Indigo
    bgLight: 'bg-indigo-50',
    textLight: 'text-indigo-700',
    borderLight: 'border-indigo-200',
    bgDark: 'dark:bg-indigo-950/60',
    textDark: 'dark:text-indigo-300',
    borderDark: 'dark:border-indigo-800',
    iconName: 'BookOpen',
  },
  {
    id: 'coding',
    name: 'Coding',
    color: '#06b6d4', // Cyan
    bgLight: 'bg-cyan-50',
    textLight: 'text-cyan-700',
    borderLight: 'border-cyan-200',
    bgDark: 'dark:bg-cyan-950/60',
    textDark: 'dark:text-cyan-300',
    borderDark: 'dark:border-cyan-800',
    iconName: 'Code',
  },
  {
    id: 'college',
    name: 'College',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/60',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-800',
    iconName: 'GraduationCap',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/60',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-800',
    iconName: 'Activity',
  },
  {
    id: 'personal',
    name: 'Personal & Routine',
    color: '#f59e0b', // Amber
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/60',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-800',
    iconName: 'User',
  },
  {
    id: 'revision',
    name: 'Revision',
    color: '#8b5cf6', // Purple
    bgLight: 'bg-purple-50',
    textLight: 'text-purple-700',
    borderLight: 'border-purple-200',
    bgDark: 'dark:bg-purple-950/60',
    textDark: 'dark:text-purple-300',
    borderDark: 'dark:border-purple-800',
    iconName: 'RotateCcw',
  },
];

export function getCategoryById(categories: Category[], id?: string): Category {
  const found = categories.find((c) => c.id === id);
  if (found) return found;
  return categories[0] || DEFAULT_CATEGORIES[0];
}
