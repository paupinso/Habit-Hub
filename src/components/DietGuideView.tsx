import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Coffee,
  Sun,
  Apple,
  Salad,
  Moon,
  Droplets,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  ShieldCheck,
  Scale,
  Candy,
  Check,
} from 'lucide-react';
import {
  OFFICIAL_DIET_PLANS,
  FOODS_TO_AVOID,
  HYDRATION_GUIDELINES,
  DayDietPlan,
} from '../data/nutritionGuide';
import { NutritionDay } from '../types';
import { sound } from '../utils/audio';

interface DietGuideViewProps {
  onApplyPlanToToday: (plan: DayDietPlan) => void;
  onGoBackToTracker?: () => void;
}

export const DietGuideView: React.FC<DietGuideViewProps> = ({
  onApplyPlanToToday,
  onGoBackToTracker,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<'dl' | 'dm' | 'dx' | 'dj' | 'dv'>('dl');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [userWeightKg, setUserWeightKg] = useState<number>(70);

  const currentPlan =
    OFFICIAL_DIET_PLANS.find((p) => p.dayId === selectedDayId) || OFFICIAL_DIET_PLANS[0];

  const handleApply = (plan: DayDietPlan) => {
    sound.completeHabit();
    onApplyPlanToToday(plan);
    setAppliedNotice(`S'ha copiat el menú de ${plan.dayName} al teu registre d'avui amb les kcal calculades!`);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const recommendedWaterMin = (userWeightKg * 0.035).toFixed(1);
  const recommendedWaterMax = (userWeightKg * 0.05).toFixed(1);

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* 1. Header Banner: Pauta Nutricional CEA */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Guia & Pauta Nutricional</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Pauta Nutricional Esportiva
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              Per Antoni J. Valle Font · Graduat en CAFE & Nutrició
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm shrink-0">
            <span className="text-xs font-black">CEA</span>
          </div>
        </div>

        {/* Motto quote from document */}
        <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-center">
          <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
            « Es juga com s’entrena, es juga com menges »
          </span>
          <p className="text-[10px] text-slate-600 font-medium mt-0.5">
            Objectiu: eliminar ultraprocessats i sucres refinats per millorar el rendiment esportiu.
          </p>
        </div>

        {/* Day Selector (DL, DM, DX, DJ, DV) */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {OFFICIAL_DIET_PLANS.map((plan) => (
            <button
              key={plan.dayId}
              type="button"
              onClick={() => {
                sound.tap();
                setSelectedDayId(plan.dayId);
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                selectedDayId === plan.dayId
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="uppercase text-[10px]">{plan.dayId}</span>
              <span className="text-[11px] mt-0.5">{plan.dayName.slice(0, 3)}</span>
            </button>
          ))}
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* 2. Selected Day Menu Details */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Menú Recomanat
            </span>
            <h3 className="text-lg font-black text-slate-900 capitalize">
              {currentPlan.dayName}
            </h3>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ~{currentPlan.totalEstimatedKcal} kcal
            </span>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
              5 àpats complets
            </span>
          </div>
        </div>

        {/* 1. Berenar / Esmorzar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Coffee className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  1. Esmorzar / Berenar del matí
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {currentPlan.esmorzar.title}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              ~{currentPlan.esmorzar.estimatedKcal} kcal
            </span>
          </div>

          <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-9">
            {currentPlan.esmorzar.description}
          </p>

          {currentPlan.esmorzar.hasSugar && (
            <div className="pl-9 pt-1">
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                <Candy className="w-3 h-3 text-amber-600" />
                <span>{currentPlan.esmorzar.sugarWarning}</span>
              </span>
            </div>
          )}

          {currentPlan.esmorzar.accompanimentOptions?.length > 0 && (
            <div className="pl-9 pt-1 text-[10px] text-slate-500 font-semibold">
              <span className="text-emerald-800 font-bold">Acompanyament a escollir: </span>
              {currentPlan.esmorzar.accompanimentOptions.join(' · ')}
            </div>
          )}
        </div>

        {/* 2. Snack Escola / Mig matí */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sun className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  2. Snack Escola / Mig matí
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {currentPlan.snackEscola.title}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              ~{currentPlan.snackEscola.estimatedKcal} kcal
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-9">
            {currentPlan.snackEscola.description}
          </p>
        </div>

        {/* 3. Dinar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Salad className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">3. Dinar</span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {currentPlan.dinar.title}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              ~{currentPlan.dinar.estimatedKcal} kcal
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-9">
            {currentPlan.dinar.description}
          </p>
          <div className="pl-9 pt-1 text-[10px] text-slate-500 font-semibold">
            <span className="text-emerald-800 font-bold">Postre: </span>
            {currentPlan.dinar.dessertOptions.join(' · ')}
          </div>
        </div>

        {/* 4. Berenar de l'horabaixa */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Apple className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  4. Berenar de l’horabaixa (pre-esport)
                </span>
                <span className="text-[11px] font-bold text-emerald-700">
                  Iogurt proteic o fruita amb fruits secs
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">~180 kcal</span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-9">
            Pre-entrenament per carregar energia neta abans de l’activitat física.
          </p>
        </div>

        {/* 5. Sopar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Moon className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">5. Sopar</span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {currentPlan.sopar.title}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-slate-900 tabular-nums">
              ~{currentPlan.sopar.estimatedKcal} kcal
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-9">
            {currentPlan.sopar.description}
          </p>
          <div className="pl-9 pt-1 text-[10px] text-slate-500 font-semibold">
            <span className="text-emerald-800 font-bold">Postre: </span>
            {currentPlan.sopar.dessertOptions.join(' · ')}
          </div>
        </div>

        {/* Action Button: Apply this plan to today */}
        <button
          type="button"
          onClick={() => handleApply(currentPlan)}
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Aplicar aquest menú al meu registre d'avui</span>
        </button>
      </div>

      {/* 3. Foods to Avoid Card */}
      <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-rose-900 uppercase tracking-wide">
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          <span>Aliments a EVITAR Absolutament</span>
        </div>

        <div className="space-y-2">
          {FOODS_TO_AVOID.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs font-medium space-y-0.5"
            >
              <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                <span className="text-rose-600">❌</span>
                <span>{item.name}</span>
              </span>
              <p className="text-[11px] text-rose-800 pl-5">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Hydration Protocol Section */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
            <Droplets className="w-4 h-4 text-emerald-600" />
            <span>Protocol Oficial d'Hidratació</span>
          </div>
          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            3-5 ml / kg
          </span>
        </div>

        {/* Interactive Urine & Weight Calculator */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900">
              El teu pes corporal:
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="40"
                max="130"
                value={userWeightKg}
                onChange={(e) => setUserWeightKg(Number(e.target.value))}
                className="w-16 bg-white border border-emerald-300 rounded-xl px-2 py-1 text-xs font-black text-slate-900 text-center focus:outline-none"
              />
              <span className="text-xs font-bold text-slate-600">kg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold">Objectiu hídric diari:</span>
            <span className="font-black text-emerald-800 tabular-nums">
              {recommendedWaterMin} L - {recommendedWaterMax} L / dia
            </span>
          </div>
        </div>

        {/* Match protocol steps */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Pauta per partits o entrenaments intensos:
          </span>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">⏰ 3 - 4 hores abans:</span>
            <p className="text-[11px] text-slate-600">{HYDRATION_GUIDELINES.matchProtocol.hoursBefore3_4}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">⏰ 1 hora abans:</span>
            <p className="text-[11px] text-slate-600">{HYDRATION_GUIDELINES.matchProtocol.hourBefore1}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-emerald-800 block">⚽ Durant el partit:</span>
            <p className="text-[11px] text-slate-600">{HYDRATION_GUIDELINES.matchProtocol.duringMatch}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">🏁 Post-partit (primers 30 min):</span>
            <p className="text-[11px] text-slate-600">{HYDRATION_GUIDELINES.matchProtocol.postMatch}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
