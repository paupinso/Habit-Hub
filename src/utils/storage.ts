import {
  Habit,
  HabitLog,
  DailyReview,
  DayPerformanceData,
  WeeklyAnalysis,
  SleepRecord,
  NutritionDay,
  SportSession,
  DailySurvey,
  PersonalGoal,
  UserProfile,
  UserGoalType,
  UserAccount,
} from '../types';
import { formatDateIso, getTodayIso, getWeekDaysForDate, parseIsoDate } from './date';

const ACCOUNTS_KEY = 'habitpulse_accounts_v1';
const ACTIVE_USER_ID_KEY = 'habitpulse_active_user_id_v1';

const HABITS_KEY = 'habitpulse_habits_v2';
const LOGS_KEY = 'habitpulse_logs_v2';
const REVIEWS_KEY = 'habitpulse_reviews_v2';
const SLEEP_KEY = 'habitpulse_sleep_v2';
const NUTRITION_KEY = 'habitpulse_nutrition_v2';
const SPORT_KEY = 'habitpulse_sport_v2';
const SURVEYS_KEY = 'habitpulse_surveys_v2';
const GOALS_KEY = 'habitpulse_goals_v2';
const PROFILE_KEY = 'habitpulse_profile_v2';

export function safeGetItem(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Storage] getItem failed for "${key}":`, err);
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] setItem failed for "${key}":`, err);
  }
}

export function loadAccounts(): UserAccount[] {
  const raw = safeGetItem(ACCOUNTS_KEY);
  if (!raw) {
    const defaultAcc: UserAccount = {
      id: 'user-pau',
      email: 'paupinso@gmail.com',
      name: 'Pau Pinsó',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: 'atleta',
      avatarInitials: 'PP',
    };
    safeSetItem(ACCOUNTS_KEY, JSON.stringify([defaultAcc]));
    return [defaultAcc];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  safeSetItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getActiveUserId(): string {
  const stored = safeGetItem(ACTIVE_USER_ID_KEY);
  if (stored) return stored;
  const accounts = loadAccounts();
  const firstId = accounts[0]?.id || 'user-pau';
  safeSetItem(ACTIVE_USER_ID_KEY, firstId);
  return firstId;
}

export function setActiveUserId(userId: string) {
  safeSetItem(ACTIVE_USER_ID_KEY, userId);
  const accounts = loadAccounts();
  const updated = accounts.map((a) =>
    a.id === userId ? { ...a, lastLoginAt: new Date().toISOString() } : a
  );
  saveAccounts(updated);
}

export function getCurrentUser(): UserAccount {
  const activeId = getActiveUserId();
  const accounts = loadAccounts();
  const found = accounts.find((a) => a.id === activeId);
  if (found) return found;
  return (
    accounts[0] || {
      id: 'user-pau',
      email: 'paupinso@gmail.com',
      name: 'Pau Pinsó',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: 'atleta',
      avatarInitials: 'PP',
    }
  );
}

export function registerUser(email: string, name: string): UserAccount {
  const accounts = loadAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    setActiveUserId(existing.id);
    return existing;
  }
  const cleanName = name.trim() || cleanEmail.split('@')[0];
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || cleanEmail.slice(0, 2).toUpperCase();

  const newAccount: UserAccount = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    name: cleanName,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    role: 'client',
    avatarInitials: initials,
  };

  saveAccounts([...accounts, newAccount]);
  setActiveUserId(newAccount.id);

  // Initialize fresh custom profile for new user
  const newProfile: UserProfile = {
    name: cleanName,
    weightKg: 70,
    heightCm: 175,
    age: 25,
    gender: 'home',
    activityLevel: 'actiu',
    primaryGoal: 'massa-muscular',
    customCalorieTarget: 2400,
  };
  saveUserProfile(newProfile);
  ensureInitialized();

  return newAccount;
}

export function switchUser(userId: string): UserAccount {
  setActiveUserId(userId);
  ensureInitialized();
  return getCurrentUser();
}

