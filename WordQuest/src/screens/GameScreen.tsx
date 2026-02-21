import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import MysticBackground from '../components/Background/MysticBackground';
import CrosswordGrid from '../components/CrosswordGrid/CrosswordGrid';
import CoinCounter from '../components/UI/CoinCounter';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import { SPACING } from '../constants/sizes';
import { useGameStore } from '../store/gameStore';
import { LevelManager } from '../services/LevelManager';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const GameScreen = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<any>();
  const { levelId } = route.params || { levelId: 1 };

  const startLevel = useGameStore((state) => state.startLevel);
  const currentLevelData = useGameStore((state) => state.currentLevelData);
  const foundWords = useGameStore((state) => state.foundWords);
  const revealedCells = useGameStore((state) => state.revealedCells);

  useEffect(() => {
    const levelData = LevelManager.getLevel(levelId);
    if (levelData) {
        if (!currentLevelData || currentLevelData.id !== levelId) {
             startLevel(levelData);
        }
    }
  }, [levelId]);

  if (!currentLevelData) {
    return (
      <MysticBackground>
        <View style={styles.centered}>
          <Text style={{ color: COLORS.TEXT_PRIMARY }}>Loading Level {levelId}...</Text>
        </View>
      </MysticBackground>
    );
  }

  return (
    <MysticBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.levelTitle}>
             Chapter {currentLevelData.chapter} • Level {currentLevelData.id}
          </Text>
          <CoinCounter />
        </View>

        <View style={styles.gridContainer}>
          <CrosswordGrid
            levelData={currentLevelData}
            foundWords={foundWords}
            revealedCells={revealedCells}
            hammerMode={false}
            onCellPress={(row, col) => console.log('Cell pressed', row, col)}
          />
        </View>

        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Controls Placeholder</Text>
        </View>
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MD,
    paddingTop: 40,
    paddingBottom: SPACING.SM,
  },
  backButton: {
    padding: SPACING.SM,
  },
  backText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 24,
  },
  levelTitle: {
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY,
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: SPACING.MD,
    maxHeight: '55%',
  },
  placeholder: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)'
  },
  placeholderText: {
      color: COLORS.TEXT_SECONDARY
  }
});

export default GameScreen;
