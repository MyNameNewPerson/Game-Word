import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { MysticBackground } from '../components/Background/MysticBackground';
import { CrosswordGrid } from '../components/CrosswordGrid/CrosswordGrid';
import { LetterCircle, type LetterCircleHandle } from '../components/LetterCircle/LetterCircle';
import { WordDisplay } from '../components/UI/WordDisplay';
import { Toast, type ToastHandle } from '../components/UI/Toast';
import { HintsBar } from '../components/GameScreen/HintsBar';
import { LevelCompleteModal, calculateStars } from '../components/Modals/LevelCompleteModal';
import { PiggyBankModal } from '../components/Modals/PiggyBankModal';
import { SwipeLine, type SwipeLineHandle } from '../components/LetterCircle/SwipeLine';
import { checkWord } from '../services/WordChecker';
import { AudioManager } from '../services/AudioManager';
import { AdManager } from '../services/AdManager';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { SaveManager } from '../services/SaveManager';
import { LevelManager } from '../services/LevelManager';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ navigation }) => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const session = useGameStore(s => s.session);
  const { addFoundWord, addFoundBonusWord, addRevealedCell, incrementHints, resetSession } = useGameStore();
  const { coins, spendCoins, addCoins, incrementPiggyBank, addXP, updateStreak } = usePlayerStore();
  const hasNoAds = usePlayerStore(s => s.hasNoAds);

  const [currentWord, setCurrentWord] = useState('');
  const [wordDisplayState, setWordDisplayState] = useState<'typing' | 'correct' | 'error' | 'idle'>('idle');
  const [hammerMode, setHammerMode] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [showPiggy, setShowPiggy] = useState(false);

  // Refs для анимаций (не вызывают ре-рендер)
  const letterCircleRef = useRef<LetterCircleHandle>(null);
  const swipeLineRef = useRef<SwipeLineHandle>(null);
  const toastRef = useRef<ToastHandle>(null);

  if (!currentLevel) {
    return (
      <View style={styles.noLevel}>
        <Text style={{ color: COLORS.TEXT_PRIMARY }}>Уровень не выбран</Text>
      </View>
    );
  }

  const foundWords = session.foundWords;
  const foundBonusWords = session.foundBonusWords;

  // ─── ПОДСКАЗКА: ЛАМПОЧКА ──────────────────────────────────────────────────
  const handleLightbulb = useCallback(() => {
    if (coins < 100) {
      toastRef.current?.show('Недостаточно монет', 'error');
      return;
    }

    // Найти первую нераскрытую ячейку первого неугаданного слова
    const unsolvedWord = currentLevel.words.find(w => !foundWords.includes(w));
    if (!unsolvedWord) return;

    const pos = currentLevel.wordPositions[unsolvedWord];
    if (!pos) return;

    // Найти первую нераскрытую ячейку этого слова
    for (let i = 0; i < unsolvedWord.length; i++) {
      const r = pos.row + (pos.direction === 'vertical' ? i : 0);
      const c = pos.col + (pos.direction === 'horizontal' ? i : 0);
      const cellKey = `${r},${c}`;
      if (!session.revealedCells.includes(cellKey)) {
        addRevealedCell(cellKey);
        incrementHints();
        spendCoins(100);
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
        AudioManager.play('hint_use');
        toastRef.current?.show('Подсказка использована', 'info');
        return;
      }
    }
  }, [coins, currentLevel, foundWords, session.revealedCells]);

  // ─── ПОДСКАЗКА: МОЛОТОК ───────────────────────────────────────────────────
  const handleHammer = useCallback(() => {
    if (coins < 200) {
      toastRef.current?.show('Недостаточно монет', 'error');
      return;
    }
    setHammerMode(true);
    toastRef.current?.show('Нажми на клетку чтобы открыть слово', 'info');
  }, [coins]);

  const handleCellPress = useCallback((row: number, col: number) => {
    if (!hammerMode) return;

    // Найти слово которому принадлежит клетка
    const wordAtCell = Object.entries(currentLevel.wordPositions).find(([word, pos]) => {
      if (foundWords.includes(word)) return false;
      for (let i = 0; i < word.length; i++) {
        const r = pos.row + (pos.direction === 'vertical' ? i : 0);
        const c = pos.col + (pos.direction === 'horizontal' ? i : 0);
        if (r === row && c === col) return true;
      }
      return false;
    });

    if (!wordAtCell) {
      setHammerMode(false);
      return;
    }

    const [word, pos] = wordAtCell;
    // Открыть все ячейки этого слова
    for (let i = 0; i < word.length; i++) {
      const r = pos.row + (pos.direction === 'vertical' ? i : 0);
      const c = pos.col + (pos.direction === 'horizontal' ? i : 0);
      addRevealedCell(`${r},${c}`);
    }
    // Засчитать как найденное
    addFoundWord(word);

    spendCoins(200);
    incrementHints();
    setHammerMode(false);
    AudioManager.play('hint_use');
    checkLevelComplete([...foundWords, word]);
  }, [hammerMode, currentLevel, foundWords]);

  // ─── ПРОВЕРКА ЗАВЕРШЕНИЯ УРОВНЯ ───────────────────────────────────────────
  const checkLevelComplete = useCallback((words: string[]) => {
    const allFound = currentLevel.words.every(w => words.includes(w));
    if (!allFound) return;

    const timeSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const stars = calculateStars(session.hintsUsed, timeSeconds, currentLevel.estimatedTimeSeconds);
    const baseCoins = 30;
    const bonusCoins = foundBonusWords.length * 2;
    const total = baseCoins + bonusCoins;

    addCoins(total);
    addXP(25);
    updateStreak();
    AudioManager.play('level_complete');
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}

    SaveManager.saveLevelComplete({
      levelId: currentLevel.id,
      stars,
      timeSeconds,
      coinsEarned: total,
    });

    setTimeout(() => setIsLevelComplete(true), 600);
  }, [currentLevel, session, foundBonusWords]);

  // ─── ОСНОВНАЯ ЛОГИКА: СЛОВО ОТПРАВЛЕНО ────────────────────────────────────
  const handleWordSubmit = useCallback((word: string) => {
    if (!currentLevel || word.length < 3) return;

    const result = checkWord(word, currentLevel, session);

    switch (result.type) {
      case 'incorrect': {
        setWordDisplayState('error');
        letterCircleRef.current?.triggerShake();
        swipeLineRef.current?.setError(true);
        AudioManager.play('word_error');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
        setTimeout(() => setWordDisplayState('idle'), 400);
        break;
      }

      case 'already_found': {
        toastRef.current?.show('✦ Уже найдено!', 'info');
        AudioManager.play('word_error');
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
        break;
      }

      case 'too_short': {
        // Молча игнорируем
        break;
      }

      case 'correct': {
        setWordDisplayState('correct');
        const newFoundWords = [...foundWords, word];
        addFoundWord(word);
        incrementPiggyBank(2);
        addXP(5);
        AudioManager.play('word_correct');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        setTimeout(() => setWordDisplayState('idle'), 400);
        checkLevelComplete(newFoundWords);
        break;
      }

      case 'bonus': {
        setWordDisplayState('correct');
        addFoundBonusWord(word);
        addCoins(2);
        incrementPiggyBank(2);
        addXP(10);
        AudioManager.play('word_bonus');
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
        toastRef.current?.show(`✦ Бонус! +2 🪙`, 'bonus');
        setTimeout(() => setWordDisplayState('idle'), 400);
        break;
      }
    }
  }, [currentLevel, session, foundWords]);

  // ─── СЛЕДУЮЩИЙ УРОВЕНЬ ────────────────────────────────────────────────────
  const handleNextLevel = useCallback(() => {
    const next = LevelManager.getNextLevel(currentLevel.id);
    if (next) {
      useGameStore.getState().setLevel(next);
      setIsLevelComplete(false);
      setCurrentWord('');
      setWordDisplayState('idle');
      setHammerMode(false);
      // Interstitial через 500ms после старта нового уровня
      setTimeout(() => {
        AdManager.tryShowInterstitial(next.id, hasNoAds);
      }, 500);
    } else {
      navigation.navigate('ChapterSelect');
    }
  }, [currentLevel.id, hasNoAds, navigation]);

  const handleWatchAd = useCallback(async () => {
    const earned = await AdManager.showRewarded();
    if (earned) {
      addCoins(150);
      toastRef.current?.show('🎬 +150 монет!', 'bonus');
    } else {
      toastRef.current?.show('Видео недоступно', 'info');
    }
  }, [addCoins]);

  // ─── ЗВЁЗДЫ ДЛЯ МОДАЛА ───────────────────────────────────────────────────
  const timeSeconds = Math.floor((Date.now() - session.startTime) / 1000);
  const stars = calculateStars(session.hintsUsed, timeSeconds, currentLevel.estimatedTimeSeconds);

  // ─── РЕНДЕР ───────────────────────────────────────────────────────────────
  return (
    <MysticBackground>
      <SafeAreaView style={styles.container}>

        {/* Шапка */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>← Выход</Text>
          </TouchableOpacity>
          <Text style={styles.levelInfo}>
            Глава {currentLevel.chapter} · Уровень {currentLevel.id}
          </Text>
          <Text style={styles.coinsHeader}>🪙 {coins}</Text>
        </View>

        {/* Кроссворд — ~45% высоты */}
        <CrosswordGrid
          levelData={currentLevel}
          foundWords={foundWords}
          revealedCells={session.revealedCells}
          hammerMode={hammerMode}
          onCellPress={handleCellPress}
          style={styles.crossword}
        />

        {/* Подсказки и прогресс */}
        <HintsBar
          coins={coins}
          found={foundWords.length}
          total={currentLevel.words.length}
          piggyBank={usePlayerStore.getState().piggyBank}
          onLightbulb={handleLightbulb}
          onHammer={handleHammer}
          onPiggyPress={() => setShowPiggy(true)}
        />

        {/* Текущее слово */}
        <WordDisplay word={currentWord} state={wordDisplayState} />

        {/* Круг букв — ~35% высоты */}
        <LetterCircle
          ref={letterCircleRef}
          letters={currentLevel.letters}
          swipeLineRef={swipeLineRef}
          onWordChange={setCurrentWord}
          onWordSubmit={handleWordSubmit}
          style={styles.letterCircle}
        />

        {/* Слои поверх всего */}
        <Toast ref={toastRef} />
        {/* SwipeLine рендерится внутри LetterCircle */}

        {/* Модал завершения уровня */}
        <LevelCompleteModal
          visible={isLevelComplete}
          levelData={currentLevel}
          coinsEarned={30 + foundBonusWords.length * 2}
          bonusWordsCount={foundBonusWords.length}
          stars={stars}
          onNext={handleNextLevel}
          onWatchAd={handleWatchAd}
          onChapters={() => navigation.navigate('ChapterSelect')}
        />

        <PiggyBankModal visible={showPiggy} onClose={() => setShowPiggy(false)} />

      </SafeAreaView>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  noLevel: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
  },
  backText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  levelInfo: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  coinsHeader: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.MD,
    color: COLORS.ACCENT_GOLD,
  },
  crossword: { flex: 0.45 },
  letterCircle: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.LG,
  },
});
