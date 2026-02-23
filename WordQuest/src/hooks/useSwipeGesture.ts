import { useRef, useMemo } from 'react';
import { PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { hitTestLetter, type LetterPosition } from '../utils/circleLayout';
import type { SwipeLineHandle } from '../components/LetterCircle/SwipeLine';

interface Config {
  letters: string[];
  positions: LetterPosition[];
  // Container offset on screen (pageX, pageY of top-left corner)
  containerOffset: React.MutableRefObject<{ x: number; y: number }>;
  swipeLineRef: React.RefObject<SwipeLineHandle>;
  onWordChange: (word: string) => void;   // called on each letter add
  onWordSubmit: (word: string) => void;   // called on finger lift
  // ref for highlighting selected buttons (no useState!)
  selectedIndicesRef: React.MutableRefObject<number[]>;
}

export function useSwipeGesture({
  letters,
  positions,
  containerOffset,
  swipeLineRef,
  onWordChange,
  onWordSubmit,
  selectedIndicesRef,
}: Config) {
  // Current word — ref, not state
  const currentWord = useRef('');

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false, // do not yield control

    onPanResponderGrant: (e) => {
      // Start of swipe — reset
      selectedIndicesRef.current = [];
      currentWord.current = '';
      swipeLineRef.current?.clear();
      onWordChange('');

      const { pageX, pageY } = e.nativeEvent;
      checkHit(pageX, pageY);
    },

    onPanResponderMove: (e) => {
      const { pageX, pageY } = e.nativeEvent;
      const localX = pageX - containerOffset.current.x;
      const localY = pageY - containerOffset.current.y;

      // Update line tail — WITHOUT setState
      swipeLineRef.current?.updateCurrentPoint(localX, localY);

      checkHit(pageX, pageY);
    },

    onPanResponderRelease: () => {
      swipeLineRef.current?.clear();
      const word = currentWord.current;
      selectedIndicesRef.current = [];
      currentWord.current = '';

      if (word.length >= 3) {
        onWordSubmit(word);
        // Do NOT call onWordChange('') here.
        // Let the parent component handle the visual state of the submitted word
        // (e.g. animate it, then clear it).
        // The next gesture (Grant) will reset everything anyway.
      } else {
        onWordChange('');
      }
    },

    onPanResponderTerminate: () => {
      // Gesture interrupted (e.g., incoming call)
      swipeLineRef.current?.clear();
      selectedIndicesRef.current = [];
      currentWord.current = '';
      onWordChange('');
    },
  }), [letters, positions]);  // recreate only if letters change

  function checkHit(pageX: number, pageY: number) {
    const localX = pageX - containerOffset.current.x;
    const localY = pageY - containerOffset.current.y;

    for (let i = 0; i < positions.length; i++) {
      // Already selected — skip
      if (selectedIndicesRef.current.includes(i)) continue;

      if (hitTestLetter(localX, localY, positions[i].centerX, positions[i].centerY)) {
        // New letter captured
        selectedIndicesRef.current.push(i);
        currentWord.current += letters[i];

        // Add point to line
        swipeLineRef.current?.addPoint(positions[i].centerX, positions[i].centerY);

        // Notify new word
        onWordChange(currentWord.current);

        // Haptic feedback
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}

        break;  // one letter at a time
      }
    }
  }

  return { panResponder };
}
