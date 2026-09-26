import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Clock,
  Calendar,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertTriangle,
  Sparkles,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import { UserSettings, Category } from '../types';
import { CategoryBadge } from './CategoryBadge';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onResetAllData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  totalScheduleTasks: number;
  totalNotes: number;
  totalCompletions: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  categories,
  onAddCategory,
  onDeleteCategory,
  onResetAllData,
  onExportData,
  onImportData,
  totalScheduleTasks,
  totalNotes,
  totalCompletions,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = onImportData(text);
        if (success) {
          setImportStatus('Data successfully restored!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Invalid JSON data backup file.');
        }
      } catch {
        setImportStatus('Error reading file.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = newCatName.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id,
      name: newCatName.trim(),
      color: newCatColor,
      bgLight: 'bg-slate-100',
      textLight: 'text-slate-800',
      borderLight: 'border-slate-300',
      bgDark: 'dark:bg-slate-800',
      textDark: 'dark:text-slate-200',
      borderDark: 'dark:border-slate-700',
      iconName: 'Tag',
    };

    onAddCategory(newCat);
    setNewCatName('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Settings className="w-3.5 h-3.5" />
            Preferences
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1.5">
          Settings & Data
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize display options, manage routine categories, and backup or restore your schedule.
        </p>
      </div>

      {/* General Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Display & Routine Settings
        </h2>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Sunday Free / Optional Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Include Sunday in Schedule
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Keep Monday to Saturday as primary routine; enable Sunday if you follow a 7-day routine.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeSunday}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, includeSunday: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Time Format */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Time Format
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose between 12-hour (e.g. 5:30 PM) and 24-hour (17:30) display.
              </p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '12h'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                12-Hour (AM/PM)
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '24h'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Theme mode */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {settings.theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                Color Theme
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle between light and dark mode appearance.
              </p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Categories & Tags Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Categories & Color Tags
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Color-coded tags organize study, college, coding, health, personal, and revision tasks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80"
            >
              <CategoryBadge category={cat} size="sm" />
              {categories.length > 3 && (
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                  title="Remove category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add custom tag */}
        <form onSubmit={handleCreateCategory} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add new tag (e.g. Lab, Project, Fitness)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Add Tag
          </button>
        </form>
      </div>

      {/* Backup, Export & Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Data Management & Backup
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Scheduled Routine</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalScheduleTasks} tasks
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Completed Records</span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {totalCompletions} logs
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Important Notes</span>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {totalNotes} notes
            </div>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export button */}
          <button
            onClick={onExportData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            Export Data Backup (JSON)
          </button>

          {/* Import file label */}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-indigo-500" />
            Restore from Backup
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Reset button */}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-rose-600 font-semibold">
                Reset everything to defaults?
              </span>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
