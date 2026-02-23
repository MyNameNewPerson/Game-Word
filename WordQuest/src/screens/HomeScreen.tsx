import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, withRepeat, withTiming, withSequence,
  useAnimatedStyle, Easing
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MysticBackground } from '../components/Background/MysticBackground';
import { usePlayerStore } from '../store/playerStore';
import { LevelManager } from '../services/LevelManager';
import { DailyPuzzleService } from '../services/DailyPuzzleService';
import { Toast, ToastHandle } from '../components/UI/Toast';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const coins = usePlayerStore(s => s.coins);
  const streakDays = usePlayerStore(s => s.streakDays);
  const completedLevels = usePlayerStore(s => s.completedLevels);
  const setLevel = useGameStore(s => s.setLevel);

  // Daily Puzzle Timer
  const [secondsLeft, setSecondsLeft] = useState(DailyPuzzleService.getSecondsUntilNextPuzzle());
  const dailyCompleted = usePlayerStore(s =>
    DailyPuzzleService.isCompletedToday({ dailyPuzzleLastDate: s.dailyPuzzleLastDate })
  );
  const toastRef = useRef<ToastHandle>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(DailyPuzzleService.getSecondsUntilNextPuzzle());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  // Анимация логотипа (float)
  const floatY = useSharedValue(0);
  // Анимация появления кнопок (stagger)
  const btn1Opacity = useSharedValue(0);
  const btn1Y = useSharedValue(20);
  const btn2Opacity = useSharedValue(0);
  const btn2Y = useSharedValue(20);
  const btn3Opacity = useSharedValue(0);
  const btn3Y = useSharedValue(20);

  useFocusEffect(useCallback(() => {
    // Логотип — бесконечное плавание
    floatY.value = withRepeat(
      withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );

    // Staggered появление кнопок
    const appear = (opacity: any, y: any, delay: number) => {
      opacity.value = withTiming(1, { duration: 400 });
      y.value = withTiming(0, { duration: 400 });
    };
    setTimeout(() => appear(btn1Opacity, btn1Y, 0), 200);
    setTimeout(() => appear(btn2Opacity, btn2Y, 0), 300);
    setTimeout(() => appear(btn3Opacity, btn3Y, 0), 400);
  }, []));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Найти следующий непройденный уровень
  const handlePlay = useCallback(() => {
    let nextLevelId = 1;
    for (let i = 1; i <= 100; i++) {
      if (!completedLevels[i]) {
        nextLevelId = i;
        break;
      }
    }
    const level = LevelManager.getLevel(nextLevelId);
    if (level) {
      setLevel(level);
      navigation.navigate('Game');
    }
  }, [completedLevels, setLevel, navigation]);

  return (
    <MysticBackground>
      <SafeAreaView style={styles.container}>

        {/* Верхние иконки */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('PiggyBank')}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.icon}>🐷</Text>
          </TouchableOpacity>
        </View>

        {/* Логотип */}
        <View style={styles.logoArea}>
          <Animated.View style={logoStyle}>
            <Text style={styles.logoTitle}>✦ WordQuest ✦</Text>
            <Text style={styles.logoSubtitle}>Echoes of Secrets</Text>
          </Animated.View>
        </View>

        {/* Монеты */}
        <View style={styles.coinsRow}>
          <Text style={styles.coinsText}>🪙 {coins.toLocaleString('ru')}</Text>
        </View>

        {/* Главная кнопка ИГРАТЬ */}
        <Animated.View style={[styles.mainBtnWrap, useAnimatedStyle(() => ({
          opacity: btn1Opacity.value,
          transform: [{ translateY: btn1Y.value }],
        }))]}>
          <Pressable
            style={({ pressed }) => [
              styles.mainButton,
              pressed && styles.mainButtonPressed,
            ]}
            onPress={handlePlay}
          >
            <Text style={styles.mainButtonText}>▶  ИГРАТЬ</Text>
          </Pressable>
        </Animated.View>

        {/* Кнопка "Слово дня" */}
        <TouchableOpacity
          style={[styles.dailyButton, dailyCompleted && styles.dailyButtonCompleted]}
          onPress={() => {
            if (dailyCompleted) {
              toastRef.current?.show(`Следующее через ${formatTime(secondsLeft)}`, 'info');
              return;
            }
            const levelId = DailyPuzzleService.getDailyLevelId();
            const level = LevelManager.getLevel(levelId);
            if (level) {
              setLevel({ ...level, isDailyPuzzle: true });
              navigation.navigate('Game');
            }
          }}
        >
          <Text style={styles.dailyIcon}>{dailyCompleted ? '✅' : '📅'}</Text>
          <View>
            <Text style={styles.dailyTitle}>Слово дня</Text>
            <Text style={styles.dailySubtitle}>
              {dailyCompleted
                ? `Следующее через ${formatTime(secondsLeft)}`
                : 'x2 монеты · Доступно сейчас'
              }
            </Text>
          </View>
        </TouchableOpacity>

        {/* Вторичные кнопки */}
        <Animated.View style={[styles.secondaryRow, useAnimatedStyle(() => ({
          opacity: btn2Opacity.value,
          transform: [{ translateY: btn2Y.value }],
        }))]}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.secondaryButtonText}>🏪 Магазин</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ChapterSelect')}
          >
            <Text style={styles.secondaryButtonText}>🗺️ Главы</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Статус-бар */}
        <Animated.View style={[styles.statusBar, useAnimatedStyle(() => ({
          opacity: btn3Opacity.value,
        }))]}>
          <Text style={styles.statusText}>
            {streakDays > 0 ? `🔥 Серия: ${streakDays} дн.` : '🔥 Начни серию!'}
          </Text>
        </Animated.View>

        <Toast ref={toastRef} />
      </SafeAreaView>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingTop: SPACING.SM,
  },
  iconButton: { padding: SPACING.SM },
  icon: { fontSize: 24 },
  logoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.XL,
  },
  logoTitle: {
    fontFamily: 'CinzelDecorative-Regular',
    fontSize: FONT_SIZES.DISPLAY,
    color: COLORS.TEXT_PRIMARY,
    textShadowColor: COLORS.ACCENT_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    textAlign: 'center',
  },
  logoSubtitle: {
    fontFamily: 'CrimsonText-Italic',
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.XS,
  },
  coinsRow: {
    alignItems: 'center',
    marginBottom: SPACING.LG,
  },
  coinsText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.XL,
    color: COLORS.ACCENT_GOLD,
  },
  mainBtnWrap: {
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.MD,
  },
  dailyButton: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.MD,
    borderWidth: 1, borderColor: COLORS.ACCENT_TEAL,
    borderRadius: SIZES.BORDER_RADIUS, paddingVertical: 12, paddingHorizontal: SPACING.LG,
    marginHorizontal: SPACING.XL, marginBottom: SPACING.MD,
  },
  dailyButtonCompleted: { borderColor: COLORS.GRID_BORDER, opacity: 0.6 },
  dailyIcon: { fontSize: 28 },
  dailyTitle: { fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.MD, color: COLORS.TEXT_PRIMARY },
  dailySubtitle: { fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.SM, color: COLORS.TEXT_SECONDARY },
  mainButton: {
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: SIZES.BORDER_RADIUS,
    paddingVertical: 18,
    alignItems: 'center',
  },
  mainButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  mainButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.XL,
    color: COLORS.BG_DARK,
    letterSpacing: 2,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.LG,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GRID_BORDER,
    borderRadius: SIZES.BORDER_RADIUS,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  statusBar: {
    alignItems: 'center',
    paddingBottom: SPACING.LG,
  },
  statusText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
});