export function deleteAccount(userId: string): void {
  const accounts = loadAccounts().filter((a) => a.id !== userId);
  saveAccounts(accounts);
  if (getActiveUserId() === userId) {
    const nextUser = accounts[0] || {
      id: 'user-pau',
      email: 'paupinso@gmail.com',
      name: 'Pau Pinsó',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      role: 'atleta',
      avatarInitials: 'PP',
    };
    setActiveUserId(nextUser.id);
  }
}

/**
 * Resolves user-scoped storage key to ensure 100% data isolation per email account.
 */
function getKey(baseKey: string): string {
  const userId = getActiveUserId();
  const userScopedKey = `${baseKey}_${userId}`;
  // If user-pau has no scoped data yet, seamlessly migrate legacy un-scoped data
  if (userId === 'user-pau' && !safeGetItem(userScopedKey)) {
    const legacy = safeGetItem(baseKey);
    if (legacy) {
      safeSetItem(userScopedKey, legacy);
    }
  }
  return userScopedKey;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Esportista',
  weightKg: 72,
  heightCm: 178,
  age: 24,
  gender: 'home',
  activityLevel: 'alt-rendiment',
  primaryGoal: 'massa-muscular',
  customCalorieTarget: 2600,
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: "Beure 2.5L d'aigua",
    description: "Mantenir una bona hidratació al llarg del dia",
    category: 'salut',
    timeOfDay: 'tot-el-dia',
    targetValue: 2.5,
    unit: 'L',
    icon: 'Droplet',
    color: 'sky',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    title: 'Activitat física o 8.000 passes',
    description: "Esport, gimnàs, bici o caminada activa",
    category: 'salut',
    timeOfDay: 'tarda',
    targetValue: 1,
    unit: 'sessió',
    icon: 'Activity',
    color: 'emerald',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    title: 'Llegir 15 pàgines de llibre',
    description: "Aprendre i desconnectar abans de descansar",
    category: 'ment',
    timeOfDay: 'nit',
    targetValue: 15,
    unit: 'pàgines',
    icon: 'BookOpen',
    color: 'indigo',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-4',
    title: 'Definir 3 prioritats clau',
    description: "Clarificar els objectius d'estudi i feina",
    category: 'productivitat',
    timeOfDay: 'mati',
    targetValue: 1,
    unit: 'pla',
    icon: 'Target',
    color: 'amber',
    frequency: 'weekdays',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-5',
    title: 'Sense pantalles 30 min abans de dormir',
    description: "Millorar la qualitat del son i la melatonina",
    category: 'energia',
    timeOfDay: 'nit',
    targetValue: 1,
    unit: 'vegada',
    icon: 'Moon',
    color: 'rose',
    frequency: 'daily',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_GOALS: PersonalGoal[] = [
  {
    id: 'goal-1',
    title: 'Dormir entre 7.5h i 8.5h diàries',
    category: 'son',
    targetValue: 8,
    currentValue: 7.7,
    unit: 'h',
    period: 'diari',
    description: 'Horari regular per recuperar el cos i la ment.',
  },
  {
    id: 'goal-2',
    title: '4 sessions d’activitat física a la setmana',
    category: 'esport',
    targetValue: 4,
    currentValue: 4,
    unit: 'dies',
    period: 'setmanal',
    description: 'Bicicleta, gimnàs, córrer o futbol.',
  },
  {
    id: 'goal-3',
    title: 'Completar els 5 àpats equilibrats',
    category: 'alimentacio',
    targetValue: 5,
    currentValue: 4,
    unit: 'àpats',
    period: 'diari',
    description: 'Esmorzar, berenar matí, dinar, berenar horabaixa i sopar.',
  },
  {
    id: 'goal-4',
    title: 'Beure 2.5 litres d’aigua al dia',
    category: 'hidratacio',
    targetValue: 2.5,
    currentValue: 2.2,
    unit: 'L',
    period: 'diari',
    description: 'Energia constant i millor recuperació muscular.',
  },
];

export function calculateSleepHours(bedTime: string, wakeTime: string): number {
  if (!bedTime || !wakeTime) return 8.0;
  const [bH, bM] = bedTime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);
  let bedMinutes = bH * 60 + bM;
  let wakeMinutes = wH * 60 + wM;
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60; // crossed midnight
  }
  const diffMinutes = wakeMinutes - bedMinutes;
  return Number((diffMinutes / 60).toFixed(1));
}

