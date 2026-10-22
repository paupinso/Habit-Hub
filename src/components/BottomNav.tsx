import React from 'react';
import { CheckSquare, Moon, Utensils, Activity, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabType =
  | 'habits'
  | 'sleep'
  | 'nutrition'
  | 'sport'
  | 'assistant'
  | 'review'
  | 'performance'
  | 'goals'
  | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasPendingReview: boolean;
  todayProgress: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  hasPendingReview,
  todayProgress,
}) => {
  const tabs = [
    {
      id: 'habits' as TabType,
      label: 'Avui',
      icon: CheckSquare,
      badge: todayProgress === 100 ? '✓' : `${todayProgress}%`,
    },
    {
      id: 'sleep' as TabType,
      label: 'Son',
      icon: Moon,
    },
    {
      id: 'nutrition' as TabType,
      label: 'Dieta & Kcal',
      icon: Utensils,
      highlight: true,
    },
    {
      id: 'sport' as TabType,
      label: 'Esport',
      icon: Activity,
    },
    {
      id: 'assistant' as TabType,
      label: 'Assistent',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      aria-label="Navegació principal"
      className="sticky bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe transition-all mt-auto shadow-[0_-1px_3px_rgba(0,0,0,0.03)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.tap();
                onSelectTab(tab.id);
              }}
              className="relative min-h-[48px] min-w-[40px] flex flex-col items-center justify-center py-1 transition-transform active:scale-95 focus-visible:outline-none"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-emerald-600 stroke-[2.4]'
                      : 'text-slate-400 stroke-[1.8] hover:text-slate-600'
                  }`}
                />
                {tab.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors truncate max-w-[62px] ${
                  isActive
                    ? 'text-emerald-700 font-extrabold'
                    : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
