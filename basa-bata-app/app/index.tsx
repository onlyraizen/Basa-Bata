import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Animated } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system'; 

// --- IMPORTS ---
import { CATEGORIES } from '../constants/Categories';
import { TRANSLATIONS } from '../constants/Translations';
import ScrapbookCard from '../components/ScrapbookCard';  
import CategoryButton from '../components/CategoryButton';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import TutorialScreen from '../screens/TutorialScreen';
import ResultsScreen from '../screens/ResultsScreen';

// 🛑 IMPORTANT: PASTE YOUR NEW TERMINAL 2 CLOUDFLARE LINK BELOW! 🛑
const BACKEND_URL = 'https://joseph-boxes-arrangements-disco.trycloudflare.com/api/recognize';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function App() {
  const [uiLanguage, setUiLanguage] = useState<'tl' | 'en'>('tl');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'home' | 'categories' | 'lesson' | 'results' | 'tutorial'>('welcome');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; heard: string } | null>(null);

  const cardScale = useRef(new Animated.Value(0.5)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current; 
  const progressAnim = useRef(new Animated.Value(0)).current;
  const mascotBounce = useRef(new Animated.Value(0)).current;

  const activeLessonWords = activeCategory ? CATEGORIES[activeCategory as keyof typeof CATEGORIES].words : [];
  const currentWord = activeLessonWords[currentWordIndex];
  const langDict = TRANSLATIONS[uiLanguage];

  const progressPercent = activeLessonWords.length > 0 ? (currentWordIndex / activeLessonWords.length) * 100 : 0;

  // ─────────────────────────────────────────────
  // FIX 1 + 2: Replace speakTagalogWord entirely
  // Uses your backend Google TTS instead of expo-speech
  // ─────────────────────────────────────────────
  const speakTagalogWord = async (word: string) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      });

      const speakUrl = BACKEND_URL.replace('/api/recognize', '/api/speak');
      
      const response = await fetch(speakUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word }),
      });

      const data = await response.json();

      if (data.success && data.audioContent) {
        // @ts-ignore - Bypassing VS Code's stubborn type checker
        const fileUri = FileSystem.documentDirectory + 'tts_word.mp3';
        
        // @ts-ignore
        await FileSystem.writeAsStringAsync(fileUri, data.audioContent, {
          // @ts-ignore
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.log("Google TTS failed, falling back:", error);
      Speech.speak(word, { language: 'tl-PH', rate: 0.65 });
    }
  };

  const playSFX = async (isCorrect: boolean) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      const soundFile = isCorrect ? require('../assets/images/correct.mp3') : require('../assets/images/wrong.mp3');
      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
      });
    } catch (error) {
      console.log("SFX not found or failed to play.");
    }
  };

  // ─────────────────────────────────────────────
  // FIX 2: speakFeedback keeps using expo-speech
  // ─────────────────────────────────────────────
  const speakFeedback = async (message: string) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
      await new Promise(resolve => setTimeout(resolve, 300));
      Speech.speak(message, {
        language: uiLanguage === 'en' ? 'en-US' : 'tl-PH',
        rate: 0.85,
      });
    } catch (e) {
      console.log("speakFeedback error:", e);
    }
  };

  useEffect(() => {
    if (currentScreen === 'home') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotBounce, { toValue: -15, duration: 1000, useNativeDriver: true }),
          Animated.timing(mascotBounce, { toValue: 0, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    }

    if (currentScreen === 'lesson' && currentWord) {
      cardScale.setValue(0.5);
      cardOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(progressAnim, { toValue: progressPercent, useNativeDriver: false })
      ]).start();
      
      speakTagalogWord(currentWord.word);
    }
  }, [currentWordIndex, currentScreen]);

  useEffect(() => {
    if (!permissionResponse?.granted) requestPermission();
  }, []);

  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0); 
    setFeedback(null);
    progressAnim.setValue(0); 
    setCurrentScreen('lesson');
  };

  const toggleLanguage = () => {
    Haptics.selectionAsync(); 
    setUiLanguage(prev => prev === 'en' ? 'tl' : 'en');
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') return Alert.alert('Error', 'Microphone permission needed.');
      setFeedback(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playThroughEarpieceAndroid: false 
      });
      
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true })
        ])
      ).start();
    } catch (err) { console.error(err); }
  }

  // ─────────────────────────────────────────────
  // FIX 3: stopRecording safely resets spinner
  // ─────────────────────────────────────────────
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

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playThroughEarpieceAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
      });

      if (uri) {
        await sendAudioToBackend(uri);
      } else {
        console.log("Recording URI was null.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("stopRecording error:", error);
      setIsProcessing(false);
    }
  }

  // ─────────────────────────────────────────────
  // FIX 3: sendAudioToBackend formatting fix
  // ─────────────────────────────────────────────
  async function sendAudioToBackend(uri: string) {
    const formData = new FormData();
    formData.append('audio', {
      uri: uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('expectedWord', currentWord.word);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const fbMessage = data.isCorrect ? langDict.feedbackGood : langDict.feedbackTry;
        setFeedback({ isCorrect: data.isCorrect, message: fbMessage, heard: data.heard });
        
        await playSFX(data.isCorrect);
        
        if (data.isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setStreak(prev => prev + 1);
          if (!isPracticeMode) setScore(score + 10);
          setTimeout(() => speakFeedback(fbMessage), 800); 
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setStreak(0);
          setTimeout(() => speakFeedback(fbMessage), 800);
        }
      } else {
        Alert.alert('Hindi narinig', data.error || 'Subukan muli.');
      }
    } catch (error) {
      console.error("Network/parse error:", error);
      Alert.alert('Koneksyon Error', 'Walang koneksyon sa server. Subukan muli.');
    } finally {
      setIsProcessing(false);
    }
  }

  function nextWord() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeedback(null);
    if (currentWordIndex < activeLessonWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentScreen('results');
      speakFeedback(langDict.finish);
    }
  }

  if (currentScreen === 'welcome') return <WelcomeScreen langDict={langDict} onEnter={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('home'); }} />;
  if (currentScreen === 'tutorial') return <TutorialScreen langDict={langDict} onBack={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('home'); }} />;

  if (currentScreen === 'home') {
    return (
      <View style={styles.container}>
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

        <TouchableOpacity style={styles.secondaryButton} onPress={() => { Haptics.selectionAsync(); setCurrentScreen('tutorial'); }}>
          <Text style={styles.secondaryButtonText}>{langDict.tutorial}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={toggleLanguage}>
          <Text style={styles.secondaryButtonText}>{langDict.switchLang}</Text>
        </TouchableOpacity>
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
              key={cat.id} title={cat.title} subtitle={cat.subtitle} icon={cat.icon}
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
        onContinue={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCurrentScreen('categories'); }} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setCurrentScreen('categories'); }}>
          <Text style={styles.backButton}>✖</Text>
        </TouchableOpacity>
        
        <View style={styles.progressBarContainer}>
          <Animated.View style={[
            styles.progressBarFill, 
            { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }
          ]} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {streak > 1 && <Text style={styles.streakText}>🔥 {streak}</Text>}
          {!isPracticeMode && <Text style={styles.scoreText}>⭐ {score}</Text>}
        </View>
      </View>

      <View style={styles.stageContainer}>
        <ScrapbookCard 
          word={currentWord.word} 
          icon={currentWord.icon} 
          onReplay={() => { Haptics.selectionAsync(); speakTagalogWord(currentWord.word); }} 
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
            { transform: [{ scale: pulseAnim }] }
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing || (feedback?.isCorrect === true)}
        >
          <Text style={styles.recordButtonText}>
            {recording ? langDict.micListen : langDict.micPress}
          </Text>
        </AnimatedTouchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F0FF', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, justifyContent: 'space-between' },
  homeCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCard: { backgroundColor: '#FFFFFF', width: '100%', paddingVertical: 50, borderRadius: 40, alignItems: 'center', borderWidth: 5, borderColor: '#B3D4FF', transform: [{ rotate: '2deg' }], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  logoTitle: { fontSize: 60, fontWeight: '900', color: '#3B82F6', letterSpacing: 2, textAlign: 'center' },
  logoSubtitle: { fontSize: 24, fontWeight: 'bold', color: '#64748B', marginTop: 5 },
  primaryButton: { backgroundColor: '#22C55E', width: '100%', paddingVertical: 20, borderRadius: 100, borderBottomWidth: 8, borderBottomColor: '#16A34A', alignItems: 'center', marginBottom: 15 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  secondaryButton: { backgroundColor: '#94A3B8', width: '100%', paddingVertical: 18, borderRadius: 100, borderBottomWidth: 6, borderBottomColor: '#64748B', alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  header: { marginBottom: 30, alignItems: 'center' },
  headerTitle: { fontSize: 40, fontWeight: '900', color: '#1E293B' },
  headerSubtitle: { fontSize: 18, color: '#64748B', fontWeight: 'bold' },
  categoryList: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 20, borderBottomWidth: 4, borderBottomColor: '#B3D4FF' },
  backButton: { fontSize: 20, color: '#94A3B8', fontWeight: '900', paddingHorizontal: 5 },
  progressBarContainer: { flex: 1, height: 16, backgroundColor: '#E2E8F0', borderRadius: 10, marginHorizontal: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 10 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#F59E0B' },
  streakText: { fontSize: 18, fontWeight: 'bold', color: '#EF4444' },
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
});