function bootstrapRealisticData(): {
  logs: HabitLog[];
  reviews: DailyReview[];
  sleep: SleepRecord[];
  nutrition: NutritionDay[];
  sports: SportSession[];
  surveys: DailySurvey[];
} {
  const logs: HabitLog[] = [];
  const reviews: DailyReview[] = [];
  const sleep: SleepRecord[] = [];
  const nutrition: NutritionDay[] = [];
  const sports: SportSession[] = [];
  const surveys: DailySurvey[] = [];

  const today = new Date();

  const sportsPool = [
    { sport: 'Bicicleta', duration: 60, intensity: 'moderada' as const, type: 'resistencia' as const },
    { sport: 'Gimnàs', duration: 50, intensity: 'alta' as const, type: 'forca' as const },
    { sport: 'Córrer', duration: 40, intensity: 'alta' as const, type: 'resistencia' as const },
    { sport: 'Futbol', duration: 75, intensity: 'maxima' as const, type: 'resistencia' as const },
    { sport: 'Pàdel', duration: 60, intensity: 'moderada' as const, type: 'resistencia' as const },
    { sport: 'Caminar', duration: 45, intensity: 'baixa' as const, type: 'recuperacio' as const },
  ];

  for (let i = 8; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDateIso(d);

    // 1. Habit logs
    INITIAL_HABITS.forEach((h, hIdx) => {
      const isDone = (hIdx + i) % 4 !== 0;
      logs.push({
        date: dateStr,
        habitId: h.id,
        completed: isDone,
        currentValue: isDone ? h.targetValue : Math.floor(h.targetValue * 0.5),
        completedAt: `${dateStr}T19:00:00Z`,
      });
    });

    // 2. Sleep record
    const bedTime = i % 2 === 0 ? '23:30' : '23:00';
    const wakeTime = i % 2 === 0 ? '07:15' : '07:30';
    const duration = calculateSleepHours(bedTime, wakeTime);
    const wokeUpTired = duration < 7.5 || i % 4 === 0;

    sleep.push({
      date: dateStr,
      bedTime,
      wakeTime,
      durationHours: duration,
      qualityScore: wokeUpTired ? 3 : 4,
      wokeUpTired,
      sleptWell: wokeUpTired ? 'normal' : 'molt-be',
      dayEnergyLevel: wokeUpTired ? 3 : 4,
      notes: wokeUpTired ? 'M’ha costat una mica llevar-me.' : 'Descans molt reparador.',
      updatedAt: `${dateStr}T08:00:00Z`,
    });

    // 3. Nutrition (5 meals, calories and sugar tracking)
    const hadSugarThisDay = i === 3; // Only 1 day with sugar in the whole week!
    nutrition.push({
      date: dateStr,
      calorieTarget: 2200,
      totalCalories: hadSugarThisDay ? 2380 : 2120,
      consumedSugarToday: hadSugarThisDay,
      sugarNotes: hadSugarThisDay ? 'Una ració de postre dolç' : undefined,
      waterLiters: i % 2 === 0 ? 2.4 : 2.6,
      meals: {
        esmorzar: {
          items: 'Torrades de pa integral amb oli d’oliva, pernil i cafè amb llet de civada.',
          calories: 420,
          hasSugar: false,
          time: '08:00',
          quality: 'saludable',
        },
        'berenar-mati': {
          items: 'Un plàtan i un grapat d’ametlles crues.',
          calories: 220,
          hasSugar: false,
          time: '11:15',
          quality: 'saludable',
        },
        dinar: {
          items: 'Arròs amb verdures saltejades i pit de pollastre a la planxa. Iogurt natural.',
          calories: 780,
          hasSugar: false,
          time: '14:00',
          quality: 'equilibrat',
        },
        'berenar-horabaixa': {
          items: hadSugarThisDay ? 'Un dònut de xocolata i cafè' : 'Una poma i una barreta de civada.',
          calories: hadSugarThisDay ? 450 : 250,
          hasSugar: hadSugarThisDay,
          time: '18:00',
          quality: hadSugarThisDay ? 'critic' : 'saludable',
        },
        sopar: {
          items: 'Crema de carbassa i truita francesa de dos ous amb amanida de tomàquet.',
          calories: 450,
          hasSugar: false,
          time: '21:30',
          quality: 'saludable',
        },
      },
      updatedAt: `${dateStr}T22:00:00Z`,
    });

    // 4. Sport session
    const isRest = i % 3 === 0;
    const sp = sportsPool[i % sportsPool.length];
    if (isRest) {
      sports.push({
        id: `sport-${dateStr}`,
        date: dateStr,
        isRestDay: true,
        sport: 'Descans actiu',
        durationMinutes: 0,
        intensity: 'baixa',
        trainingType: 'recuperacio',
        feeling: 'be',
        notes: 'Dia de descans per permetre recuperació muscular.',
        createdAt: `${dateStr}T20:00:00Z`,
      });
    } else {
      sports.push({
        id: `sport-${dateStr}`,
        date: dateStr,
        isRestDay: false,
        sport: sp.sport,
        durationMinutes: sp.duration,
        intensity: sp.intensity,
        trainingType: sp.type,
        feeling: i % 4 === 0 ? 'cansat' : 'molt-fort',
        notes: `Bona sessió de ${sp.sport}. Treball completat amb èxit.`,
        createdAt: `${dateStr}T19:00:00Z`,
      });
    }

    // 5. Daily Survey
    surveys.push({
      date: dateStr,
      completed: true,
      mood: i % 3 === 0 ? 'positiva' : 'molt-positiva',
      stress: i % 2 === 0 ? 2 : 3,
      motivation: 4,
      hunger: 'normal',
      energy: wokeUpTired ? 3 : 4,
      hasMuscleSoreness: !isRest && (sp.intensity === 'alta' || sp.intensity === 'maxima'),
      needsRest: isRest,
      dynamicAnswers: [
        {
          questionId: 'q-sleep',
          question: 'Com valores la teva claredat mental aquest matí?',
          answer: wokeUpTired ? 'Una mica espès les primeres hores' : 'Clar i amb bona concentració',
          category: 'fatiga',
        },
        {
          questionId: 'q-training',
          question: isRest ? 'Com notes les cames avui que descanses?' : `Sensació després de fer ${sp.sport}?`,
          answer: isRest ? 'Recuperant bé' : 'Cansament agradable sense dolor',
          category: 'muscular',
        },
      ],
      submittedAt: `${dateStr}T21:00:00Z`,
    });

    // 6. Review
    reviews.push({
      date: dateStr,
      completed: true,
      productivityScore: i % 2 === 0 ? 8 : 9,
      energyLevel: wokeUpTired ? 3 : 4,
      focusLevel: 4,
      stressLevel: 2,
      dailyWin: 'Entrenament i àpats organitzats amb consistència.',
      improvement: 'Beure més aigua abans de les 16h.',
      notes: 'Seguint la rutina amb motivació.',
      submittedAt: `${dateStr}T22:30:00Z`,
      calculatedPerformanceIndex: i % 2 === 0 ? 82 : 88,
    });
  }

  return { logs, reviews, sleep, nutrition, sports, surveys };
}

