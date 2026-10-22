export type DayMoment = 'mati' | 'tarda' | 'nit' | 'tot-el-dia';

export type TabType =
  | 'habits'
  | 'sleep'
  | 'nutrition'
  | 'sport'
  | 'assistant'
  | 'review'
  | 'performance'
  | 'goals'
  | 'settings';

export type HabitCategory = 'salut' | 'productivitat' | 'ment' | 'energia' | 'personal';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  timeOfDay: DayMoment;
  targetValue: number;
  unit?: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'weekends';
  createdAt: string;
  archived?: boolean;
}

export interface HabitLog {
  date: string; // "YYYY-MM-DD"
  habitId: string;
  completed: boolean;
  currentValue: number;
  completedAt?: string;
}

export interface DailyReview {
  date: string;
  completed: boolean;
  productivityScore: number;
  energyLevel: number;
  focusLevel: number;
  stressLevel: number;
  dailyWin: string;
  improvement: string;
  notes?: string;
  submittedAt: string;
  calculatedPerformanceIndex: number;
}

// 2. Control del Son i del Descans
export interface SleepRecord {
  date: string; // "YYYY-MM-DD"
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  qualityScore: number; // 1 to 5
  wokeUpTired: boolean;
  sleptWell: 'molt-be' | 'normal' | 'malament';
  dayEnergyLevel: number; // 1 to 5
  notes?: string;
  updatedAt?: string;
}

// 3. Control de l'Alimentació (5 apartats, kcal i regla estricta de sucre)
export type MealType = 'esmorzar' | 'berenar-mati' | 'dinar' | 'berenar-horabaixa' | 'sopar';

export interface NutrientBreakdown {
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG: number;
  fiberG: number;
  sugarsG: number;
  saltG: number;
}

export interface CalorieInterval {
  minKcal: number;
  maxKcal: number;
}

export type CookingMethod = 'planxa' | 'bullit' | 'forn' | 'fregit' | 'fresc/cru' | 'guisat' | 'altre';

export interface IngredientNutrientDetail {
  id: string;
  name: string;
  grams: number;
  state: 'cru' | 'cuinat';
  cookingMethod: CookingMethod;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG: number;
  fiberG: number;
  sugarsG: number;
  saltG: number;
  isSauceOrOil?: boolean;
  densityPer100g?: number;
  confidence?: number;
}

export interface MealEntry {
  items: string; // Aliments i quantitats aproximades
  calories: number; // Kcal de l'àpat
  hasSugar: boolean; // Porta sucre afegit o dolç?
  time?: string;
  quality?: 'saludable' | 'equilibrat' | 'millorable' | 'critic';
  dishName?: string;
  totalGrams?: number;
  nutrients?: NutrientBreakdown;
  ingredients?: IngredientNutrientDetail[];
  calorieInterval?: CalorieInterval;
  photoUrl?: string;
  sleepImpactNote?: string;
  sportRecoveryNote?: string;
}

export interface NutritionDay {
  date: string; // "YYYY-MM-DD"
  meals: {
    esmorzar: MealEntry;
    'berenar-mati': MealEntry;
    dinar: MealEntry;
    'berenar-horabaixa': MealEntry;
    sopar: MealEntry;
  };
  calorieTarget: number; // Objectiu diari (ex: 2200 kcal)
  totalCalories: number; // Suma de calories del dia
  totalNutrients?: NutrientBreakdown;
  consumedSugarToday: boolean; // Si ha consumit sucre afegit avui
  sugarNotes?: string; // Detall del dolç/sucre si n'ha menjat
  waterLiters: number;
  notes?: string;
  updatedAt?: string;
}

// 4. Registre d'Activitat Física i Esport
export type TrainingType = 'forca' | 'resistencia' | 'mobilitat' | 'recuperacio';
export type SportIntensity = 'baixa' | 'moderada' | 'alta' | 'maxima';
export type SportFeeling = 'molt-fort' | 'be' | 'cansat' | 'pesadesa' | 'amb-molesties';

export interface SportSession {
  id: string;
  date: string;
  isRestDay: boolean;
  sport: string;
  durationMinutes: number;
  intensity: SportIntensity;
  trainingType: TrainingType;
  feeling: SportFeeling;
  distanceKm?: number; // Quilòmetres per a córrer, bicicleta, caminar, etc.
  pace?: string; // Ritme (ex: 4:45 min/km o 26.5 km/h)
  speedKmh?: number; // Velocitat mitjana km/h
  gymDetails?: {
    muscleGroups: string[];
    routineName?: string;
    exercisesDone?: string;
    focusType?: string;
  };
  cyclingDetails?: {
    bikeType?: string;
    elevationGainM?: number;
    speedKmh?: number;
  };
  runningDetails?: {
    runType?: string;
    avgPace?: string;
  };
  swimmingDetails?: {
    meters?: number;
    stroke?: string;
  };
  sleepRecoveryRecommendation?: {
    recommendedSleepHours: number;
    recommendedSleepRange: string;
    restWindowHours: number;
    recoveryTip: string;
    sleepWhyTip: string;
  };
  notes?: string;
  createdAt: string;
}

// 5. Enquestes Diàries Dinàmiques
export interface DynamicSurveyAnswer {
  questionId: string;
  question: string;
  answer: string | number;
  category: 'fatiga' | 'muscular' | 'anim' | 'estres' | 'hidratacio' | 'recuperacio';
}

