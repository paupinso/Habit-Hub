import React from 'react';
import { Flame, Target, MoonStar, Settings, BarChart2, UserCheck } from 'lucide-react';
import { formatCatalanDateLong } from '../utils/date';
import { sound } from '../utils/audio';
import { TabType } from './BottomNav';
import { UserAccount } from '../types';

interface HeaderProps {
  selectedDate: string;
  isToday: boolean;
  streakDays: number;
  currentTab: TabType;
  currentUser: UserAccount;
  onSelectTab: (tab: TabType) => void;
  onOpenNewHabit: () => void;
  onResetToToday: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  isToday,
  streakDays,
  currentTab,
  currentUser,
  onSelectTab,
  onOpenNewHabit,
  onResetToToday,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 pt-safe px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand title & Date in White & Emerald */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.tap();
                onSelectTab('habits');
              }}
              className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              HabitPulse
            </button>
            {!isToday && (
              <button
                onClick={() => {
                  sound.tap();
                  onResetToToday();
                }}
                className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors ml-1"
              >
                Avui
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium truncate">
            {formatCatalanDateLong(selectedDate)}
          </span>
        </div>

        {/* Right Action Icons: Streak, Comparative Chart, Goals, User Profile, Settings */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            title={`Ratxa activa de ${streakDays} dies`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold tabular-nums"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{streakDays}d</span>
          </div>

          {/* Comparative Weekly Chart Button */}
          <button
            onClick={() => {
              sound.tap();
              onSelectTab('performance');
            }}
            title="Comparativa Setmanal i Gràfics dia a dia"
            className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              currentTab === 'performance'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.tap();
              onSelectTab('goals');
            }}
            title="Evolució i Objectius"
            className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              currentTab === 'goals'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Target className="w-4 h-4" />
          </button>

          {/* User Account / Email Switcher Button */}
          <button
            onClick={() => {
              sound.tap();
              onOpenAuth();
            }}
            title={`Compte: ${currentUser.name} (${currentUser.email}) - Gestió de comptes`}
            className="min-h-[34px] px-2 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/90 text-emerald-800 transition-all active:scale-95"
          >
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
              {currentUser.avatarInitials || 'US'}
            </span>
            <span className="text-[11px] font-bold max-w-[65px] truncate hidden sm:inline">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              onSelectTab('settings');
            }}
            title="Ajustos i Còpia"
            className={`min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              currentTab === 'settings'
                ? 'bg-slate-800 border-slate-800 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
