import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Coffee,
  Sun,
  Apple,
  Moon,
  Droplets,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sparkles,
  Salad,
  Info,
  Candy,
  Scale,
  Calendar,
  AlertOctagon,
  ChevronRight,
  BookOpen,
  Zap,
  Camera,
  Target,
  Dumbbell,
  BarChart3,
  Edit,
  Clock,
  Layers,
  HeartPulse,
} from 'lucide-react';
import { NutritionDay, MealType, MealEntry, UserProfile, UserGoalType, MealPhotoAnalysis, NutrientBreakdown } from '../types';
import { sound } from '../utils/audio';
import { formatCatalanDateLong, getWeekDaysForDate } from '../utils/date';
import {
  calculateTotalDayCalories,
  calculateTotalDayNutrients,
  getWeeklySugarCount,
  loadNutritionDays,
  loadUserProfile,
  saveUserProfile,
} from '../utils/storage';
import { estimateCaloriesAndSugar, OFFICIAL_DIET_PLANS, DayDietPlan, GOAL_NUTRITION_PROFILES } from '../data/nutritionGuide';
import { DietGuideView } from './DietGuideView';
import { GoalFocusView } from './GoalFocusView';
import { MealPhotoScannerModal } from './MealPhotoScannerModal';

interface NutritionViewProps {
  selectedDate: string;
  nutritionDay: NutritionDay;
  onSaveNutrition: (nut: NutritionDay) => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  selectedDate,
  nutritionDay,
  onSaveNutrition,
  userProfile,
  onUpdateProfile,
}) => {
  const [activeSubView, setActiveSubView] = useState<'registre' | 'resum' | 'objectiu' | 'guia'>('registre');
  const [profile, setProfile] = useState<UserProfile>(userProfile || loadUserProfile());
  const [isPhotoScannerOpen, setIsPhotoScannerOpen] = useState(false);
  const [scannerMealType, setScannerMealType] = useState<MealType>('dinar');
  const [editingMealData, setEditingMealData] = useState<{
    mealType: MealType;
    analysis: MealPhotoAnalysis;
  } | null>(null);
  const [meals, setMeals] = useState(nutritionDay.meals);
  const [calorieTarget, setCalorieTarget] = useState(
    nutritionDay.calorieTarget || profile.customCalorieTarget || 2200
  );
  const [consumedSugarToday, setConsumedSugarToday] = useState(nutritionDay.consumedSugarToday || false);
  const [sugarNotes, setSugarNotes] = useState(nutritionDay.sugarNotes || '');
  const [waterLiters, setWaterLiters] = useState(nutritionDay.waterLiters || 2.0);
  const [notes, setNotes] = useState(nutritionDay.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showCalorieConfig, setShowCalorieConfig] = useState(false);

  useEffect(() => {
    if (userProfile) setProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    setMeals(nutritionDay.meals);
    setCalorieTarget(nutritionDay.calorieTarget || 2200);
    setConsumedSugarToday(nutritionDay.consumedSugarToday || false);
    setSugarNotes(nutritionDay.sugarNotes || '');
    setWaterLiters(nutritionDay.waterLiters || 2.0);
    setNotes(nutritionDay.notes || '');
    setSavedSuccess(false);
  }, [selectedDate, nutritionDay]);

  const updateMealText = (type: MealType, text: string) => {
    // Run automatic "a ull" estimation
    const estimate = estimateCaloriesAndSugar(text);

    setMeals((prev) => {
      const currentKcal = prev[type]?.calories || 0;
      // Auto-set calories if user hasn't manually customized or if currently 0
      const autoKcal = currentKcal === 0 && estimate.estimatedCalories > 0
        ? estimate.estimatedCalories
        : currentKcal;

      // Auto-detect sugar
      const autoSugar = estimate.detectedSugar;

      return {
        ...prev,
        [type]: {
          ...prev[type],
          items: text,
          calories: autoKcal,
          hasSugar: autoSugar || prev[type]?.hasSugar || false,
        },
      };
    });

    if (estimate.detectedSugar) {
      setConsumedSugarToday(true);
    }
  };

  const autoEstimateMealKcal = (type: MealType) => {
    sound.tap();
    const currentText = meals[type]?.items || '';
    const estimate = estimateCaloriesAndSugar(currentText);

    setMeals((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        calories: estimate.estimatedCalories,
        hasSugar: estimate.detectedSugar || prev[type]?.hasSugar || false,
      },
    }));

    if (estimate.detectedSugar) {
      setConsumedSugarToday(true);
    }
  };

  const updateMealCalories = (type: MealType, kcal: number) => {
    setMeals((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        calories: Math.max(0, kcal),
      },
    }));
  };

  const addMealCalories = (type: MealType, delta: number) => {
    sound.tap();
    setMeals((prev) => {
      const current = prev[type]?.calories || 0;
      return {
        ...prev,
        [type]: {
          ...prev[type],
          calories: Math.max(0, current + delta),
        },
      };
    });
  };

  const updateMealSugar = (type: MealType, hasSugar: boolean) => {
    sound.tap();
    setMeals((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        hasSugar,
      },
    }));
    if (hasSugar) {
      setConsumedSugarToday(true);
    }
  };

  const handleWaterAdjust = (delta: number) => {
    sound.tap();
    setWaterLiters((prev) => Math.max(0, Number((prev + delta).toFixed(2))));
  };

  const currentTotalCalories =
    (meals.esmorzar?.calories || 0) +
    (meals['berenar-mati']?.calories || 0) +
    (meals.dinar?.calories || 0) +
    (meals['berenar-horabaixa']?.calories || 0) +
    (meals.sopar?.calories || 0);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sound.completeHabit();

    const anyMealHasSugar =
      meals.esmorzar?.hasSugar ||
      meals['berenar-mati']?.hasSugar ||
      meals.dinar?.hasSugar ||
      meals['berenar-horabaixa']?.hasSugar ||
      meals.sopar?.hasSugar;

    const finalSugarToday = consumedSugarToday || anyMealHasSugar;

    const updated: NutritionDay = {
      date: selectedDate,
      calorieTarget: Number(calorieTarget) || 2200,
      totalCalories: currentTotalCalories,
      consumedSugarToday: finalSugarToday,
      sugarNotes: finalSugarToday ? sugarNotes.trim() || 'Consum de sucre o dolços' : undefined,
      meals,
      waterLiters,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSaveNutrition(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Apply full menu from CEA plan into today's log
  const handleApplyPlanToToday = (plan: DayDietPlan) => {
    const updatedMeals = {
      esmorzar: {
        items: `${plan.esmorzar.title} - ${plan.esmorzar.description}`,
        calories: plan.esmorzar.estimatedKcal,
        hasSugar: plan.esmorzar.hasSugar,
      },
      'berenar-mati': {
        items: `${plan.snackEscola.title} - ${plan.snackEscola.description}`,
        calories: plan.snackEscola.estimatedKcal,
        hasSugar: plan.snackEscola.hasSugar,
      },
      dinar: {
        items: `${plan.dinar.title} - ${plan.dinar.description}`,
        calories: plan.dinar.estimatedKcal,
        hasSugar: plan.dinar.hasSugar,
      },
      'berenar-horabaixa': {
        items: 'Iogurt proteic o fruita amb 20g de nous (pre-entrenament)',
        calories: 180,
        hasSugar: false,
      },
      sopar: {
        items: `${plan.sopar.title} - ${plan.sopar.description}`,
        calories: plan.sopar.estimatedKcal,
        hasSugar: plan.sopar.hasSugar,
      },
    };

    setMeals(updatedMeals);
    const hasAnySugar = plan.esmorzar.hasSugar || plan.dinar.hasSugar || plan.sopar.hasSugar;
    if (hasAnySugar) {
      setConsumedSugarToday(true);
      setSugarNotes(plan.esmorzar.sugarWarning || 'Sucre en la pauta');
    }

    const newTotal =
      plan.esmorzar.estimatedKcal +
      plan.snackEscola.estimatedKcal +
      plan.dinar.estimatedKcal +
      180 +
      plan.sopar.estimatedKcal;

    const updated: NutritionDay = {
      date: selectedDate,
      calorieTarget,
      totalCalories: newTotal,
      consumedSugarToday: hasAnySugar,
      sugarNotes: hasAnySugar ? plan.esmorzar.sugarWarning : undefined,
      meals: updatedMeals,
      waterLiters,
      notes: `Menú de ${plan.dayName} aplicat de la Pauta Nutricional CEA`,
      updatedAt: new Date().toISOString(),
    };

    onSaveNutrition(updated);
    setActiveSubView('registre');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Apply custom sample menu from user's primary goal (Massa muscular, Aprimar-se, etc.)
  const handleApplySampleMenu = (menu: {
    esmorzar: { items: string; calories: number };
    snackMati: { items: string; calories: number };
    dinar: { items: string; calories: number };
    snackTarda: { items: string; calories: number };
    sopar: { items: string; calories: number };
    totalKcal: number;
  }) => {
    const updatedMeals = {
      esmorzar: {
        items: menu.esmorzar.items,
        calories: menu.esmorzar.calories,
        hasSugar: false,
      },
      'berenar-mati': {
        items: menu.snackMati.items,
        calories: menu.snackMati.calories,
        hasSugar: false,
      },
      dinar: {
        items: menu.dinar.items,
        calories: menu.dinar.calories,
        hasSugar: false,
      },
      'berenar-horabaixa': {
        items: menu.snackTarda.items,
        calories: menu.snackTarda.calories,
        hasSugar: false,
      },
      sopar: {
        items: menu.sopar.items,
        calories: menu.sopar.calories,
        hasSugar: false,
      },
    };

    setMeals(updatedMeals);
    setCalorieTarget(menu.totalKcal);

    const updated: NutritionDay = {
      date: selectedDate,
      calorieTarget: menu.totalKcal,
      totalCalories: menu.totalKcal,
      consumedSugarToday: false,
      meals: updatedMeals,
      waterLiters,
      notes: `Menú aplicat segons l'objectiu individual de ${profile.primaryGoal}`,
      updatedAt: new Date().toISOString(),
    };

    onSaveNutrition(updated);
    setActiveSubView('registre');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
    if (onUpdateProfile) onUpdateProfile(updated);
    if (updated.customCalorieTarget) {
      setCalorieTarget(updated.customCalorieTarget);
    }
  };

  const openPhotoScannerForMeal = (type: MealType) => {
    sound.tap();
    setScannerMealType(type);
    setEditingMealData(null);
    setIsPhotoScannerOpen(true);
  };

  const openEditorForMeal = (type: MealType) => {
    sound.tap();
    setScannerMealType(type);
    const existing = meals[type];
    const estimatedGrams = existing?.totalGrams || 180;
    const estimatedKcal = existing?.calories || 0;

    const analysis: MealPhotoAnalysis = {
      dishName: existing?.dishName || existing?.items || 'Àpat confirmat',
      estimatedGrams,
      totalEstimatedCalories: estimatedKcal,
      calorieInterval: existing?.calorieInterval || {
        minKcal: Math.max(10, Math.round(estimatedKcal * 0.94)),
        maxKcal: Math.round(estimatedKcal * 1.06),
      },
      ingredients: existing?.ingredients && existing.ingredients.length > 0
        ? existing.ingredients
        : [
            {
              id: 'ing-1',
              name: existing?.dishName || existing?.items || 'Aliment principal',
              grams: estimatedGrams,
              state: 'cuinat',
              cookingMethod: 'planxa',
              kcal: estimatedKcal,
              proteinG: existing?.nutrients?.proteinG || 18,
              carbsG: existing?.nutrients?.carbsG || 20,
              fatG: existing?.nutrients?.fatG || 6,
              saturatedFatG: existing?.nutrients?.saturatedFatG || 1.2,
              fiberG: existing?.nutrients?.fiberG || 2,
              sugarsG: existing?.nutrients?.sugarsG || 1.5,
              saltG: existing?.nutrients?.saltG || 0.4,
            },
          ],
      macros: existing?.nutrients || {
        proteinG: 18,
        carbsG: 20,
        fatG: 6,
        saturatedFatG: 1.2,
        fiberG: 2,
        sugarsG: 1.5,
        saltG: 0.4,
      },
      hasRefinedSugar: existing?.hasSugar || false,
      quality: existing?.quality || 'saludable',
      goalSuitability: {
        fitsGoal: true,
        verdict: 'Àpat registrat correctament.',
        advice: 'Pots afinar els grams o afegir nous ingredients.',
      },
      confidenceScore: 98,
      sleepImpact: existing?.sleepImpactNote
        ? { rating: 'òptim', advice: existing.sleepImpactNote }
        : undefined,
      sportRecoveryImpact: existing?.sportRecoveryNote
        ? { rating: 'excel·lent', advice: existing.sportRecoveryNote }
        : undefined,
    };

    setEditingMealData({ mealType: type, analysis });
    setIsPhotoScannerOpen(true);
  };

  const handleApplyPhotoAnalysis = (type: MealType, analysis: MealPhotoAnalysis) => {
    const complementText =
      analysis.detectedComplements && analysis.detectedComplements.length > 0
        ? ` (${analysis.detectedComplements.map((c) => c.name).join(', ')})`
        : '';
    const fullText = `${analysis.dishName}${complementText}`;

    const updatedMeal: MealEntry = {
      items: fullText,
      calories: analysis.totalEstimatedCalories,
      hasSugar: analysis.hasRefinedSugar,
      dishName: analysis.dishName,
      totalGrams: analysis.estimatedGrams,
      nutrients: analysis.macros,
      ingredients: analysis.ingredients,
      calorieInterval: analysis.calorieInterval,
      sleepImpactNote: analysis.sleepImpact?.advice,
      sportRecoveryNote: analysis.sportRecoveryImpact?.advice,
      quality: analysis.quality,
    };

    const updatedMeals = {
      ...meals,
      [type]: updatedMeal,
    };

    setMeals(updatedMeals);

    const shouldFlagSugar = Boolean(analysis.hasRefinedSugar || consumedSugarToday);
    if (analysis.hasRefinedSugar) {
      setConsumedSugarToday(true);
      setSugarNotes(analysis.sugarWarning || 'Aliment amb sucre detectat per anàlisi');
    }

    const anyMealHasSugar =
      updatedMeals.esmorzar?.hasSugar ||
      updatedMeals['berenar-mati']?.hasSugar ||
      updatedMeals.dinar?.hasSugar ||
      updatedMeals['berenar-horabaixa']?.hasSugar ||
      updatedMeals.sopar?.hasSugar;

    const newDayTotalKcal =
      (updatedMeals.esmorzar?.calories || 0) +
      (updatedMeals['berenar-mati']?.calories || 0) +
      (updatedMeals.dinar?.calories || 0) +
      (updatedMeals['berenar-horabaixa']?.calories || 0) +
      (updatedMeals.sopar?.calories || 0);

    const updatedNutritionDay: NutritionDay = {
      date: selectedDate,
      calorieTarget,
      totalCalories: newDayTotalKcal,
      totalNutrients: calculateTotalDayNutrients({ ...nutritionDay, meals: updatedMeals }),
      consumedSugarToday: shouldFlagSugar || anyMealHasSugar,
      sugarNotes: sugarNotes || (analysis.hasRefinedSugar ? analysis.sugarWarning : undefined),
      meals: updatedMeals,
      waterLiters,
      notes,
      updatedAt: new Date().toISOString(),
    };

    // Auto-save persistently so user's confirmed meal is saved immediately
    onSaveNutrition(updatedNutritionDay);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Weekly Sugar calculation (Only 1 pic per setmana permès!)
  const weekDays = getWeekDaysForDate(selectedDate);
  const allNutritionDays = loadNutritionDays();
  const otherDaysCount = getWeeklySugarCount(
    weekDays.filter((d) => d.date !== selectedDate),
    allNutritionDays
  );

  const thisDayHasSugar =
    consumedSugarToday ||
    Boolean(meals.esmorzar?.hasSugar) ||
    Boolean(meals['berenar-mati']?.hasSugar) ||
    Boolean(meals.dinar?.hasSugar) ||
    Boolean(meals['berenar-horabaixa']?.hasSugar) ||
    Boolean(meals.sopar?.hasSugar);

  const currentWeeklySugarCount = otherDaysCount + (thisDayHasSugar ? 1 : 0);

  // Calorie calculation status
  const calorieDelta = currentTotalCalories - calorieTarget;
  const calPercent = Math.min(130, Math.round((currentTotalCalories / (calorieTarget || 1)) * 100));

  // Critical & Strict Dietary Feedback
  const getCriticalDietAdvice = () => {
    const list: { type: 'danger' | 'warning' | 'success'; title: string; text: string }[] = [];

    // 1. Strict Sugar Rule Check (MÀXIM 1 PIC PER SETMANA)
    if (currentWeeklySugarCount > 1) {
      list.push({
        type: 'danger',
        title: '🚨 INCOMPLIMENT GREU DEL LÍMIT DE SUCRE',
        text: `Portes ${currentWeeklySugarCount} pics de sucre aquesta setmana. Has incomplert la regla innegociable d'1 sol pic! El sucre afegit et saboteja la crema de greix, provoca caigudes d'energia i inflamació muscular. Tolerància zero fins dilluns vinent.`,
      });
    } else if (currentWeeklySugarCount === 1) {
      list.push({
        type: 'warning',
        title: '⚠️ COMODÍ DE SUCRE ESGOTAT (1/1 PIC)',
        text: `Has gastat el teu únic pic de sucre permès d'aquesta setmana (${thisDayHasSugar ? 'avui' : 'un altre dia d’aquesta setmana'}). Ni un sol gram més de sucre ni ultraprocessats fins dilluns vinent!`,
      });
    } else {
      list.push({
        type: 'success',
        title: '✅ DISCIPLINA DE SUCRE IMPECABLE',
        text: `0 pics de sucre consumits aquesta setmana. Mantens el teu únic comodí setmanal intacte. El teu cos crema energia de forma neta i estable.`,
      });
    }

    // 2. Strict Calorie Count Check
    if (currentTotalCalories === 0) {
      list.push({
        type: 'warning',
        title: '⚠️ SENSE RECOMPTE CALÒRIC',
        text: `No has anotat els aliments ni les calories. Escriu els aliments o utilitza les idees de dietes de la Pauta CEA i l'aplicació calcularà les kcal a ull directament.`,
      });
    } else if (calorieDelta > 300) {
      list.push({
        type: 'danger',
        title: `🚨 SUPERÀVIT CRÍTIC (+${calorieDelta} kcal)`,
        text: `Portes ${currentTotalCalories} kcal (${calPercent}% del límit). Has superat el teu límit diari de ${calorieTarget} kcal. Si no has competit ni entrenat dur, aquest excés s'acumularà en teixit adipós. Retalla racions al sopar.`,
      });
    } else if (calorieDelta > 100) {
      list.push({
        type: 'warning',
        title: `⚠️ LÍMIT CALÒRIC FREC A FREC (+${calorieDelta} kcal)`,
        text: `Estàs lleugerament per sobre del teu pressupost diari. Modera carbohidrats simples i greixos afegits a l'últim àpat del dia.`,
      });
    } else if (calorieDelta < -600 && currentTotalCalories > 0) {
      list.push({
        type: 'warning',
        title: `⚠️ DÈFICIT EXCESSIVAMENT AGRESSIU (${currentTotalCalories} kcal)`,
        text: `Estàs menjant molt per sota del teu metabolisme basal (-${Math.abs(calorieDelta)} kcal). Un dèficit tan gran destruirà massa muscular i frenarà la recuperació esportiva. Afegeix carbohidrats nets i proteïna.`,
      });
    } else if (currentTotalCalories > 0) {
      list.push({
        type: 'success',
        title: `🎯 BALANÇ CALÒRIC CORRECTE`,
        text: `Portes ${currentTotalCalories} / ${calorieTarget} kcal (${calPercent}% de l'objectiu). El teu marge restant és de ${Math.abs(calorieDelta)} kcal.`,
      });
    }

    return list;
  };

  const criticalAdvice = getCriticalDietAdvice();

  const mealSections: {
    id: MealType;
    label: string;
    sublabel: string;
    icon: React.ElementType;
    placeholder: string;
    presets: { label: string; text: string; kcal: number }[];
  }[] = [
    {
      id: 'esmorzar',
      label: '1. Esmorzar',
      sublabel: 'Arrencada d’energia neta (7:00 - 8:30)',
      icon: Coffee,
      placeholder: 'Ex: Tortilla de 3 clares i 1 rovell amb tonyina, cafè sol...',
      presets: [
        { label: 'Tortilla tonyina', text: 'Tortilla (3 clares i 1 rovell) amb tonyina', kcal: 230 },
        { label: 'Pa gall d’indi alvocat', text: 'Pa torrat amb gall d’indi i alvocat', kcal: 310 },
        { label: 'Sandwich mixt', text: 'Sandwich mixt de pernil dolç i formatge', kcal: 290 },
        { label: 'Tortitas avena mel', text: 'Tortitas d’avena amb nous, plàtan i mel', kcal: 390 },
      ],
    },
    {
      id: 'berenar-mati',
      label: '2. Berenar del matí (Snack Escola)',
      sublabel: 'Per mantenir focus i evitar pics de gana (10:30 - 11:30)',
      icon: Sun,
      placeholder: 'Ex: 2 plàtans amb nous o iogurt proteic...',
      presets: [
        { label: '2 Plàtans + nous', text: 'Dos plàtans amb una grapada de nous', kcal: 310 },
        { label: 'Iogurt proteic', text: 'Iogurt proteic (Mercadona)', kcal: 85 },
        { label: 'Poma + fruits secs', text: 'Poma amb combinació de fruits secs', kcal: 210 },
        { label: 'Mig sandwich vegetal', text: 'Mig sandwich vegetal i tonyina', kcal: 230 },
      ],
    },
    {
      id: 'dinar',
      label: '3. Dinar',
      sublabel: 'Àpat central: proteïna + carbohidrats complexos (13:30 - 15:00)',
      icon: Salad,
      placeholder: 'Ex: Espaguetis amb tomàtiga i carn de ternera picada...',
      presets: [
        { label: 'Pollastre forn patata', text: 'Crema de verdures i pollastre al forn amb patata', kcal: 560 },
        { label: 'Espaguetis carn', text: 'Espaguetis amb salsa de tomàtiga i carn de ternera picada', kcal: 590 },
        { label: 'Arròs tonyina', text: 'Arròs amb verdures saltejades i tonyina natural', kcal: 510 },
        { label: 'Salmó forn', text: 'Salmó al forn amb patata i verdures al gust', kcal: 580 },
      ],
    },
    {
      id: 'berenar-horabaixa',
      label: '4. Berenar de l’horabaixa',
      sublabel: 'Pre-entrenament o estudi (17:30 - 18:30)',
      icon: Apple,
      placeholder: 'Ex: Iogurt grec natural amb civada i nabius...',
      presets: [
        { label: 'Iogurt + civada', text: 'Iogurt natural amb 30g de civada i fruita', kcal: 180 },
        { label: 'Plàtan + ametlles', text: 'Plàtan i 20g d’ametlles crues', kcal: 220 },
        { label: 'Gelatina protein', text: 'Gelatina protein Mercadona i fruita', kcal: 110 },
      ],
    },
    {
      id: 'sopar',
      label: '5. Sopar',
      sublabel: 'Proteïna lleugera i verdura, baix en carbohidrats (20:30 - 22:00)',
      icon: Moon,
      placeholder: 'Ex: Ensalada amb tonyina i ou bullit...',
      presets: [
        { label: 'Ensalada tonyina ou', text: 'Ensalada amb tonyina i ou bullit', kcal: 360 },
        { label: 'Pizza tonyina/pernil', text: 'Pizza (de tonyina amb ceba o pernil dolç) 0 salses', kcal: 680 },
        { label: 'Peix al forn patata', text: 'Peix al forn amb patata i verdures', kcal: 440 },
        { label: 'Tacos carn picada', text: 'Tacos carn picada amb verdures', kcal: 530 },
      ],
    },
  ];

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Top Toggle Switch: El meu registre VS Segons Objectiu VS Pauta CEA */}
      {/* Top Toggle Switch: 4 Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] grid grid-cols-4 gap-1">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveSubView('registre');
          }}
          className={`py-2 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-center ${
            activeSubView === 'registre'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Registre
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveSubView('resum');
          }}
          className={`py-2 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeSubView === 'resum'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>Resum</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveSubView('objectiu');
          }}
          className={`py-2 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeSubView === 'objectiu'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-3 h-3" />
          <span>Objectiu</span>
        </button>
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setActiveSubView('guia');
          }}
          className={`py-2 px-1 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeSubView === 'guia'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3 h-3" />
          <span>Pauta</span>
        </button>
      </div>

      {/* Subviews routing */}
      {activeSubView === 'objectiu' ? (
        <GoalFocusView
          userProfile={profile}
          onUpdateProfile={handleUpdateProfile}
          onApplySampleMenu={handleApplySampleMenu}
          onGoBackToTracker={() => setActiveSubView('registre')}
        />
      ) : activeSubView === 'guia' ? (
        <DietGuideView onApplyPlanToToday={handleApplyPlanToToday} />
      ) : activeSubView === 'resum' ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Daily Nutritional Totals Card */}
          {(() => {
            const dayNutrients = calculateTotalDayNutrients({ ...nutritionDay, meals });
            const proteinTarget = Math.round(profile.weightKg * (profile.primaryGoal === 'massa-muscular' ? 2.0 : 1.6));
            const fiberTarget = 30; // 30g daily fiber recommendation
            const satFatMax = 22; // WHO maximum saturated fat limit

            return (
              <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Resum Nutricional Diari
                      </h3>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Suma automàtica de tots els àpats confirmats
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                    {currentTotalCalories} / {calorieTarget} kcal
                  </span>
                </div>

                {/* Macronutrient Dashboard */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Protein */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600 uppercase">Proteïnes Totals</span>
                      <strong className="text-emerald-700 font-black">{dayNutrients.proteinG}g / {proteinTarget}g</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((dayNutrients.proteinG / (proteinTarget || 1)) * 100))}%` }}
                        className="bg-emerald-600 h-full rounded-full transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      Target: {proteinTarget}g ({profile.primaryGoal === 'massa-muscular' ? '2.0g/kg' : '1.6g/kg'})
                    </span>
                  </div>

                  {/* Carbohydrates */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600 uppercase">Carbohidrats</span>
                      <strong className="text-sky-700 font-black">{dayNutrients.carbsG}g</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((dayNutrients.carbsG / 250) * 100))}%` }}
                        className="bg-sky-600 h-full rounded-full transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      Combustible per a glucogen muscular
                    </span>
                  </div>

                  {/* Total Fats & Saturated Fats */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600 uppercase">Greix / Saturats</span>
                      <strong className="text-amber-700 font-black">{dayNutrients.fatG}g ({dayNutrients.saturatedFatG}g sat)</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((dayNutrients.saturatedFatG / satFatMax) * 100))}%` }}
                        className={`h-full rounded-full transition-all ${dayNutrients.saturatedFatG > satFatMax ? 'bg-rose-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      Límit de saturats: max {satFatMax}g/dia
                    </span>
                  </div>

                  {/* Fiber */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-600 uppercase">Fibra Vegetal</span>
                      <strong className="text-teal-700 font-black">{dayNutrients.fiberG}g / {fiberTarget}g</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.round((dayNutrients.fiberG / fiberTarget) * 100))}%` }}
                        className="bg-teal-600 h-full rounded-full transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-slate-500 block">
                      Sacietat i microbioma saludable
                    </span>
                  </div>
                </div>

                {/* Micronutrients: Sugars and Salt */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-2xl border ${thisDayHasSugar ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
                    <span className="text-[9px] uppercase font-bold block">Sucres</span>
                    <strong className="text-sm font-black">{dayNutrients.sugarsG}g</strong>
                    <span className="text-[9px] block font-semibold mt-0.5">
                      {thisDayHasSugar ? '⚠️ Sucre afegit detectat' : '✓ 0 sucres refinats afegits'}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-2xl border ${dayNutrients.saltG > 5 ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                    <span className="text-[9px] uppercase font-bold block">Sal / Sodi</span>
                    <strong className="text-sm font-black">{dayNutrients.saltG}g</strong>
                    <span className="text-[9px] block font-semibold mt-0.5">
                      {dayNutrients.saltG > 5 ? 'Alerta: >5g recomanat OMS' : 'Controlat (<5g/dia OMS)'}
                    </span>
                  </div>
                </div>

                {/* Per-Meal Breakdown Table with Edit Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">
                    Distribució per àpats (fes clic per corregir):
                  </span>
                  <div className="space-y-1.5">
                    {(
                      [
                        { id: 'esmorzar', label: 'Esmorzar' },
                        { id: 'berenar-mati', label: 'Berenar matí' },
                        { id: 'dinar', label: 'Dinar' },
                        { id: 'berenar-horabaixa', label: 'Berenar horabaixa' },
                        { id: 'sopar', label: 'Sopar' },
                      ] as const
                    ).map((slot) => {
                      const meal = meals[slot.id];
                      return (
                        <div
                          key={slot.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 font-black">{slot.label}</strong>
                              <span className="text-[10px] text-emerald-800 font-bold">
                                {meal?.calories || 0} kcal
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {meal?.items || 'Sense registrar'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditorForMeal(slot.id)}
                              className="px-2 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-emerald-600" />
                              <span>Corregir</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ECOSYSTEM INTEGRATION: SLEEP & SPORT */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>Sinergia amb Son i Activitat Física</span>
            </h4>

            {/* Sleep Correlation */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-950 font-black">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Impacte del Sopar en el Descans:</span>
              </div>
              <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                {meals.sopar?.calories && meals.sopar.calories > 600
                  ? `El teu sopar d'avui és de ${meals.sopar.calories} kcal. Els àpats copiosos allarguen la digestió gàstrica i eleven la temperatura interna, podent fragmentar el son profund. Espera un mínim de 2.5 - 3 hores abans d'anar a dormir.`
                  : meals.sopar?.calories
                  ? `Sopar equilibrat de ${meals.sopar.calories} kcal. Afavoreix un trànsit digestiu plàcid i una síntesi correcta de melatonina durant la fase REM.`
                  : "Encara no has registrat el sopar. Recomanem proteïna magra (salmó, tortilla de clares o pollastre) amb verdures per afavorir el descans."}
              </p>
            </div>

            {/* Sport Correlation */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-950 font-black">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Síntesi Proteica i Recuperació Esportiva:</span>
              </div>
              <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                Has aportat nutrients nets al llarg del dia. Per a una regeneració muscular òptima, distribueix la proteïna en racions d'almenys 25-35g cada 3-4 hores, combinada amb hidratació suficient (2-3L d'aigua).
              </p>
            </div>
          </div>

          {/* Weekly 7-Day History Table */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-2.5">
            <span className="text-xs font-black uppercase text-slate-900 tracking-wider block">
              Historial Setmanal (7 dies)
            </span>
            <div className="space-y-1">
              {weekDays.map((d) => {
                const nut = allNutritionDays.find((n) => n.date === d.date);
                const isSelected = d.date === selectedDate;
                const kcal = isSelected ? currentTotalCalories : nut?.totalCalories || 0;
                const sugarFlag = isSelected ? thisDayHasSugar : nut?.consumedSugarToday || false;

                return (
                  <div
                    key={d.date}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-400 font-bold'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-black text-slate-900 block">{d.dayName}</span>
                      <span className="text-[10px] text-slate-500">{d.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-800 tabular-nums">
                        {kcal} kcal
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          sugarFlag ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sugarFlag ? 'Sucre afegit' : 'Net (0 sucre)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Goal Quick Summary Banner & Photo Scan CTA */}
          <div className="bg-white p-3.5 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider">
                    Enfocament:
                  </span>
                  <span className="text-xs font-black text-slate-900 truncate">
                    {GOAL_NUTRITION_PROFILES[profile.primaryGoal]?.title || 'Guanyar Massa Muscular'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                  Pauta adaptada · Què menjar i evitar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setActiveSubView('objectiu');
                }}
                className="text-[10px] text-emerald-800 font-bold px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Canviar
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.tap();
                  setScannerMealType('dinar');
                  setIsPhotoScannerOpen(true);
                }}
                className="text-[10px] text-white font-black px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Foto Kcal</span>
              </button>
            </div>
          </div>

          {/* 1. Header Card: Blanc i Verd Calorie Counter & Balance */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.06)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold uppercase tracking-wider">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Recompte Calòric Automàtic</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-black tabular-nums tracking-tight ${
                      calorieDelta > 200
                        ? 'text-rose-600'
                        : calorieDelta < -500 && currentTotalCalories > 0
                        ? 'text-amber-600'
                        : 'text-emerald-950'
                    }`}
                  >
                    {currentTotalCalories}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/ {calorieTarget} kcal</span>
                </div>
              </div>

              {/* Quick Target modifier button */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full border shadow-sm ${
                    calorieDelta > 200
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : calorieDelta < -400 && currentTotalCalories > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {calorieDelta > 0
                    ? `+${calorieDelta} kcal excés`
                    : `${Math.abs(calorieDelta)} kcal restants`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalorieConfig(!showCalorieConfig)}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                >
                  {showCalorieConfig ? 'Amaga ajust' : 'Ajustar objectiu'}
                </button>
              </div>
            </div>

            {/* Optional Calorie Target Editor */}
            {showCalorieConfig && (
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <label className="text-xs font-bold text-emerald-950">
                  Objectiu diari (kcal):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="50"
                    min="1200"
                    max="4500"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-20 bg-white border border-emerald-300 rounded-xl px-2 py-1 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700"
                  >
                    Fixar
                  </button>
                </div>
              </div>
            )}

            {/* Calorie Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  style={{ width: `${Math.min(100, calPercent)}%` }}
                  className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                    calorieDelta > 200
                      ? 'bg-rose-500'
                      : calorieDelta > 0
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>0 kcal</span>
                <span className="text-emerald-700 font-bold">{calPercent}% consumit</span>
                <span>{calorieTarget} kcal</span>
              </div>
            </div>
          </div>

          {/* 2. REGLA ESTRICTA DEL SUCRE (MÀXIM 1 PIC A LA SETMANA) */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              currentWeeklySugarCount > 1
                ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-sm'
                : currentWeeklySugarCount === 1
                ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-sm ${
                    currentWeeklySugarCount > 1
                      ? 'bg-rose-600 text-white border-rose-700'
                      : currentWeeklySugarCount === 1
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-emerald-600 text-white border-emerald-700'
                  }`}
                >
                  <Candy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Regla Estricta del Sucre
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    Límit innegociable: màxim 1 pic per setmana
                  </p>
                </div>
              </div>

              {/* Badge */}
              <span
                className={`text-xs font-black px-3 py-1 rounded-full tabular-nums border shadow-sm ${
                  currentWeeklySugarCount > 1
                    ? 'bg-rose-600 text-white border-rose-700'
                    : currentWeeklySugarCount === 1
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-emerald-600 text-white border-emerald-700'
                }`}
              >
                {currentWeeklySugarCount} / 1 pic màx
              </span>
            </div>

            {/* 7-Day Sugar Compliance Strip */}
            <div className="mt-3.5 pt-3 border-t border-black/10">
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block mb-2">
                Seguiment setmanal dels 7 dies:
              </span>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((d) => {
                  const nutDay = allNutritionDays.find((n) => n.date === d.date);
                  const dayHasSugar =
                    d.date === selectedDate
                      ? thisDayHasSugar
                      : nutDay?.consumedSugarToday || false;

                  return (
                    <div
                      key={d.date}
                      className={`py-1.5 px-0.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        dayHasSugar
                          ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                          : 'bg-white border-emerald-200/80 text-emerald-800 font-semibold'
                      } ${d.date === selectedDate ? 'ring-2 ring-emerald-600 ring-offset-1' : ''}`}
                    >
                      <span className="text-[9px] uppercase font-bold">{d.dayName}</span>
                      <span className="text-[11px] tabular-nums font-black mt-0.5">
                        {dayHasSugar ? '⚠️' : '✓'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status text */}
            <div className="mt-3 text-xs leading-relaxed font-semibold">
              {currentWeeklySugarCount > 1 ? (
                <p className="text-rose-900 bg-rose-100/80 p-2.5 rounded-2xl border border-rose-300 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>CRÍTICA ESTRICTA:</strong> Has violat la norma setmanal amb{' '}
                    {currentWeeklySugarCount} pics de sucre. Bloqueja completament qualsevol dolç,
                    sucre afegit, cereals industrials o refrescos fins la setmana vinent.
                  </span>
                </p>
              ) : currentWeeklySugarCount === 1 ? (
                <p className="text-amber-950 bg-amber-100/80 p-2.5 rounded-2xl border border-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>COMODÍ ESGOTAT:</strong> Ja has consumit el teu únic pic permès aquesta
                    setmana. Zero sucre permès durant la resta de dies.
                  </span>
                </p>
              ) : (
                <p className="text-emerald-950 bg-emerald-100/80 p-2.5 rounded-2xl border border-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>DISCIPLINA NETA:</strong> 0 pics de sucre aquesta setmana. La teva energia
                    es manté sense caigudes i el metabolisme actiu.
                  </span>
                </p>
              )}
            </div>

            {/* Toggle if sugar was taken today */}
            <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Has consumit sucre o dolços avui?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setConsumedSugarToday(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !thisDayHasSugar
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  No, net (0)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.tap();
                    setConsumedSugarToday(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    thisDayHasSugar
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  Sí, he pres sucre
                </button>
              </div>
            </div>

            {thisDayHasSugar && (
              <div className="mt-2.5 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={sugarNotes}
                  onChange={(e) => setSugarNotes(e.target.value)}
                  placeholder="Quin aliment o beguda amb sucre has pres? Ex: Croissant, cola, pastís..."
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* 3. Water Widget */}
          <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Hidratació</span>
                <span className="text-[11px] text-slate-500 font-medium">Mínim 2.0L d'aigua recomanat</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleWaterAdjust(-0.25)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold active:scale-95 transition-all"
                aria-label="Restar aigua"
              >
                -
              </button>
              <span className="text-xs font-black text-emerald-700 tabular-nums px-1">
                {waterLiters} L
              </span>
              <button
                type="button"
                onClick={() => handleWaterAdjust(0.25)}
                className="w-8 h-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold active:scale-95 shadow-sm transition-all"
                aria-label="Sumar aigua"
              >
                +
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Registre nutricional i recompte calòric desats correctament!</span>
            </div>
          )}

          {/* 4. Form for the 5 Meals with Automatic "a ull" Kcal calculation & Sugar alerts */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Els 5 àpats del dia
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Càlcul a ull automàtic
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">
                Total: {currentTotalCalories} kcal
              </span>
            </div>

            {mealSections.map((m) => {
              const Icon = m.icon;
              const currentMeal = meals[m.id] || { items: '', calories: 0, hasSugar: false };
              const currentEstimate = estimateCaloriesAndSugar(currentMeal.items || '');

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    currentMeal.items?.trim()
                      ? 'bg-white border-emerald-300 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{m.label}</h3>
                        <span className="text-[10px] text-slate-500 font-medium block">{m.sublabel}</span>
                      </div>
                    </div>

                    {/* Meal calories input + Auto-estimate trigger + Photo trigger */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openPhotoScannerForMeal(m.id)}
                        title="Fes una foto o puja una imatge del plat per calcular kcal"
                        className="p-1 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => autoEstimateMealKcal(m.id)}
                        title="Calcular calories a ull automàticament"
                        className="p-1 px-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-0.5 transition-colors"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>A ull</span>
                      </button>

                      <span className="text-[10px] text-slate-500 font-bold ml-0.5">kcal:</span>
                      <input
                        type="number"
                        min="0"
                        max="3500"
                        step="10"
                        value={currentMeal.calories || ''}
                        onChange={(e) => updateMealCalories(m.id, Number(e.target.value))}
                        placeholder="0"
                        className="w-14 bg-slate-50 border border-emerald-200 rounded-lg px-1.5 py-1 text-xs font-black text-slate-900 text-center focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Textarea for foods */}
                  <textarea
                    rows={2}
                    value={currentMeal.items || ''}
                    onChange={(e) => updateMealText(m.id, e.target.value)}
                    placeholder={m.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors resize-none font-medium"
                  />

                  {/* Confirmed Nutrient Breakdown Card if analyzed */}
                  {currentMeal.nutrients && (
                    <div className="mt-2 p-2.5 bg-slate-900 text-white rounded-xl space-y-2 shadow-2xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Desglossament nutricional confirmat</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditorForMeal(m.id)}
                          className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                        >
                          <Edit className="w-2.5 h-2.5" />
                          <span>Modificar</span>
                        </button>
                      </div>

                      {currentMeal.calorieInterval && (
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Interval calòric aproximat:</span>
                          <strong className="text-amber-400">
                            {currentMeal.calorieInterval.minKcal} – {currentMeal.calorieInterval.maxKcal} kcal
                          </strong>
                        </div>
                      )}

                      {/* Nutrient Pills */}
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center text-[9px]">
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Prot.</span>
                          <span className="font-black text-emerald-400">{currentMeal.nutrients.proteinG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Hidrats</span>
                          <span className="font-black text-sky-400">{currentMeal.nutrients.carbsG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Greix</span>
                          <span className="font-black text-amber-400">{currentMeal.nutrients.fatG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Saturats</span>
                          <span className="font-black text-rose-400">{currentMeal.nutrients.saturatedFatG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Fibra</span>
                          <span className="font-black text-teal-400">{currentMeal.nutrients.fiberG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Sucres</span>
                          <span className="font-black text-purple-400">{currentMeal.nutrients.sugarsG}g</span>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg">
                          <span className="text-slate-400 block font-semibold">Sal</span>
                          <span className="font-black text-slate-300">{currentMeal.nutrients.saltG}g</span>
                        </div>
                      </div>

                      {/* Individual ingredients list if present */}
                      {currentMeal.ingredients && currentMeal.ingredients.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] space-y-1">
                          <span className="text-slate-400 font-semibold block text-[9px]">
                            Ingredients individuals ({currentMeal.ingredients.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {currentMeal.ingredients.map((ing) => (
                              <span
                                key={ing.id}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/70 text-[9px]"
                              >
                                {ing.name} ({ing.grams}g · {ing.kcal}k)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sleep advice or sport recovery note */}
                      {currentMeal.sleepImpactNote && (
                        <div className="text-[10px] text-indigo-300 pt-1 flex items-start gap-1">
                          <Moon className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{currentMeal.sleepImpactNote}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complements Identified Badge (e.g. Pepito de pollo amb formatge) */}
                  {currentEstimate.detectedComplements && currentEstimate.detectedComplements.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 items-center animate-in fade-in duration-150">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Complements:</span>
                      {currentEstimate.detectedComplements.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Instant Sugar or Processed Warning if detected */}
                  {currentEstimate.detectedSugar && (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Candy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{currentEstimate.sugarWarning || 'Alerta: Aliments amb sucre afegit detectats!'}</span>
                    </div>
                  )}

                  {/* Quick Preset Dishes from CEA plan */}
                  <div className="mt-2 flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Idees:</span>
                    {m.presets.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.tap();
                          setMeals((prev) => ({
                            ...prev,
                            [m.id]: {
                              items: p.text,
                              calories: p.kcal,
                              hasSugar: p.text.toLowerCase().includes('mel') || p.text.toLowerCase().includes('confitura'),
                            },
                          }));
                          if (p.text.toLowerCase().includes('mel') || p.text.toLowerCase().includes('confitura')) {
                            setConsumedSugarToday(true);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[10px] font-semibold border border-slate-200 shrink-0 transition-colors"
                      >
                        {p.label} (~{p.kcal}k)
                      </button>
                    ))}
                  </div>

                  {/* Sugar toggle button */}
                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100">
                    <span className="text-[10px] text-slate-600 font-semibold">Porta sucre afegit aquest àpat?</span>
                    <button
                      type="button"
                      onClick={() => updateMealSugar(m.id, !currentMeal.hasSugar)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                        currentMeal.hasSugar
                          ? 'bg-rose-600 text-white border border-rose-700'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {currentMeal.hasSugar ? '⚠️ Sucre afegit' : 'Sense sucre'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Submit */}
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Desar registre i auditoria de dieta</span>
            </button>
          </form>

          {/* 5. Critical Dietary Audit Section */}
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-slate-900 font-black text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>Auditoria Nutricional i Crítica Estricta</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Exigent
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalAdvice.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs font-medium leading-relaxed space-y-1 ${
                    item.type === 'danger'
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                      : item.type === 'warning'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-[11px]">
                    {item.type === 'danger' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : item.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{item.title}</span>
                  </div>
                  <p className="pl-6 text-[11px] leading-snug opacity-90">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Multimodal Camera / Image Calorie & Ingredient Scanner Modal */}
      <MealPhotoScannerModal
        isOpen={isPhotoScannerOpen}
        onClose={() => {
          setIsPhotoScannerOpen(false);
          setEditingMealData(null);
        }}
        targetMealType={scannerMealType}
        userGoal={profile.primaryGoal}
        onApplyAnalysis={handleApplyPhotoAnalysis}
        initialMealToEdit={editingMealData}
      />
    </div>
  );
};
