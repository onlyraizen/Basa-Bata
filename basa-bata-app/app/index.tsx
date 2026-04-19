import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Animated } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

// --- EXISTING IMPORTS ---
import { CATEGORIES, TOTAL_WORDS } from '../constants/Categories';
import { TRANSLATIONS } from '../constants/Translations';
import ScrapbookCard from '../components/ScrapbookCard';
import CategoryButton from '../components/CategoryButton';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import TutorialScreen from '../screens/TutorialScreen';
import ResultsScreen from '../screens/ResultsScreen';

// 🔥 NEW IMPORTS
import ParentDashboard from '../screens/ParentDashboard';
import AchievementsScreen from '../screens/AchievementsScreen';
import ReactiveMascot from '../components/ReactiveMascot';
import FlyingStar from '../components/FlyingStar';
import {
  getProgress,
  saveWordProgress,
  getTotalStars,
  addStars,
  updateDailyStreak,
  getUnlockedAchievements,
  unlockAchievement,
  getSoundEnabled,
  setSoundEnabled,
  ACHIEVEMENTS,
  AllProgress,
} from '../utils/Storage';

// 🛑 UPDATE THIS EVERY TIME YOU RESTART CLOUDFLARE TUNNEL
const BACKEND_BASE = 'https://progress-junior-portsmouth-perceived.trycloudflare.com';
const RECOGNIZE_URL = `${BACKEND_BASE}/api/recognize`;
const SPEAK_URL = `${BACKEND_BASE}/api/speak`;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// In-memory cache: once we fetch "aso" TTS, we never fetch it again
const ttsCache = new Map<string, string>();

type Screen = 'welcome' | 'home' | 'categories' | 'lesson' | 'results' | 'tutorial' | 'parent' | 'achievements';

