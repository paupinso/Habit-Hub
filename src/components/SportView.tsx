import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Flame,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
  HeartPulse,
  Dumbbell,
  Bike,
  Coffee,
  Plus,
  Compass,
  Gauge,
  Navigation,
  Moon,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  SportSession,
  SportIntensity,
  TrainingType,
  SportFeeling,
  SleepRecord,
  TabType,
} from '../types';
import { sound } from '../utils/audio';
import { formatCatalanDateLong } from '../utils/date';
import { computeSportSleepRecovery } from '../utils/sportSleepAdvisor';

interface SportViewProps {
  selectedDate: string;
  sportSession?: SportSession;
  sleepRecord?: SleepRecord;
  onSaveSport: (session: SportSession) => void;
  onNavigateTab?: (tab: TabType) => void;
}

type SportCategoryKey =
  | 'gimnas'
  | 'bici'
  | 'correr'
  | 'futbol'
  | 'padel'
  | 'natacio'
  | 'caminar'
  | 'altre';

interface SportDefinition {
  key: SportCategoryKey;
  label: string;
  icon: string;
  defaultTrainingType: TrainingType;
}

const PRIMARY_SPORTS: SportDefinition[] = [
  { key: 'gimnas', label: 'Gimnàs / Fitness', icon: '🏋️‍♂️', defaultTrainingType: 'forca' },
  { key: 'bici', label: 'Bicicleta', icon: '🚴', defaultTrainingType: 'resistencia' },
  { key: 'correr', label: 'Córrer / Running', icon: '🏃', defaultTrainingType: 'resistencia' },
  { key: 'futbol', label: 'Futbol', icon: '⚽', defaultTrainingType: 'resistencia' },
  { key: 'padel', label: 'Pàdel / Tennis', icon: '🎾', defaultTrainingType: 'resistencia' },
  { key: 'natacio', label: 'Natació', icon: '🏊', defaultTrainingType: 'resistencia' },
  { key: 'caminar', label: 'Caminar / Senderisme', icon: '🚶', defaultTrainingType: 'recuperacio' },
  { key: 'altre', label: 'Altre esport', icon: '➕', defaultTrainingType: 'resistencia' },
];

const GYM_MUSCLE_GROUPS = [
  { id: 'cames', label: 'Cames / Glutis (Leg day)', icon: '🦵', highDemand: true },
  { id: 'pit', label: 'Pit / Pectorals', icon: '🏋️', highDemand: false },
  { id: 'esquena', label: 'Esquena / Dorsals', icon: '🧗', highDemand: false },
  { id: 'bracos', label: 'Braços (Bíceps / Tríceps)', icon: '💪', highDemand: false },
  { id: 'espatlles', label: 'Espatlles / Deltoides', icon: '🛡️', highDemand: false },
  { id: 'core', label: 'Core / Abdominals', icon: '🧱', highDemand: false },
  { id: 'fullbody', label: 'Full Body / Circuit', icon: '⚡', highDemand: true },
  { id: 'mobilitat', label: 'Mobilitat i Estiraments', icon: '🧘', highDemand: false },
];

const POPULAR_GYM_EXERCISES = [
  'Sentadilles',
  'Press banca',
  'Pes mort',
  'Dominades',
  'Press militar',
  'Rem amb barra',
  'Hip thrust',
  'Fons tríceps / Dips',
  'Premsa de cames',
  'Elevacions laterals',
];