// Ensure initial bootstrap
function ensureInitialized() {
  const activeId = getActiveUserId();
  const habitsKey = getKey(HABITS_KEY);
  const rawHabits = safeGetItem(habitsKey);
  if (!rawHabits) {
    saveHabits(INITIAL_HABITS);
    saveGoals(INITIAL_GOALS);
    if (activeId === 'user-pau') {
      const data = bootstrapRealisticData();
      saveLogs(data.logs);
      saveReviews(data.reviews);
      safeSetItem(getKey(SLEEP_KEY), JSON.stringify(data.sleep));
      safeSetItem(getKey(NUTRITION_KEY), JSON.stringify(data.nutrition));
      safeSetItem(getKey(SPORT_KEY), JSON.stringify(data.sports));
      safeSetItem(getKey(SURVEYS_KEY), JSON.stringify(data.surveys));
    } else {
      saveLogs([]);
      saveReviews([]);
      safeSetItem(getKey(SLEEP_KEY), JSON.stringify([]));
      safeSetItem(getKey(NUTRITION_KEY), JSON.stringify([]));
      safeSetItem(getKey(SPORT_KEY), JSON.stringify([]));
      safeSetItem(getKey(SURVEYS_KEY), JSON.stringify([]));
    }
  }
}

// Habits
export function loadHabits(): Habit[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(HABITS_KEY));
  return raw ? JSON.parse(raw) : INITIAL_HABITS;
}

