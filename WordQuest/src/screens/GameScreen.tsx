import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MysticBackground } from '../components/Background/MysticBackground';
import { COLORS } from '../constants';
import { CrosswordGrid } from '../components/CrosswordGrid/CrosswordGrid';
import { useGameStore } from '../store/gameStore';
import { LetterCircle, LetterCircleHandle } from '../components/LetterCircle/LetterCircle';
import { WordDisplay } from '../components/UI/WordDisplay';
import { SwipeLineHandle } from '../components/LetterCircle/SwipeLine';

export const GameScreen: React.FC = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const [currentWord, setCurrentWord] = useState('');
  const [wordState, setWordState] = useState<'typing' | 'correct' | 'error' | 'idle'>('idle');

  const swipeLineRef = useRef<SwipeLineHandle>(null);
  const letterCircleRef = useRef<LetterCircleHandle>(null);

  const handleWordChange = (word: string) => {
    setCurrentWord(word);
    setWordState('typing');
  };

  const handleWordSubmit = (word: string) => {
    console.log('Word submitted:', word);
    // Logic stub for now - random success/fail to test UI
    if (Math.random() > 0.5) {
      setWordState('correct');
      // Clear word after animation
      setTimeout(() => {
        setCurrentWord('');
        setWordState('idle');
      }, 500);
    } else {
      setWordState('error');
      letterCircleRef.current?.triggerShake();
      letterCircleRef.current?.triggerErrorLine();
       setTimeout(() => {
        setCurrentWord('');
        setWordState('idle');
      }, 500);
    }
  };

  return (
    <MysticBackground>
      <View style={styles.container}>
        {currentLevel ? (
           <>
             <View style={styles.gridContainer}>
               <CrosswordGrid
                  levelData={currentLevel}
                  foundWords={[]}
                  revealedCells={[]}
                  hammerMode={false}
                  onCellPress={() => {}}
               />
             </View>

             <View style={styles.controlsContainer}>
               <WordDisplay word={currentWord} state={wordState} />
               <LetterCircle
                  ref={letterCircleRef}
                  letters={currentLevel.letters}
                  swipeLineRef={swipeLineRef}
                  onWordChange={handleWordChange}
                  onWordSubmit={handleWordSubmit}
               />
             </View>
           </>
        ) : (
            <Text style={styles.text}>No Level Selected</Text>
        )}
      </View>
    </MysticBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60, // Add padding for status bar/header
  },
  gridContainer: {
    flex: 1, // Take available space
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
  },
  controlsContainer: {
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    marginTop: 100,
  },
});
