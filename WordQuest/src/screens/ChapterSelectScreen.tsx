import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavigationProp } from '../navigation/types';
import { MysticBackground } from '../components/Background/MysticBackground';
import { ProgressBar } from '../components/UI/ProgressBar';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING, SIZES } from '../constants/sizes';
import { usePlayerStore } from '../store/playerStore';
import { LevelManager } from '../services/LevelManager';

// Chapters data from generate_levels.py logic (hardcoded here for display as they are static)
const CHAPTERS = [
    { id: 1, name: "Пролог: Пыльный Архив", theme: "archive" },
    { id: 2, name: "Египетские Пески", theme: "egypt" },
    { id: 3, name: "Затонувший Город", theme: "underwater" },
    { id: 4, name: "Ледяные Руины", theme: "ice" },
    { id: 5, name: "Лесной Лабиринт", theme: "forest" },
    { id: 6, name: "Небесная Крепость", theme: "sky" },
    { id: 7, name: "Подземный Храм", theme: "temple" },
    { id: 8, name: "Вулканический Остров", theme: "volcano" },
    { id: 9, name: "Хрустальные Пещеры", theme: "crystal" },
    { id: 10, name: "Финал: Сердце Тайны", theme: "finale" },
];

const ChapterSelectScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const completedLevels = usePlayerStore(state => state.completedLevels);
  const currentLevel = usePlayerStore(state => state.currentLevel);

  // Helper to calculate chapter progress
  const getChapterProgress = (chapterId: number) => {
    // Assuming 10 levels per chapter
    const startLevel = (chapterId - 1) * 10 + 1;
    const endLevel = chapterId * 10;

    // Count how many levels in this range are completed
    const completedCount = completedLevels.filter(lvl => lvl >= startLevel && lvl <= endLevel).length;

    // Determine if unlocked
    // Chapter 1 always unlocked
    // Chapter N unlocked if all levels of N-1 are completed OR simply if we reached startLevel
    const isUnlocked = chapterId === 1 || completedLevels.includes(startLevel - 1) || currentLevel >= startLevel;

    return { completedCount, total: 10, isUnlocked, startLevel };
  };

  const handlePressChapter = (chapterId: number, startLevel: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;

    // Find first unplayed level in chapter, or just go to start if all done
    // Or go to currentLevel if it's within this chapter
    let targetLevel = startLevel;
    if (currentLevel >= startLevel && currentLevel < startLevel + 10) {
        targetLevel = currentLevel;
    }

    navigation.navigate('Game', { levelId: targetLevel });
  };

  return (
    <MysticBackground style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>◀ Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Главы</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {CHAPTERS.map((chapter) => {
          const { completedCount, total, isUnlocked, startLevel } = getChapterProgress(chapter.id);
          const progress = completedCount / total;

          return (
            <TouchableOpacity
              key={chapter.id}
              style={[styles.card, !isUnlocked && styles.cardLocked]}
              onPress={() => handlePressChapter(chapter.id, startLevel, isUnlocked)}
              disabled={!isUnlocked}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.chapterNum, !isUnlocked && styles.textLocked]}>
                  Глава {chapter.id}
                </Text>
                {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>

              <Text style={[styles.chapterName, !isUnlocked && styles.textLocked]}>
                {chapter.name}
              </Text>

              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {completedCount} / {total}
                </Text>
                <ProgressBar progress={progress} height={6} color={isUnlocked ? COLORS.ACCENT_GOLD : COLORS.TEXT_DISABLED} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SIZES.HEADER_HEIGHT,
    paddingHorizontal: SPACING.LG,
    paddingBottom: SPACING.MD,
    backgroundColor: 'rgba(18, 18, 26, 0.8)',
  },
  backButton: {
    padding: SPACING.SM,
  },
  backText: {
    fontFamily: FONTS.BODY_BOLD,
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.MD,
  },
  title: {
    fontFamily: FONTS.TITLE,
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
  },
  scrollContent: {
    padding: SPACING.LG,
    paddingBottom: SPACING.XXL,
  },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: SIZES.BORDER_RADIUS,
    padding: SPACING.LG,
    marginBottom: SPACING.LG,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: COLORS.BG_DARK,
    borderColor: COLORS.DIVIDER,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XS,
  },
  chapterNum: {
    fontFamily: FONTS.BODY_BOLD,
    fontSize: FONT_SIZES.SM,
    color: COLORS.ACCENT_TEAL,
    letterSpacing: 1,
  },
  chapterName: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  textLocked: {
    color: COLORS.TEXT_DISABLED,
  },
  lockIcon: {
    fontSize: FONT_SIZES.LG,
  },
  progressContainer: {
    marginTop: SPACING.XS,
  },
  progressText: {
    fontFamily: FONTS.NUMBERS,
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
    textAlign: 'right',
  },
});

export default ChapterSelectScreen;