export function saveHabits(habits: Habit[]) {
  safeSetItem(getKey(HABITS_KEY), JSON.stringify(habits));
}

// Logs
export function loadLogs(): HabitLog[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(LOGS_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveLogs(logs: HabitLog[]) {
  safeSetItem(getKey(LOGS_KEY), JSON.stringify(logs));
}

// Reviews
export function loadReviews(): DailyReview[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(REVIEWS_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveReviews(reviews: DailyReview[]) {
  safeSetItem(getKey(REVIEWS_KEY), JSON.stringify(reviews));
}

// Sleep Records
export function loadSleepRecords(): SleepRecord[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(SLEEP_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveSleepRecord(record: SleepRecord) {
  const list = loadSleepRecords().filter((s) => s.date !== record.date);
  const updated = [record, ...list];
  safeSetItem(getKey(SLEEP_KEY), JSON.stringify(updated));
}

export function getSleepForDate(date: string): SleepRecord {
  const all = loadSleepRecords();
  const existing = all.find((s) => s.date === date);
  if (existing) return existing;
  return {
    date,
    bedTime: '23:00',
    wakeTime: '07:15',
    durationHours: 8.25,
    qualityScore: 4,
    wokeUpTired: false,
    sleptWell: 'molt-be',
    dayEnergyLevel: 4,
  };
}

// Nutrition (5 meals)
export function loadNutritionDays(): NutritionDay[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(NUTRITION_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveNutritionDay(nut: NutritionDay) {
  const list = loadNutritionDays().filter((n) => n.date !== nut.date);
  const updated = [nut, ...list];
  safeSetItem(getKey(NUTRITION_KEY), JSON.stringify(updated));
}

export function calculateTotalDayCalories(nutritionDay: NutritionDay): number {
  if (!nutritionDay || !nutritionDay.meals) return 0;
  const m = nutritionDay.meals;
  return (
    (m.esmorzar?.calories || 0) +
    (m['berenar-mati']?.calories || 0) +
    (m.dinar?.calories || 0) +
    (m['berenar-horabaixa']?.calories || 0) +
    (m.sopar?.calories || 0)
  );
}

export function calculateTotalDayNutrients(nutritionDay: NutritionDay) {
  const totals = {
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    saturatedFatG: 0,
    fiberG: 0,
    sugarsG: 0,
    saltG: 0,
  };
  if (!nutritionDay || !nutritionDay.meals) return totals;
  const mealsList = [
    nutritionDay.meals.esmorzar,
    nutritionDay.meals['berenar-mati'],
    nutritionDay.meals.dinar,
    nutritionDay.meals['berenar-horabaixa'],
    nutritionDay.meals.sopar,
  ];

  mealsList.forEach((m) => {
    if (m?.nutrients) {
      totals.proteinG += Number(m.nutrients.proteinG) || 0;
      totals.carbsG += Number(m.nutrients.carbsG) || 0;
      totals.fatG += Number(m.nutrients.fatG) || 0;
      totals.saturatedFatG += Number(m.nutrients.saturatedFatG) || 0;
      totals.fiberG += Number(m.nutrients.fiberG) || 0;
      totals.sugarsG += Number(m.nutrients.sugarsG) || 0;
      totals.saltG += Number(m.nutrients.saltG) || 0;
    }
  });

  totals.carbsG = Number(totals.carbsG.toFixed(1));
  totals.fatG = Number(totals.fatG.toFixed(1));
  totals.saturatedFatG = Number(totals.saturatedFatG.toFixed(1));
  totals.fiberG = Number(totals.fiberG.toFixed(1));
  totals.sugarsG = Number(totals.sugarsG.toFixed(1));
  totals.saltG = Number(totals.saltG.toFixed(2));

  return totals;
}

export function getWeeklySugarCount(weekDays: { date: string }[], nutritionDays: NutritionDay[]): number {
  let count = 0;
  weekDays.forEach((d) => {
    const nut = nutritionDays.find((n) => n.date === d.date);
    if (nut) {
      const hasMealSugar =
        nut.consumedSugarToday ||
        nut.meals.esmorzar?.hasSugar ||
        nut.meals['berenar-mati']?.hasSugar ||
        nut.meals.dinar?.hasSugar ||
        nut.meals['berenar-horabaixa']?.hasSugar ||
        nut.meals.sopar?.hasSugar;
      if (hasMealSugar) count++;
    }
  });
  return count;
}

export function getNutritionForDate(date: string): NutritionDay {
  const all = loadNutritionDays();
  const existing = all.find((n) => n.date === date);
  if (existing) {
    // ensure fields exist
    if (!existing.calorieTarget) existing.calorieTarget = 2200;
    existing.totalCalories = calculateTotalDayCalories(existing);
    return existing;
  }
  return {
    date,
    waterLiters: 2.0,
    calorieTarget: 2200,
    totalCalories: 0,
    consumedSugarToday: false,
    meals: {
      esmorzar: { items: '', calories: 0, hasSugar: false },
      'berenar-mati': { items: '', calories: 0, hasSugar: false },
      dinar: { items: '', calories: 0, hasSugar: false },
      'berenar-horabaixa': { items: '', calories: 0, hasSugar: false },
      sopar: { items: '', calories: 0, hasSugar: false },
    },
  };
}

// Sport Sessions
export function loadSportSessions(): SportSession[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(SPORT_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveSportSession(session: SportSession) {
  const list = loadSportSessions().filter((s) => s.date !== session.date || s.id !== session.id);
  const updated = [session, ...list];
  safeSetItem(getKey(SPORT_KEY), JSON.stringify(updated));
}

export function getSportForDate(date: string): SportSession | undefined {
  const all = loadSportSessions();
  return all.find((s) => s.date === date);
}

// Daily Surveys
export function loadDailySurveys(): DailySurvey[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(SURVEYS_KEY));
  return raw ? JSON.parse(raw) : [];
}

export function saveDailySurvey(survey: DailySurvey) {
  const list = loadDailySurveys().filter((s) => s.date !== survey.date);
  const updated = [survey, ...list];
  safeSetItem(getKey(SURVEYS_KEY), JSON.stringify(updated));
}

export function getSurveyForDate(date: string): DailySurvey | undefined {
  const all = loadDailySurveys();
  return all.find((s) => s.date === date);
}

// Goals
export function loadGoals(): PersonalGoal[] {
  ensureInitialized();
  const raw = safeGetItem(getKey(GOALS_KEY));
  return raw ? JSON.parse(raw) : INITIAL_GOALS;
}

export function saveGoals(goals: PersonalGoal[]) {
  safeSetItem(getKey(GOALS_KEY), JSON.stringify(goals));
}

// Habit streak calculation
export function calculateHabitStreak(habitId: string, logs: HabitLog[]): number {
  const todayStr = getTodayIso();
  const today = parseIsoDate(todayStr);

  let streak = 0;
  const checkDate = new Date(today);

  const todayIso = formatDateIso(checkDate);
  const todayLog = logs.find((l) => l.habitId === habitId && l.date === todayIso);
  if (todayLog && todayLog.completed) {
    streak++;
  }

  for (let i = 1; i <= 60; i++) {
    const prev = new Date(today);
    prev.setDate(today.getDate() - i);
    const prevIso = formatDateIso(prev);
    const log = logs.find((l) => l.habitId === habitId && l.date === prevIso);

    if (log && log.completed) {
      streak++;
    } else {
      if (i === 1 && (!todayLog || !todayLog.completed)) {
        continue;
      }
      break;
    }
  }

  return streak;
}

// Weekly analysis
export function getWeeklyAnalysis(
  targetDateIso: string,
  habits: Habit[],
  logs: HabitLog[],
  reviews: DailyReview[]
): WeeklyAnalysis {
  const weekDays = getWeekDaysForDate(targetDateIso);
  const sleepRecords = loadSleepRecords();
  const sportRecords = loadSportSessions();
  const nutritionDays = loadNutritionDays();

  const daysData = weekDays.map((d) => {
    const activeHabits = habits.filter((h) => !h.archived);
    const total = activeHabits.length || 1;
    let completedCount = 0;
    activeHabits.forEach((habit) => {
      const log = logs.find((l) => l.habitId === habit.id && l.date === d.date);
      if (log && log.completed) completedCount++;
    });

    const completionRate = Math.round((completedCount / total) * 100);
    const review = reviews.find((r) => r.date === d.date);
    const sleep = sleepRecords.find((s) => s.date === d.date);
    const sport = sportRecords.find((sp) => sp.date === d.date);
    const nut = nutritionDays.find((n) => n.date === d.date);

    let perfIndex = completionRate;
    if (review) {
      perfIndex = Math.round(
        completionRate * 0.5 + (review.productivityScore / 10) * 30 + (review.energyLevel / 5) * 20
      );
    }

    let mealsCount = 0;
    let dayCalories = 0;
    let dayHadSugar = false;
    if (nut) {
      const m = nut.meals;
      if (m.esmorzar?.items) mealsCount++;
      if (m['berenar-mati']?.items) mealsCount++;
      if (m.dinar?.items) mealsCount++;
      if (m['berenar-horabaixa']?.items) mealsCount++;
      if (m.sopar?.items) mealsCount++;
      dayCalories = nut.totalCalories || calculateTotalDayCalories(nut);
      dayHadSugar =
        nut.consumedSugarToday ||
        m.esmorzar?.hasSugar ||
        m['berenar-mati']?.hasSugar ||
        m.dinar?.hasSugar ||
        m['berenar-horabaixa']?.hasSugar ||
        m.sopar?.hasSugar;
    }

    return {
      date: d.date,
      dayName: d.dayName,
      dayNumber: d.dayNumber,
      isToday: d.isToday,
      totalHabits: total,
      completedHabits: completedCount,
      habitCompletionRate: completionRate,
      reviewScore: review?.productivityScore,
      performanceIndex: Math.min(100, Math.max(0, perfIndex)),
      sleepDuration: sleep?.durationHours,
      sportMinutes: sport && !sport.isRestDay ? sport.durationMinutes : 0,
      mealsLoggedCount: mealsCount,
      totalCalories: dayCalories,
      hadSugar: dayHadSugar,
      review,
    };
  });

  const pastOrTodayDays = daysData.filter((d) => d.date <= getTodayIso());
  const evaluatedDays = pastOrTodayDays.length || 1;

  const totalHabitsDone = pastOrTodayDays.reduce((acc, d) => acc + d.completedHabits, 0);
  const sumPerf = pastOrTodayDays.reduce((acc, d) => acc + d.performanceIndex, 0);
  const avgPerf = Math.round(sumPerf / evaluatedDays);

  const sumCompletion = pastOrTodayDays.reduce((acc, d) => acc + d.habitCompletionRate, 0);
  const avgCompletion = Math.round(sumCompletion / evaluatedDays);

  const reviewedDays = pastOrTodayDays.filter((d) => d.reviewScore !== undefined);
  const avgProductivity =
    reviewedDays.length > 0
      ? Number((reviewedDays.reduce((acc, d) => acc + (d.reviewScore || 0), 0) / reviewedDays.length).toFixed(1))
      : 8.0;

  // Sleep average
  const validSleep = pastOrTodayDays.filter((d) => d.sleepDuration !== undefined && d.sleepDuration > 0);
  const avgSleep =
    validSleep.length > 0
      ? Number((validSleep.reduce((acc, d) => acc + (d.sleepDuration || 0), 0) / validSleep.length).toFixed(1))
      : 7.8;

  // Total sport minutes
  const totalSportMin = pastOrTodayDays.reduce((acc, d) => acc + (d.sportMinutes || 0), 0);

  // Sugar count in the week
  const weeklySugarCount = getWeeklySugarCount(weekDays, nutritionDays);

  // Calorie average
  const totalCalSum = pastOrTodayDays.reduce((acc, d) => acc + (d.totalCalories || 0), 0);
  const avgCalories = Math.round(totalCalSum / evaluatedDays);

  // Best day
  let bestDay = { dayName: 'Dilluns', score: 0 };
  pastOrTodayDays.forEach((d) => {
    if (d.performanceIndex >= bestDay.score) {
      bestDay = { dayName: d.dayName, score: d.performanceIndex };
    }
  });

  // Habit consistency
  const activeHabits = habits.filter((h) => !h.archived);
  const habitStats = activeHabits.map((habit) => {
    let done = 0;
    pastOrTodayDays.forEach((d) => {
      const l = logs.find((log) => log.habitId === habit.id && log.date === d.date);
      if (l && l.completed) done++;
    });
    return { title: habit.title, rate: Math.round((done / evaluatedDays) * 100) };
  });

  habitStats.sort((a, b) => b.rate - a.rate);
  const starHabit = habitStats[0] || { title: 'Tots els hàbits', rate: 100 };
  const habitsNeedingFocus = habitStats.filter((h) => h.rate < 70).slice(0, 2);

  // Active streak
  let overallStreak = 0;
  activeHabits.forEach((h) => {
    const s = calculateHabitStreak(h.id, logs);
    if (s > overallStreak) overallStreak = s;
  });

  // Actionable, strict and critical insights in Catalan
  const insights: string[] = [];

  // Sugar Audit insight (Critical!)
  if (weeklySugarCount === 0) {
    insights.push(`Regla del Sucre: 0/1 pics consumits. Disciplina total i estricta respecte al sucre afegit!`);
  } else if (weeklySugarCount === 1) {
    insights.push(`Regla del Sucre: 1/1 pic consumit aquesta setmana (límit assolit). Tancament absolut: no està permès cap altre dolç fins dilluns vinent.`);
  } else {
    insights.push(`⚠️ ALERTA CRÍTICA DE SUCRE: Has consumit sucre ${weeklySugarCount} pics aquesta setmana! Has superat el límit permès d’1 sol pic. Cal més rigor i tallar de soca-rel els processats.`);
  }

  // Calories insight
  if (avgCalories > 2350) {
    insights.push(`Balanç Calòric: Mitjana de ${avgCalories} kcal/dia (per sobre de l'objectiu de 2.200 kcal). Redueix racions al sopar o berenar.`);
  } else if (avgCalories > 0 && avgCalories < 1800) {
    insights.push(`Balanç Calòric: Mitjana de ${avgCalories} kcal/dia. Massa baix si fas esport; cal més energia per no perdre massa muscular.`);
  } else {
    insights.push(`Balanç Calòric: Mitjana controlada de ${avgCalories} kcal/dia.`);
  }

  insights.push(`Mitjana de son: ${avgSleep}h per nit. Esport acumulat: ${totalSportMin} minuts.`);

  return {
    weekStart: weekDays[0].date,
    weekEnd: weekDays[6].date,
    days: daysData,
    averagePerformanceIndex: avgPerf,
    averageHabitCompletionRate: avgCompletion,
    averageProductivityScore: avgProductivity,
    averageSleepHours: avgSleep,
    totalSportMinutes: totalSportMin,
    totalHabitsDone,
    weeklySugarCount,
    averageCalories: avgCalories,
    bestDay,
    starHabit,
    habitsNeedingFocus,
    streakDays: overallStreak,
    insights,
  };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = safeGetItem(getKey(PROFILE_KEY));
    if (!raw) return DEFAULT_USER_PROFILE;
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading user profile:', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    safeSetItem(
      getKey(PROFILE_KEY),
      JSON.stringify({
        ...profile,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

