import React, { useState } from 'react';
import {
  Check,
  Plus,
  Flame,
  Droplets,
  Activity,
  BookOpen,
  Target,
  Smile,
  Moon,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  MoreVertical,
  Trash2,
  Minus,
  Utensils,
  HelpCircle,
  Candy,
  Scale,
} from 'lucide-react';
import {
  Habit,
  HabitLog,
  DayMoment,
  SleepRecord,
  NutritionDay,
  SportSession,
  DailySurvey,
} from '../types';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { getWeekDaysForDate } from '../utils/date';
import { calculateHabitStreak, calculateTotalDayCalories, getWeeklySugarCount, loadNutritionDays } from '../utils/storage';
import { DynamicSurveySection } from './DynamicSurveySection';

interface HabitsViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  habits: Habit[];
  logs: HabitLog[];
  sleepRecord?: SleepRecord;
  nutritionDay?: NutritionDay;
  sportSession?: SportSession;
  survey?: DailySurvey;
  onToggleHabit: (habitId: string) => void;
  onUpdateHabitValue: (habitId: string, delta: number) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenNewHabit: () => void;
  onNavigateTab: (tab: any) => void;
  onSaveSurvey: (survey: DailySurvey) => void;
  isToday: boolean;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  selectedDate,
  onSelectDate,
  habits,
  logs,
  sleepRecord,
  nutritionDay,
  sportSession,
  survey,
  onToggleHabit,
  onUpdateHabitValue,
  onDeleteHabit,
  onOpenNewHabit,
  onNavigateTab,
  onSaveSurvey,
  isToday,
}) => {
  const [filterMoment, setFilterMoment] = useState<DayMoment | 'tots'>('tots');
  const [activeMenuHabitId, setActiveMenuHabitId] = useState<string | null>(null);
  const [showSurveyDetails, setShowSurveyDetails] = useState<boolean>(!survey?.completed);

  const weekDays = getWeekDaysForDate(selectedDate);
  const activeHabits = habits.filter((h) => !h.archived);

  const displayedHabits = activeHabits.filter((h) => {
    if (filterMoment === 'tots') return true;
    if (h.timeOfDay === 'tot-el-dia') return true;
    return h.timeOfDay === filterMoment;
  });

  const totalCount = activeHabits.length;
  const completedCount = activeHabits.filter((h) => {
    const l = logs.find((log) => log.habitId === h.id && log.date === selectedDate);
    return l?.completed;
  }).length;

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Nutrition & Sugar math
  const currentKcal = nutritionDay ? (nutritionDay.totalCalories || calculateTotalDayCalories(nutritionDay)) : 0;
  const allNuts = loadNutritionDays();
  const weeklySugar = getWeeklySugarCount(weekDays, allNuts);

  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Droplet':
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Smile':
        return <Smile className={className} />;
      case 'Moon':
        return <Moon className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const handleToggle = (habitId: string) => {
    const wasCompleted = logs.find((l) => l.habitId === habitId && l.date === selectedDate)?.completed;
    onToggleHabit(habitId);

    if (!wasCompleted) {
      if (completedCount + 1 >= totalCount && totalCount > 0) {
        sound.celebrate();
        triggerConfetti();
      }
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-3.5">
      {/* 1. Horizontal Date Scroller */}
      <section aria-label="Selector de dies de la setmana" className="pt-1">
        <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {weekDays.map((d) => {
            const isSelected = d.date === selectedDate;
            return (
              <button
                key={d.date}
                onClick={() => {
                  sound.tap();
                  onSelectDate(d.date);
                }}
                className={`min-h-[58px] flex flex-col items-center justify-center rounded-xl p-1 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                  {d.dayName}
                </span>
                <span
                  className={`text-sm tabular-nums mt-0.5 ${
                    isSelected ? 'font-black' : d.isToday ? 'text-emerald-700 font-bold' : 'font-semibold'
                  }`}
                >
                  {d.dayNumber}
                </span>
                {d.isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Visual 4-Card Dashboard: Son, Dieta & Kcal, Esport, Assistent */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Son & Descans */}
        <div
          onClick={() => {
            sound.tap();
            onNavigateTab('sleep');
          }}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm transition-all cursor-pointer space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Son & Descans</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-lg font-black text-slate-900 tabular-nums">
            {sleepRecord?.durationHours || 7.5} h
          </div>
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            {sleepRecord?.wokeUpTired ? '🥱 Cansat en llevar-se' : '😊 Descans reparador'} · {sleepRecord?.qualityScore || 4}★
          </span>
        </div>

        {/* Card 2: Dieta & Recompte Kcal */}
        <div
          onClick={() => {
            sound.tap();
            onNavigateTab('nutrition');
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 group ${
            weeklySugar > 1
              ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200/90 hover:border-emerald-500/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dieta & Kcal</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-lg font-black text-slate-900 tabular-nums flex items-baseline gap-1">
            <span>{currentKcal}</span>
            <span className="text-[10px] text-slate-500 font-medium">kcal</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold truncate">
            {weeklySugar > 1 ? (
              <span className="text-rose-600">⚠️ Sucre: {weeklySugar}/1 pic (excés!)</span>
            ) : weeklySugar === 1 ? (
              <span className="text-amber-700">Sucre: 1/1 pic (límit)</span>
            ) : (
              <span className="text-emerald-700">✓ Sucre: 0/1 pics (net)</span>
            )}
          </div>
        </div>

        {/* Card 3: Esport & Activitat */}
        <div
          onClick={() => {
            sound.tap();
            onNavigateTab('sport');
          }}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm transition-all cursor-pointer space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Esport</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            {sportSession ? (sportSession.isRestDay ? 'Descans actiu' : sportSession.sport) : 'Sense esport'}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            {sportSession && !sportSession.isRestDay
              ? sportSession.distanceKm
                ? `${sportSession.distanceKm} km · ${sportSession.pace || sportSession.durationMinutes + ' min'}`
                : `${sportSession.durationMinutes} min · Intensitat ${sportSession.intensity}`
              : 'Recuperació muscular'}
          </span>
        </div>

        {/* Card 4: Assistent IA */}
        <div
          onClick={() => {
            sound.tap();
            onNavigateTab('assistant');
          }}
          className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 shadow-sm transition-all cursor-pointer space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assistent IA</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-lg font-black text-slate-900 truncate">
            Coach Exigent
          </div>
          <span className="text-[10px] text-slate-500 font-medium block truncate">
            Auditoria crítica de dieta
          </span>
        </div>
      </section>

      {/* 3. Daily Habits Progress Card in Clean White & Emerald */}
      <section className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Hàbits d'avui</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-bold text-slate-800">
                {completedCount} de {totalCount} completats
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {percentage === 100
                ? 'Tots els hàbits assolits! 🎉'
                : percentage >= 60
                ? 'Molt bon ritme avui!'
                : 'Constància i disciplina'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {percentage === 100
                ? 'Excel·lent constància. Fes el tancament al vespre.'
                : 'La disciplina diària és la clau dels resultats.'}
            </p>
          </div>

          {/* Progress Ring */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="none" className="text-slate-100" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * percentage) / 100}
                strokeLinecap="round"
                className={`transition-all duration-700 ${percentage === 100 ? 'text-emerald-500' : 'text-emerald-600'}`}
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900 tabular-nums">
              {percentage}%
            </span>
          </div>
        </div>
      </section>

      {/* 4. Adaptive Dynamic Survey Accordion in White */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowSurveyDetails(!showSurveyDetails)}
          className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 hover:text-slate-900 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Enquesta de benestar del dia</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            survey?.completed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {survey?.completed ? 'Completada ✓' : 'Respondre ara'}
          </span>
        </button>

        {showSurveyDetails && (
          <DynamicSurveySection
            selectedDate={selectedDate}
            survey={survey}
            sleepRecord={sleepRecord}
            sportSession={sportSession}
            recentSportStreakCount={sportSession && !sportSession.isRestDay ? 3 : 0}
            onSaveSurvey={onSaveSurvey}
          />
        )}
      </div>

      {/* 5. Habits List & Moment Filters */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-900">Els teus hàbits</span>
          <div className="flex items-center gap-1 p-0.5 bg-white rounded-xl border border-slate-200 shadow-sm">
            {[
              { id: 'tots', label: 'Tots' },
              { id: 'mati', label: 'Matí' },
              { id: 'tarda', label: 'Tarda' },
              { id: 'nit', label: 'Nit' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.tap();
                  setFilterMoment(tab.id as DayMoment | 'tots');
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  filterMoment === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {displayedHabits.map((habit) => {
            const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
            const isCompleted = !!log?.completed;
            const currentVal = log?.currentValue || (isCompleted ? habit.targetValue : 0);
            const streak = calculateHabitStreak(habit.id, logs);
            const isQuantitative = habit.targetValue > 1 && !!habit.unit;

            return (
              <div
                key={habit.id}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {renderIcon(habit.icon)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-bold truncate ${
                        isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {habit.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className="capitalize">{habit.timeOfDay.replace('-', ' ')}</span>
                      {habit.targetValue > 1 && habit.unit && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {currentVal}/{habit.targetValue} {habit.unit}
                          </span>
                        </>
                      )}
                      {streak > 1 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold tabular-nums">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {streak} d
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {isQuantitative && !isCompleted && (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => {
                          sound.tap();
                          onUpdateHabitValue(habit.id, -1);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded active:scale-90 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold tabular-nums text-slate-900 px-1">
                        {currentVal}
                      </span>
                      <button
                        onClick={() => {
                          sound.tap();
                          onUpdateHabitValue(habit.id, 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded active:scale-90 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleToggle(habit.id)}
                    aria-label={isCompleted ? `Desmarcar ${habit.title}` : `Completar ${habit.title}`}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all active:scale-90 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'border-slate-300 bg-white text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <Check className={`w-5 h-5 stroke-[3] transition-transform ${isCompleted ? 'scale-100' : 'scale-75'}`} />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuHabitId(activeMenuHabitId === habit.id ? null : habit.id)}
                      className="min-h-[38px] min-w-[28px] flex items-center justify-center text-slate-400 hover:text-slate-700"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenuHabitId === habit.id && (
                      <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-36">
                        <button
                          onClick={() => {
                            sound.tap();
                            onDeleteHabit(habit.id);
                            setActiveMenuHabitId(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            sound.tap();
            onOpenNewHabit();
          }}
          className="w-full min-h-[44px] rounded-2xl bg-white border border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2 shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Afegir nou hàbit personal</span>
        </button>
      </div>
    </div>
  );
};
