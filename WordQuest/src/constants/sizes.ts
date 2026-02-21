export const SPACING = {
  XS: 4, SM: 8, MD: 12, LG: 16, XL: 24, XXL: 32,
} as const;

export const SIZES = {
  HEADER_HEIGHT:       56,
  HINTS_BAR_HEIGHT:    64,
  WORD_DISPLAY_HEIGHT: 48,
  LETTER_CIRCLE_RATIO: 0.35,   // 35% высоты экрана
  CROSSWORD_RATIO:     0.52,   // 52% высоты экрана
  CELL_MAX:            52,     // Максимальный размер ячейки кроссворда (px)
  CELL_MIN:            24,     // Минимальный размер ячейки
  LETTER_BUTTON_SIZE:  56,     // Кнопка буквы в круге
  SHUFFLE_BUTTON_SIZE: 44,     // Кнопка перемешать
  HIT_RADIUS:          28,     // Радиус захвата буквы при свайпе
  BORDER_RADIUS:       12,     // Стандартное скругление
  BORDER_RADIUS_SM:    6,
  BORDER_RADIUS_LG:    20,
  MIN_TAP_TARGET:      44,     // Accessibility: минимальная tap-зона
} as const;
