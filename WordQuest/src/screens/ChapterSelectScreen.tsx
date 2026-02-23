import React, { useCallback } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MysticBackground } from '../components/Background/MysticBackground';
import { CHAPTERS, getChapterById } from '../constants/chapters';
import { usePlayerStore } from '../store/playerStore';
import { useGameStore } from '../store/gameStore';
import { LevelManager } from '../services/LevelManager';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../constants';
import type { ChapterData } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

function getChapterProgress(chapterId: number, completedLevels: Record<number, any>) {
  const chapter = getChapterById(chapterId);
  const completed = chapter.levels.filter(id => completedLevels[id]).length;
  const totalStars = chapter.levels.reduce((sum, id) => {
    return sum + (completedLevels[id]?.stars ?? 0);
  }, 0);
  return { completed, total: chapter.levels.length, totalStars, maxStars: chapter.levels.length * 3 };
}

function isChapterUnlocked(chapterId: number, completedLevels: Record<number, any>): boolean {
  if (chapterId === 1) return true;
  const prevChapter = getChapterById(chapterId - 1);
  return prevChapter.levels.every(id => completedLevels[id] !== undefined);
}

type Props = NativeStackScreenProps<RootStackParamList, 'ChapterSelect'>;

export const ChapterSelectScreen: React.FC<Props> = ({ navigation }) => {
  const completedLevels = usePlayerStore(s => s.completedLevels);
  const setLevel = useGameStore(s => s.setLevel);

  const handlePlayChapter = useCallback((chapter: ChapterData) => {
    // Найти первый непройденный уровень главы
    const nextId = chapter.levels.find(id => !completedLevels[id]) ?? chapter.levels[0];
    const level = LevelManager.getLevel(nextId);
    if (level) {
      setLevel(level);
      navigation.navigate('Game');
    }
  }, [completedLevels, setLevel, navigation]);

  const renderChapter = useCallback(({ item }: { item: ChapterData }) => {
    const unlocked = isChapterUnlocked(item.id, completedLevels);
    const { completed, total, totalStars, maxStars } = getChapterProgress(item.id, completedLevels);
    const progress = total > 0 ? completed / total : 0;

    return (
      <View style={[styles.card, !unlocked && styles.cardLocked]}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardChapter}>ГЛАВА {item.id}</Text>

        {/* Прогресс-бар */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
        <Text style={styles.progressText}>{completed}/{total}</Text>

        {/* Звёзды */}
        <Text style={styles.stars}>
          {Array.from({ length: 5 }, (_, i) => {
            const filled = Math.round((totalStars / maxStars) * 5);
            return i < filled ? '⭐' : '☆';
          }).join('')}
        </Text>

        {/* Кнопка */}
        {unlocked ? (
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayChapter(item)}
          >
            <Text style={styles.playButtonText}>▶ ИГРАТЬ</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>🔒 Закрыто</Text>
          </View>
        )}
      </View>
    );
  }, [completedLevels, handlePlayChapter]);

  return (
    <MysticBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Главы</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={CHAPTERS}
          keyExtractor={ch => String(ch.id)}
          renderItem={renderChapter}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          snapToInterval={220}           // snapToInterval = ширина карточки + gap
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: 220, offset: 220 * index, index })}
        />
      </SafeAreaView>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  backText: { color: COLORS.TEXT_SECONDARY, fontSize: FONT_SIZES.MD, fontFamily: 'CrimsonText-Regular' },
  headerTitle: { color: COLORS.TEXT_PRIMARY, fontSize: FONT_SIZES.XL, fontFamily: 'Cinzel-Bold' },
  list: { paddingHorizontal: SPACING.LG, paddingVertical: SPACING.LG, gap: 16 },
  card: {
    width: 200,
    backgroundColor: '#1A1A28',
    borderRadius: SIZES.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: COLORS.GRID_BORDER,
    padding: SPACING.MD,
    alignItems: 'center',
  },
  cardLocked: { opacity: 0.5 },
  cardEmoji: { fontSize: 44, marginBottom: SPACING.SM },
  cardName: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardChapter: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.GRID_EMPTY,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { backgroundColor: COLORS.ACCENT_GOLD, borderRadius: 3 },
  progressText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SM,
  },
  stars: { fontSize: 16, marginBottom: SPACING.MD },
  playButton: {
    backgroundColor: COLORS.ACCENT_GOLD,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: SPACING.LG,
    width: '100%',
    alignItems: 'center',
  },
  playButtonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.SM,
    color: COLORS.BG_DARK,
    letterSpacing: 1,
  },
  lockedBadge: {
    borderWidth: 1,
    borderColor: COLORS.GRID_BORDER,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: SPACING.LG,
    width: '100%',
    alignItems: 'center',
  },
  lockedText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
});
