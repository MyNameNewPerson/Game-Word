import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AppRouteProp, AppNavigationProp } from '../navigation/types';
import { MysticBackground } from '../components/Background/MysticBackground';
import CrosswordGrid from '../components/CrosswordGrid/CrosswordGrid';
import { CoinCounter } from '../components/UI/CoinCounter';
import { Toast } from '../components/UI/Toast';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING, SIZES } from '../constants/sizes';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { LevelManager } from '../services/LevelManager';
import { LevelData } from '../types/LevelTypes';

const GameScreen = () => {
  const route = useRoute<AppRouteProp<'Game'>>();
  const navigation = useNavigation<AppNavigationProp>();
  const { levelId } = route.params;

  const startLevel = useGameStore(state => state.startLevel);
  const currentLevelData = useGameStore(state => state.currentLevelData);
  const foundWords = useGameStore(state => state.foundWords);
  const revealedCells = useGameStore(state => state.revealedCells);
  const hammerMode = useGameStore(state => state.hammerMode);

  const [isLoading, setIsLoading] = useState(true);
  const [levelData, setLevelData] = useState<LevelData | null>(null);

  useEffect(() => {
    const data = LevelManager.getLevel(levelId);
    if (data) {
      setLevelData(data);
      startLevel(data);
    } else {
      console.error(`Level ${levelId} not found!`);
      navigation.goBack();
    }
    setIsLoading(false);
  }, [levelId]);

  const handleCellPress = (row: number, col: number) => {
    console.log(`Cell pressed: ${row}, ${col}`);
    // Hammer logic will go here in Phase 4/6
  };

  if (isLoading || !levelData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.TEXT_PRIMARY }}>Loading Level {levelId}...</Text>
      </View>
    );
  }

  return (
    <MysticBackground style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>◀</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Уровень {levelId}</Text>
          <Text style={styles.headerSubtitle}>{levelData.chapterName}</Text>
        </View>
        <CoinCounter />
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Crossword Grid */}
        <View style={styles.gridContainer}>
          <CrosswordGrid
            levelData={levelData}
            foundWords={foundWords}
            revealedCells={revealedCells}
            hammerMode={hammerMode}
            onCellPress={handleCellPress}
          />
        </View>

        {/* Hints Bar (Placeholder for Phase 6) */}
        <View style={styles.hintsBarPlaceholder}>
          <Text style={{ color: COLORS.TEXT_DISABLED }}>[Hints Bar Placeholder]</Text>
        </View>

        {/* Word Display (Placeholder for Phase 3) */}
        <View style={styles.wordDisplayPlaceholder}>
           <Text style={{ color: COLORS.ACCENT_TEAL, fontFamily: FONTS.HEADING, fontSize: FONT_SIZES.XL }}>
             WORD
           </Text>
        </View>

        {/* Letter Circle (Placeholder for Phase 3) */}
        <View style={styles.circleContainer}>
           <View style={styles.circlePlaceholder}>
             {levelData.letters.map((char, index) => (
               <Text key={index} style={{ color: COLORS.TEXT_PRIMARY, margin: 5 }}>{char}</Text>
             ))}
           </View>
        </View>
      </View>

      {/* Toast Container (absolute positioned) */}
      <Toast ref={(ref) => { /* store ref for global usage or context */ }} />
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.BG_DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SIZES.HEADER_HEIGHT, // Adjust for safe area
    paddingHorizontal: SPACING.MD,
    paddingBottom: SPACING.SM,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backIcon: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZES.LG,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontFamily: FONTS.BODY,
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'column',
  },
  gridContainer: {
    height: '52%', // CROSSWORD_RATIO
    width: '100%',
    padding: SPACING.MD,
    // backgroundColor: 'rgba(255,0,0,0.1)', // Debug
  },
  hintsBarPlaceholder: {
    height: SIZES.HINTS_BAR_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG_ELEVATED,
    marginHorizontal: SPACING.MD,
    borderRadius: SIZES.BORDER_RADIUS,
  },
  wordDisplayPlaceholder: {
    height: SIZES.WORD_DISPLAY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,255,0.1)', // Debug
  },
  circlePlaceholder: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: COLORS.GRID_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});

export default GameScreen;
