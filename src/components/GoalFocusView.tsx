import React, { useState } from 'react';
import {
  Target,
  Dumbbell,
  Flame,
  Zap,
  Heart,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  Apple,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserGoalType, UserProfile } from '../types';
import {
  GOAL_NUTRITION_PROFILES,
  calculateDailyCalorieRecommendation,
} from '../data/nutritionGuide';
import { sound } from '../utils/audio';

interface GoalFocusViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onApplySampleMenu: (menu: {
    esmorzar: { items: string; calories: number };
    snackMati: { items: string; calories: number };
    dinar: { items: string; calories: number };
    snackTarda: { items: string; calories: number };
    sopar: { items: string; calories: number };
    totalKcal: number;
  }) => void;
  onGoBackToTracker?: () => void;
}

export const GoalFocusView: React.FC<GoalFocusViewProps> = ({
  userProfile,
  onUpdateProfile,
  onApplySampleMenu,
  onGoBackToTracker,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<UserGoalType>(userProfile.primaryGoal);
  const [weightKg, setWeightKg] = useState<number>(userProfile.weightKg || 72);
  const [heightCm, setHeightCm] = useState<number>(userProfile.heightCm || 178);
  const [age, setAge] = useState<number>(userProfile.age || 24);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>(
    userProfile.activityLevel || 'alt-rendiment'
  );
  const [gender, setGender] = useState<'home' | 'dona'>(userProfile.gender || 'home');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const currentGuideline = GOAL_NUTRITION_PROFILES[selectedGoal];

  // Calculate live nutrition math
  const tempProfile: UserProfile = {
    ...userProfile,
    primaryGoal: selectedGoal,
    weightKg,
    heightCm,
    age,
    gender,
    activityLevel,
  };

  const calculated = calculateDailyCalorieRecommendation(tempProfile);

  const handleSelectGoal = (goal: UserGoalType) => {
    sound.tap();
    setSelectedGoal(goal);
    const updated = {
      ...tempProfile,
      primaryGoal: goal,
      customCalorieTarget: undefined, // reset to recommended
    };
    onUpdateProfile(updated);
  };

  const handleSaveProfileCalculations = () => {
    sound.completeHabit();
    const updated: UserProfile = {
      ...tempProfile,
      customCalorieTarget: calculated.recommendedKcal,
    };
    onUpdateProfile(updated);
    setAppliedNotice(
      `S'ha configurat l'objectiu de ${currentGuideline.title} amb ${calculated.recommendedKcal} kcal diàries!`
    );
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const handleApplyMenuToToday = () => {
    sound.completeHabit();
    const sample = currentGuideline.sampleDayMenu;
    onApplySampleMenu({
      esmorzar: { items: sample.esmorzar.items, calories: sample.esmorzar.kcal },
      snackMati: { items: sample.snackMati.items, calories: sample.snackMati.kcal },
      dinar: { items: sample.dinar.items, calories: sample.dinar.kcal },
      snackTarda: { items: sample.snackTarda.items, calories: sample.snackTarda.kcal },
      sopar: { items: sample.sopar.items, calories: sample.sopar.kcal },
      totalKcal: sample.totalKcal,
    });
    setAppliedNotice(`Menú de ${currentGuideline.title} aplicat correctament al teu registre d'avui!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const goalIcons: Record<UserGoalType, React.ElementType> = {
    'massa-muscular': Dumbbell,
    'perdre-pes': Flame,
    'alt-rendiment': Zap,
    'manteniment-salut': Heart,
  };

  return (
    <div className="space-y-4">
      {/* 1. Header: Professional Goal Focus Switcher */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Enfocament Segons Objectiu</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Pauta Professional Individualitzada
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              Què menjar, què evitar i estratègia calòrica segons el teu cos
            </p>
          </div>
        </div>

        {/* 4 Primary Goals Selection Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {(
            [
              { id: 'massa-muscular', title: 'Massa Muscular', sub: 'Hipertròfia & Força', icon: Dumbbell },
              { id: 'perdre-pes', title: 'Aprimar-se', sub: 'Pèrdua greix & Definició', icon: Flame },
              { id: 'alt-rendiment', title: 'Alt Rendiment', sub: 'Esport & Competició', icon: Zap },
              { id: 'manteniment-salut', title: 'Manteniment', sub: 'Vitalitat & Salut', icon: Heart },
            ] as const
          ).map((g) => {
            const Icon = g.icon;
            const isSelected = selectedGoal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGoal(g.id)}
                className={`p-3 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs font-black block">{g.title}</span>
                  <span
                    className={`text-[10px] font-semibold block ${
                      isSelected ? 'text-emerald-100' : 'text-slate-500'
                    }`}
                  >
                    {g.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* 2. Personalized Metrics Card & Scientific Calculator */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Objectiu Calòric & Macronutrients
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Càlcul científic (Fórmula Mifflin-St Jeor)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 underline cursor-pointer"
          >
            <span>{showCalculator ? 'Tancar ajust' : 'Ajustar pes/dades'}</span>
            {showCalculator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Live Target Display */}
        <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Kcal Diàries</span>
            <span className="text-sm font-black text-emerald-700 tabular-nums">
              {calculated.recommendedKcal}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Proteïna</span>
            <span className="text-sm font-black text-slate-800 tabular-nums">
              {calculated.macros.proteinG}g
            </span>
            <span className="text-[8px] text-slate-500 block">
              {(calculated.macros.proteinG / weightKg).toFixed(1)}g/kg
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Carbohidrats</span>
            <span className="text-sm font-black text-slate-800 tabular-nums">
              {calculated.macros.carbsG}g
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Greixos</span>
            <span className="text-sm font-black text-slate-800 tabular-nums">
              {calculated.macros.fatG}g
            </span>
          </div>
        </div>

        {/* Collapsible Calculator Form */}
        {showCalculator && (
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3 animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-emerald-950 uppercase block">
              Dades individuals per al càlcul de TDEE:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Pes (kg)</label>
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-black text-center text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Alçada (cm)</label>
                <input
                  type="number"
                  min="130"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-black text-center text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Edat</label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-black text-center text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Sexe</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'home' | 'dona')}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="home">Home</option>
                  <option value="dona">Dona</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-600 font-bold block mb-1">Nivell d’activitat</label>
                <select
                  value={activityLevel}
                  onChange={(e) =>
                    setActivityLevel(e.target.value as UserProfile['activityLevel'])
                  }
                  className="w-full bg-white border border-emerald-300 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="sedentari">Sedentari (1.2x)</option>
                  <option value="moderat">Moderat 2-3d (1.375x)</option>
                  <option value="actiu">Actiu 4-5d (1.55x)</option>
                  <option value="alt-rendiment">Alt Rendiment / Duresa (1.725x)</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveProfileCalculations}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
            >
              Fixar aquests valors com a objectiu
            </button>
          </div>
        )}
      </div>

      {/* 3. QUÈ HE DE MENJAR? (Specific to Goal) */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Apple className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Què he de menjar?
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold">
                Aliments clau per {currentGuideline.title.toLowerCase()}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Recomanats
          </span>
        </div>

        <div className="space-y-2.5">
          {currentGuideline.foodsToEat.map((food, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{food.name}</span>
                {food.recommendedPortion && (
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {food.recommendedPortion}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {food.benefit}
              </p>
              {food.exampleDish && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Exemple pràctic: {food.exampleDish}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. QUÈ HE D'EVITAR? (Specific to Goal) */}
      <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Què he d’evitar?
              </h3>
              <span className="text-[10px] text-rose-700 font-bold">
                Aliments i hàbits sabotejadors
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            Crític
          </span>
        </div>

        <div className="space-y-2.5">
          {currentGuideline.foodsToAvoid.map((food, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                  <span className="text-rose-600">✕</span>
                  <span>{food.name}</span>
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    food.severity === 'critic'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {food.severity}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {food.reason}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-900 bg-white p-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Alternativa òptima: {food.healthyAlternative}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ESTRATÈGIA & TIMING D'ALT RENDIMENT */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Estratègia & Timing d'Alt Rendiment
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">
              Moments clau de nutrició i recuperació
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {currentGuideline.highPerformanceTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. MENÚ MODEL ADAPTAT A L'OBJECTIU */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Exemple de Menú Diari Recomanat
            </span>
            <h4 className="text-sm font-black text-slate-900">
              {currentGuideline.sampleDayMenu.title}
            </h4>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            ~{currentGuideline.sampleDayMenu.totalKcal} kcal
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Esmorzar</span>
              <span className="font-bold text-slate-900">{currentGuideline.sampleDayMenu.esmorzar.title}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentGuideline.sampleDayMenu.esmorzar.items}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {currentGuideline.sampleDayMenu.esmorzar.kcal} kcal
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Berenar matí</span>
              <span className="font-bold text-slate-900">{currentGuideline.sampleDayMenu.snackMati.title}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentGuideline.sampleDayMenu.snackMati.items}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {currentGuideline.sampleDayMenu.snackMati.kcal} kcal
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Dinar</span>
              <span className="font-bold text-slate-900">{currentGuideline.sampleDayMenu.dinar.title}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentGuideline.sampleDayMenu.dinar.items}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {currentGuideline.sampleDayMenu.dinar.kcal} kcal
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Berenar horabaixa</span>
              <span className="font-bold text-slate-900">{currentGuideline.sampleDayMenu.snackTarda.title}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentGuideline.sampleDayMenu.snackTarda.items}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {currentGuideline.sampleDayMenu.snackTarda.kcal} kcal
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Sopar</span>
              <span className="font-bold text-slate-900">{currentGuideline.sampleDayMenu.sopar.title}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">{currentGuideline.sampleDayMenu.sopar.items}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              {currentGuideline.sampleDayMenu.sopar.kcal} kcal
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyMenuToToday}
          className="w-full min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Carregar aquest menú complet al dia d’avui</span>
        </button>
      </div>
    </div>
  );
};