export default function App() {
  const [uiLanguage, setUiLanguage] = useState<'tl' | 'en'>('tl');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; heard: string } | null>(null);

  // 🔥 NEW STATE
  const [progress, setProgress] = useState<AllProgress>({});
  const [totalStars, setTotalStars] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'excited'>('idle');
  const [showFlyingStar, setShowFlyingStar] = useState(false);
  const [firstAttemptForWord, setFirstAttemptForWord] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<{ word: string; correct: boolean }[]>([]);

  const cardScale = useRef(new Animated.Value(0.5)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSoundRef = useRef<Audio.Sound | null>(null);

  const activeLessonWords = activeCategory ? CATEGORIES[activeCategory].words : [];
  const currentWord = activeLessonWords[currentWordIndex];
  const activeCategoryData = activeCategory ? CATEGORIES[activeCategory] : null;
  const langDict = TRANSLATIONS[uiLanguage];
  const progressPercent = activeLessonWords.length > 0 ? (currentWordIndex / activeLessonWords.length) * 100 : 0;

  // ─── HYDRATION ON MOUNT ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [p, ts, ds, ua, se] = await Promise.all([
        getProgress(),
        getTotalStars(),
        updateDailyStreak(),
        getUnlockedAchievements(),
        getSoundEnabled(),
      ]);
      setProgress(p);
      setTotalStars(ts);
      setDailyStreak(ds);
      setUnlockedAchievements(ua);
      setSoundEnabledState(se);
    })();
  }, []);

  // ─── AUDIO MODE HELPERS ────────────────────────────────────
  const setPlaybackMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });
  };

  const setRecordingMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playThroughEarpieceAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
  };

  const unloadCurrentSound = async () => {
    if (currentSoundRef.current) {
      try {
        await currentSoundRef.current.unloadAsync();
      } catch {}
      currentSoundRef.current = null;
    }
  };

  // ─── TTS ────────────────────────────────────────────────────
  const speakTagalogWord = async (word: string, slow: boolean = false) => {
    if (!soundEnabled) return;
    try {
      await unloadCurrentSound();
      await setPlaybackMode();

      const cacheKey = slow ? `${word}_slow` : word;
      let audioBase64: string | undefined = ttsCache.get(cacheKey);

      if (!audioBase64) {
        const response = await fetch(SPEAK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, slow }),
        });
        if (!response.ok) throw new Error(`TTS server ${response.status}`);
        const data = await response.json();
        if (!data.success || !data.audioContent) throw new Error('No audio from server');
        audioBase64 = data.audioContent;
        ttsCache.set(cacheKey, audioBase64!);
      }

      const dataUri = `data:audio/mp3;base64,${audioBase64}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: dataUri },
        { shouldPlay: true, volume: 1.0 }
      );
      currentSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          if (currentSoundRef.current === sound) currentSoundRef.current = null;
        }
      });
    } catch (error) {
      console.log('Google TTS failed:', error);
      Speech.speak(word, { language: 'fil-PH', rate: slow ? 0.4 : 0.7 });
    }
  };

  const playSFX = async (isCorrect: boolean) => {
    if (!soundEnabled) return;
    try {
      await setPlaybackMode();
      const soundFile = isCorrect
        ? require('../assets/images/correct.mp3')
        : require('../assets/images/wrong.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch {
      console.log('SFX failed');
    }
  };

  const speakFeedback = async (message: string) => {
    if (!soundEnabled) return;
    try {
      await setPlaybackMode();
      if (uiLanguage === 'tl') {
        await speakTagalogWord(message);
      } else {
        Speech.speak(message, { language: 'en-US', rate: 0.85 });
      }
    } catch {}
  };

  // ─── ACHIEVEMENT CHECK ──────────────────────────────────────
  const checkAchievements = async (newTotalStars: number, categoryCompleted: string | null, wasPerfect: boolean) => {
    const toCheck: string[] = [];
    if (newTotalStars >= 1) toCheck.push('first_word');
    if (newTotalStars >= 5) toCheck.push('five_stars');
    if (newTotalStars >= 10) toCheck.push('ten_stars');
    if (newTotalStars >= 50) toCheck.push('fifty_stars');
    if (categoryCompleted === 'hayop') toCheck.push('finish_hayop');
    if (categoryCompleted === 'kulay') toCheck.push('finish_kulay');
    if (categoryCompleted === 'bilang') toCheck.push('finish_bilang');
    if (categoryCompleted === 'katawan') toCheck.push('finish_katawan');
    if (wasPerfect) toCheck.push('perfect_lesson');
    if (dailyStreak >= 3) toCheck.push('streak_3');
    if (dailyStreak >= 7) toCheck.push('streak_7');

    for (const id of toCheck) {
      const wasNew = await unlockAchievement(id);
      if (wasNew) {
        const ach = Object.values(ACHIEVEMENTS).find((a) => a.id === id);
        if (ach) {
          setNewAchievement(`${ach.icon} ${ach.title}`);
          setTimeout(() => setNewAchievement(null), 3500);
          setUnlockedAchievements((prev) => [...prev, id]);
        }
      }
    }
  };

  // ─── EFFECTS ────────────────────────────────────────────────
  useEffect(() => {
    if (currentScreen === 'home') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotBounce, { toValue: -15, duration: 1000, useNativeDriver: true }),
          Animated.timing(mascotBounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }

    if (currentScreen === 'lesson' && currentWord) {
      cardScale.setValue(0.5);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(progressAnim, { toValue: progressPercent, useNativeDriver: false }),
      ]).start();

      setFirstAttemptForWord(true);
      setShowHint(false);
      setWrongAttempts(0);
      setMascotMood('idle');

      speakTagalogWord(currentWord.word);
    }
  }, [currentWordIndex, currentScreen]);

  useEffect(() => {
    if (!permissionResponse?.granted) requestPermission();
    return () => {
      unloadCurrentSound();
    };
  }, []);

  // Pre-fetch upcoming words
  useEffect(() => {
    if (currentScreen === 'lesson' && activeLessonWords.length > 0) {
      const nextWords = activeLessonWords.slice(currentWordIndex + 1, currentWordIndex + 3);
      nextWords.forEach(async (w) => {
        if (!ttsCache.has(w.word)) {
          try {
            const res = await fetch(SPEAK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: w.word }),
            });
            const data = await res.json();
            if (data.success) ttsCache.set(w.word, data.audioContent);
          } catch {}
        }
      });
    }
  }, [currentWordIndex, currentScreen, activeCategory]);

  // ─── HANDLERS ───────────────────────────────────────────────
  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    progressAnim.setValue(0);
    setSessionResults([]);
    setCurrentScreen('lesson');
  };

  const toggleLanguage = () => {
    Haptics.selectionAsync();
    setUiLanguage((prev) => (prev === 'en' ? 'tl' : 'en'));
  };

  const toggleSound = async () => {
    Haptics.selectionAsync();
    const next = !soundEnabled;
    setSoundEnabledState(next);
    await setSoundEnabled(next);
  };

  // ─── RECORDING ──────────────────────────────────────────────
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        return Alert.alert('Error', 'Microphone permission needed.');
      }
      setFeedback(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await unloadCurrentSound();
      await setRecordingMode();
      await new Promise((resolve) => setTimeout(resolve, 150));

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } catch (err) {
      console.error(err);
    }
  }

  async function stopRecording() {
    if (!recording) {
      setIsProcessing(false);
      return;
    }
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    const recordingRef = recording;
    setRecording(null);
    setIsProcessing(true);

    try {
      await recordingRef.stopAndUnloadAsync();
      const uri = recordingRef.getURI();
      await setPlaybackMode();

      if (uri) {
        await sendAudioToBackend(uri);
      } else {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('stopRecording error:', error);
      setIsProcessing(false);
    }
  }

  async function sendAudioToBackend(uri: string) {
    const formData = new FormData();
    formData.append('audio', {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('expectedWord', currentWord.word);

    try {
      const response = await fetch(RECOGNIZE_URL, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();

      if (data.success) {
        // Silent recording handling
        if (!data.heard || data.heard === '(walang narinig)') {
          setFeedback({
            isCorrect: false,
            message: langDict.silentError,
            heard: '...',
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setMascotMood('sad');
          return;
        }

        const fbMessage = data.isCorrect ? langDict.feedbackGood : langDict.feedbackTry;
        setFeedback({ isCorrect: data.isCorrect, message: fbMessage, heard: data.heard });
        await playSFX(data.isCorrect);

        if (data.isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setMascotMood('happy');
          setStreak((prev) => prev + 1);
          if (!isPracticeMode) setScore((prev) => prev + 10);

          setShowFlyingStar(true);

          if (!isPracticeMode && activeCategory) {
            await saveWordProgress(activeCategory, currentWord.id, firstAttemptForWord);
            const newTotal = await addStars(firstAttemptForWord ? 3 : 1);
            setTotalStars(newTotal);
            const updated = await getProgress();
            setProgress(updated);
          }

          setSessionResults((prev) => [...prev, { word: currentWord.word, correct: true }]);

          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => speakFeedback(fbMessage), 800);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setMascotMood('sad');
          setStreak(0);
          setFirstAttemptForWord(false);
          const newWrongCount = wrongAttempts + 1;
          setWrongAttempts(newWrongCount);

          if (newWrongCount >= 2) setShowHint(true);

          if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
          feedbackTimerRef.current = setTimeout(() => speakFeedback(fbMessage), 800);
        }
      } else {
        Alert.alert('Hindi narinig', data.error || 'Subukan muli.');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Koneksyon Error', 'Walang koneksyon sa server. Subukan muli.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function nextWord() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedback(null);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    await unloadCurrentSound();

    if (currentWordIndex < activeLessonWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setMascotMood('excited');
      const wasPerfect = sessionResults.every((r) => r.correct) && sessionResults.length === activeLessonWords.length;
      const catProgress = progress[activeCategory!] || {};
      const allWordsComplete = activeLessonWords.every((w) => catProgress[String(w.id)]?.completed);

      await checkAchievements(totalStars, allWordsComplete ? activeCategory : null, wasPerfect);
      setCurrentScreen('results');
      speakFeedback(langDict.finish);
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────
  const getCategoryCompletedCount = (categoryId: string): number => {
    const catProgress = progress[categoryId] || {};
    return Object.values(catProgress).filter((w) => w.completed).length;
  };

  // ─── RENDER ────────────────────────────────────────────────
  if (currentScreen === 'welcome') {
    return <WelcomeScreen langDict={langDict} onEnter={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('home'); }} />;
  }

  if (currentScreen === 'tutorial') {
    return <TutorialScreen langDict={langDict} onBack={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('home'); }} />;
  }

  if (currentScreen === 'parent') {
    return (
      <ParentDashboard
        langDict={langDict}
        progress={progress}
        totalStars={totalStars}
        dailyStreak={dailyStreak}
        unlockedAchievements={unlockedAchievements}
        onBack={() => { Haptics.selectionAsync(); setCurrentScreen('home'); }}
        onViewAchievements={() => { Haptics.selectionAsync(); setCurrentScreen('achievements'); }}
      />
    );
  }

  if (currentScreen === 'achievements') {
    return (
      <AchievementsScreen
        langDict={langDict}
        unlockedAchievements={unlockedAchievements}
        onBack={() => { Haptics.selectionAsync(); setCurrentScreen('parent'); }}
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <View style={styles.container}>
        {/* Top stats bar */}
        <View style={styles.homeTopBar}>
          <View style={styles.statsPill}>
            <Text style={styles.statsText}>⭐ {totalStars}</Text>
          </View>
          {dailyStreak > 0 && (
            <View style={styles.statsPill}>
              <Text style={styles.statsText}>🔥 {dailyStreak}</Text>
            </View>
          )}
          <TouchableOpacity onPress={toggleSound} style={styles.soundToggle}>
            <Text style={styles.soundToggleText}>{soundEnabled ? '🔊' : '🔇'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeCenter}>
          <Animated.View style={{ transform: [{ translateY: mascotBounce }] }}>
            <Text style={{ fontSize: 90, marginBottom: -20, zIndex: 10, textAlign: 'center' }}>🦉</Text>
          </Animated.View>
          <View style={styles.logoCard}>
            <Text style={styles.logoTitle}>{langDict.title}</Text>
            <Text style={styles.logoSubtitle}>{langDict.subtitle}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPracticeMode(false); setCurrentScreen('categories'); }}>
          <Text style={styles.primaryButtonText}>{langDict.start}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F59E0B', borderBottomColor: '#D97706' }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setIsPracticeMode(true); setCurrentScreen('categories'); }}>
          <Text style={styles.primaryButtonText}>{langDict.practice}</Text>
        </TouchableOpacity>

        <View style={styles.bottomButtonRow}>
          <TouchableOpacity style={styles.iconButton} onPress={() => { Haptics.selectionAsync(); setCurrentScreen('tutorial'); }}>
            <Text style={styles.iconButtonEmoji}>❓</Text>
            <Text style={styles.iconButtonLabel}>{langDict.tutorial}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => { Haptics.selectionAsync(); setCurrentScreen('parent'); }}>
            <Text style={styles.iconButtonEmoji}>👨‍👩‍👧</Text>
            <Text style={styles.iconButtonLabel}>{langDict.parentDashboard}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
            <Text style={styles.iconButtonEmoji}>🌐</Text>
            <Text style={styles.iconButtonLabel}>{uiLanguage === 'tl' ? 'EN' : 'TL'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentScreen === 'categories') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{langDict.lessons}</Text>
          <Text style={styles.headerSubtitle}>{langDict.selectCat}</Text>
        </View>
        <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
          {Object.values(CATEGORIES).map((cat) => (
            <CategoryButton
              key={cat.id}
              title={cat.title}
              subtitle={cat.subtitle}
              icon={cat.icon}
              color={cat.color}
              completedCount={getCategoryCompletedCount(cat.id)}
              totalCount={cat.words.length}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); selectCategory(cat.id); }}
            />
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => { Haptics.selectionAsync(); setCurrentScreen('home'); }}>
          <Text style={styles.secondaryButtonText}>{langDict.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentScreen === 'results') {
    const maxScore = activeLessonWords.length * 10;
    return (
      <ResultsScreen
        score={score}
        maxScore={maxScore}
        isPracticeMode={isPracticeMode}
        langDict={langDict}
        sessionResults={sessionResults}
        onContinue={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('categories'); }}
      />
    );
  }

  // LESSON SCREEN
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setCurrentScreen('categories'); }}>
          <Text style={styles.backButton}>✖</Text>
        </TouchableOpacity>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[
            styles.progressBarFill,
            { backgroundColor: activeCategoryData?.color || '#22C55E' },
            { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
          ]} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {streak > 1 && <Text style={styles.streakText}>🔥 {streak}</Text>}
          {!isPracticeMode && <Text style={styles.scoreText}>⭐ {score}</Text>}
        </View>
      </View>

      {/* 🦉 Reactive Mascot */}
      <View style={styles.mascotContainer}>
        <ReactiveMascot mood={mascotMood} size={60} />
      </View>

      <View style={styles.stageContainer}>
        <ScrapbookCard
          word={currentWord.word}
          icon={currentWord.icon}
          syllables={showHint ? currentWord.syllables : undefined}
          onReplay={() => { Haptics.selectionAsync(); speakTagalogWord(currentWord.word); }}
          onSlowReplay={() => { Haptics.selectionAsync(); speakTagalogWord(currentWord.word, true); }}
          cardOpacity={cardOpacity}
          cardScale={cardScale}
        />

        <View style={styles.feedbackContainer}>
          {isProcessing && <ActivityIndicator size="large" color="#4ade80" />}
          {feedback && (
            <View style={[styles.feedbackBox, feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
              <Text style={styles.feedbackTitle}>{feedback.message}</Text>
              <Text style={styles.feedbackSubtitle}>{langDict.heard} "{feedback.heard}"</Text>
              {feedback.isCorrect && (
                <TouchableOpacity style={styles.nextButton} onPress={nextWord}>
                  <Text style={styles.nextButtonText}>{langDict.next}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionZone}>
        <AnimatedTouchable
          style={[
            styles.recordButton,
            recording ? styles.recordingActive : null,
            isProcessing ? styles.recordingDisabled : null,
            { transform: [{ scale: pulseAnim }] },
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing || feedback?.isCorrect === true}
        >
          <Text style={styles.recordButtonText}>
            {recording ? langDict.micListen : langDict.micPress}
          </Text>
        </AnimatedTouchable>
      </View>

      {/* Flying star animation */}
      {showFlyingStar && <FlyingStar onComplete={() => setShowFlyingStar(false)} />}

      {/* New achievement notification */}
      {newAchievement && (
        <View style={styles.achievementToast}>
          <Text style={styles.achievementToastLabel}>{langDict.newAchievement}</Text>
          <Text style={styles.achievementToastText}>{newAchievement}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F0FF', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, justifyContent: 'space-between' },
  homeTopBar: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 10 },
  statsPill: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#B3D4FF' },
  statsText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  soundToggle: { backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#B3D4FF' },
  soundToggleText: { fontSize: 18 },
  homeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCard: { backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 50, borderRadius: 40, alignItems: 'center', borderWidth: 5, borderColor: '#B3D4FF', transform: [{ rotate: '2deg' }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  logoTitle: { fontSize: 60, fontWeight: '900', color: '#3B82F6', letterSpacing: 2, textAlign: 'center' },
  logoSubtitle: { fontSize: 24, fontWeight: 'bold', color: '#64748B', marginTop: 5 },
  primaryButton: { backgroundColor: '#22C55E', width: '100%', paddingVertical: 20, borderRadius: 100, borderBottomWidth: 8, borderBottomColor: '#16A34A', alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  secondaryButton: { backgroundColor: '#94A3B8', width: '100%', paddingVertical: 18, borderRadius: 100, borderBottomWidth: 6, borderBottomColor: '#64748B', alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  bottomButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  iconButton: { flex: 1, backgroundColor: '#FFFFFF', marginHorizontal: 5, paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#B3D4FF' },
  iconButtonEmoji: { fontSize: 28, marginBottom: 4 },
  iconButtonLabel: { fontSize: 11, fontWeight: 'bold', color: '#475569', textAlign: 'center' },
  header: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 40, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 18, color: '#64748B', fontWeight: 'bold' },
  categoryList: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, borderBottomWidth: 4, borderBottomColor: '#B3D4FF' },
  backButton: { fontSize: 20, color: '#94A3B8', fontWeight: '900', paddingHorizontal: 5 },
  progressBarContainer: { flex: 1, height: 16, backgroundColor: '#E2E8F0', borderRadius: 10, marginHorizontal: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 10 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B' },
  streakText: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
  mascotContainer: { alignItems: 'center', marginTop: 10 },
  stageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  feedbackContainer: { minHeight: 100, width: '100%', justifyContent: 'center', alignItems: 'center' },
  feedbackBox: { width: '90%', padding: 15, borderRadius: 20, alignItems: 'center', borderBottomWidth: 4 },
  feedbackCorrect: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  feedbackIncorrect: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  feedbackTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  feedbackSubtitle: { fontSize: 14, color: '#475569', fontStyle: 'italic', marginBottom: 10 },
  nextButton: { backgroundColor: '#22C55E', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, marginTop: 5 },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  actionZone: { alignItems: 'center', paddingBottom: 10 },
  recordButton: { backgroundColor: '#3B82F6', width: '100%', paddingVertical: 18, borderRadius: 100, borderBottomWidth: 8, borderBottomColor: '#1D4ED8', alignItems: 'center', marginBottom: 5 },
  recordingActive: { backgroundColor: '#EF4444', borderBottomColor: '#B91C1C', borderBottomWidth: 4 },
  recordingDisabled: { backgroundColor: '#94A3B8', borderBottomColor: '#64748B' },
  recordButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  achievementToast: { position: 'absolute', top: 80, left: 20, right: 20, backgroundColor: '#FDE047', padding: 16, borderRadius: 20, alignItems: 'center', borderBottomWidth: 6, borderBottomColor: '#EAB308', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10, zIndex: 999 },
  achievementToastLabel: { fontSize: 12, fontWeight: 'bold', color: '#78350F', letterSpacing: 1 },
  achievementToastText: { fontSize: 20, fontWeight: '900', color: '#78350F', marginTop: 2 },
});