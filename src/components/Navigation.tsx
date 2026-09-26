import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarRange,
  Columns3,
  BarChart3,
  StickyNote,
  Settings,
  Sun,
  Moon,
  Flame,
  Menu,
  X,
  Clock,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { ActiveTab, UserSettings } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  onOpenAIAssistant: () => void;
  streak: number;
  todayCompletedCount: number;
  todayTotalCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onToggleTheme,
  onOpenAIAssistant,
  streak,
  todayCompletedCount,
  todayTotalCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarCheck className="w-5 h-5" />,
      badge: todayTotalCount > 0 ? `${todayCompletedCount}/${todayTotalCount}` : undefined,
    },
    { id: 'weekly-schedule', label: 'Weekly Schedule', icon: <CalendarRange className="w-5 h-5" /> },
    { id: 'week-overview', label: 'Week', icon: <Columns3 className="w-5 h-5" /> },
    { id: 'habits', label: 'Habits', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'notes', label: 'Important Notes', icon: <StickyNote className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shrink-0 z-30">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-base tracking-tight leading-tight">
                Routinely
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weekly Schedule & Tasks</p>
            </div>
          </div>
        </div>

        {/* Streak & Today's Summary Card */}
        <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-gradient-to-br from-indigo-50/80 to-sky-50/80 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-100/70 dark:border-indigo-900/40">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streak} Day Streak</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
              {todayCompletedCount}/{todayTotalCount}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Assistant Quick Card in Sidebar */}
        <div className="px-3 py-2">
          <button
            onClick={onOpenAIAssistant}
            className="w-full p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-600/20 text-left hover:opacity-95 transition-all group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Gemini Assistant
              </span>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-indigo-100 font-medium leading-snug">
              Describe schedule changes in text & AI edits them for you!
            </p>
          </button>
        </div>

        {/* Bottom Theme & User Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>Recurring Sync Active</span>
          </div>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Light / Dark mode"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">Routinely</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800"
            title="Open Gemini AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI</span>
          </button>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak}d</span>
            </div>
          )}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl z-30 p-4 space-y-1 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Bottom Quick Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 px-2 py-1.5 flex justify-around items-center">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
            activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium relative ${
            activeTab === 'today' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <CalendarCheck className="w-4 h-4 mb-0.5" />
          Today
          {todayTotalCount > todayCompletedCount && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-600"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('weekly-schedule')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
            activeTab === 'weekly-schedule' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <CalendarRange className="w-4 h-4 mb-0.5" />
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('week-overview')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
            activeTab === 'week-overview' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <Columns3 className="w-4 h-4 mb-0.5" />
          Week
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
            activeTab === 'habits' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          Habits
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium ${
            activeTab === 'notes' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'
          }`}
        >
          <StickyNote className="w-4 h-4 mb-0.5" />
          Notes
        </button>
      </div>
    </>
  );
};
