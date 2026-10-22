import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Zap,
  Smile,
  ShieldAlert,
  Flame,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react';
import { DailySurvey, SleepRecord, SportSession, DynamicSurveyAnswer } from '../types';
import { sound } from '../utils/audio';

interface DynamicSurveySectionProps {
  selectedDate: string;
  survey?: DailySurvey;
  sleepRecord?: SleepRecord;
  sportSession?: SportSession;
  recentSportStreakCount: number;
  onSaveSurvey: (survey: DailySurvey) => void;
}

export const DynamicSurveySection: React.FC<DynamicSurveySectionProps> = ({
  selectedDate,
  survey,
  sleepRecord,
  sportSession,
  recentSportStreakCount,
  onSaveSurvey,
}) => {
  const [mood, setMood] = useState<'molt-positiva' | 'positiva' | 'neutral' | 'baixa'>(
    survey?.mood || 'positiva'
  );
  const [stress, setStress] = useState<number>(survey?.stress || 2);
  const [motivation, setMotivation] = useState<number>(survey?.motivation || 4);
  const [hunger, setHunger] = useState<'normal' | 'molta-gana' | 'poca-gana'>(
    survey?.hunger || 'normal'
  );
  const [energy, setEnergy] = useState<number>(survey?.energy || 4);
  const [hasMuscleSoreness, setHasMuscleSoreness] = useState<boolean>(
    survey?.hasMuscleSoreness || false
  );
  const [dynamicAnswers, setDynamicAnswers] = useState<DynamicSurveyAnswer[]>(
    survey?.dynamicAnswers || []
  );
  const [saved, setSaved] = useState(false);

  // Generate dynamic contextual questions based on real data
  const dynamicQuestions: {
    id: string;
    question: string;
    options: string[];
    category: DynamicSurveyAnswer['category'];
  }[] = [];

  // 1. If slept < 7h
  if (sleepRecord && sleepRecord.durationHours < 7.0) {
    dynamicQuestions.push({
      id: 'q-sleep-fatigue',
      question: `Vas dormir ${sleepRecord.durationHours}h. Com portes la concentració a l'estudi o la feina?`,
      options: ['Bona concentració', 'Navegant amb cafè', 'Força espès i lent'],
      category: 'fatiga',
    });
  }

  // 2. If did intense sport
  if (sportSession && !sportSession.isRestDay && (sportSession.intensity === 'alta' || sportSession.intensity === 'maxima')) {
    dynamicQuestions.push({
      id: 'q-sport-soreness',
      question: `Després de ${sportSession.sport} d’intensitat ${sportSession.intensity}, tens agulletes o tensió?`,
      options: ['Cames i esquena com noves', 'Agulletes lleugeres', 'Musculatura molt carregada'],
      category: 'muscular',
    });
  }

  // 3. If multiple consecutive days doing sport
  if (recentSportStreakCount >= 3) {
    dynamicQuestions.push({
      id: 'q-recovery-check',
      question: `Portes ${recentSportStreakCount} dies seguits entrenant. Com valores la necessitat de descans actiu demà?`,
      options: ['Tinc energia per continuar', 'Em convindria descansar o caminar', 'Necessito descans absolut'],
      category: 'recuperacio',
    });
  }

  // 4. Always include hydration / thirst perception check
  dynamicQuestions.push({
    id: 'q-hydration',
    question: 'Com notes el teu nivell de set i hidratació al llarg del dia?',
    options: ['Hidratació ideal', 'Tinc la boca seca de tant en tant', 'Baja, he begut poc'],
    category: 'hidratacio',
  });

  const handleSelectDynamicOption = (qId: string, qText: string, cat: DynamicSurveyAnswer['category'], ans: string) => {
    sound.tap();
    setDynamicAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== qId);
      return [...filtered, { questionId: qId, question: qText, answer: ans, category: cat }];
    });
  };

  const handleSave = () => {
    sound.completeHabit();
    const updated: DailySurvey = {
      date: selectedDate,
      completed: true,
      mood,
      stress,
      motivation,
      hunger,
      energy,
      hasMuscleSoreness,
      needsRest: recentSportStreakCount >= 3,
      dynamicAnswers,
      submittedAt: new Date().toISOString(),
    };
    onSaveSurvey(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Enquesta Dinàmica d'Hàbits
            </h3>
            <span className="text-[10px] text-slate-500 font-medium block">
              Preguntes adaptades segons el teu descans i esport
            </span>
          </div>
        </div>

        {survey?.completed && (
          <span className="text-[10px] font-bold text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            Completada ✓
          </span>
        )}
      </div>

      {/* 1. Quick State Dials: Mood & Hunger */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Estat d’ànim
          </span>
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'molt-positiva', label: 'Excel·lent 😃' },
              { id: 'positiva', label: 'Positiu 🙂' },
              { id: 'neutral', label: 'Neutre 😐' },
              { id: 'baixa', label: 'Baix 😔' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  sound.tap();
                  setMood(m.id as any);
                }}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  mood === m.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
            Sensació de gana
          </span>
          <div className="grid grid-cols-1 gap-1">
            {[
              { id: 'normal', label: 'Apetits controlats 👌' },
              { id: 'molta-gana', label: 'Molta gana / ansietat 🍽️' },
              { id: 'poca-gana', label: 'Sense gana ☕' },
            ].map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  sound.tap();
                  setHunger(h.id as any);
                }}
                className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all text-left truncate ${
                  hunger === h.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Numeric Sliders: Stress & Motivation */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span>Estrès</span>
            <span className="text-rose-600">{stress}/5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  sound.tap();
                  setStress(s);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  stress === s
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span>Motivació</span>
            <span className="text-emerald-700">{motivation}/5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  sound.tap();
                  setMotivation(m);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  motivation === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Dynamic Contextual Questions */}
      {dynamicQuestions.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Preguntes personalitzades d’avui:
          </span>

          {dynamicQuestions.map((dq) => {
            const currentAns = dynamicAnswers.find((a) => a.questionId === dq.id)?.answer;

            return (
              <div key={dq.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-slate-900 block leading-snug">
                  {dq.question}
                </span>
                <div className="flex flex-col gap-1">
                  {dq.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectDynamicOption(dq.id, dq.question, dq.category, opt)}
                      className={`py-1.5 px-3 rounded-xl text-left text-xs font-semibold transition-all ${
                        currentAns === opt
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{saved ? 'Enquesta desada!' : 'Desar respostes'}</span>
        </button>
      </div>
    </div>
  );
};
