#!/usr/bin/env python3
"""
WordQuest Level Generator
Генерирует 100 уровней для 10 глав.
Запуск: python generate_levels.py
Валидация: python generate_levels.py --validate
"""

import json
import random
import argparse
from typing import List, Dict, Tuple, Optional

# ─── ТЕМЫ ГЛАВ ────────────────────────────────────────────────────────────────
# Принцип: тема — это ВИЗУАЛЬНЫЙ АНТУРАЖ.
# Слова берутся из общего словаря русского языка.
# 1–2 "якорных" слова на уровень создают связь с темой.
# Остальные 4–7 слов — общеупотребительные (знает каждый).

CHAPTER_THEMES = {
    1: {
        "name": "Родной дом",
        # Якорные слова — простейший словарь, 3–4 буквы
        "anchor_words": ["ДОМ","КОТ","СТОЛ","СВЕТ","СОН","ОКНО","УЮТ","ЧАЙ","ПОЛ","ПЁС"],
        "anchor_words_medium": ["ТЕПЛО","ПОЛКА","ЛАМПА","КОВЁР","КРЕСЛО"],
        "max_word_length": 5,
    },
    2: {
        "name": "Лесная тропа",
        "anchor_words": ["ЛЕС","ДУБ","ЕЛЬ","МОХ","ВОЛК","ЗАЯЦ","БОР","КОРА","РЫСЬ"],
        "anchor_words_medium": ["СОСНА","ВОРОНА","МАЛИНА","ЛИСТЬЯ","БЕРЁЗА"],
        "max_word_length": 5,
    },
    3: {
        "name": "Речной берег",
        "anchor_words": ["РЕКА","РЫБА","РАК","ЛЕЩ","ТИНА","МЕЛЬ","ВОЛНА","БЕРЕГ","КИТ"],
        "anchor_words_medium": ["ЗАЛИВ","ОМУТ","БРОД","ПРИБОЙ"],
        "max_word_length": 6,
    },
    4: {
        "name": "Осенний сад",
        "anchor_words": ["САД","ЛИСТ","КЛЁН","ГРУША","СЛИВА","ЯГОДА","ОСЕНЬ","ЗАКАТ"],
        "anchor_words_medium": ["ЯБЛОКО","ЛИСТЬЯ","УРОЖАЙ","ВЕТКА"],
        "max_word_length": 6,
    },
    5: {
        "name": "Ночное поле",
        "anchor_words": ["ЛУНА","ТЕНЬ","МРАК","РОСА","НОЧЬ","ТУМАН","ПОЛЕ","ТЬМА"],
        "anchor_words_medium": ["ЗВЕЗДА","СУМРАК","СЕРЕБРО","ПОЛНОЧЬ"],
        "max_word_length": 6,
    },
    6: {
        "name": "Старая деревня",
        "anchor_words": ["ИЗБА","ПЕЧЬ","ДВОР","ПЁС","ГУСЬ","ПОРОГ","ПЛОТ","КРЕСТ"],
        "anchor_words_medium": ["ПЛЕТЕНЬ","ОГОРОД","КОЛОДЕЦ","СОЛОМА"],
        "max_word_length": 7,
    },
    7: {
        "name": "Горная дорога",
        "anchor_words": ["ГОРА","СКАЛА","ТУМАН","ОРЁЛ","ЛЁД","КАМЕНЬ","ВЕТЕР","МГЛА"],
        "anchor_words_medium": ["УЩЕЛЬЕ","ВЕРШИНА","ОБРЫВ","КРЯЖ"],
        "max_word_length": 7,
    },
    8: {
        "name": "Морской берег",
        "anchor_words": ["МОРЕ","МАЯК","КРАБ","ВОЛНА","ПРИБОЙ","СКАЛА","ПЕНА","БУРЯ"],
        "anchor_words_medium": ["ЧАЙКА","ГОРИЗОНТ","БУХТА","ЛАГУНА"],
        "max_word_length": 7,
    },
    9: {
        "name": "Зимний рассвет",
        "anchor_words": ["СНЕГ","ИНЕЙ","МОРОЗ","ЛЁД","МЕТЕЛЬ","ЗИМА","СТУЖА","МГЛА"],
        "anchor_words_medium": ["ВЬЮГА","СУГРОБ","БУРАН","ГОЛОЛЁД"],
        "max_word_length": 7,
    },
    10: {
        "name": "Архив тайн",
        "anchor_words": ["КЛЮЧ","ТАЙНА","СЛЕД","ЗАМОК","СВЕЧА","ШИФР","ОБМАН","ЗАГАДКА"],
        "anchor_words_medium": ["АРХИВ","ТАЙНИК","РАЗГАДКА","РУКОПИСЬ"],
        "max_word_length": 8,
    },
}

