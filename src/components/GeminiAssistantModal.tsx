import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Check,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  Zap,
  Cpu,
  Layers,
  Trash2,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { ScheduleTask, Category, DayOfWeek } from '../types';
import { ScheduleAction } from '../../server/geminiHandler';
import { DAY_NAMES, formatTimeString } from '../utils/dateUtils';
import { CategoryBadge } from './CategoryBadge';
import { getCategoryById } from '../utils/categories';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  actions?: ScheduleAction[];
  actionsApplied?: boolean;
  timestamp: string;
}

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleTask[];
  categories: Category[];
  onApplyActions: (actions: ScheduleAction[]) => void;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  schedule,
  categories,
  onApplyActions,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `👋 **Hi! I'm your Routinely AI Assistant.**\n\nIf you're wondering how text-to-schedule editing works: **You don't need to manually click buttons to add, delete, or change every task!** You can simply describe in everyday language what changes you want to make, and I will draft the exact changes and apply them directly to your master weekly routine.\n\n### What I can do for you:\n* ⏰ **Change times:** *"Shift my wake up to 6:00 AM on weekdays"* or *"Move DSA study to 7 PM"*\n* ➕ **Add new tasks:** *"Add 45-min Python practice every Tuesday and Thursday at 6 PM"*\n* ❌ **Delete tasks:** *"Remove Friday evening mock test"*\n* 🏷️ **Categorize routine:** *"Tag all my programming sessions as Coding"*\n* 📚 **Exam prep:** *"Reorganize Wednesday and Thursday with 2 hours of DBMS & OS revision"*\n\nTry clicking any suggestion below or type your request!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterSuggestions = [
    'What all changes can you make for me?',
    'Shift my wake up to 6:00 AM on Monday to Friday',
    'Add a 45-min Python practice session on Tue & Thu at 6 PM',
    'Review my current routine and suggest a more balanced study flow',
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn chat
      const historyPayload = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          currentSchedule: schedule,
          categories,
          modelName: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: data.reply || 'Here are the recommended schedule updates.',
        actions: data.actions && data.actions.length > 0 ? data.actions : undefined,
        actionsApplied: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `I couldn't process your request right now. Please make sure the server is active or try again. (${error?.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyMessageActions = (messageId: string, actions?: ScheduleAction[]) => {
    if (!actions || actions.length === 0) return;
    onApplyActions(actions);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, actionsApplied: true } : m))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] max-h-[750px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-sky-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Routinely AI Assistant
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Describe routine edits in text & apply them automatically
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Model switcher */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
              title="Select Gemini model"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (High Availability)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fastest)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning)</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((message) => {
            const isAI = message.role === 'model';
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                    isAI
                      ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60'
                      : 'bg-indigo-600 text-white rounded-tr-xs font-medium shadow-sm shadow-indigo-600/25'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>

                  {/* Render Structured Schedule Actions if Gemini produced them */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <Layers className="w-3.5 h-3.5" />
                          Proposed Routine Changes ({message.actions.length}):
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {message.actions.map((act, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                  act.type === 'ADD'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                    : act.type === 'UPDATE'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {act.type}
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {act.title || (act.id ? `Task (${act.id})` : 'Routine Item')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                              {act.day && (
                                <span className="capitalize">{act.day.slice(0, 3)}</span>
                              )}
                              {act.time && (
                                <span>{act.time}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Apply button */}
                      <div className="pt-1">
                        {message.actionsApplied ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-4 h-4 stroke-[3]" />
                            Changes successfully applied to your weekly routine!
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApplyMessageActions(message.id, message.actions)}
                            className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Apply Changes to My Schedule Now
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-right ${
                      isAI ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {message.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Routinely AI is planning your schedule edits...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starter Suggestions */}
        {messages.length <= 3 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Suggested questions / prompt examples:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {starterSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-left transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type: 'Shift wake up to 6 AM' or 'Add DSA revision on Friday at 8 PM'..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-xs transition-all shrink-0"
            title="Send to AI Assistant"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
