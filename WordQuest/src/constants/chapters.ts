import { ChapterData } from '../types';

export const CHAPTERS: ChapterData[] = [
  {
    id: 1,
    name: 'Родной дом',
    emoji: '🏠',
    narrative: 'Всё начинается здесь — в тишине знакомой комнаты. Что-то зовёт тебя дальше...',
    visualTheme: 'home',
    colorPrimary: '#C8A870',
    colorBg: '#2A1F0E',
    levels: [1,2,3,4,5,6,7,8,9,10],
  },
  {
    id: 2,
    name: 'Лесная тропа',
    emoji: '🌲',
    narrative: 'Тропа уходит в лес. Шёпот листьев — или это что-то другое?',
    visualTheme: 'forest',
    colorPrimary: '#2D5A27',
    colorBg: '#0D1F0A',
    levels: [11,12,13,14,15,16,17,18,19,20],
  },
  {
    id: 3,
    name: 'Речной берег',
    emoji: '🌊',
    narrative: 'Вода несёт отражения и тайны. Что скрывается под поверхностью?',
    visualTheme: 'river',
    colorPrimary: '#1A4A6B',
    colorBg: '#0A1E2D',
    levels: [21,22,23,24,25,26,27,28,29,30],
  },
  {
    id: 4,
    name: 'Осенний сад',
    emoji: '🍂',
    narrative: 'Осень прячет больше чем показывает. Каждый листок — страница.',
    visualTheme: 'autumn',
    colorPrimary: '#B5541B',
    colorBg: '#1E0D05',
    levels: [31,32,33,34,35,36,37,38,39,40],
  },
  {
    id: 5,
    name: 'Ночное поле',
    emoji: '🌙',
    narrative: 'Ночь открывает то, что день прячет. Слушай тишину.',
    visualTheme: 'night',
    colorPrimary: '#2D2060',
    colorBg: '#080515',
    levels: [41,42,43,44,45,46,47,48,49,50],
  },
  {
    id: 6,
    name: 'Старая деревня',
    emoji: '🏡',
    narrative: 'Здесь время идёт иначе. Каждый предмет помнит хозяина.',
    visualTheme: 'village',
    colorPrimary: '#7A5C3A',
    colorBg: '#1A0F05',
    levels: [51,52,53,54,55,56,57,58,59,60],
  },
  {
    id: 7,
    name: 'Горная дорога',
    emoji: '⛰️',
    narrative: 'Путь становится круче. Что ждёт за перевалом?',
    visualTheme: 'mountain',
    colorPrimary: '#4A4A5A',
    colorBg: '#0D0D12',
    levels: [61,62,63,64,65,66,67,68,69,70],
  },
  {
    id: 8,
    name: 'Морской берег',
    emoji: '🌅',
    narrative: 'Маяк светит во тьму. Кому он посылает сигнал?',
    visualTheme: 'sea',
    colorPrimary: '#1A3A6B',
    colorBg: '#05101E',
    levels: [71,72,73,74,75,76,77,78,79,80],
  },
  {
    id: 9,
    name: 'Зимний рассвет',
    emoji: '❄️',
    narrative: 'Мороз хранит тайны лучше любого сейфа. Но след всегда остаётся.',
    visualTheme: 'winter',
    colorPrimary: '#2A3D5C',
    colorBg: '#070D14',
    levels: [81,82,83,84,85,86,87,88,89,90],
  },
  {
    id: 10,
    name: 'Архив тайн',
    emoji: '📚',
    narrative: 'Ты вернулся туда, откуда начал. Теперь ты знаешь ответы. Или нет?',
    visualTheme: 'archive',
    colorPrimary: '#6B4A1A',
    colorBg: '#150D05',
    levels: [91,92,93,94,95,96,97,98,99,100],
  },
];

export function getChapterForLevel(levelId: number): ChapterData {
  return CHAPTERS.find(ch => ch.levels.includes(levelId)) ?? CHAPTERS[0];
}

export function getChapterById(chapterId: number): ChapterData {
  return CHAPTERS.find(ch => ch.id === chapterId) ?? CHAPTERS[0];
}
