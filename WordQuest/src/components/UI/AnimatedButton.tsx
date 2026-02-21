import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onPress, children, style, disabled }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[style, animatedStyle, disabled && styles.disabled]}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