# Слова-заполнители — знает КАЖДЫЙ носитель языка.
# Используются во всех главах как дополнение к якорным.
UNIVERSAL_FILLERS = [
    # 3 буквы
    "КОТ","РОТ","НОС","СОН","ЛАД","РАК","СОК","НОЧ","ЛУЧ","БОК","ТОН","ЛУК",
    "РАЗ","МАК","ЧАС","ВОЗ","КОС","ОКО","ЛОБ","ДУБ","ЖУК","МУХ",
    # 4 буквы
    "РОСА","КОРА","СОЛЬ","СТОК","ЛОСЬ","РОСТ","СИЛА","ЛИСТ","НОРА","КРАСА",
    "РУКА","НОТА","ТУЧА","КОСА","СОВА","ЛИСА","ГОРА","МОСТ","БОЛЬ","БЫЛЬ",
    # 5 букв (только для уровней 5–10 главы)
    "ГОЛОС","НОРКА","БЕРЕГ","СТЕКЛ","МЕСТО","СЛОВО","СТОЛБ","КОРМА",
]

# Слова ЗАПРЕЩЕНЫ как основные (редкие, специфичные, неприятные)
FORBIDDEN_WORDS = {
    "ФЕРЗЬ","ПЛИНТУС","НУМИЗМАТ","ГАМБИТ","ФАРАОН","ПАПИРУС",
    "ИЕРОГЛИФ","СФИНКС","РАБ","ВОР","ЯД","КАЛ","ТРУП","ЗЛО",
    "ЭОН","ЭРА","ВИД","ОБЪ","ЪЕЛ",
}


def can_form_from_letters(word: str, letters: List[str]) -> bool:
    """Проверяет можно ли составить слово из данного набора букв."""
    pool = list(letters)
    for char in word:
        if char in pool:
            pool.remove(char)
        else:
            return False
    return True


def score_placement(grid: List[List], word: str, row: int, col: int, direction: str) -> int:
    """Считает количество пересечений с уже размещёнными словами."""
    score = 0
    for i, letter in enumerate(word):
        r = row + (i if direction == 'vertical' else 0)
        c = col + (i if direction == 'horizontal' else 0)
        if 0 <= r < len(grid) and 0 <= c < len(grid[0]):
            if grid[r][c] == letter:
                score += 2  # пересечение — высокий приоритет
            elif grid[r][c] is None:
                score += 0  # пустая клетка — нейтрально
            else:
                return -999  # конфликт — запрещаем
    return score


def can_place(grid: List[List], word: str, row: int, col: int, direction: str) -> bool:
    """Проверяет можно ли разместить слово без конфликтов."""
    rows, cols = len(grid), len(grid[0])
    length = len(word)

    # Проверяем границы
    if direction == 'horizontal':
        if col + length > cols: return False
    else:
        if row + length > rows: return False

    # Проверяем клетки ДО слова (не должно быть букв)
    if direction == 'horizontal':
        if col > 0 and grid[row][col-1] is not None: return False
        if col + length < cols and grid[row][col+length] is not None: return False
    else:
        if row > 0 and grid[row-1][col] is not None: return False
        if row + length < rows and grid[row+length][col] is not None: return False

    # Проверяем каждую клетку
    for i, letter in enumerate(word):
        r = row + (i if direction == 'vertical' else 0)
        c = col + (i if direction == 'horizontal' else 0)
        cell = grid[r][c]

        if cell is not None and cell != letter:
            return False  # конфликт букв

        # Проверяем боковые клетки (не должно быть чужих букв рядом)
        if cell is None:  # только для новых клеток
            if direction == 'horizontal':
                if r > 0 and grid[r-1][c] is not None: return False
                if r < rows-1 and grid[r+1][c] is not None: return False
            else:
                if c > 0 and grid[r][c-1] is not None: return False
                if c < cols-1 and grid[r][c+1] is not None: return False

    return True


def find_best_placement(
    grid: List[List], word: str
) -> Optional[Tuple[int, int, str]]:
    """Находит лучшее место для слова (максимум пересечений)."""
    rows, cols = len(grid), len(grid[0])
    candidates = []

    for direction in ['horizontal', 'vertical']:
        for row in range(rows):
            for col in range(cols):
                if can_place(grid, word, row, col, direction):
                    score = score_placement(grid, word, row, col, direction)
                    if score >= 0:
                        candidates.append((score, row, col, direction))

    if not candidates:
        return None

    candidates.sort(key=lambda x: -x[0])
    _, row, col, direction = candidates[0]
    return row, col, direction


def place_word(grid: List[List], word: str, row: int, col: int, direction: str):
    for i, letter in enumerate(word):
        r = row + (i if direction == 'vertical' else 0)
        c = col + (i if direction == 'horizontal' else 0)
        grid[r][c] = letter


