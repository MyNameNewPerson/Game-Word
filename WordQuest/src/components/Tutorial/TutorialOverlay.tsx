import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { usePlayerStore } from '../../store/playerStore';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

const { width: SW, height: SH } = Dimensions.get('window');

const STEPS = [
  {
    id: 1,
    text: 'Проведи пальцем по буквам чтобы составить слово',
    highlightArea: { bottom: true },  // подсветить нижнюю часть (круг букв)
    arrowDirection: 'up' as const,
  },
  {
    id: 2,
    text: 'Найденные слова заполнят кроссворд',
    highlightArea: { top: true },     // подсветить верхнюю часть (кроссворд)
    arrowDirection: 'down' as const,
  },
  {
    id: 3,
    text: 'Если застрял — возьми подсказку за монеты',
    highlightArea: { middle: true },  // подсветить HintsBar
    arrowDirection: 'up' as const,
  },
];

interface Props {
  visible: boolean;
}

export const TutorialOverlay: React.FC<Props> = ({ visible }) => {
  const [step, setStep] = useState(0);
  const setTutorialCompleted = usePlayerStore(s => s.setTutorialCompleted);

  if (!visible || step >= STEPS.length) return null;

  const current = STEPS[step];

  const handleTap = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setTutorialCompleted();
    }
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={handleTap}
      activeOpacity={1}
    >
      {/* Подсказка */}
      <View style={[
        styles.tooltip,
        current.arrowDirection === 'up' ? styles.tooltipBottom : styles.tooltipTop,
      ]}>
        <Text style={styles.tooltipText}>{current.text}</Text>
        <Text style={styles.tapHint}>Нажми чтобы продолжить</Text>
      </View>

      {/* Индикатор шага */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  tooltip: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.ACCENT_GOLD,
    padding: SPACING.LG,
    marginHorizontal: SPACING.XL,
    alignItems: 'center',
    maxWidth: 300,
  },
  tooltipTop: { position: 'absolute', top: SH * 0.1 },
  tooltipBottom: { position: 'absolute', bottom: SH * 0.15 },
  tooltipText: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.LG,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: SPACING.SM,
  },
  tapHint: {
    fontFamily: 'CrimsonText-Regular',
    fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY,
  },
  dots: {
    position: 'absolute',
    bottom: SH * 0.08,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: COLORS.ACCENT_GOLD },
});