export interface DailySurvey {
  date: string;
  completed: boolean;
  mood: 'molt-positiva' | 'positiva' | 'neutral' | 'baixa';
  stress: number;
  motivation: number;
  hunger: 'normal' | 'molta-gana' | 'poca-gana';
  energy: number;
  hasMuscleSoreness: boolean;
  needsRest: boolean;
  dynamicAnswers: DynamicSurveyAnswer[];
  submittedAt?: string;
}

// 8. Recordatoris i Objectius Personals
export interface PersonalGoal {
  id: string;
  title: string;
  category: 'son' | 'esport' | 'alimentacio' | 'hidratacio' | 'habits';
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'diari' | 'setmanal';
  description?: string;
}

// 6. Assistent Intel·ligent
export interface AssistantAnalysis {
  generatedAt: string;
  sleepSummary: string;
  nutritionSummary: string;
  sportRecoverySummary: string;
  sugarAudit: {
    status: 'correcte' | 'alerta-sucre' | 'critic';
    weeklySugarCount: number;
    message: string;
  };
  calorieAudit: {
    totalKcal: number;
    targetKcal: number;
    deltaKcal: number;
    verdict: string;
  };
  detectedPatterns: string[];
  recommendations: {
    category: 'son' | 'alimentacio' | 'esport' | 'rutina';
    title: string;
    action: string;
  }[];
}

export interface DayPerformanceData {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  totalHabits: number;
  completedHabits: number;
  habitCompletionRate: number;
  reviewScore?: number;
  performanceIndex: number;
  sleepDuration?: number;
  sportMinutes?: number;
  mealsLoggedCount?: number;
  totalCalories?: number;
  hadSugar?: boolean;
  review?: DailyReview;
}

export interface WeeklyAnalysis {
  weekStart: string;
  weekEnd: string;
  days: DayPerformanceData[];
  averagePerformanceIndex: number;
  averageHabitCompletionRate: number;
  averageProductivityScore: number;
  averageSleepHours: number;
  totalSportMinutes: number;
  totalHabitsDone: number;
  weeklySugarCount: number; // Consum de sucre durant la setmana (màxim permès: 1)
  averageCalories: number;
  bestDay: { dayName: string; score: number };
  starHabit: { title: string; rate: number };
  habitsNeedingFocus: { title: string; rate: number }[];
  streakDays: number;
  insights: string[];
}

// 9. Perfil d'Usuari & Objectiu Individual (High Performance / Massa Muscular / Aprimar-se / Manteniment)
export type UserGoalType =
  | 'massa-muscular'
  | 'perdre-pes'
  | 'alt-rendiment'
  | 'manteniment-salut';

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'home' | 'dona';
  activityLevel: 'sedentari' | 'moderat' | 'actiu' | 'alt-rendiment';
  primaryGoal: UserGoalType;
  customCalorieTarget?: number;
  updatedAt?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
  role?: 'client' | 'atleta' | 'premium';
  avatarInitials?: string;
}


export interface GoalFoodItem {
  name: string;
  category: 'proteina' | 'carbohidrat' | 'greix' | 'verdura' | 'snack';
  benefit: string;
  recommendedPortion?: string;
  exampleDish?: string;
}

export interface GoalAvoidItem {
  name: string;
  reason: string;
  severity: 'critic' | 'moderat' | 'alerta';
  healthyAlternative: string;
}

export interface GoalDietGuideline {
  goalType: UserGoalType;
  title: string;
  tagline: string;
  description: string;
  dailyCalorieModifier: number; // ex: +350 kcal per volum, -400 kcal per definició
  proteinGPerKg: number; // ex: 2.0g/kg
  carbsPercent: number; // 45-55%
  fatPercent: number; // 20-30%
  macroDistribution: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  keyRules: string[];
  foodsToEat: GoalFoodItem[];
  foodsToAvoid: GoalAvoidItem[];
  highPerformanceTips: string[];
  sampleDayMenu: {
    title: string;
    totalKcal: number;
    esmorzar: { title: string; items: string; kcal: number };
    snackMati: { title: string; items: string; kcal: number };
    dinar: { title: string; items: string; kcal: number };
    snackTarda: { title: string; items: string; kcal: number };
    sopar: { title: string; items: string; kcal: number };
  };
}

// 10. Reconeixement d'Àpats i Càlcul Calòric per Imatges
export interface MealVariantOption {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinGPer100g: number;
  carbsGPer100g: number;
  fatGPer100g: number;
  note?: string;
}

export interface MealPhotoAnalysis {
  dishName: string;
  identifiedIngredients?: string[];
  ingredients?: IngredientNutrientDetail[];
  detectedComplements?: {
    name: string;
    estimatedKcal: number;
    note?: string;
  }[];
  totalEstimatedCalories: number;
  calorieInterval?: CalorieInterval;
  estimatedGrams?: number;
  kcalPer100g?: number;
  densityExplanation?: string;
  portionFormula?: string;
  availableVariants?: MealVariantOption[];
  macros: NutrientBreakdown;
  hasRefinedSugar: boolean;
  sugarWarning?: string;
  oilAndSaucesNotice?: string;
  quality: 'saludable' | 'equilibrat' | 'millorable' | 'critic';
  goalSuitability: {
    fitsGoal: boolean;
    verdict: string;
    advice: string;
  };
  confidenceScore: number;
  sleepImpact?: {
    rating: 'òptim' | 'moderat' | 'pesat';
    advice: string;
  };
  sportRecoveryImpact?: {
    rating: 'excel·lent' | 'adequat' | 'insuficient';
    advice: string;
  };
  varietyScore?: number;
  clarificationQuestion?: string;
}

