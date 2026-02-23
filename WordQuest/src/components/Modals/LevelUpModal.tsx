import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withSequence, withTiming, withSpring,
  useAnimatedStyle, runOnJS
} from 'react-native-reanimated';
import { Confetti } from '../UI/Confetti';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../../constants';

interface Props {
  visible: boolean;
  level: number;
  title: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<Props> = ({ visible, level, title, onClose }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.5, { duration: 200 });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Confetti visible={visible} />

        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.headerText}>✦ Новый уровень! ✦</Text>

          <Text style={styles.levelText}>Уровень {level}</Text>
          <Text style={styles.titleText}>🎉 {title} 🎉</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Продолжить</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LG,
  },
  card: {
    backgroundColor: '#1C160A',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_GOLD,
    padding: SPACING.XL,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.MD,
  },
  levelText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: 48,
    color: COLORS.ACCENT_GOLD,
    textAlign: 'center',
    marginBottom: SPACING.XS,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.XL,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  button: {
    backgroundColor: COLORS.ACCENT_GOLD,
    paddingVertical: 14,
    paddingHorizontal: SPACING.XL,
    borderRadius: SIZES.BORDER_RADIUS,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Cinzel-Bold',
    fontSize: FONT_SIZES.MD,
    color: COLORS.BG_DARK,
  },
});
