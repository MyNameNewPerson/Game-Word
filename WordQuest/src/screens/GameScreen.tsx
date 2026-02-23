import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MysticBackground } from '../components/Background/MysticBackground';
import { COLORS } from '../constants';
import { CrosswordGrid } from '../components/CrosswordGrid/CrosswordGrid';
import { useGameStore } from '../store/gameStore';

export const GameScreen: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);

  return (
    <MysticBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Game Screen (Stub)</Text>
        {currentLevel ? (
             <CrosswordGrid
                levelData={currentLevel}
                foundWords={[]}
                revealedCells={[]}
                hammerMode={false}
                onCellPress={() => {}}
             />
        ) : (
            <Text style={{color: 'white'}}>No Level Selected</Text>
        )}
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    marginBottom: 20,
  },
});
