import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Bed,
  Sparkles,
  Zap,
  Battery,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Dumbbell,
  ShieldAlert,
} from 'lucide-react';
import { SleepRecord, SportSession } from '../types';
import { calculateSleepHours } from '../utils/storage';
import { sound } from '../utils/audio';
import { formatCatalanDateLong } from '../utils/date';
import { computeSportSleepRecovery } from '../utils/sportSleepAdvisor';

interface SleepViewProps {
  selectedDate: string;
  sleepRecord: SleepRecord;
  recentSport?: SportSession;
  onSaveSleep: (record: SleepRecord) => void;
}

export const SleepView: React.FC<SleepViewProps> = ({
  selectedDate,
  sleepRecord,
  recentSport,
  onSaveSleep,
}) => {
  const [bedTime, setBedTime] = useState(sleepRecord.bedTime || '23:00');
  const [wakeTime, setWakeTime] = useState(sleepRecord.wakeTime || '07:15');
  const [qualityScore, setQualityScore] = useState(sleepRecord.qualityScore || 4);
  const [wokeUpTired, setWokeUpTired] = useState(sleepRecord.wokeUpTired || false);
  const [sleptWell, setSleptWell] = useState<'molt-be' | 'normal' | 'malament'>(
    sleepRecord.sleptWell || 'molt-be'
  );
  const [dayEnergyLevel, setDayEnergyLevel] = useState(sleepRecord.dayEnergyLevel || 4);
  const [notes, setNotes] = useState(sleepRecord.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setBedTime(sleepRecord.bedTime || '23:00');
    setWakeTime(sleepRecord.wakeTime || '07:15');
    setQualityScore(sleepRecord.qualityScore || 4);
    setWokeUpTired(sleepRecord.wokeUpTired || false);
    setSleptWell(sleepRecord.sleptWell || 'molt-be');
    setDayEnergyLevel(sleepRecord.dayEnergyLevel || 4);
    setNotes(sleepRecord.notes || '');
    setSavedSuccess(false);
  }, [selectedDate, sleepRecord]);

  const currentDuration = calculateSleepHours(bedTime, wakeTime);

  // Compute sport sleep recommendation if sport was logged today
  const sportRecommendation = recentSport
    ? computeSportSleepRecovery({
        sport: recentSport.sport,
        durationMinutes: recentSport.durationMinutes,
        intensity: recentSport.intensity,
        trainingType: recentSport.trainingType,
        feeling: recentSport.feeling,
        distanceKm: recentSport.distanceKm,
        gymMuscleGroups: recentSport.gymDetails?.muscleGroups,
        isRestDay: recentSport.isRestDay,
      })
    : null;

  // Quick adjust bedtime to meet sport target
  const handleApplySportTarget = () => {
    if (!sportRecommendation) return;
    sound.tap();
    const targetHours = sportRecommendation.recommendedSleepHours;
    // Calculate new bedtime assuming wakeTime remains constant
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    const wakeTotalMinutes = wakeH * 60 + wakeM;
    let bedTotalMinutes = wakeTotalMinutes - Math.round(targetHours * 60);
    if (bedTotalMinutes < 0) {
      bedTotalMinutes += 24 * 60;
    }
    const newBedH = Math.floor(bedTotalMinutes / 60);
    const newBedM = bedTotalMinutes % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    setBedTime(`${pad(newBedH)}:${pad(newBedM)}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.completeHabit();
    const updated: SleepRecord = {
      date: selectedDate,
      bedTime,
      wakeTime,
      durationHours: currentDuration,
      qualityScore,
      wokeUpTired,
      sleptWell,
      dayEnergyLevel,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSaveSleep(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Personalized Sleep & Recovery Recommendation
  const getSleepAdvice = () => {
    const adviceList: string[] = [];
    if (currentDuration < 7.0) {
      adviceList.push(
        'Has dormit menys de 7 hores. El cos necessita més temps per a la fase REM i la recuperació del sistema nerviós.'
      );
    } else if (currentDuration >= 7.5 && currentDuration <= 9.0) {
      adviceList.push(
        'Durada de son en rang excel·lent (7.5h - 9h). Afavoreix la reparació miofibril·lar, el metabolisme i la claredat mental.'
      );
    }

    if (wokeUpTired) {
      adviceList.push(
        'Si et despertes cansat malgrat dormir les hores suficients, vigila la digestió abans d’anar al llit i redueix pantalles 45 min abans.'
      );
    }

    if (recentSport && !recentSport.isRestDay) {
      adviceList.push(
        `Esport d'avui: ${recentSport.sport} (${recentSport.durationMinutes} min). Objectiu de son calculat: ${sportRecommendation?.recommendedSleepRange}.`
      );
    }

    return adviceList;
  };

  const advice = getSleepAdvice();

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner in Blanc i Verd */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Moon className="w-4 h-4 text-emerald-600" />
              <span>Control del Son i del Descans</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentDuration} hores de son
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatCatalanDateLong(selectedDate)}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <Bed className="w-6 h-6" />
          </div>
        </div>

        {/* Quick status bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
          <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Anar a dormir</span>
            <span className="text-xs font-black text-slate-900 tabular-nums">{bedTime}</span>
          </div>
          <div className="text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Despertar</span>
            <span className="text-xs font-black text-slate-900 tabular-nums">{wakeTime}</span>
          </div>
          <div className="text-center bg-emerald-50 p-2 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block uppercase">Qualitat</span>
            <span className="text-xs font-black text-emerald-900 tabular-nums">{qualityScore} / 5</span>
          </div>
        </div>
      </div>

      {/* ⭐ DEDICATED SPORT SLEEP RECOMMENDATION CARD */}
      {recentSport && sportRecommendation && (
        <div className="bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30 p-4 rounded-3xl border-2 border-emerald-400 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ⚡
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Son Recomanat segons l'Esport
                </h3>
                <p className="text-[10px] text-emerald-700 font-bold">
                  {recentSport.isRestDay
                    ? 'Dia de descans actiu'
                    : `${recentSport.durationMinutes} min de ${recentSport.sport}`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-900 bg-white px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs">
              {sportRecommendation.recommendedSleepRange}
            </span>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-xs text-slate-700 space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Objectiu fisiològic:</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  currentDuration >= sportRecommendation.recommendedSleepHours
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {currentDuration >= sportRecommendation.recommendedSleepHours
                  ? '✓ Objectiu assolit'
                  : `⚠️ Falten ${(sportRecommendation.recommendedSleepHours - currentDuration).toFixed(1)}h`}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              {sportRecommendation.sleepWhyTip}
            </p>
          </div>

          {/* Quick apply button */}
          <button
            type="button"
            onClick={handleApplySportTarget}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Ajustar horari per dormir {sportRecommendation.recommendedSleepRange.split(' - ')[0]}</span>
          </button>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Registre de descans desat correctament!</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. Bedtime & Wake time */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Horaris de son
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="bed-time" className="text-[11px] font-bold text-slate-700 block">
                A quina hora vas anar a dormir?
              </label>
              <input
                id="bed-time"
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="wake-time" className="text-[11px] font-bold text-slate-700 block">
                A quina hora et vas despertar?
              </label>
              <input
                id="wake-time"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Quality & Wake Feeling */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
            Com valores la qualitat del descans? (1 = Molt dolenta, 5 = Excel·lent)
          </label>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  sound.tap();
                  setQualityScore(q);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  qualityScore === q
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {q} ★
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              T'has despertat cansat aquest matí?
            </span>
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setWokeUpTired(!wokeUpTired);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                wokeUpTired
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {wokeUpTired ? '🥱 Sí, cansat' : '😊 No, recuperat'}
            </button>
          </div>
        </div>

        {/* 3. Day Energy Level */}
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Nivell d'energia durant el dia
              </label>
            </div>
            <span className="text-xs font-black text-emerald-700">{dayEnergyLevel} / 5</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  sound.tap();
                  setDayEnergyLevel(lvl);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  dayEnergyLevel === lvl
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Desar Registre de Descans</span>
        </button>
      </form>

      {/* 4. Recommendations Card */}
      {advice.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Recomanacions Personalitzades de Descans</span>
          </div>

          <div className="space-y-2">
            {advice.map((adv, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-slate-800 font-semibold leading-relaxed flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
