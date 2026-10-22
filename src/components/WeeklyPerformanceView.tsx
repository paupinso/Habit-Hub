import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  Flame,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart2,
  Zap,
  Target,
  Candy,
  Scale,
  Moon,
  Activity,
  Utensils,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  HeartPulse,
} from 'lucide-react';
import {
  Habit,
  HabitLog,
  DailyReview,
  WeeklyAnalysis,
  DayPerformanceData,
  NutritionDay,
  SleepRecord,
  SportSession,
} from '../types';
import { sound } from '../utils/audio';
import {
  getWeeklyAnalysis,
  loadNutritionDays,
  loadSleepRecords,
  loadSportSessions,
  calculateTotalDayCalories,
  calculateTotalDayNutrients,
} from '../utils/storage';
import {
  getWeekDaysForDate,
  getWeekRangeLabel,
  parseIsoDate,
  formatDateIso,
  getTodayIso,
  formatCatalanDateLong,
} from '../utils/date';
import { TabType } from './BottomNav';

interface WeeklyPerformanceViewProps {
  habits: Habit[];
  logs: HabitLog[];
  reviews: DailyReview[];
  onSelectDay: (date: string) => void;
  onNavigateTab?: (tab: TabType) => void;
}

type MetricMode = 'calories' | 'macros' | 'habits' | 'sleep' | 'sport' | 'sugar';

