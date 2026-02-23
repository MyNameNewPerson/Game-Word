import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue, withSpring, withTiming, withDelay, useAnimatedStyle
} from 'react-native-reanimated';
import { Confetti } from '../UI/Confetti';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../../constants';
import type { LevelData } from '../../types';

interface Props {
  visible: boolean;
  levelData: LevelData;
  coinsEarned: number;
  bonusWordsCount: number;
  stars: 1 | 2 | 3;
  onNext: () => void;
  onWatchAd: () => void;
  onChapters: () => void;
}

// Подсчёт звёзд
export function calculateStars(hintsUsed: number, timeSeconds: number, estimatedTime: number): 1 | 2 | 3 {
  if (hintsUsed === 0 && timeSeconds <= estimatedTime * 1.5) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

// Одна звезда с анимацией появления
const Star: React.FC<{ filled: boolean; delay: number }> = ({ filled, delay }) => {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(-30);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { mass: 0.6, damping: 8, stiffness: 150 }));
    rotate.value = withDelay(delay, withTiming(0, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 44 }}>{filled ? '⭐' : '☆'}</Text>
    </Animated.View>
  );
};

export const LevelCompleteModal: React.FC<Props> = ({
  visible, levelData, coinsEarned, bonusWordsCount, stars,
  onNext, onWatchAd, onChapters
}) => {
  const titleOpacity = useSharedValue(0);
  const contentY = useSharedValue(30);
  const contentOpacity = useSharedValue(0);
  // Анимированный счётчик монет
  const displayCoins = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      titleOpacity.value = withTiming(1, { duration: 400 });
      contentY.value = withDelay(400, withTiming(0, { duration: 400 }));
      contentOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
      displayCoins.value = withDelay(600, withTiming(coinsEarned, { duration: 1200 }));
    }
  }, [visible, coinsEarned]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      {/* Конфетти — поверх всего */}
      <Confetti visible={visible} />

      {/* Затемнение */}
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Заголовок */}
          <Animated.View style={titleStyle}>
            <Text style={styles.title}>✦ УРОВЕНЬ ПРОЙДЕН! ✦</Text>
          </Animated.View>

          {/* Звёзды */}
          <View style={styles.starsRow}>
            <Star filled={stars >= 1} delay={300} />
            <Star filled={stars >= 2} delay={600} />
            <Star filled={stars >= 3} delay={900} />
          </View>

          <Animated.View style={[styles.content, contentStyle]}>
            {/* Монеты */}
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>Монеты получены:</Text>
              <Text style={styles.rewardValue}>🪙 +{coinsEarned}</Text>
            </View>

            {/* Бонусные слова */}
            {bonusWordsCount > 0 && (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardLabel}>
                  Бонусных слов: {bonusWordsCount}
                </Text>
                <Text style={styles.rewardValue}>
                  🌟 +{bonusWordsCount * 2}
                </Text>
              </View>
            )}

            {/* Главная кнопка */}
            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
              <Text style={styles.nextButtonText}>▶ Следующий уровень</Text>
            </TouchableOpacity>

            {/* Rewarded реклама */}
            <TouchableOpacity style={styles.adButton} onPress={onWatchAd}>
              <Text style={styles.adButtonText}>▶ +150 монет за видео</Text>
            </TouchableOpacity>

            {/* К главам */}
            <TouchableOpacity style={styles.chaptersButton} onPress={onChapters}>
              <Text style={styles.chaptersButtonText}>◀ К главам</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
    padding: SPACING.XL,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'CinzelDecorative-Regular',
    fontSize: FONT_SIZES.LG,
    color: COLORS.ACCENT_GOLD,
    textAlign: 'center',
    textShadowColor: COLORS.ACCENT_GOLD,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: SPACING.MD,
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  content: { width: '100%', alignItems: 'center' },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: SPACING.XS,
  },
  rewardLabel: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
  },
  rewardValue: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.MD,
    color: COLORS.ACCENT_GOLD,
  },
  nextButton: {
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: SIZES.BORDER_RADIUS,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.LG,
    marginBottom: SPACING.SM,
  },
  nextButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.LG,
    color: COLORS.BG_DARK,
    letterSpacing: 1,
  },
  adButton: {
    borderWidth: 1,
    borderColor: COLORS.ACCENT_TEAL,
    borderRadius: SIZES.BORDER_RADIUS,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  adButtonText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
    color: COLORS.ACCENT_TEAL,
  },
  chaptersButton: { paddingVertical: SPACING.SM },
  chaptersButtonText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
});
