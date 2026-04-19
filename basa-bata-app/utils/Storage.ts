import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔑 Storage keys
const KEYS = {
  PROGRESS: '@basabata/progress',
  STREAK: '@basabata/streak',
  STREAK_DATE: '@basabata/streak_date',
  ACHIEVEMENTS: '@basabata/achievements',
  SOUND_ENABLED: '@basabata/sound_enabled',
  TOTAL_STARS: '@basabata/total_stars',
};

// 📊 Progress type: per-category, per-word completion
export interface WordProgress {
  completed: boolean;
  attempts: number;
  correctOnFirstTry: boolean;
  lastPlayed: string;
}

export interface CategoryProgress {
  [wordId: string]: WordProgress;
}

export interface AllProgress {
  [categoryId: string]: CategoryProgress;
}

// 🏆 Achievements
export const ACHIEVEMENTS = {
  FIRST_WORD: { id: 'first_word', title: 'Unang Hakbang!', subtitle: 'First word completed', icon: '🌱' },
  FIVE_STARS: { id: 'five_stars', title: '5 Bituin!', subtitle: 'Earned 5 stars', icon: '⭐' },
  TEN_STARS: { id: 'ten_stars', title: '10 Bituin!', subtitle: 'Earned 10 stars', icon: '🌟' },
  FIFTY_STARS: { id: 'fifty_stars', title: 'Bituin Master!', subtitle: '50 stars total', icon: '🏆' },
  FINISH_HAYOP: { id: 'finish_hayop', title: 'Hayop Expert!', subtitle: 'Finished Mga Hayop', icon: '🦁' },
  FINISH_KULAY: { id: 'finish_kulay', title: 'Kulay Expert!', subtitle: 'Finished Mga Kulay', icon: '🎨' },
  FINISH_BILANG: { id: 'finish_bilang', title: 'Bilang Expert!', subtitle: 'Finished Mga Bilang', icon: '🔢' },
  FINISH_KATAWAN: { id: 'finish_katawan', title: 'Katawan Expert!', subtitle: 'Finished Ang Katawan', icon: '👋' },
  PERFECT_LESSON: { id: 'perfect_lesson', title: 'Perpekto!', subtitle: 'Perfect lesson score', icon: '💯' },
  STREAK_3: { id: 'streak_3', title: '3-Day Streak!', subtitle: 'Played 3 days in a row', icon: '🔥' },
  STREAK_7: { id: 'streak_7', title: '7-Day Streak!', subtitle: 'One full week!', icon: '🔥🔥' },
};

// ─── PROGRESS ──────────────────────────────────────────────
export async function getProgress(): Promise<AllProgress> {
  try {
    const json = await AsyncStorage.getItem(KEYS.PROGRESS);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function saveWordProgress(
  categoryId: string,
  wordId: number,
  correctOnFirstTry: boolean
): Promise<void> {
  try {
    const progress = await getProgress();
    if (!progress[categoryId]) progress[categoryId] = {};
    const key = String(wordId);
    const existing = progress[categoryId][key];
    progress[categoryId][key] = {
      completed: true,
      attempts: (existing?.attempts || 0) + 1,
      correctOnFirstTry: existing?.correctOnFirstTry || correctOnFirstTry,
      lastPlayed: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.log('Save progress failed:', e);
  }
}

// ─── TOTAL STARS ───────────────────────────────────────────
export async function getTotalStars(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(KEYS.TOTAL_STARS);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function addStars(amount: number): Promise<number> {
  try {
    const current = await getTotalStars();
    const next = current + amount;
    await AsyncStorage.setItem(KEYS.TOTAL_STARS, String(next));
    return next;
  } catch {
    return 0;
  }
}

// ─── STREAK ────────────────────────────────────────────────
export async function updateDailyStreak(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = await AsyncStorage.getItem(KEYS.STREAK_DATE);
    const currentStreak = parseInt((await AsyncStorage.getItem(KEYS.STREAK)) || '0', 10);

    if (lastDate === today) return currentStreak; // Already counted today

    let newStreak = 1;
    if (lastDate) {
      const diff = (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000;
      if (diff === 1) newStreak = currentStreak + 1;
      else if (diff === 0) return currentStreak;
    }

    await AsyncStorage.setItem(KEYS.STREAK, String(newStreak));
    await AsyncStorage.setItem(KEYS.STREAK_DATE, today);
    return newStreak;
  } catch {
    return 0;
  }
}

export async function getStreak(): Promise<number> {
  try {
    return parseInt((await AsyncStorage.getItem(KEYS.STREAK)) || '0', 10);
  } catch {
    return 0;
  }
}

// ─── ACHIEVEMENTS ──────────────────────────────────────────
export async function getUnlockedAchievements(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function unlockAchievement(id: string): Promise<boolean> {
  try {
    const unlocked = await getUnlockedAchievements();
    if (unlocked.includes(id)) return false;
    unlocked.push(id);
    await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
    return true; // Newly unlocked!
  } catch {
    return false;
  }
}

// ─── SOUND TOGGLE ──────────────────────────────────────────
export async function getSoundEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.SOUND_ENABLED);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
  } catch {}
}

// ─── RESET (for dev/testing) ───────────────────────────────
export async function resetAllProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch {}
}