def build_crossword(words: List[str]) -> Optional[Dict]:
    """Строит кроссворд из списка слов. Возвращает grid и wordPositions."""
    GRID_SIZE = 12  # достаточно для любого набора слов
    grid = [[None] * GRID_SIZE for _ in range(GRID_SIZE)]
    word_positions = {}

    sorted_words = sorted(words, key=len, reverse=True)

    for idx, word in enumerate(sorted_words):
        if idx == 0:
            # Первое слово — по центру горизонтально
            row = GRID_SIZE // 2
            col = (GRID_SIZE - len(word)) // 2
            place_word(grid, word, row, col, 'horizontal')
            word_positions[word] = {'row': row, 'col': col, 'direction': 'horizontal'}
        else:
            result = find_best_placement(grid, word)
            if result is None:
                return None  # не удалось разместить — попробуем другой набор
            row, col, direction = result
            place_word(grid, word, row, col, direction)
            word_positions[word] = {'row': row, 'col': col, 'direction': direction}

    # Обрезаем пустые строки/столбцы
    grid, word_positions = trim_grid(grid, word_positions)

    return {'grid': grid, 'wordPositions': word_positions}


def trim_grid(grid, word_positions):
    """Убирает пустые строки и столбцы по краям."""
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0

    min_r = next((r for r in range(rows) if any(grid[r][c] for c in range(cols))), 0)
    max_r = next((r for r in range(rows-1, -1, -1) if any(grid[r][c] for c in range(cols))), rows-1)
    min_c = next((c for c in range(cols) if any(grid[r][c] for r in range(rows))), 0)
    max_c = next((c for c in range(cols-1, -1, -1) if any(grid[r][c] for r in range(rows))), cols-1)

    new_grid = [row[min_c:max_c+1] for row in grid[min_r:max_r+1]]

    new_positions = {}
    for word, pos in word_positions.items():
        new_positions[word] = {
            'row': pos['row'] - min_r,
            'col': pos['col'] - min_c,
            'direction': pos['direction'],
        }

    return new_grid, new_positions


def estimate_difficulty(words: List[str]) -> float:
    if not words: return 1.0
    avg_len = sum(len(w) for w in words) / len(words)
    unique_letters = len(set(''.join(words)))
    word_count = len(words)
    return round(avg_len * 0.4 + unique_letters * 0.3 + word_count * 0.3, 2)


def estimate_time(words: List[str]) -> int:
    """Примерное время прохождения в секундах."""
    base = sum(len(w) * 4 for w in words)
    return max(30, min(360, base))


def generate_level(
    chapter_id: int,
    level_number_in_chapter: int,  # 1–10
    dictionary: List[str],
) -> Optional[Dict]:
    """
    Генерирует один уровень.
    level_number_in_chapter: 1 = самый лёгкий, 10 = самый сложный.
    """
    theme = CHAPTER_THEMES[chapter_id]
    progress = level_number_in_chapter / 10.0  # 0.1–1.0

    # Определяем параметры сложности
    if level_number_in_chapter <= 3:
        target_word_count = random.randint(4, 5)
        max_word_len = 4
        anchor_pool = theme["anchor_words"]
    elif level_number_in_chapter <= 7:
        target_word_count = random.randint(5, 7)
        max_word_len = 5
        anchor_pool = theme["anchor_words"] + theme["anchor_words_medium"]
    else:
        target_word_count = random.randint(6, 9)
        max_word_len = theme["max_word_length"]
        anchor_pool = theme["anchor_words_medium"] + theme["anchor_words"]

    # Фильтруем словарь
    valid_words = [
        w for w in dictionary
        if 3 <= len(w) <= max_word_len
        and w not in FORBIDDEN_WORDS
        and w.isalpha()
    ]

    # Пробуем несколько якорных слов как "зерно" для набора букв
    random.shuffle(anchor_pool)

    for anchor in anchor_pool:
        if len(anchor) > max_word_len:
            continue

        # Создаём набор букв вокруг якорного слова
        base_letters = list(anchor)
        # Добавляем дополнительные частые буквы
        extra_count = 1 + int(progress * 2)
        common = list("АЕИОУРСТНЛКМПГДБВФХ")
        random.shuffle(common)
        all_letters = base_letters + common[:extra_count]

        # Находим все слова из словаря составимые из этих букв
        possible = [
            w for w in valid_words
            if can_form_from_letters(w, all_letters)
        ]

        if len(possible) < target_word_count:
            continue  # мало слов — пробуем другой якорь

        # Берём якорное слово + дополнительные
        main_words = [anchor] if anchor in possible else []
        fillers = [w for w in possible if w != anchor]
        random.shuffle(fillers)

        # Дополняем до target_word_count
        needed = target_word_count - len(main_words)
        main_words += fillers[:needed]

        if len(main_words) < 4:
            continue

        # Строим кроссворд
        result = build_crossword(main_words)
        if result is None:
            continue

        grid = result['grid']
        bonus_words = [w for w in possible if w not in main_words]

        level_id = (chapter_id - 1) * 10 + level_number_in_chapter

        return {
            'id': level_id,
            'chapter': chapter_id,
            'letters': all_letters,
            'words': main_words,
            'grid': grid,
            'wordPositions': result['wordPositions'],
            'gridRows': len(grid),
            'gridCols': len(grid[0]) if grid else 0,
            'bonusWords': bonus_words[:20],  # не больше 20 бонусных
            'estimatedTimeSeconds': estimate_time(main_words),
            'difficultyScore': estimate_difficulty(main_words),
            'anchorWord': anchor,
        }

    return None  # не удалось сгенерировать


