import React from 'react';
import { Pressable, Animated, StyleSheet, StyleProp, ViewStyle, Text, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';

interface AnimatedButtonProps {
  onPress: () => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  children?: React.ReactNode;
  scaleFactor?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  children,
  scaleFactor = 0.95
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: scaleFactor,
      useNativeDriver: true,
      speed: 20,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        { transform: [{ scale }] },
        style
      ]}
    >
      {children ? children : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.BUTTON_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabled: {
    backgroundColor: COLORS.BUTTON_DISABLED,
    opacity: 0.7,
  },
  text: {
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.HEADING,
    fontSize: FONT_SIZES.MD,
  }
});

export default AnimatedButton;
