import React, { useState } from 'react';
import {
  Target,
  BarChart3,
  Flame,
  Moon,
  Utensils,
  Activity,
  Plus,
  CheckCircle,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  Droplets,
  Candy,
  Scale,
  Trash2,
} from 'lucide-react';
import {
  PersonalGoal,
  SleepRecord,
  SportSession,
  NutritionDay,
  Habit,
  HabitLog,
} from '../types';
import { sound } from '../utils/audio';

interface GoalsAndStatsViewProps {
  goals: PersonalGoal[];
  sleepRecords: SleepRecord[];
  sportSessions: SportSession[];
  nutritionDays: NutritionDay[];
  habits: Habit[];
  logs: HabitLog[];
  onSaveGoals: (goals: PersonalGoal[]) => void;
}

export const GoalsAndStatsView: React.FC<GoalsAndStatsViewProps> = ({
  goals,
  sleepRecords,
  sportSessions,
  nutritionDays,
  habits,
  logs,
  onSaveGoals,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'objectius' | 'estadistiques'>('objectius');
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  // New goal state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PersonalGoal['category']>('son');
  const [newTarget, setNewTarget] = useState(8);
  const [newUnit, setNewUnit] = useState('h');
  const [newPeriod, setNewPeriod] = useState<'diari' | 'setmanal'>('diari');

  // Stats math
  const totalSleepHours = sleepRecords.reduce((acc, s) => acc + s.durationHours, 0);
  const avgSleepHours =
    sleepRecords.length > 0 ? Number((totalSleepHours / sleepRecords.length).toFixed(1)) : 8.0;

  const totalSportMin = sportSessions
    .filter((s) => !s.isRestDay)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const sportCount = sportSessions.filter((s) => !s.isRestDay).length;

  const totalLoggedMeals = nutritionDays.reduce((acc, n) => {
    let count = 0;
    if (n.meals.esmorzar.items) count++;
    if (n.meals['berenar-mati'].items) count++;
    if (n.meals.dinar.items) count++;
    if (n.meals['berenar-horabaixa'].items) count++;
    if (n.meals.sopar.items) count++;
    return acc + count;
  }, 0);

  // Popular sports breakdown
  const sportCounts: Record<string, number> = {};
  sportSessions
    .filter((s) => !s.isRestDay)
    .forEach((s) => {
      sportCounts[s.sport] = (sportCounts[s.sport] || 0) + 1;
    });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    sound.completeHabit();

    const created: PersonalGoal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetValue: Number(newTarget) || 1,
      currentValue: 0,
      unit: newUnit.trim() || '',
      period: newPeriod,
    };

    onSaveGoals([...goals, created]);
    setNewTitle('');
    setIsAddGoalOpen(false);
  };

  const handleUpdateGoalProgress = (id: string, delta: number) => {
    sound.tap();
    const updated = goals.map((g) => {
      if (g.id === id) {
        const next = Math.max(0, g.currentValue + delta);
        return { ...g, currentValue: next };
      }
      return g;
    });
    onSaveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    sound.tap();
    const updated = goals.filter((g) => g.id !== id);
    onSaveGoals(updated);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner in Blanc i Verd */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Evolució & Objectius Personals</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              La teva progressió
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Fites de descans, alimentació, esport i hàbits
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => {
              sound.tap();
              setActiveSubTab('objectius');
            }}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeSubTab === 'objectius'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Objectius Personals
          </button>
          <button
            onClick={() => {
              sound.tap();
              setActiveSubTab('estadistiques');
            }}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeSubTab === 'estadistiques'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gràfics i Estadístiques
          </button>
        </div>
      </div>

      {/* 1. Objectius Personals View */}
      {activeSubTab === 'objectius' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Els teus objectius actius
            </span>
            <button
              onClick={() => {
                sound.tap();
                setIsAddGoalOpen(true);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nou objectiu</span>
            </button>
          </div>

          {/* Goal Cards in Blanc i Verd */}
          <div className="space-y-2.5">
            {goals.map((g) => {
              const progressPct = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
              const isAchieved = progressPct >= 100;

              return (
                <div
                  key={g.id}
                  className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{g.title}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-0.5">
                        <span className="capitalize text-emerald-700">{g.category}</span>
                        <span>·</span>
                        <span className="capitalize">{g.period}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                        isAchieved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isAchieved ? 'Completat ✓' : `${progressPct}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAchieved ? 'bg-emerald-600' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Counter modifier */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        {g.currentValue} / {g.targetValue} {g.unit}
                      </span>
                      <button
                        onClick={() => handleUpdateGoalProgress(g.id, 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      aria-label="Eliminar objectiu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Goal Modal / Inline Form */}
          {isAddGoalOpen && (
            <form
              onSubmit={handleAddGoal}
              className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  Afegir nou objectiu personal
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel·lar
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Títol</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Entrenar 4 dies, menjar net, 0 sucre..."
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="son">Son & Descans</option>
                    <option value="alimentacio">Alimentació & Dieta</option>
                    <option value="esport">Esport & Activitat</option>
                    <option value="hidratacio">Hidratació</option>
                    <option value="habits">Hàbits personals</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Període</label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="diari">Diari</option>
                    <option value="setmanal">Setmanal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Objectiu numèric</label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Unitat</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="vegades, hores, dies..."
                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                Crear Objectiu
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Estadístiques View */}
      {activeSubTab === 'estadistiques' && (
        <div className="space-y-3.5">
          {/* Aggregate KPI tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Moon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mitjana de son</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {avgSleepHours} h
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">
                {sleepRecords.length} registres de descans
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Activitat esportiva</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalSportMin} min
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">
                {sportCount} sessions realitzades
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                <span>Àpats registrats</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {totalLoggedMeals}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                Esmorzars, dinars i sopars
              </span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Candy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Control del Sucre</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                1 pic/setm.
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block">
                Norma estricta activa
              </span>
            </div>
          </div>

          {/* Sports Breakdown list */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
              Esports més practicats
            </span>
            <div className="space-y-2">
              {Object.entries(sportCounts).length > 0 ? (
                Object.entries(sportCounts).map(([sp, cnt]) => (
                  <div
                    key={sp}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold"
                  >
                    <span className="text-slate-900">{sp}</span>
                    <span className="text-emerald-700 font-black">{cnt} sessions</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Encara no hi ha sessions registrades.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