def load_dictionary(path: str) -> List[str]:
    """
    Загружает словарь из файла.
    Ожидается: одно слово на строку, все заглавными.
    Фильтр: только существительные 3–9 букв, только кириллица.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            words = [
                line.strip().upper()
                for line in f
                if line.strip()
            ]
        # Фильтруем
        words = [
            w for w in words
            if 3 <= len(w) <= 9
            and w.isalpha()
            and all(c in 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' for c in w)
            and w not in FORBIDDEN_WORDS
        ]
        print(f"Словарь загружен: {len(words)} слов")
        return words
    except FileNotFoundError:
        print("ОШИБКА: dictionary.txt не найден!")
        print("Скачайте словарь: https://github.com/danakt/russian-words/raw/master/russian.txt")
        print("Сохраните как assets/dictionary.txt")
        return []


def validate_levels(levels: List[Dict]) -> bool:
    """Проверяет корректность всех уровней."""
    errors = 0
    for lvl in levels:
        lid = lvl['id']
        # Все слова должны составляться из букв уровня
        for word in lvl['words']:
            if not can_form_from_letters(word, lvl['letters']):
                print(f"ОШИБКА уровень {lid}: слово {word} нельзя составить из {lvl['letters']}")
                errors += 1
        # Должно быть минимум 4 слова
        if len(lvl['words']) < 4:
            print(f"ОШИБКА уровень {lid}: только {len(lvl['words'])} слов (минимум 4)")
            errors += 1
        # Кроссворд должен существовать
        if not lvl.get('grid') or not lvl.get('wordPositions'):
            print(f"ОШИБКА уровень {lid}: нет кроссворда")
            errors += 1

    if errors == 0:
        print(f"✅ Валидация пройдена: {len(levels)} уровней, 0 ошибок")
    else:
        print(f"❌ Найдено {errors} ошибок")
    return errors == 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--validate', action='store_true', help='Только валидация')
    parser.add_argument('--dict', default='assets/dictionary.txt', help='Путь к словарю')
    parser.add_argument('--output', default='assets/levels.json', help='Выходной файл')
    args = parser.parse_args()

    dictionary = load_dictionary(args.dict)
    if not dictionary:
        return

    if args.validate:
        try:
            with open(args.output, 'r', encoding='utf-8') as f:
                data = json.load(f)
            validate_levels(data['levels'])
        except FileNotFoundError:
            print(f"Файл {args.output} не найден. Сначала сгенерируйте уровни.")
        return

    # Генерация
    print("Генерация уровней...")
    levels = []

    for chapter_id in range(1, 11):
        chapter_name = CHAPTER_THEMES[chapter_id]['name']
        print(f"\nГлава {chapter_id}: {chapter_name}")

        chapter_levels = []
        for level_in_chapter in range(1, 11):
            level = None
            attempts = 0
            while level is None and attempts < 50:
                level = generate_level(chapter_id, level_in_chapter, dictionary)
                attempts += 1

            if level:
                chapter_levels.append(level)
                print(f"  Уровень {level['id']}: {len(level['words'])} слов, "
                      f"сложность {level['difficultyScore']}")
            else:
                print(f"  ⚠️  Уровень {(chapter_id-1)*10+level_in_chapter}: не удалось сгенерировать")

        # Сортируем уровни главы по сложности (нарастающая)
        chapter_levels.sort(key=lambda l: l['difficultyScore'])
        # Переназначаем id после сортировки
        for i, lvl in enumerate(chapter_levels):
            lvl['id'] = (chapter_id - 1) * 10 + i + 1

        levels.extend(chapter_levels)

    # Сохраняем
    output = {
        'levels': levels,
        'dictionary': dictionary[:5000],  # первые 5000 слов для проверки бонусов
        'generated_at': __import__('datetime').datetime.now().isoformat(),
        'total_levels': len(levels),
    }

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Сохранено {len(levels)} уровней в {args.output}")
    validate_levels(levels)


if __name__ == '__main__':
    main()
