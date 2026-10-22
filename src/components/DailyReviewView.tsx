import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Smile,
  ShieldAlert,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Calendar,
  History,
  Clock,
  Candy,
  Scale,
} from 'lucide-react';
import { DailyReview, Habit, HabitLog } from '../types';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { formatCatalanDateLong } from '../utils/date';

interface DailyReviewViewProps {
  selectedDate: string;
  habits: Habit[];
  logs: HabitLog[];
  reviews: DailyReview[];
  onSaveReview: (review: DailyReview) => void;
  onGoToHabits: () => void;
}

export const DailyReviewView: React.FC<DailyReviewViewProps> = ({
  selectedDate,
  habits,
  logs,
  reviews,
  onSaveReview,
  onGoToHabits,
}) => {
  const existingReview = reviews.find((r) => r.date === selectedDate);

  const [productivityScore, setProductivityScore] = useState<number>(
    existingReview ? existingReview.productivityScore : 8
  );
  const [energyLevel, setEnergyLevel] = useState<number>(
    existingReview ? existingReview.energyLevel : 4
  );
  const [focusLevel, setFocusLevel] = useState<number>(
    existingReview ? existingReview.focusLevel : 4
  );
  const [stressLevel, setStressLevel] = useState<number>(
    existingReview ? existingReview.stressLevel : 2
  );
  const [dailyWin, setDailyWin] = useState<string>(
    existingReview ? existingReview.dailyWin : ''
  );
  const [improvement, setImprovement] = useState<string>(
    existingReview ? existingReview.improvement : ''
  );
  const [notes, setNotes] = useState<string>(
    existingReview?.notes || ''
  );
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Sync state when selected date changes
  useEffect(() => {
    if (existingReview) {
      setProductivityScore(existingReview.productivityScore);
      setEnergyLevel(existingReview.energyLevel);
      setFocusLevel(existingReview.focusLevel);
      setStressLevel(existingReview.stressLevel);
      setDailyWin(existingReview.dailyWin);
      setImprovement(existingReview.improvement);
      setNotes(existingReview.notes || '');
    } else {
      setProductivityScore(8);
      setEnergyLevel(4);
      setFocusLevel(4);
      setStressLevel(2);
      setDailyWin('');
      setImprovement('');
      setNotes('');
    }
    setIsSavedRecently(false);
  }, [selectedDate, existingReview]);

  // Habits completed today
  const activeHabits = habits.filter((h) => !h.archived);
  const totalHabits = activeHabits.length || 1;
  const completedHabits = activeHabits.filter((h) => {
    const l = logs.find((log) => log.habitId === h.id && log.date === selectedDate);
    return l?.completed;
  }).length;
  const habitRate = Math.round((completedHabits / totalHabits) * 100);

  // Real-time calculated overall performance index
  const calculatedIndex = Math.min(
    100,
    Math.round(habitRate * 0.6 + (productivityScore / 10) * 30 + (energyLevel / 5) * 10)
  );

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { label: 'Dia Excel·lent 🔥', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (score >= 70) return { label: 'Dia Molt Bo ✨', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score >= 50) return { label: 'Dia Acceptable 👍', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { label: 'Dia Millorable ⚡', color: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const badge = getPerformanceBadge(calculatedIndex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.completeHabit();

    const review: DailyReview = {
      date: selectedDate,
      completed: true,
      productivityScore,
      energyLevel,
      focusLevel,
      stressLevel,
      dailyWin: dailyWin.trim() || 'Jornada mantinguda amb constància.',
      improvement: improvement.trim() || 'Continuar amb el bon ritme.',
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
      calculatedPerformanceIndex: calculatedIndex,
    };

    onSaveReview(review);
    setIsSavedRecently(true);
    triggerConfetti();
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner in Blanc i Verd */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tancament del dia</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Avaluació de la jornada
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatCatalanDateLong(selectedDate)}
            </p>
          </div>

          {/* Overall Performance score gauge */}
          <div className="flex flex-col items-end">
            <div className="text-3xl font-black tabular-nums text-slate-900 flex items-baseline gap-0.5">
              <span>{calculatedIndex}</span>
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 shadow-sm ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Habits context bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-semibold">
            Hàbits assolits: <strong className="text-emerald-700 font-black">{completedHabits}/{totalHabits}</strong> ({habitRate}%)
          </span>
          <button
            onClick={() => {
              sound.tap();
              onGoToHabits();
            }}
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <span>Veure llista</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isSavedRecently && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-bold animate-in fade-in duration-300 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Avaluació desada amb èxit! El teu rendiment setmanal s'ha actualitzat.</span>
        </div>
      )}

      {/* Main Review Form in Blanc i Verd */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Productivity / Performance Slider */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <label htmlFor="prod-score" className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Rendiment global percebut
              </label>
            </div>
            <span className="text-sm font-black text-emerald-700 tabular-nums bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {productivityScore} / 10
            </span>
          </div>

          <input
            id="prod-score"
            type="range"
            min="1"
            max="10"
            step="1"
            value={productivityScore}
            onChange={(e) => {
              sound.tap();
              setProductivityScore(Number(e.target.value));
            }}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
            <span>1 - Molt baix</span>
            <span>5 - Normal</span>
            <span>10 - Extraordinari</span>
          </div>
        </div>

        {/* 2. Dials Grid: Energy, Focus, Stress */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Energy */}
          <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Energia</span>
              </span>
              <span className="text-xs font-black text-slate-900">{energyLevel}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setEnergyLevel(lvl);
                  }}
                  className={`flex-1 h-6 rounded-md text-[10px] font-bold transition-all ${
                    energyLevel >= lvl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Focus */}
          <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-emerald-600" />
                <span>Focus</span>
              </span>
              <span className="text-xs font-black text-slate-900">{focusLevel}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setFocusLevel(lvl);
                  }}
                  className={`flex-1 h-6 rounded-md text-[10px] font-bold transition-all ${
                    focusLevel >= lvl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Stress */}
          <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-500" />
                <span>Estrès</span>
              </span>
              <span className="text-xs font-black text-slate-900">{stressLevel}/5</span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setStressLevel(lvl);
                  }}
                  className={`flex-1 h-6 rounded-md text-[10px] font-bold transition-all ${
                    stressLevel >= lvl
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Qualitative Reflection Prompts */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3.5">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
            Reflexió del final de la jornada
          </span>

          {/* Daily Win */}
          <div className="space-y-1.5">
            <label htmlFor="daily-win" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quina ha estat la teva millor victòria o èxit d'avui?</span>
            </label>
            <input
              id="daily-win"
              type="text"
              value={dailyWin}
              onChange={(e) => setDailyWin(e.target.value)}
              placeholder="Ex: He completat l'entrenament, zero sucre, he menjat net..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Improvement */}
          <div className="space-y-1.5">
            <label htmlFor="daily-improv" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Què podries haver fet millor demà?</span>
            </label>
            <input
              id="daily-improv"
              type="text"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Ex: No ajornar la feina, beure més aigua, anar a dormir abans..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Additional notes / gratitude */}
          <div className="space-y-1.5">
            <label htmlFor="daily-notes" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-emerald-600" />
              <span>Notes o agraïments (opcional)</span>
            </label>
            <textarea
              id="daily-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pensaments lliures o reflexions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completar el Tancament del Dia</span>
        </button>
      </form>
    </div>
  );
};