export const WeeklyPerformanceView: React.FC<WeeklyPerformanceViewProps> = ({
  habits,
  logs,
  reviews,
  onSelectDay,
  onNavigateTab,
}) => {
  const [currentDateIso, setCurrentDateIso] = useState<string>(getTodayIso());
  const [selectedDayIso, setSelectedDayIso] = useState<string>(getTodayIso());
  const [metricMode, setMetricMode] = useState<MetricMode>('calories');

  // Load all user-scoped data
  const analysis: WeeklyAnalysis = getWeeklyAnalysis(currentDateIso, habits, logs, reviews);
  const weekDays = getWeekDaysForDate(currentDateIso);
  const weekLabel = getWeekRangeLabel(weekDays);
  const nutritionDays: NutritionDay[] = loadNutritionDays();
  const sleepRecords: SleepRecord[] = loadSleepRecords();
  const sportSessions: SportSession[] = loadSportSessions();

  const handlePrevWeek = () => {
    sound.tap();
    const d = parseIsoDate(currentDateIso);
    d.setDate(d.getDate() - 7);
    setCurrentDateIso(formatDateIso(d));
  };

  const handleNextWeek = () => {
    sound.tap();
    const d = parseIsoDate(currentDateIso);
    d.setDate(d.getDate() + 7);
    setCurrentDateIso(formatDateIso(d));
  };

  const handleCurrentWeek = () => {
    sound.tap();
    const today = getTodayIso();
    setCurrentDateIso(today);
    setSelectedDayIso(today);
  };

  // Compile full day-by-day dataset for the 7 days (Monday - Sunday)
  const fullWeekDays = weekDays.map((d) => {
    const perfDay = analysis.days.find((p) => p.date === d.date);
    const nut = nutritionDays.find((n) => n.date === d.date);
    const sleep = sleepRecords.find((s) => s.date === d.date);
    const sport = sportSessions.find((sp) => sp.date === d.date);

    const targetKcal = nut?.calorieTarget || 2200;
    const consumedKcal = nut ? calculateTotalDayCalories(nut) : (perfDay?.totalCalories || 0);
    const nutrients = nut ? calculateTotalDayNutrients(nut) : {
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      saturatedFatG: 0,
      fiberG: 0,
      sugarsG: 0,
      saltG: 0,
    };

    const hasSugar =
      nut?.consumedSugarToday ||
      nut?.meals.esmorzar?.hasSugar ||
      nut?.meals['berenar-mati']?.hasSugar ||
      nut?.meals.dinar?.hasSugar ||
      nut?.meals['berenar-horabaixa']?.hasSugar ||
      nut?.meals.sopar?.hasSugar ||
      false;

    const sleepHours = sleep?.durationHours || 0;
    const sportMin = sport && !sport.isRestDay ? sport.durationMinutes : 0;
    const habitPercent = perfDay?.habitCompletionRate || 0;

    return {
      date: d.date,
      dayName: d.dayName,
      dayNumber: d.dayNumber,
      isToday: d.isToday,
      targetKcal,
      consumedKcal,
      diffKcal: consumedKcal - targetKcal,
      nutrients,
      hasSugar,
      sugarNotes: nut?.sugarNotes,
      sleepHours,
      sleepQuality: sleep?.sleptWell,
      sportMin,
      sportName: sport?.sport || (sport?.isRestDay ? 'Descans' : 'Sense registre'),
      sportIntensity: sport?.intensity,
      habitPercent,
      completedHabits: perfDay?.completedHabits || 0,
      totalHabits: perfDay?.totalHabits || habits.filter((h) => !h.archived).length || 1,
      performanceScore: perfDay?.performanceIndex || 0,
      meals: nut?.meals,
    };
  });

  // Selected day detail
  const selectedDayData =
    fullWeekDays.find((d) => d.date === selectedDayIso) || fullWeekDays[0];

  // Max value calculations for scaling bar charts
  const maxCalories = Math.max(2600, ...fullWeekDays.map((d) => d.consumedKcal));
  const maxSleep = Math.max(10, ...fullWeekDays.map((d) => d.sleepHours));
  const maxSport = Math.max(90, ...fullWeekDays.map((d) => d.sportMin));
  const maxMacroGram = Math.max(
    180,
    ...fullWeekDays.map((d) => Math.max(d.nutrients.proteinG, d.nutrients.carbsG, d.nutrients.fatG))
  );

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* 1. Week Selector Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
        <button
          onClick={handlePrevWeek}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all border border-slate-200"
          aria-label="Setmana anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Aparell de Comparativa Setmanal
            </span>
            {currentDateIso !== getTodayIso() && (
              <button
                onClick={handleCurrentWeek}
                className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md hover:bg-emerald-200"
              >
                Setmana Actual
              </button>
            )}
          </div>
          <h2 className="text-sm font-extrabold text-slate-900 capitalize mt-0.5">{weekLabel}</h2>
        </div>

        <button
          onClick={handleNextWeek}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all border border-slate-200"
          aria-label="Setmana següent"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Interactive Metric Switcher (Bar Chart Modes) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1.5">
          Selecciona mètrica a comparar dia a dia:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sound.tap();
              setMetricMode('calories');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'calories'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Calories (kcal)</span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              setMetricMode('macros');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'macros'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Macros (P/C/G)</span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              setMetricMode('habits');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'habits'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Hàbits (%)</span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              setMetricMode('sleep');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'sleep'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Son (h)</span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              setMetricMode('sport');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'sport'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Esport (min)</span>
          </button>

          <button
            onClick={() => {
              sound.tap();
              setMetricMode('sugar');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              metricMode === 'sugar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Candy className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sucre (1 pic)</span>
          </button>
        </div>
      </div>

      {/* 3. Main Comparative Visual Apparatus (The Day-by-Day Bar Chart) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        {/* Metric Header & Legend */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Comparació dia a dia
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              {metricMode === 'calories' && 'Calories consumides vs Objectiu (2.200 kcal)'}
              {metricMode === 'macros' && 'Distribució de Proteïnes, Carbs i Greixos'}
              {metricMode === 'habits' && 'Taxa de compliment d’hàbits diaris'}
              {metricMode === 'sleep' && 'Hores de descans nocturn'}
              {metricMode === 'sport' && 'Minuts d’entrenament i activitat'}
              {metricMode === 'sugar' && 'Control setmanal del Sucre (màx 1 pic/setmana)'}
            </h3>
          </div>

          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Clica un dia
          </span>
        </div>

        {/* Legend for Macros mode */}
        {metricMode === 'macros' && (
          <div className="flex items-center justify-center gap-4 text-[11px] font-bold py-1 bg-slate-50 rounded-xl">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Proteïna
            </span>
            <span className="flex items-center gap-1.5 text-sky-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Carbohidrats
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Greixos
            </span>
          </div>
        )}

        {/* THE BAR CHART */}
        <div className="h-48 pt-4 pb-1 flex items-end justify-between gap-1.5 px-1 relative">
          {/* Target line for calories mode */}
          {metricMode === 'calories' && (
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-emerald-400/80 pointer-events-none z-10 flex items-center justify-end pr-2"
              style={{
                bottom: `${Math.round((2200 / maxCalories) * 100 * 0.72 + 28)}px`,
              }}
            >
              <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded shadow-xs">
                Obj: 2.200 kcal
              </span>
            </div>
          )}

          {/* Optimal sleep target line */}
          {metricMode === 'sleep' && (
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-400/80 pointer-events-none z-10 flex items-center justify-end pr-2"
              style={{
                bottom: `${Math.round((8 / maxSleep) * 100 * 0.72 + 28)}px`,
              }}
            >
              <span className="text-[9px] font-black text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded shadow-xs">
                Obj: 8.0h
              </span>
            </div>
          )}

          {fullWeekDays.map((day) => {
            const isSelected = day.date === selectedDayIso;

            // Height calculations
            let barHeightPercent = 10;
            let barColor = 'bg-emerald-500';
            let topLabel = '';

            if (metricMode === 'calories') {
              barHeightPercent = Math.min(100, Math.max(12, Math.round((day.consumedKcal / maxCalories) * 100)));
              topLabel = day.consumedKcal > 0 ? `${day.consumedKcal}` : '0';
              if (day.hasSugar) {
                barColor = 'bg-rose-500';
              } else if (day.consumedKcal > 2350) {
                barColor = 'bg-amber-500';
              } else if (day.consumedKcal >= 1900) {
                barColor = 'bg-emerald-500';
              } else if (day.consumedKcal > 0) {
                barColor = 'bg-teal-400';
              } else {
                barColor = 'bg-slate-200';
              }
            } else if (metricMode === 'habits') {
              barHeightPercent = Math.max(12, day.habitPercent);
              topLabel = `${day.habitPercent}%`;
              barColor = day.habitPercent >= 80 ? 'bg-emerald-500' : day.habitPercent >= 50 ? 'bg-amber-500' : 'bg-slate-300';
            } else if (metricMode === 'sleep') {
              barHeightPercent = Math.max(12, Math.round((day.sleepHours / maxSleep) * 100));
              topLabel = day.sleepHours > 0 ? `${day.sleepHours}h` : '0h';
              barColor = day.sleepHours >= 7.5 ? 'bg-indigo-500' : day.sleepHours >= 6.5 ? 'bg-indigo-400' : 'bg-amber-500';
            } else if (metricMode === 'sport') {
              barHeightPercent = day.sportMin > 0 ? Math.max(14, Math.round((day.sportMin / maxSport) * 100)) : 10;
              topLabel = day.sportMin > 0 ? `${day.sportMin}m` : '0';
              barColor = day.sportMin >= 60 ? 'bg-emerald-600' : day.sportMin > 0 ? 'bg-teal-500' : 'bg-slate-200';
            } else if (metricMode === 'sugar') {
              barHeightPercent = day.hasSugar ? 85 : 30;
              topLabel = day.hasSugar ? '1 pic' : 'Net';
              barColor = day.hasSugar ? 'bg-rose-500' : 'bg-emerald-500';
            }

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  sound.tap();
                  setSelectedDayIso(day.date);
                }}
                className={`flex-1 flex flex-col items-center h-full justify-end group transition-transform focus:outline-none ${
                  isSelected ? 'scale-105' : 'hover:opacity-90'
                }`}
              >
                {/* Numeric label over bar */}
                <span
                  className={`text-[9px] font-black mb-1 truncate max-w-full ${
                    isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-500'
                  }`}
                >
                  {topLabel}
                </span>

                {/* The Bar */}
                <div className="w-full max-w-[34px] h-[130px] flex items-end justify-center">
                  {metricMode === 'macros' ? (
                    // Grouped mini bars for Protein, Carbs, Fat
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      {/* Protein */}
                      <div
                        style={{
                          height: `${Math.max(8, Math.round((day.nutrients.proteinG / maxMacroGram) * 100))}%`,
                        }}
                        className={`w-2.5 rounded-t-sm bg-emerald-500 transition-all ${
                          isSelected ? 'ring-1 ring-emerald-700' : ''
                        }`}
                        title={`Proteïna: ${day.nutrients.proteinG}g`}
                      />
                      {/* Carbs */}
                      <div
                        style={{
                          height: `${Math.max(8, Math.round((day.nutrients.carbsG / maxMacroGram) * 100))}%`,
                        }}
                        className={`w-2.5 rounded-t-sm bg-sky-500 transition-all ${
                          isSelected ? 'ring-1 ring-sky-700' : ''
                        }`}
                        title={`Carbohidrats: ${day.nutrients.carbsG}g`}
                      />
                      {/* Fat */}
                      <div
                        style={{
                          height: `${Math.max(8, Math.round((day.nutrients.fatG / maxMacroGram) * 100))}%`,
                        }}
                        className={`w-2.5 rounded-t-sm bg-amber-500 transition-all ${
                          isSelected ? 'ring-1 ring-amber-700' : ''
                        }`}
                        title={`Greix: ${day.nutrients.fatG}g`}
                      />
                    </div>
                  ) : (
                    <div
                      style={{ height: `${barHeightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all shadow-xs ${barColor} ${
                        isSelected
                          ? 'ring-2 ring-emerald-600 ring-offset-2 ring-offset-white'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                    />
                  )}
                </div>

                {/* Day of Week Label */}
                <div
                  className={`mt-2 text-center w-full rounded-md py-0.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-black'
                      : day.isToday
                      ? 'bg-emerald-100 text-emerald-800 font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="text-[10px] block uppercase font-bold leading-none">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-[9px] font-medium leading-none">{day.dayNumber}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Day Drilldown Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-4 rounded-3xl border border-emerald-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Inspecció detallada del dia
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                {selectedDayData.dayName}, {selectedDayData.dayNumber} ({selectedDayData.date})
              </h4>
            </div>
          </div>

          <button
            onClick={() => {
              sound.tap();
              onSelectDay(selectedDayData.date);
              if (onNavigateTab) onNavigateTab('nutrition');
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <span>Obrir al Diari</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Nutritional Summary of the selected day */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              Balanç Calòric del Dia
            </span>
            <div className="text-right">
              <span className="text-base font-black text-slate-900 tabular-nums">
                {selectedDayData.consumedKcal} kcal
              </span>
              <span className="text-[11px] text-slate-400 font-medium ml-1">
                / {selectedDayData.targetKcal} kcal
              </span>
            </div>
          </div>

          {/* Kcal Difference pill */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Balanç energètic:</span>
            <span
              className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                selectedDayData.diffKcal > 150
                  ? 'bg-amber-50 text-amber-800'
                  : selectedDayData.diffKcal < -300
                  ? 'bg-sky-50 text-sky-800'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {selectedDayData.diffKcal > 0
                ? `+${selectedDayData.diffKcal} kcal superàvit`
                : selectedDayData.diffKcal < 0
                ? `${selectedDayData.diffKcal} kcal dèficit`
                : 'Exacte amb l’objectiu'}
            </span>
          </div>

          {/* 7-Nutrients Breakdown */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
              <span className="text-[9px] uppercase font-bold text-emerald-800 block">Proteïna</span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {selectedDayData.nutrients.proteinG}g
              </span>
            </div>

            <div className="p-2 bg-sky-50/70 rounded-xl border border-sky-200/60">
              <span className="text-[9px] uppercase font-bold text-sky-800 block">Carbohidrats</span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {selectedDayData.nutrients.carbsG}g
              </span>
            </div>

            <div className="p-2 bg-amber-50/70 rounded-xl border border-amber-200/60">
              <span className="text-[9px] uppercase font-bold text-amber-800 block">Greixos</span>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {selectedDayData.nutrients.fatG}g
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-500 block">Fibra</span>
              <span className="font-bold text-slate-800">{selectedDayData.nutrients.fiberG}g</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-500 block">Sucres</span>
              <span className="font-bold text-slate-800">{selectedDayData.nutrients.sugarsG}g</span>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="text-[9px] text-slate-500 block">Sal</span>
              <span className="font-bold text-slate-800">{selectedDayData.nutrients.saltG}g</span>
            </div>
          </div>
        </div>

        {/* Other dimensions: Habits, Sleep, Sport, Sugar */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Habits pill */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Hàbits
            </span>
            <span className="font-black text-slate-900">
              {selectedDayData.completedHabits}/{selectedDayData.totalHabits} ({selectedDayData.habitPercent}%)
            </span>
          </div>

          {/* Sleep pill */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              Descans
            </span>
            <span className="font-black text-slate-900">
              {selectedDayData.sleepHours || 0} h
            </span>
          </div>

          {/* Sport pill */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Esport
            </span>
            <span className="font-black text-slate-900 truncate max-w-[100px]">
              {selectedDayData.sportMin > 0 ? `${selectedDayData.sportMin}m (${selectedDayData.sportName})` : 'Descans'}
            </span>
          </div>

          {/* Sugar pill */}
          <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-semibold flex items-center gap-1.5">
              <Candy className="w-3.5 h-3.5 text-rose-500" />
              Sucre
            </span>
            <span
              className={`font-black ${
                selectedDayData.hasSugar ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {selectedDayData.hasSugar ? '⚠️ Pic consumit' : '✓ 100% Net'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. 4 Summary KPIs in Pure Blanc & Verd */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mitjana Calòrica</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {analysis.averageCalories || 2120} kcal
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            Objectiu recomanat: 2.200 kcal/dia
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Candy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Regla del Sucre</span>
          </div>
          <div
            className={`text-2xl font-black tabular-nums ${
              analysis.weeklySugarCount > 1 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {analysis.weeklySugarCount} / 1
          </div>
          <span
            className={`text-[10px] font-bold block ${
              analysis.weeklySugarCount > 1
                ? 'text-rose-600'
                : analysis.weeklySugarCount === 1
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {analysis.weeklySugarCount > 1
              ? 'Límit setmanal superat!'
              : analysis.weeklySugarCount === 1
              ? 'Comodí setmanal emprat'
              : '0 pics (Impecable)'}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Moon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mitjana de son</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {analysis.averageSleepHours} h
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block">
            Recuperació muscular òptima
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Esport acumulat</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            {analysis.totalSportMinutes} min
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Entrenament i recuperació
          </span>
        </div>
      </div>

      {/* 6. Intelligent Coaching Insights in Catalan */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Conclusions i Anàlisi de la Setmana</span>
        </div>

        <div className="space-y-2">
          {analysis.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-slate-800 font-semibold leading-relaxed flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
