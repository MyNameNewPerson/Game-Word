import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import MysticBackground from '../components/Background/MysticBackground';
import ProgressBar from '../components/UI/ProgressBar';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING } from '../constants/sizes';
import { CHAPTERS } from '../constants/chapters';
import { usePlayerStore } from '../store/playerStore';

type ChapterSelectScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChapterSelect'>;

const ChapterSelectScreen = () => {
  const navigation = useNavigation<ChapterSelectScreenNavigationProp>();
  const completedLevels = usePlayerStore((state) => state.completedLevels);
  const currentLevel = usePlayerStore((state) => state.currentLevel);

  // Helper to check if chapter is unlocked
  const isChapterUnlocked = (chapterId: number) => {
    if (chapterId === 1) return true;
    const prevChapter = CHAPTERS.find(c => c.id === chapterId - 1);
    if (!prevChapter) return true;
    // Unlocked if all levels of previous chapter are completed
    // Assuming 10 levels per chapter and contiguous IDs
    const startId = (prevChapter.id - 1) * 10 + 1;
    const endId = startId + 9;
    for (let i = startId; i <= endId; i++) {
        if (!completedLevels.includes(i)) return false;
    }
    return true;
  };

  const getChapterProgress = (chapterId: number) => {
    const startId = (chapterId - 1) * 10 + 1;
    const endId = startId + 9;
    let completedCount = 0;
    for (let i = startId; i <= endId; i++) {
      if (completedLevels.includes(i)) completedCount++;
    }
    return completedCount / 10;
  };

  const handlePressChapter = (chapter: typeof CHAPTERS[0]) => {
      if (!isChapterUnlocked(chapter.id)) {
          Alert.alert("Locked", "Complete the previous chapter to unlock this one.");
          return;
      }
      // Find first incomplete level in this chapter
      const startId = (chapter.id - 1) * 10 + 1;
      const endId = startId + 9;
      let targetLevel = startId;
      for (let i = startId; i <= endId; i++) {
          if (!completedLevels.includes(i)) {
              targetLevel = i;
              break;
          }
      }
      // Or just go to currentLevel if it falls in this chapter
      if (currentLevel >= startId && currentLevel <= endId) {
          targetLevel = currentLevel;
      } else if (currentLevel > endId) {
          // Chapter completed, replay first level? or last?
          // Let's replay first level if fully completed
          targetLevel = startId;
      }

      navigation.navigate('Game', { levelId: targetLevel });
  };

  return (
    <MysticBackground>
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>◀ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Chapters</Text>
          <View style={{width: 50}} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {CHAPTERS.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.id);
          const progress = getChapterProgress(chapter.id);

          return (
            <TouchableOpacity
              key={chapter.id}
              style={[styles.card, !unlocked && styles.cardLocked, { borderColor: chapter.color }]}
              onPress={() => handlePressChapter(chapter)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.chapterTitle, !unlocked && styles.textLocked]}>{chapter.name}</Text>
                {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>
              <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>{Math.round(progress * 10)} / 10 Levels</Text>
                  <ProgressBar progress={progress} color={chapter.color} />
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
    padding: SPACING.LG,
    paddingTop: 0,
    gap: SPACING.LG,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SPACING.LG,
      paddingTop: 50,
      backgroundColor: COLORS.BG_DARK,
  },
  backButton: {
      padding: SPACING.SM,
  },
  backText: {
      color: COLORS.TEXT_SECONDARY,
      fontFamily: FONTS.BODY_BOLD,
      fontSize: FONT_SIZES.MD,
  },
  title: {
      fontFamily: FONTS.TITLE,
      fontSize: FONT_SIZES.XL,
      color: COLORS.TEXT_PRIMARY,
  },
  card: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 16,
    padding: SPACING.LG,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLocked: {
    opacity: 0.6,
    borderColor: COLORS.DIVIDER,
    backgroundColor: COLORS.BG_ELEVATED,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  chapterTitle: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
  },
  textLocked: {
      color: COLORS.TEXT_DISABLED,
  },
  lockIcon: {
    fontSize: 20,
  },
  progressContainer: {
      gap: SPACING.XS,
  },
  progressText: {
      fontFamily: FONTS.NUMBERS,
      fontSize: FONT_SIZES.SM,
      color: COLORS.TEXT_SECONDARY,
      alignSelf: 'flex-end',
  }
});

export default ChapterSelectScreen;
