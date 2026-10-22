/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadReviews,
  saveReviews,
  loadSleepRecords,
  saveSleepRecord,
  getSleepForDate,
  loadNutritionDays,
  saveNutritionDay,
  getNutritionForDate,
  loadSportSessions,
  saveSportSession,
  getSportForDate,
  loadDailySurveys,
  saveDailySurvey,
  getSurveyForDate,
  loadGoals,
  saveGoals,
  loadUserProfile,
  saveUserProfile,
  getCurrentUser,
} from './utils/storage';
import {
  Habit,
  HabitLog,
  DailyReview,
  SleepRecord,
  NutritionDay,
  SportSession,
  DailySurvey,
  PersonalGoal,
  UserProfile,
  UserAccount,
} from './types';
import { getTodayIso, formatDateIso } from './utils/date';
import { PhoneSimulatorWrapper } from './components/PhoneSimulatorWrapper';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HabitsView } from './components/HabitsView';
import { SleepView } from './components/SleepView';
import { NutritionView } from './components/NutritionView';
import { SportView } from './components/SportView';
import { AIAssistantView } from './components/AIAssistantView';
import { DailyReviewView } from './components/DailyReviewView';
import { WeeklyPerformanceView } from './components/WeeklyPerformanceView';
import { GoalsAndStatsView } from './components/GoalsAndStatsView';
import { SettingsModal } from './components/SettingsModal';
import { NewHabitModal } from './components/NewHabitModal';
import { AuthModal } from './components/AuthModal';
import { sound } from './utils/audio';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [logs, setLogs] = useState<HabitLog[]>(() => loadLogs());
  const [reviews, setReviews] = useState<DailyReview[]>(() => loadReviews());
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>(() => loadSleepRecords());
  const [nutritionDays, setNutritionDays] = useState<NutritionDay[]>(() => loadNutritionDays());
  const [sportSessions, setSportSessions] = useState<SportSession[]>(() => loadSportSessions());
  const [surveys, setSurveys] = useState<DailySurvey[]>(() => loadDailySurveys());
  const [goals, setGoals] = useState<PersonalGoal[]>(() => loadGoals());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [currentTab, setCurrentTab] = useState<TabType>('habits');
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPhoneFrameActive, setIsPhoneFrameActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('habitpulse_frame');
      return stored !== null ? stored === 'true' : false;
    }
    return false;
  });

  const handleUserChanged = (newUser: UserAccount) => {
    setCurrentUser(newUser);
    setHabits(loadHabits());
    setLogs(loadLogs());
    setReviews(loadReviews());
    setSleepRecords(loadSleepRecords());
    setNutritionDays(loadNutritionDays());
    setSportSessions(loadSportSessions());
    setSurveys(loadDailySurveys());
    setGoals(loadGoals());
    setUserProfile(loadUserProfile());
  };

  const todayIso = getTodayIso();
  const isToday = selectedDate === todayIso;

  // Streak calculation
  const maxStreak = Math.max(
    1,
    ...habits.map((h) => {
      const habitLogs = logs.filter((l) => l.habitId === h.id && l.completed);
      return habitLogs.length > 0 ? Math.min(14, habitLogs.length) : 0;
    })
  );

  // Today progress
  const activeHabits = habits.filter((h) => !h.archived);
  const totalToday = activeHabits.length || 1;
  const completedToday = activeHabits.filter((h) => {
    const l = logs.find((log) => log.habitId === h.id && log.date === todayIso);
    return l?.completed;
  }).length;
  const todayProgressPercent = Math.round((completedToday / totalToday) * 100);

  const todayReviewDone = reviews.some((r) => r.date === todayIso && r.completed);

  // Active records for selected date
  const currentSleep = getSleepForDate(selectedDate);
  const currentNutrition = getNutritionForDate(selectedDate);
  const currentSport = getSportForDate(selectedDate);
  const currentSurvey = getSurveyForDate(selectedDate);

  // 1. Habit Handlers
  const handleToggleHabit = (habitId: string) => {
    sound.tap();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setLogs((prevLogs) => {
      const existing = prevLogs.find((l) => l.habitId === habitId && l.date === selectedDate);
      let updated: HabitLog[];

      if (existing) {
        const nextState = !existing.completed;
        if (nextState) sound.completeHabit();
        updated = prevLogs.map((l) =>
          l.habitId === habitId && l.date === selectedDate
            ? {
                ...l,
                completed: nextState,
                currentValue: nextState ? habit.targetValue : 0,
                completedAt: nextState ? new Date().toISOString() : undefined,
              }
            : l
        );
      } else {
        sound.completeHabit();
        updated = [
          ...prevLogs,
          {
            date: selectedDate,
            habitId,
            completed: true,
            currentValue: habit.targetValue,
            completedAt: new Date().toISOString(),
          },
        ];
      }

      saveLogs(updated);
      return updated;
    });
  };

  const handleUpdateHabitValue = (habitId: string, delta: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    setLogs((prevLogs) => {
      const existing = prevLogs.find((l) => l.habitId === habitId && l.date === selectedDate);
      const current = existing ? existing.currentValue : 0;
      const nextVal = Math.max(0, current + delta);
      const isCompleted = nextVal >= habit.targetValue;

      if (isCompleted && (!existing || !existing.completed)) {
        sound.completeHabit();
      }

      let updated: HabitLog[];
      if (existing) {
        updated = prevLogs.map((l) =>
          l.habitId === habitId && l.date === selectedDate
            ? {
                ...l,
                currentValue: nextVal,
                completed: isCompleted,
                completedAt: isCompleted ? new Date().toISOString() : undefined,
              }
            : l
        );
      } else {
        updated = [
          ...prevLogs,
          {
            date: selectedDate,
            habitId,
            currentValue: nextVal,
            completed: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : undefined,
          },
        ];
      }

      saveLogs(updated);
      return updated;
    });
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveHabits(updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter((h) => h.id !== habitId);
    setHabits(updated);
    saveHabits(updated);
  };

  // 2. Sleep Handlers
  const handleSaveSleep = (record: SleepRecord) => {
    saveSleepRecord(record);
    setSleepRecords((prev) => {
      const filtered = prev.filter((s) => s.date !== record.date);
      return [record, ...filtered];
    });
  };

  // 3. Nutrition Handlers
  const handleSaveNutrition = (nut: NutritionDay) => {
    saveNutritionDay(nut);
    setNutritionDays((prev) => {
      const filtered = prev.filter((n) => n.date !== nut.date);
      return [nut, ...filtered];
    });
  };

  // 4. Sport Handlers
  const handleSaveSport = (session: SportSession) => {
    saveSportSession(session);
    setSportSessions((prev) => {
      const filtered = prev.filter((s) => s.date !== session.date || s.id !== session.id);
      return [session, ...filtered];
    });
  };

  // 5. Survey Handlers
  const handleSaveSurvey = (survey: DailySurvey) => {
    saveDailySurvey(survey);
    setSurveys((prev) => {
      const filtered = prev.filter((s) => s.date !== survey.date);
      return [survey, ...filtered];
    });
  };

  // 6. Review Handlers
  const handleSaveReview = (review: DailyReview) => {
    setReviews((prev) => {
      const filtered = prev.filter((r) => r.date !== review.date);
      const updated = [review, ...filtered];
      saveReviews(updated);
      return updated;
    });
  };

  // 7. Goals Handlers
  const handleSaveGoals = (updatedGoals: PersonalGoal[]) => {
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  // 8. Settings & Backup Handlers
  const handleTogglePhoneFrame = () => {
    const next = !isPhoneFrameActive;
    setIsPhoneFrameActive(next);
    localStorage.setItem('habitpulse_frame', String(next));
  };

  const handleResetData = () => {
    localStorage.clear();
    setHabits(loadHabits());
    setLogs(loadLogs());
    setReviews(loadReviews());
    setSleepRecords(loadSleepRecords());
    setNutritionDays(loadNutritionDays());
    setSportSessions(loadSportSessions());
    setSurveys(loadDailySurveys());
    setGoals(loadGoals());
    setSelectedDate(getTodayIso());
    setCurrentTab('habits');
  };

  const handleExportData = () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      habits,
      logs,
      reviews,
      sleepRecords,
      nutritionDays,
      sportSessions,
      surveys,
      goals,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitpulse_full_backup_${formatDateIso(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.habits)) {
        setHabits(parsed.habits);
        saveHabits(parsed.habits);
        if (Array.isArray(parsed.logs)) {
          setLogs(parsed.logs);
          saveLogs(parsed.logs);
        }
        if (Array.isArray(parsed.reviews)) {
          setReviews(parsed.reviews);
          saveReviews(parsed.reviews);
        }
        if (Array.isArray(parsed.sleepRecords)) {
          setSleepRecords(parsed.sleepRecords);
          localStorage.setItem('habitpulse_sleep_v2', JSON.stringify(parsed.sleepRecords));
        }
        if (Array.isArray(parsed.nutritionDays)) {
          setNutritionDays(parsed.nutritionDays);
          localStorage.setItem('habitpulse_nutrition_v2', JSON.stringify(parsed.nutritionDays));
        }
        if (Array.isArray(parsed.sportSessions)) {
          setSportSessions(parsed.sportSessions);
          localStorage.setItem('habitpulse_sport_v2', JSON.stringify(parsed.sportSessions));
        }
        if (Array.isArray(parsed.surveys)) {
          setSurveys(parsed.surveys);
          localStorage.setItem('habitpulse_surveys_v2', JSON.stringify(parsed.surveys));
        }
        if (Array.isArray(parsed.goals)) {
          setGoals(parsed.goals);
          saveGoals(parsed.goals);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <PhoneSimulatorWrapper isPhoneFrameActive={isPhoneFrameActive}>
      {/* Top Header */}
      <Header
        selectedDate={selectedDate}
        isToday={isToday}
        streakDays={maxStreak}
        currentTab={currentTab}
        currentUser={currentUser}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenNewHabit={() => setIsNewHabitModalOpen(true)}
        onResetToToday={() => setSelectedDate(getTodayIso())}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Tab Screen */}
      <main className="flex-1">
        {currentTab === 'habits' && (
          <HabitsView
            selectedDate={selectedDate}
            onSelectDate={(d) => setSelectedDate(d)}
            habits={habits}
            logs={logs}
            sleepRecord={currentSleep}
            nutritionDay={currentNutrition}
            sportSession={currentSport}
            survey={currentSurvey}
            onToggleHabit={handleToggleHabit}
            onUpdateHabitValue={handleUpdateHabitValue}
            onDeleteHabit={handleDeleteHabit}
            onOpenNewHabit={() => setIsNewHabitModalOpen(true)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSaveSurvey={handleSaveSurvey}
            isToday={isToday}
          />
        )}

        {currentTab === 'sleep' && (
          <SleepView
            selectedDate={selectedDate}
            sleepRecord={currentSleep}
            recentSport={currentSport}
            onSaveSleep={handleSaveSleep}
          />
        )}

        {currentTab === 'nutrition' && (
          <NutritionView
            selectedDate={selectedDate}
            nutritionDay={currentNutrition}
            onSaveNutrition={handleSaveNutrition}
            userProfile={userProfile}
            onUpdateProfile={(p) => {
              setUserProfile(p);
              saveUserProfile(p);
            }}
          />
        )}

        {currentTab === 'sport' && (
          <SportView
            selectedDate={selectedDate}
            sportSession={currentSport}
            sleepRecord={currentSleep}
            onSaveSport={handleSaveSport}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'assistant' && (
          <AIAssistantView
            selectedDate={selectedDate}
            sleepRecords={sleepRecords}
            nutritionDays={nutritionDays}
            sportSessions={sportSessions}
            surveys={surveys}
            habits={habits}
            logs={logs}
          />
        )}

        {currentTab === 'review' && (
          <DailyReviewView
            selectedDate={selectedDate}
            habits={habits}
            logs={logs}
            reviews={reviews}
            onSaveReview={handleSaveReview}
            onGoToHabits={() => setCurrentTab('habits')}
          />
        )}

        {currentTab === 'performance' && (
          <WeeklyPerformanceView
            habits={habits}
            logs={logs}
            reviews={reviews}
            onSelectDay={(d) => {
              setSelectedDate(d);
            }}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsAndStatsView
            goals={goals}
            sleepRecords={sleepRecords}
            sportSessions={sportSessions}
            nutritionDays={nutritionDays}
            habits={habits}
            logs={logs}
            onSaveGoals={handleSaveGoals}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            isPhoneFrameActive={isPhoneFrameActive}
            onTogglePhoneFrame={handleTogglePhoneFrame}
            onResetData={handleResetData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* User Accounts & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChanged={handleUserChanged}
      />

      {/* New Habit Creation Modal */}
      <NewHabitModal
        isOpen={isNewHabitModalOpen}
        onClose={() => setIsNewHabitModalOpen(false)}
        onAddHabit={handleAddHabit}
      />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        hasPendingReview={!todayReviewDone}
        todayProgress={todayProgressPercent}
      />
    </PhoneSimulatorWrapper>
  );
}
