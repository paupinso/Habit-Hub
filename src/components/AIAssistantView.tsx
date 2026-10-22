import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  MessageSquare,
  Send,
  RefreshCw,
  TrendingUp,
  Moon,
  Utensils,
  Activity,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
  Candy,
  Scale,
  Flame,
  ArrowRight,
  AlertOctagon,
} from 'lucide-react';
import {
  SleepRecord,
  NutritionDay,
  SportSession,
  DailySurvey,
  Habit,
  HabitLog,
} from '../types';
import { sound } from '../utils/audio';
import { getWeekDaysForDate } from '../utils/date';
import { calculateTotalDayCalories, getWeeklySugarCount } from '../utils/storage';
import { computeSportSleepRecovery } from '../utils/sportSleepAdvisor';

interface AIAssistantViewProps {
  selectedDate: string;
  sleepRecords: SleepRecord[];
  nutritionDays: NutritionDay[];
  sportSessions: SportSession[];
  surveys: DailySurvey[];
  habits: Habit[];
  logs: HabitLog[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  selectedDate,
  sleepRecords,
  nutritionDays,
  sportSessions,
  surveys,
  habits,
  logs,
}) => {
  const [activeTab, setActiveTab] = useState<'informe' | 'xat'>('informe');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Soc el teu assessor nutricional i de rendiment estricte. Aquí no hi ha paraules buides: vigilo cada caloria (kcal), penalitzo qualsevol excés i aplico la regla innegociable de màxim 1 pic de sucre per setmana. Pregunta’m el que necessitis o genera l’auditoria.',
      timestamp: 'Ara',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const todaySleep = sleepRecords.find((s) => s.date === selectedDate);
  const todayNutrition = nutritionDays.find((n) => n.date === selectedDate);
  const todaySport = sportSessions.find((s) => s.date === selectedDate);
  const todaySurvey = surveys.find((s) => s.date === selectedDate);

  const weekDays = getWeekDaysForDate(selectedDate);
  const weeklySugarCount = getWeeklySugarCount(weekDays, nutritionDays);
  const todayCalories = todayNutrition ? (todayNutrition.totalCalories || calculateTotalDayCalories(todayNutrition)) : 0;
  const targetCalories = todayNutrition?.calorieTarget || 2200;

  // Run strict analysis
  const handleRunAnalysis = async () => {
    sound.tap();
    setIsAnalyzing(true);

    const payload = {
      todayData: {
        date: selectedDate,
        sleep: todaySleep,
        nutrition: todayNutrition,
        sport: todaySport,
        survey: todaySurvey,
        totalCalories: todayCalories,
        calorieTarget: targetCalories,
        weeklySugarCount,
      },
      recentHistory: {
        sleepHistory: sleepRecords.slice(0, 7),
        sportHistory: sportSessions.slice(0, 7),
        nutritionHistory: nutritionDays.slice(0, 7),
      },
      question:
        'Fes una anàlisi crítica i molt exigent de la dieta, el recompte calòric i la regla del sucre (màxim 1 pic per setmana), creuant-ho amb el son i l’esport.',
    };

    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setAnalysisResult(json.data);
      } else {
        setAnalysisResult(generateLocalPatternAnalysis());
      }
    } catch {
      setAnalysisResult(generateLocalPatternAnalysis());
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local strict, demanding heuristic analysis
  const generateLocalPatternAnalysis = () => {
    const recentSleep = sleepRecords.slice(0, 5);
    const avgSleep =
      recentSleep.length > 0
        ? Number((recentSleep.reduce((acc, s) => acc + s.durationHours, 0) / recentSleep.length).toFixed(1))
        : 7.8;

    const patterns: string[] = [];

    // Critical Sugar check
    if (weeklySugarCount > 1) {
      patterns.push(
        `🚨 CRÍTICA ESTRICTA DE SUCRE: Has consumit sucre ${weeklySugarCount} vegades aquesta setmana. Has trencat la regla innegociable d'1 sol pic! Això saboteja la sensibilitat a la insulina, arruïna la recuperació esportiva i genera desitjos compulsius de menjar.`
      );
    } else if (weeklySugarCount === 1) {
      patterns.push(
        `⚠️ COMODÍ DE SUCRE ESGOTAT (1/1): Has gastat el teu únic pic de sucre permès d'aquesta setmana. Ni un sol gram més de sucre afegit ni dolços fins dilluns vinent.`
      );
    } else {
      patterns.push(
        `✅ DISCIPLINA DE FERRO EN SUCRE: 0/1 pics consumits aquesta setmana. Mantens el teu comodí intacte i una energia neta sense baixades.`
      );
    }

    // Critical Calorie check
    const calDiff = todayCalories - targetCalories;
    if (todayCalories === 0) {
      patterns.push(
        `⚠️ SENSE RECOMPTE CALÒRIC: No has registrat les calories dels 5 àpats. Sense dades no hi ha progrés ni control del pes corporal.`
      );
    } else if (calDiff > 250) {
      patterns.push(
        `🔴 SUPERÀVIT EXCESSIU (+${calDiff} kcal): Portes ${todayCalories} kcal respecte a l'objectiu de ${targetCalories} kcal. Si no has tingut un entrenament d'altíssim desgast, aquest excés es convertirà en greix.`
      );
    } else if (calDiff < -550 && todayCalories > 0) {
      patterns.push(
        `🟠 DÈFICIT PERILLÓS (-${Math.abs(calDiff)} kcal): Portes només ${todayCalories} kcal. Retallar tant destruirà el teu teixit muscular i frenarà la recuperació.`
      );
    } else if (todayCalories > 0) {
      patterns.push(
        `🟢 RECOMPTE EQUILIBRAT: ${todayCalories} / ${targetCalories} kcal (dins el marge òptim per al teu rendiment).`
      );
    }

    if (avgSleep < 7.2) {
      patterns.push(
        `DORMIR POC PROVOCA GANA DE SUCRE: Amb només ${avgSleep}h de mitjana de son, el cos allibera grelina i et demana carbohidrats ràpids per compensar la fatiga. Prioritza anar a dormir a l'hora.`
      );
    }

    // Sport-specific sleep and rest computation
    let sportDiag = 'Dia de descans o sense esport registrat. Redueix calories un 10%.';
    let sportSleepRec = '7h 30m - 8h 00m';
    if (todaySport && !todaySport.isRestDay) {
      const rec = computeSportSleepRecovery({
        sport: todaySport.sport,
        durationMinutes: todaySport.durationMinutes,
        intensity: todaySport.intensity,
        trainingType: todaySport.trainingType,
        feeling: todaySport.feeling,
        distanceKm: todaySport.distanceKm,
        gymMuscleGroups: todaySport.gymDetails?.muscleGroups,
        isRestDay: false,
      });
      sportSleepRec = rec.recommendedSleepRange;

      let detailStr = '';
      if (todaySport.gymDetails && todaySport.gymDetails.muscleGroups.length > 0) {
        detailStr = ` • Grups: ${todaySport.gymDetails.muscleGroups.join(', ')}`;
      } else if (todaySport.distanceKm) {
        detailStr = ` • Distància: ${todaySport.distanceKm} km${todaySport.pace ? ` a ${todaySport.pace}` : ''}`;
      }

      sportDiag = `Sessió de ${todaySport.sport} (${todaySport.durationMinutes} min, intensitat ${todaySport.intensity}${detailStr}). Objectiu de son per esta nit: ${rec.recommendedSleepRange}. Finestra de descans recomanada: ${rec.restWindowHours}h. ${rec.sleepWhyTip}`;
    }

    return {
      sleepDiagnosis:
        avgSleep >= 7.5
          ? `Descans sostingut (mitjana de ${avgSleep}h). Objectiu segons l'esport d'avui: ${sportSleepRec}.`
          : `Son deficient (${avgSleep}h). Amb l'esport realitzat necessites dormir ${sportSleepRec} per assimilar l'entrenament.`,
      nutritionDiagnosis:
        weeklySugarCount > 1
          ? 'INADMISSIBLE: ' + weeklySugarCount + ' pics de sucre. Tolerància zero fins dilluns.'
          : weeklySugarCount === 1
          ? 'Comodí de sucre gastat (1/1). Prohibit cap altre dolç.'
          : 'Bona contenció de dolços. Recompte de kcal sota control.',
      sportRecoveryDiagnosis: sportDiag,
      detectedPatterns: patterns,
      recommendations: [
        {
          category: 'esport',
          title: `Temps de son recomanat segons esport: ${sportSleepRec}`,
          description: todaySport && !todaySport.isRestDay
            ? `Per assimilar la càrrega de ${todaySport.sport}, el cos necessita ${sportSleepRec} de son profund per reparar fibres i resintetitzar glicogen.`
            : 'En dies sense esport, 7h30 a 8h són suficients per mantenir la recuperació basal del sistema nerviós.',
        },
        {
          category: 'alimentacio',
          title: 'Regla del Sucre: 1 sol pic per setmana',
          description:
            weeklySugarCount >= 1
              ? 'Has exhaurit el teu marge. Fins a la propera setmana només aigua, te, cafè sense sucre i fruita sencera.'
              : 'Tens el comodí disponible. No el gastis per avorriment ni per impuls.',
        },
        {
          category: 'alimentacio',
          title: 'Rigors amb les quantitats i el pes del menjar',
          description:
            'Apunta quantitats reals (grams d’arròs, pollastre, cullerades d’oli). L’oli d’oliva aporta 9 kcal/gram i sovint suma 300 kcal ocultes.',
        },
      ],
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    sound.tap();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: 'Ara',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          context: {
            date: selectedDate,
            sleep: todaySleep,
            nutrition: todayNutrition,
            sport: todaySport,
            totalCalories: todayCalories,
            targetCalories,
            weeklySugarCount,
          },
        }),
      });
      const data = await res.json();
      const replyText =
        data.reply ||
        generateLocalStrictReply(userMsg.text, weeklySugarCount, todayCalories, targetCalories);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: 'Ara',
        },
      ]);
    } catch {
      const fallback = generateLocalStrictReply(
        userMsg.text,
        weeklySugarCount,
        todayCalories,
        targetCalories
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: fallback,
          timestamp: 'Ara',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const generateLocalStrictReply = (
    text: string,
    sugarCount: number,
    kcal: number,
    targetKcal: number
  ) => {
    const lower = text.toLowerCase();

    // Muscle mass
    if (lower.includes('massa muscular') || lower.includes('muscul') || lower.includes('hipertrofia') || lower.includes('volum')) {
      return `Per guanyar massa muscular de veritat sense acumular greix superflu:
1. Superàvit calòric moderat (+300 a +400 kcal) sobre el teu manteniment (aprox. 2.600 - 2.800 kcal).
2. Proteïna alta: entre 1.8g i 2.2g per kg de pes (pit de pollastre, vedella magra, ous, salmó, iogurt proteic).
3. Carbohidrats nets: arròs basmati, civada integral i moniato per omplir els dipòsits de glucogen muscular abans i després d’entrenar.
4. Complements sans densos: entrepans com el pepito de pollastre amb formatge tendre (490 kcal) aporten proteïna d'alt valor i energia ràpida post-entrenament.
5. Zero sucre afegit (màxim 1 sol pic setmanal): el sucre inflama les articulacions i saboteja la síntesi proteica!`;
    }

    // Weight loss
    if (lower.includes('aprimar') || lower.includes('perdre pes') || lower.includes('definicio') || lower.includes('definir') || lower.includes('grasa') || lower.includes('greix')) {
      return `Per aprimar-te i definir de manera professional mantenint la teva massa muscular intacta:
1. Dèficit calòric controlat (-400 kcal): no caiguis en dietes miracle de menys de 1.400 kcal perquè destruiran el teu metabolisme.
2. Proteïna al sostre (2.0 a 2.2g/kg): clares d’ou, lluç, daurada, pollastre a la planxa i formatge 0% per mantenir la sacietat alta.
3. Volum de verdures lliure: cremes casolanes de verdures (carbassó, porros) i amanides fresques abans de dinar i sopar.
4. QUÈ HE D’EVITAR: zero begudes ensucrades, sucs o alcohol; elimina salses industrials (maionesa, quètxup) i vigila complements grassos com el formatge fos si no estan calculats.
5. Regla estricta del sucre: 1 sol pic a la setmana innegociable.`;
    }

    // Pepito de pollo amb formatge
    if (lower.includes('pepito') || (lower.includes('pollo') && lower.includes('formatge'))) {
      return `Anàlisi d'un Pepito de pollastre amb formatge:
- Panet integral o artesà: ~180 kcal (carbohidrats nets)
- Pit de pollastre a la planxa (160g): ~180 kcal (32g de proteïna neta)
- Formatge fos havarti o semicurat: ~130 kcal (greix i calci)
Total aproximat: ~490 kcal.
Veredicte: Si el teu objectiu és GUANYAR MASSA MUSCULAR, és un àpat post-entrenament fantàstic. Si el teu objectiu és APRIMAR-SE, retalla el formatge o pren el pit de pollastre al plat amb amanida per estalviar 200 kcal de greix.`;
    }

    if (lower.includes('sucre') || lower.includes('dolç') || lower.includes('xocolata') || lower.includes('pastís')) {
      if (sugarCount >= 1) {
        return `Ni parlar-ne! Portes ${sugarCount} pic(s) de sucre aquesta setmana. La teva norma és taxativa: només 1 pic setmanal. Si en menges ara, estaràs incomplint el teu compromís. Beu un got d'aigua freda o pren una infusió.`;
      }
      return `Tens el teu únic pic setmanal disponible (0/1), però no el malgastis avui per simple impuls. Reserva’l si tens un esdeveniment important el cap de setmana.`;
    }

    if (lower.includes('calor') || lower.includes('kcal') || lower.includes('menjar') || lower.includes('dinar') || lower.includes('sopar')) {
      const diff = kcal - targetKcal;
      if (kcal === 0) {
        return `Encara no has introduït les kcal del dia! Si vols resultats seriosos, comença per pesar el menjar i anotar les calories a cada un dels 5 àpats. L'objectiu és de ${targetKcal} kcal.`;
      }
      if (diff > 200) {
        return `Vigila: portes ${kcal} kcal, superant en +${diff} kcal el teu pressupost diari. Sopar d'avui ha de ser 100% net: verdures bullides o amanida i una font neta de proteïna (lluç, pollastre o clares d'ou). Res de pa ni postres.`;
      }
      return `Portes ${kcal} / ${targetKcal} kcal. Vas per bon camí, però mantén el pes de les racions exacte. No afegeixis salses ni olis a ull.`;
    }

    return `Entesos. El meu criteri com a coach és directe: respecta el recompte de ${targetKcal} kcal, no toquis el sucre més d'1 pic per setmana (actualment portes ${sugarCount}/1) i assegura les teves hores de son per rendir al màxim.`;
  };

  const currentResult = analysisResult || generateLocalPatternAnalysis();

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner in Blanc i Verd */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Coach & Assistent IA</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Assessorament Estricte
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Crítica honesta de dieta, kcal i regla d'1 pic de sucre/setmana
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => {
              sound.tap();
              setActiveTab('informe');
            }}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'informe'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Auditoria i Patrons
          </button>
          <button
            onClick={() => {
              sound.tap();
              setActiveTab('xat');
            }}
            className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all ${
              activeTab === 'xat'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Xat amb el Coach
          </button>
        </div>
      </div>

      {/* 1. Informe / Auditoria Tab */}
      {activeTab === 'informe' && (
        <div className="space-y-3.5">
          {/* Quick status summary cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Sugar strict card */}
            <div
              className={`p-3.5 rounded-2xl border ${
                weeklySugarCount > 1
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : weeklySugarCount === 1
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1">
                  <Candy className="w-3.5 h-3.5" />
                  <span>Regla del Sucre</span>
                </span>
                <span className="font-black tabular-nums">{weeklySugarCount} / 1</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">
                {weeklySugarCount > 1
                  ? '🚨 Límit trencat! Stop total'
                  : weeklySugarCount === 1
                  ? '⚠️ Comodí gastat'
                  : '✓ Impecable (0 pics)'}
              </p>
            </div>

            {/* Calorie status card */}
            <div className="p-3.5 rounded-2xl border bg-white border-emerald-100 shadow-sm text-slate-900">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kcal totals</span>
                </span>
                <span className="font-black tabular-nums text-slate-900">{todayCalories}</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                {todayCalories === 0
                  ? '⚠️ Pendent de registre'
                  : `${Math.round((todayCalories / targetCalories) * 100)}% de ${targetCalories} kcal`}
              </p>
            </div>
          </div>

          {/* Action to re-analyze */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900">Diagnòstic encreuat</span>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analitzant...' : 'Actualitzar anàlisi'}</span>
            </button>
          </div>

          {/* Patterns & Strict Critiques */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Patrons i Crítica Estricta de Dieta</span>
            </div>

            <div className="space-y-2.5">
              {currentResult.detectedPatterns?.map((pat: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-slate-800 font-semibold leading-relaxed flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                  <span>{pat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations list */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Recomanacions Pràctiques i Adaptades</span>
            </div>

            <div className="space-y-2.5">
              {currentResult.recommendations?.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">{rec.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Xat Tab with strict Coach */}
      {activeTab === 'xat' && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-emerald-50/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-sm shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-800 font-medium rounded-tl-sm shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>El coach està analitzant les teves dades...</span>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setInputText('Què he de menjar per guanyar massa muscular?');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shrink-0"
            >
              🏋️ Guanyar massa muscular
            </button>
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setInputText('Si em vull aprimar què he de menjar i evitar?');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shrink-0"
            >
              🔥 Aprimar-se: què evitar?
            </button>
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setInputText('Quant aporta un pepito de pollastre amb formatge?');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shrink-0"
            >
              🥪 Pepito de pollastre amb formatge
            </button>
            <button
              type="button"
              onClick={() => {
                sound.tap();
                setInputText('Com porto la regla del sucre aquesta setmana?');
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shrink-0"
            >
              🍬 Regla del sucre
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta sobre la dieta, kcal, esport..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              aria-label="Enviar missatge"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