export const SportView: React.FC<SportViewProps> = ({
  selectedDate,
  sportSession,
  sleepRecord,
  onSaveSport,
  onNavigateTab,
}) => {
  const [isRestDay, setIsRestDay] = useState<boolean>(sportSession?.isRestDay || false);

  // Active sport category tab
  const getInitialSportKey = (): SportCategoryKey => {
    if (!sportSession || !sportSession.sport) return 'correr';
    const s = sportSession.sport.toLowerCase();
    if (s.includes('gimnàs') || s.includes('gimnas') || s.includes('peses') || s.includes('fitness'))
      return 'gimnas';
    if (s.includes('bici') || s.includes('ciclisme')) return 'bici';
    if (s.includes('córrer') || s.includes('correr') || s.includes('running')) return 'correr';
    if (s.includes('futbol')) return 'futbol';
    if (s.includes('pàdel') || s.includes('padel') || s.includes('tennis')) return 'padel';
    if (s.includes('natació') || s.includes('natacio')) return 'natacio';
    if (s.includes('caminar')) return 'caminar';
    return 'altre';
  };

  const [activeCategory, setActiveCategory] = useState<SportCategoryKey>(getInitialSportKey());
  const [customSportName, setCustomSportName] = useState<string>(
    sportSession && getInitialSportKey() === 'altre' ? sportSession.sport : ''
  );

  // General fields
  const [durationMinutes, setDurationMinutes] = useState<number>(sportSession?.durationMinutes || 45);
  const [intensity, setIntensity] = useState<SportIntensity>(sportSession?.intensity || 'moderada');
  const [trainingType, setTrainingType] = useState<TrainingType>(
    sportSession?.trainingType || 'resistencia'
  );
  const [feeling, setFeeling] = useState<SportFeeling>(sportSession?.feeling || 'be');
  const [notes, setNotes] = useState<string>(sportSession?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sport specific fields: Running / Cycling / Walking / Swimming
  const [distanceKm, setDistanceKm] = useState<number | ''>(
    sportSession?.distanceKm !== undefined ? sportSession.distanceKm : 5.0
  );
  const [pace, setPace] = useState<string>(sportSession?.pace || '');
  const [speedKmh, setSpeedKmh] = useState<number | ''>(
    sportSession?.speedKmh !== undefined ? sportSession.speedKmh : ''
  );

  // Gym specific fields
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    sportSession?.gymDetails?.muscleGroups || ['Cames / Glutis (Leg day)']
  );
  const [gymFocusType, setGymFocusType] = useState<string>(
    sportSession?.gymDetails?.focusType || 'hipertrofia'
  );
  const [gymRoutineName, setGymRoutineName] = useState<string>(
    sportSession?.gymDetails?.routineName || ''
  );
  const [gymExercisesDone, setGymExercisesDone] = useState<string>(
    sportSession?.gymDetails?.exercisesDone || ''
  );

  // Cycling specific fields
  const [bikeType, setBikeType] = useState<string>(
    sportSession?.cyclingDetails?.bikeType || 'Carretera'
  );
  const [elevationGainM, setElevationGainM] = useState<number | ''>(
    sportSession?.cyclingDetails?.elevationGainM !== undefined
      ? sportSession.cyclingDetails.elevationGainM
      : 350
  );

  // Running specific fields
  const [runType, setRunType] = useState<string>(
    sportSession?.runningDetails?.runType || 'Rodatge suau (Zona 2)'
  );

  // Swimming specific fields
  const [swimMeters, setSwimMeters] = useState<number | ''>(
    sportSession?.swimmingDetails?.meters !== undefined ? sportSession.swimmingDetails.meters : 1500
  );
  const [swimStroke, setSwimStroke] = useState<string>(
    sportSession?.swimmingDetails?.stroke || 'Crol'
  );

  // Football & Padel
  const [matchFormat, setMatchFormat] = useState<string>('Partit amb amics');

  // Reset or initialize when date/sportSession changes
  useEffect(() => {
    if (sportSession) {
      setIsRestDay(sportSession.isRestDay);
      const catKey = getInitialSportKey();
      setActiveCategory(catKey);
      setCustomSportName(catKey === 'altre' ? sportSession.sport : '');
      setDurationMinutes(sportSession.durationMinutes || 45);
      setIntensity(sportSession.intensity || 'moderada');
      setTrainingType(sportSession.trainingType || 'resistencia');
      setFeeling(sportSession.feeling || 'be');
      setDistanceKm(sportSession.distanceKm !== undefined ? sportSession.distanceKm : '');
      setPace(sportSession.pace || '');
      setSpeedKmh(sportSession.speedKmh !== undefined ? sportSession.speedKmh : '');
      setNotes(sportSession.notes || '');

      if (sportSession.gymDetails) {
        setSelectedMuscleGroups(sportSession.gymDetails.muscleGroups || []);
        setGymFocusType(sportSession.gymDetails.focusType || 'hipertrofia');
        setGymRoutineName(sportSession.gymDetails.routineName || '');
        setGymExercisesDone(sportSession.gymDetails.exercisesDone || '');
      }

      if (sportSession.cyclingDetails) {
        setBikeType(sportSession.cyclingDetails.bikeType || 'Carretera');
        setElevationGainM(
          sportSession.cyclingDetails.elevationGainM !== undefined
            ? sportSession.cyclingDetails.elevationGainM
            : ''
        );
      }

      if (sportSession.runningDetails) {
        setRunType(sportSession.runningDetails.runType || 'Rodatge suau (Zona 2)');
      }

      if (sportSession.swimmingDetails) {
        setSwimMeters(
          sportSession.swimmingDetails.meters !== undefined ? sportSession.swimmingDetails.meters : ''
        );
        setSwimStroke(sportSession.swimmingDetails.stroke || 'Crol');
      }
    } else {
      setIsRestDay(false);
      setActiveCategory('correr');
      setDurationMinutes(45);
      setIntensity('moderada');
      setTrainingType('resistencia');
      setFeeling('be');
      setDistanceKm(5.0);
      setPace('5:10 min/km');
      setSpeedKmh('');
      setSelectedMuscleGroups(['Cames / Glutis (Leg day)']);
      setGymFocusType('hipertrofia');
      setGymRoutineName('');
      setGymExercisesDone('');
      setBikeType('Carretera');
      setElevationGainM(350);
      setRunType('Rodatge suau (Zona 2)');
      setSwimMeters(1500);
      setSwimStroke('Crol');
      setMatchFormat('Partit amb amics');
      setNotes('');
    }
    setSavedSuccess(false);
  }, [selectedDate, sportSession]);

  // Determine current active sport title
  const activeSportTitle = useMemo(() => {
    switch (activeCategory) {
      case 'gimnas':
        return 'Gimnàs / Musculació';
      case 'bici':
        return 'Bicicleta / Ciclisme';
      case 'correr':
        return 'Córrer / Running';
      case 'futbol':
        return 'Futbol';
      case 'padel':
        return 'Pàdel / Tennis';
      case 'natacio':
        return 'Natació';
      case 'caminar':
        return 'Caminar / Senderisme';
      case 'altre':
        return customSportName.trim() || 'Altre esport';
    }
  }, [activeCategory, customSportName]);

  // When changing category, auto-set default training type and duration if appropriate
  const handleSelectCategory = (catKey: SportCategoryKey) => {
    sound.tap();
    setActiveCategory(catKey);
    const def = PRIMARY_SPORTS.find((s) => s.key === catKey);
    if (def) {
      setTrainingType(def.defaultTrainingType);
    }
    if (catKey === 'gimnas') {
      if (durationMinutes < 40) setDurationMinutes(60);
      setTrainingType('forca');
    } else if (catKey === 'bici') {
      if (typeof distanceKm !== 'number' || distanceKm < 10) setDistanceKm(30);
      if (durationMinutes < 45) setDurationMinutes(75);
    } else if (catKey === 'correr') {
      if (typeof distanceKm !== 'number' || distanceKm > 30) setDistanceKm(5.0);
    } else if (catKey === 'natacio') {
      if (typeof swimMeters !== 'number') setSwimMeters(1500);
    }
  };

  // Auto-calculate pace for running / speed for cycling / pace for swimming
  useEffect(() => {
    const dist = Number(distanceKm);
    const dur = Number(durationMinutes);

    if (activeCategory === 'correr' && dist > 0 && dur > 0) {
      const totalSec = (dur * 60) / dist;
      const min = Math.floor(totalSec / 60);
      const sec = Math.round(totalSec % 60);
      const formattedSec = sec < 10 ? `0${sec}` : `${sec}`;
      const autoPace = `${min}:${formattedSec} min/km`;
      if (!pace || pace.includes('min/km')) {
        setPace(autoPace);
      }
    } else if (activeCategory === 'bici' && dist > 0 && dur > 0) {
      const autoSpeed = Number(((dist / dur) * 60).toFixed(1));
      setSpeedKmh(autoSpeed);
      if (!pace || pace.includes('km/h')) {
        setPace(`${autoSpeed} km/h`);
      }
    } else if (activeCategory === 'natacio' && Number(swimMeters) > 0 && dur > 0) {
      const hundreds = Number(swimMeters) / 100;
      const secPerHundred = (dur * 60) / hundreds;
      const min = Math.floor(secPerHundred / 60);
      const sec = Math.round(secPerHundred % 60);
      setPace(`${min}:${sec < 10 ? `0${sec}` : sec} /100m`);
    }
  }, [activeCategory, distanceKm, durationMinutes, swimMeters]);

  // Compute real-time Sleep and Rest recommendations!
  const sleepAdvice = useMemo(() => {
    return computeSportSleepRecovery({
      sport: activeSportTitle,
      durationMinutes: isRestDay ? 0 : Number(durationMinutes) || 0,
      intensity,
      trainingType,
      feeling,
      distanceKm: typeof distanceKm === 'number' ? distanceKm : undefined,
      gymMuscleGroups: activeCategory === 'gimnas' ? selectedMuscleGroups : [],
      isRestDay,
    });
  }, [
    activeSportTitle,
    durationMinutes,
    intensity,
    trainingType,
    feeling,
    distanceKm,
    selectedMuscleGroups,
    activeCategory,
    isRestDay,
  ]);

  // Gym muscle group toggle
  const toggleMuscleGroup = (label: string) => {
    sound.tap();
    if (selectedMuscleGroups.includes(label)) {
      if (selectedMuscleGroups.length > 1) {
        setSelectedMuscleGroups(selectedMuscleGroups.filter((g) => g !== label));
      }
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, label]);
    }
  };

  // Add exercise to gym list
  const addExerciseChip = (exercise: string) => {
    sound.tap();
    const current = gymExercisesDone.trim();
    if (!current) {
      setGymExercisesDone(exercise);
    } else if (!current.includes(exercise)) {
      setGymExercisesDone(`${current}, ${exercise}`);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.completeHabit();

    const session: SportSession = {
      id: sportSession?.id || `sport-${selectedDate}-${Date.now()}`,
      date: selectedDate,
      isRestDay,
      sport: isRestDay ? 'Dia de descans' : activeSportTitle,
      durationMinutes: isRestDay ? 0 : Number(durationMinutes) || 0,
      intensity,
      trainingType,
      feeling,
      distanceKm:
        !isRestDay &&
        (activeCategory === 'correr' || activeCategory === 'bici' || activeCategory === 'caminar') &&
        distanceKm !== ''
          ? Number(distanceKm)
          : undefined,
      pace: !isRestDay && pace.trim() ? pace.trim() : undefined,
      speedKmh:
        !isRestDay && activeCategory === 'bici' && speedKmh !== ''
          ? Number(speedKmh)
          : undefined,
      gymDetails:
        !isRestDay && activeCategory === 'gimnas'
          ? {
              muscleGroups: selectedMuscleGroups,
              focusType: gymFocusType,
              routineName: gymRoutineName.trim(),
              exercisesDone: gymExercisesDone.trim(),
            }
          : undefined,
      cyclingDetails:
        !isRestDay && activeCategory === 'bici'
          ? {
              bikeType,
              elevationGainM: elevationGainM !== '' ? Number(elevationGainM) : undefined,
              speedKmh: speedKmh !== '' ? Number(speedKmh) : undefined,
            }
          : undefined,
      runningDetails:
        !isRestDay && activeCategory === 'correr'
          ? {
              runType,
              avgPace: pace.trim(),
            }
          : undefined,
      swimmingDetails:
        !isRestDay && activeCategory === 'natacio'
          ? {
              meters: swimMeters !== '' ? Number(swimMeters) : undefined,
              stroke: swimStroke,
            }
          : undefined,
      sleepRecoveryRecommendation: {
        recommendedSleepHours: sleepAdvice.recommendedSleepHours,
        recommendedSleepRange: sleepAdvice.recommendedSleepRange,
        restWindowHours: sleepAdvice.restWindowHours,
        recoveryTip: sleepAdvice.recoveryTip,
        sleepWhyTip: sleepAdvice.sleepWhyTip,
      },
      notes: notes.trim(),
      createdAt: sportSession?.createdAt || new Date().toISOString(),
    };

    onSaveSport(session);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Banner in Blanc i Verd */}
      <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Entrenament & Recuperació</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {isRestDay ? 'Dia de descans' : `${durationMinutes} min de ${activeSportTitle}`}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formatCatalanDateLong(selectedDate)}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm text-2xl">
            {isRestDay ? '☕' : PRIMARY_SPORTS.find((s) => s.key === activeCategory)?.icon || '⚡'}
          </div>
        </div>

        {/* Dynamic metrics quick badge */}
        {!isRestDay && (
          <div className="p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs font-bold text-emerald-950">
            {activeCategory === 'gimnas' ? (
              <span className="flex items-center gap-1.5 truncate">
                <Dumbbell className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {selectedMuscleGroups.length} grup(s): {selectedMuscleGroups.map((g) => g.split(' ')[0]).join(', ')}
                </span>
              </span>
            ) : activeCategory === 'bici' ? (
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{distanceKm || 0} km ({speedKmh || pace || '0 km/h'})</span>
              </span>
            ) : activeCategory === 'correr' ? (
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{distanceKm || 0} km a {pace || '--:--'}</span>
              </span>
            ) : activeCategory === 'natacio' ? (
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{swimMeters || 0}m de {swimStroke}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Intensitat {intensity} • {durationMinutes} min</span>
              </span>
            )}

            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 text-emerald-800 shrink-0 text-[11px]">
              <Moon className="w-3 h-3 text-emerald-600" />
              <span>{sleepAdvice.recommendedSleepRange.split(' - ')[0]} son</span>
            </span>
          </div>
        )}

        {/* Rest Day Toggle */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Avui ha estat un dia de descans sense esport?
          </span>
          <button
            type="button"
            onClick={() => {
              sound.tap();
              setIsRestDay(!isRestDay);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isRestDay
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {isRestDay ? '✓ Sí, descans' : 'No, he fet esport'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Sessió d'activitat física i recomanació de descans desades!</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {!isRestDay ? (
          <>
            {/* 1. INTERACTIVE SPORT SELECTION TABS / BUTTONS */}
            <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                    1. Tria l'esport que has fet
                  </label>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Pitja l'esport per desplegar les seves opcions específiques:
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Pestañes actives
                </span>
              </div>

              {/* Grid of primary sports */}
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_SPORTS.map((s) => {
                  const isSelected = activeCategory === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleSelectCategory(s.key)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500 ring-offset-1'
                          : 'bg-slate-50 text-slate-700 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-base">{s.icon}</span>
                        <span className="truncate">{s.label}</span>
                      </span>
                      {isSelected && <span className="text-xs">●</span>}
                    </button>
                  );
                })}
              </div>

              {/* If "Altre esport" selected, custom text input */}
              {activeCategory === 'altre' && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Escriu el nom de l'esport o activitat:
                  </label>
                  <input
                    type="text"
                    value={customSportName}
                    onChange={(e) => setCustomSportName(e.target.value)}
                    placeholder="Ex: Crossfit, Escalada, Ioga, Boxa..."
                    className="w-full bg-slate-50 border border-emerald-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* 2. DYNAMIC SUB-OPTIONS DEPENDING ON THE SPORT (PESTAÑES DESPLEGADES) */}

            {/* A) GIMNÀS / FITNESS OPTIONS */}
            {activeCategory === 'gimnas' && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🏋️‍♂️
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Opcions de Gimnàs i Fitness
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Grups musculars, rutina i exercicis realitzats
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    SALA DE FORÇA
                  </span>
                </div>

                {/* Duration for gym */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Quant de temps has entrenat al gimnàs?
                    </label>
                    <span className="text-xs font-black text-emerald-700">{durationMinutes} minuts</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[30, 45, 60, 75, 90, 120].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setDurationMinutes(m);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          durationMinutes === m
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Muscle groups multi-select */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                      Quins grups musculars has treballat? *
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {selectedMuscleGroups.length} seleccionats
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GYM_MUSCLE_GROUPS.map((g) => {
                      const isSel = selectedMuscleGroups.includes(g.label);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleMuscleGroup(g.label)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span className="text-sm">{g.icon}</span>
                          <span className="text-[11px] leading-tight truncate">{g.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Focus type */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide block">
                    Tipus de treball a la sala
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hipertrofia', label: 'Hipertròfia (8-12 reps)' },
                      { id: 'forca-maxima', label: 'Força màxima (càrregues altes)' },
                      { id: 'resistencia', label: 'Resistència muscular' },
                      { id: 'circuit', label: 'Circuit funcional / HIIT' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setGymFocusType(f.id);
                        }}
                        className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold text-left transition-all ${
                          gymFocusType === f.id
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-black'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercises done quick chips & detail */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Exercicis destacats de la teva sessió:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_GYM_EXERCISES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => addExerciseChip(ex)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>+</span>
                        <span>{ex}</span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    value={gymExercisesDone}
                    onChange={(e) => setGymExercisesDone(e.target.value)}
                    placeholder="Escriu els exercicis i sèries (ex: Sentadilles 4x8 amb 80kg, Press banca 4x10...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* B) BICICLETA OPTIONS */}
            {activeCategory === 'bici' && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🚴
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Opcions de Ciclisme
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Quilòmetres, temps, velocitat mitjana i desnivell
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    BICICLETA
                  </span>
                </div>

                {/* Km and Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kilometers */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Quilòmetres (km) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="350"
                        value={distanceKm}
                        onChange={(e) =>
                          setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 45"
                        className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white pr-9"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">km</span>
                    </div>
                  </div>

                  {/* Duration in minutes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Temps total (min) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="5"
                        min="10"
                        max="600"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white pr-9"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">min</span>
                    </div>
                  </div>
                </div>

                {/* Quick km buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Distàncies:</span>
                  {[15, 25, 40, 60, 80, 100].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setDistanceKm(k);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0"
                    >
                      {k} km
                    </button>
                  ))}
                </div>

                {/* Speed & Elevation Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Velocitat mitjana
                    </label>
                    <input
                      type="text"
                      value={pace}
                      onChange={(e) => setPace(e.target.value)}
                      placeholder="Ex: 27.5 km/h"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Desnivell (+D)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="25"
                        value={elevationGainM}
                        onChange={(e) =>
                          setElevationGainM(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 450"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white pr-7"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>
                </div>

                {/* Bike modal */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Modalitat de bicicleta
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Carretera', 'Muntanya (BTT)', 'Gravel', 'Rodet / Indoor'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setBikeType(b);
                        }}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center truncate ${
                          bikeType === b
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* C) CÓRRER / RUNNING OPTIONS */}
            {activeCategory === 'correr' && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🏃
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Opcions de Running
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Quilòmetres, temps total i ritme mitjà (mitja)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    CÒRRER
                  </span>
                </div>

                {/* Km and Pace grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Kilometers */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Quants de quilòmetres (km) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        max="100"
                        value={distanceKm}
                        onChange={(e) =>
                          setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Ex: 5.2"
                        className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white pr-9"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">km</span>
                    </div>
                  </div>

                  {/* Pace (Mitja) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Ritme mitjà (Mitja)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pace}
                        onChange={(e) => setPace(e.target.value)}
                        placeholder="Ex: 4:50 min/km"
                        className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick km chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Distàncies ràpides:</span>
                  {[3, 5, 8, 10, 12, 15, 21.1].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setDistanceKm(k);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0"
                    >
                      {k === 21.1 ? 'Mitja 21k' : `${k} km`}
                    </button>
                  ))}
                </div>

                {/* Duration */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      Temps total de carrera
                    </label>
                    <span className="text-xs font-black text-emerald-700">{durationMinutes} minuts</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[20, 30, 45, 60, 75, 90].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setDurationMinutes(m);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          durationMinutes === m
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Running session type */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-wide block">
                    Tipus de sessió de running
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Rodatge suau (Zona 2)',
                      'Sèries / Intervals',
                      'Tirada llarga',
                      'Cursa / Competició',
                    ].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setRunType(r);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-left transition-all ${
                          runType === r
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-black'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* D) FUTBOL / PÀDEL OPTIONS */}
            {(activeCategory === 'futbol' || activeCategory === 'padel') && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      {activeCategory === 'futbol' ? '⚽' : '🎾'}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        {activeCategory === 'futbol' ? 'Opcions de Futbol' : 'Opcions de Pàdel / Tennis'}
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Durada del partit o entrenament
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">Temps de joc</label>
                    <span className="text-xs font-black text-emerald-700">{durationMinutes} minuts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[45, 60, 75, 90, 120].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setDurationMinutes(m);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          durationMinutes === m
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Format de la trobada
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Partit competitiu', 'Partit amb amics', 'Entrenament tècnic'].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setMatchFormat(fmt);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold text-center ${
                          matchFormat === fmt
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* E) NATACIÓ OPTIONS */}
            {activeCategory === 'natacio' && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🏊
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Opcions de Natació
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Metres totals, temps i estil
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Metres nedats *</label>
                    <input
                      type="number"
                      step="50"
                      value={swimMeters}
                      onChange={(e) =>
                        setSwimMeters(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Ex: 1500"
                      className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Temps (min) *</label>
                    <input
                      type="number"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[500, 1000, 1500, 2000, 2500, 3000].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setSwimMeters(m);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0"
                    >
                      {m}m
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block">Estil principal</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Crol', 'Braça', 'Esquena', 'Estils'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setSwimStroke(st);
                        }}
                        className={`py-1.5 rounded-xl text-[10px] font-bold text-center ${
                          swimStroke === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* F) CAMINAR / SENDERISME OPTIONS */}
            {activeCategory === 'caminar' && (
              <div className="bg-white p-4 rounded-3xl border-2 border-emerald-300/80 shadow-md shadow-emerald-600/5 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                      🚶
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Caminar / Senderisme
                      </h3>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Quilòmetres caminats i durada del passeig
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Distància (km)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={distanceKm}
                      onChange={(e) =>
                        setDistanceKm(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="Ex: 6.5"
                      className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Temps (min)</label>
                    <input
                      type="number"
                      step="5"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. ⭐ PROMINENT PERSONALIZED SLEEP & REST RECOMMENDATION (DIRECTLY FROM SPORT) */}
            <div className="bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/40 p-4 rounded-3xl border-2 border-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.12)] space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Recomanació de Son i Descans</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                        Adaptat a {activeSportTitle}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Càlcul científic segons desgast muscular i metabòlic
                    </p>
                  </div>
                </div>
              </div>

              {/* Main metric banner: Sleep Target tonight & Rest window */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Sleep hours tonight */}
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Son recomanat</span>
                    <Moon className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-base font-black text-emerald-950 tracking-tight">
                    {sleepAdvice.recommendedSleepRange}
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 block bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    Target mínim: {sleepAdvice.recommendedSleepHours} hores
                  </span>
                </div>

                {/* Rest window before next hard session */}
                <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Finestra descans</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-base font-black text-slate-900 tracking-tight">
                    {sleepAdvice.restWindowHours} hores
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 block bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                    Abans de carregar de nou
                  </span>
                </div>
              </div>

              {/* Badges */}
              {sleepAdvice.keyRecoveryBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sleepAdvice.keyRecoveryBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-900 text-[10px] font-bold border border-emerald-300/80"
                    >
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Why this sleep amount (Physiological reason) */}
              <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200/90 text-xs text-slate-700 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-900">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Per què el teu cos necessita aquest descans aquesta nit?</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  {sleepAdvice.sleepWhyTip}
                </p>
              </div>

              {/* Recovery instructions */}
              <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200/90 text-xs text-slate-700 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-900">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pauta de recuperació recomanada:</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                  {sleepAdvice.recoveryTip}
                </p>
              </div>

              {/* Direct link to sleep tab if supported */}
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('sleep')}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Moon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Configurar horari a la secció de Son</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              )}
            </div>

            {/* 4. INTENSITY & TRAINING TYPE */}
            <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block mb-2">
                  Intensitat de l'activitat
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'baixa', label: 'Baixa' },
                    { id: 'moderada', label: 'Moderada' },
                    { id: 'alta', label: 'Alta' },
                    { id: 'maxima', label: 'Màxima' },
                  ].map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setIntensity(i.id as SportIntensity);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        intensity === i.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Type */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block mb-2">
                  Tipus d'entrenament
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'forca', label: 'Força / Peses 💪' },
                    { id: 'resistencia', label: 'Resistència / Cardio 🏃' },
                    { id: 'mobilitat', label: 'Mobilitat / Flexibilitat 🧘' },
                    { id: 'recuperacio', label: 'Recuperació activa 🚶' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setTrainingType(t.id as TrainingType);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        trainingType === t.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wide block mb-2">
                  Com t'has sentit durant l'entrenament?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'molt-fort', label: 'Molt fort i amb energia ⚡' },
                    { id: 'be', label: 'Bé, ritme regular 👍' },
                    { id: 'cansat', label: 'Cansament acumulat 🥱' },
                    { id: 'amb-molesties', label: 'Amb petites molèsties 🩹' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        sound.tap();
                        setFeeling(f.id as SportFeeling);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        feeling === f.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* General notes */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Notes addicionals de la sessió:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: bones sensacions, bon ritme a les pujades, calor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3 text-center py-8">
            <Coffee className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-black text-slate-900 uppercase">
              Dia de descans i recuperació
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              El descans programat és fonamental per a la supercompensació fisiològica i la recuperació del sistema nerviós central.
            </p>

            <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <Moon className="w-4 h-4 text-emerald-700" />
                <span>Recomanació per a avui:</span>
              </div>
              <p className="text-xs text-emerald-800">
                {sleepAdvice.recoveryTip} Objectiu de son esta nit: <strong>{sleepAdvice.recommendedSleepRange}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isRestDay ? 'Confirmar dia de descans' : 'Desar activitat i pauta de son'}</span>
        </button>
      </form>
    </div>
  );
};
