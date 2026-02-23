export const SIZES = {
  CELL_MIN:           28,   // минимальный размер ячейки кроссворда (px)
  CELL_MAX:           52,   // максимальный размер ячейки
  LETTER_BUTTON_SIZE: 56,   // диаметр кнопки буквы в круге
  HIT_RADIUS:         28,   // радиус захвата буквы при свайпе
  BORDER_RADIUS:      12,   // скругление кнопок
} as const;

export const FONT_SIZES = {
  XS:      10,
  SM:      12,
  MD:      14,
  LG:      18,
  XL:      22,
  XXL:     28,
  DISPLAY: 36,
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
} as const;
