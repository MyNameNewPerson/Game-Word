import React, {
  forwardRef, useImperativeHandle, useMemo, useRef, useState, useCallback
} from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, withSequence, withTiming, useAnimatedStyle
} from 'react-native-reanimated';
import LetterButton from './LetterButton';
import { ShuffleButton } from './ShuffleButton';
import { SwipeLine, type SwipeLineHandle } from './SwipeLine';
import { getCirclePositions } from '../../utils/circleLayout';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { SIZES } from '../../constants/sizes';

export interface LetterCircleHandle {
  triggerShake: () => void;
  triggerErrorLine: () => void;
}

interface Props {
  letters: string[];
  swipeLineRef: React.RefObject<SwipeLineHandle>;
  onWordChange: (word: string) => void;
  onWordSubmit: (word: string) => void;
  style?: any;
}

export const LetterCircle = forwardRef<LetterCircleHandle, Props>((
  { letters, swipeLineRef, onWordChange, onWordSubmit, style },
  ref
) => {
  // Container size = min(screen width - padding, max size)
  const CONTAINER_SIZE = Math.min(Dimensions.get('window').width - 32, 320);

  // Positions of letters in a circle
  const positions = useMemo(
    () => getCirclePositions(letters.length, CONTAINER_SIZE),
    [letters.length, CONTAINER_SIZE]
  );

  // Selected indices — REF, not state (no re-render on swipe)
  const selectedIndicesRef = useRef<number[]>([]);

  // Container offset on screen (needed for hitTest)
  const containerOffset = useRef({ x: 0, y: 0 });
  const viewRef = useRef<View>(null);

  // Shuffle state — useState is fine here as it's only on button press
  const [displayLetters, setDisplayLetters] = useState(letters);

  // Shake animation (error)
  const shakeX = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    triggerShake() {
      shakeX.value = withSequence(
        withTiming(-14, { duration: 50 }),
        withTiming(14, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    },
    triggerErrorLine() {
      swipeLineRef.current?.setError(true);
    },
  }));

  const containerShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const { panResponder } = useSwipeGesture({
    letters: displayLetters,
    positions,
    containerOffset,
    swipeLineRef,
    onWordChange,
    onWordSubmit,
    selectedIndicesRef,
  });

  const handleShuffle = useCallback(() => {
    // Fisher-Yates shuffle
    const arr = [...displayLetters];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    selectedIndicesRef.current = [];
    setDisplayLetters(arr);
  }, [displayLetters]);

  const handleLayout = () => {
    viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
      containerOffset.current = { x: pageX, y: pageY };
    });
  };

  return (
    <Animated.View
      ref={viewRef}
      style={[
        styles.container,
        { width: CONTAINER_SIZE, height: CONTAINER_SIZE },
        containerShakeStyle,
        style,
      ]}
      {...panResponder.panHandlers}
      onLayout={handleLayout}
    >
      {/* SVG swipe line (drawn on top of everything inside this container? No, usually behind or on top.
          If on top, it blocks touches unless pointerEvents="none".
          SwipeLine has pointerEvents="none".
      */}
      <SwipeLine ref={swipeLineRef} />

      {/* Letters */}
      {displayLetters.map((letter, index) => (
        <LetterButton
          key={`${letter}-${index}`}
          letter={letter}
          isSelected={selectedIndicesRef.current.includes(index)}
          position={positions[index]}
          entryDelay={index * 80}  // staggered entry
        />
      ))}

      {/* Shuffle button in center */}
      <View style={[
        styles.shuffleWrap,
        {
          left: CONTAINER_SIZE / 2 - 22,
          top: CONTAINER_SIZE / 2 - 22,
        }
      ]}>
        <ShuffleButton onShuffle={handleShuffle} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20, // Add some margin from top components
  },
  shuffleWrap: {
    position: 'absolute',
  },
});
