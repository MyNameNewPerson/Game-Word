import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withTiming, withSequence, useAnimatedStyle
} from 'react-native-reanimated';
import { COLORS, FONT_SIZES } from '../../constants';

interface Props {
  onShuffle: () => void;
}

export const ShuffleButton: React.FC<Props> = ({ onShuffle }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const handlePress = () => {
    // Press animation
    scale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
    rotation.value = withTiming(rotation.value + 180, { duration: 300 });
    onShuffle();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.7}>
        <Text style={styles.icon}>↺</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Centering is calculated in LetterCircle via containerSize/2
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.GRID_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    color: COLORS.TEXT_SECONDARY,
  },
});
