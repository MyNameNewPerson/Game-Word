#!/usr/bin/env python3
"""
WordQuest Level Generator v2.0
Генерирует готовый levels.json для игры.

Использование:
  python generate_levels.py                         # 100 уровней
  python generate_levels.py --count 50              # 50 уровней
  python generate_levels.py --dict my_dict.txt      # свой словарь
  python generate_levels.py --validate              # только валидация

Требования: Python 3.8+, без внешних зависимостей
"""

import json
import random
import argparse
import sys
from itertools import permutations
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Set

# ============================================================
# КОНФИГУРАЦИЯ СЛОЖНОСТИ
# ============================================================
DIFFICULTY_CONFIG = {
    1: {
        "letter_count_range": (3, 3),
        "word_count_range":   (1, 5),
        "min_word_length":    2,
        "max_word_length":    4,
        "max_grid_rows":      5,
        "max_grid_cols":      5,
        "estimated_time":     (45, 90),
    },
    2: {
        "letter_count_range": (4, 5),
        "word_count_range":   (3, 6),
        "min_word_length":    3,
        "max_word_length":    6,
        "max_grid_rows":      7,
        "max_grid_cols":      7,
        "estimated_time":     (90, 180),
    },
    3: {
        "letter_count_range": (6, 7),
        "word_count_range":   (5, 10),
        "min_word_length":    3,
        "max_word_length":    8,
        "max_grid_rows":      10,
        "max_grid_cols":      9,
        "estimated_time":     (150, 300),
    },
}

# Кривая сложности по уровням
def get_difficulty(level_num: int) -> int:
    if level_num <= 15: return 1
    if level_num <= 55: return 2
    return 3

# Главы и темы (10 уровней на главу)
CHAPTERS = [
    (1,  "Пролог: Пыльный Архив",    "archive",    "#D4AF37"),
    (2,  "Египетские Пески",          "egypt",      "#C4A35A"),
    (3,  "Затонувший Город",          "underwater", "#40A0D0"),
    (4,  "Ледяные Руины",             "ice",        "#80D0FF"),
    (5,  "Лесной Лабиринт",           "forest",     "#2ECC71"),
    (6,  "Небесная Крепость",         "sky",        "#9B59B6"),
    (7,  "Подземный Храм",            "temple",     "#E67E22"),
    (8,  "Вулканический Остров",      "volcano",    "#E74C3C"),
    (9,  "Хрустальные Пещеры",        "crystal",    "#00BCD4"),
    (10, "Финал: Сердце Тайны",       "finale",     "#FFD700"),
]

STORY_ENTRIES = [
    "Среди пыльных полок архива я нашёл странный дневник. Страницы покрыты символами — слова, что открывают древние тайны. Кто оставил его здесь?",
    "Дневник привёл меня в пустыню. Под раскалённым песком — руины храма. Жрецы хранили секреты в словах: каждый символ был замком, каждое слово — ключом.",
    "Я нырнул в тёмные воды. Затонувший город встретил меня тишиной. На стенах — надписи на языке, которого нет ни в одной книге. Но я учусь читать его.",
    "Лёд здесь не тает тысячелетиями. Внутри ледяных глыб — замёрзшие слова древних мореплавателей. Каждое слово — история жизни и смерти.",
    "Лес живой. Деревья шепчут слова на языке, который я начинаю понимать. Дорога разветвляется — правильный путь указывают только те, кто знает слова.",
    "С высоты облаков мир выглядит иначе. Крепость держится не на камне — на словах. Стражи проверяют каждого: знаешь слово — проходи. Не знаешь — падаешь.",
    "Храм уходит на километры вниз. На каждом уровне — испытание словами. Древний жрец сказал: 'Язык — это не инструмент общения. Это оружие и защита.'",
    "Вулкан молчит уже сотни лет. Местные говорят — он ждёт, когда кто-то произнесёт правильное слово. Я изучаю надписи на лаве. Время почти вышло.",
    "Кристаллы поют. Каждый издаёт звук при прикосновении — и это звуки слов. Пещера — огромный музыкальный инструмент, построенный из языка.",
    "Я дошёл до центра. Здесь хранится то, что искали все: не артефакт и не сокровище. Само Слово. То, что стоит в начале всех языков. Я готов его прочесть.",
]

# ============================================================
# ЗАГРУЗКА СЛОВАРЯ
# ============================================================
def load_dictionary(path: str) -> Set[str]:
    """Загружает словарь и возвращает множество слов в верхнем регистре."""
    words = set()
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip().upper()
                # Фильтр: только кириллица, длина 2–10, без дефисов и пробелов
                if (2 <= len(word) <= 10 and
                    word.isalpha() and
                    all('А' <= c <= 'Я' or c == 'Ё' for c in word)):
                    words.add(word)
    except FileNotFoundError:
        print(f"⚠ Словарь {path} не найден. Используется встроенный демо-словарь.")
        words = get_demo_dictionary()
    print(f"  Загружено {len(words)} слов из словаря")
    return words

def get_demo_dictionary() -> Set[str]:
    """Встроенный минимальный словарь для демо (если dictionary.txt не найден)."""
    return {
        "КОТ","КОР","КОК","РОТ","ТОК","РОК","ТОР","ОРТ","КРОТ","КОРТ","ТОРС",
        "СТОЛ","СЛОН","НОРА","РОСА","СОРА","РАСА","КОРА","АРКА","РУКА","КАРА",
        "БАНЯ","БАНК","БАНТ","БРАНД","БАНДА","ЛИСТ","СИЛТ","ТИЛЬ","ЛОСК","СОЛЬ",
        "СОЛЬ","ПОЛЕ","ПОРА","ОПОР","ПОРТ","РЕПО","ПЕРО","РОСТ","РОСТОК","СТОК",
        "ВОЛК","ВOLK","ЛОВКО","ЛОКО","ЛОКОН","КЛОН","НОЛЬ","НОЛЬМЕР","ДОЛЯ",
        "СИЛА","ЛИСТ","СЛИТ","КЛИН","ЛИМОН","МЫЛО","МЫТЬ","МОЛЬ","МОЛЛЮСК",
        "НИТЬ","НОЧЬ","НОЯБРЬ","ПАРК","ПАРА","МАРТ","МАРКА","ТЬМА","ДАМА","ДАМ",
        "МОРЕ","МОРЖ","МОРОЗ","РОЛЬ","РОЯЛЬ","ПОЛЯНА","ЯБЛОК","ЯБЛОНЯ","ЯЗЫК",
        "СЛОВО","СОВА","ВОДА","ВДОВА","ДВОРИК","ДИВНЫЙ","ДИВАН","ВИНА","ВИНО",
        "НОГА","ГОРН","ГОРА","ГОРОД","ДОРОГА","РОГАЛЬ","РОГАН","ДОГА","ГОДА",
        "РЕКА","РЕКОРД","ОРЁЛ","ОРЕХ","ОРЕШНИК","ЕХАТЬ","ЕДА","ЕДА","ЕЗДОК",
    }

# ============================================================
# ПОИСК СЛОВ ИЗ НАБОРА БУКВ
# ============================================================
def find_words_from_letters(letters: List[str], dictionary: Set[str],
                             min_len: int, max_len: int) -> Tuple[List[str], List[str]]:
    """
    Возвращает (crossword_words, bonus_words).
    Crossword words: длиннее, приоритет для сетки.
    Bonus words: короткие или лишние.
    """
    found = set()
    for length in range(min_len, min(len(letters), max_len) + 1):
        for perm in set(permutations(letters, length)):
            word = ''.join(perm)
            if word in dictionary:
                found.add(word)

    found_list = sorted(found, key=lambda w: (-len(w), w))

    # Разделяем: длинные → в кроссворд, остальные → бонусные
    crossword = [w for w in found_list if len(w) >= 3]
    bonus = [w for w in found_list if len(w) < 3]  # (на практике не попадут из-за фильтра)

    return crossword, []  # Bonus будут определены после выбора основных слов

# ============================================================
# АЛГОРИТМ РАЗМЕЩЕНИЯ СЛОВ НА СЕТКЕ
# ============================================================
VIRTUAL_GRID = 30  # Размер виртуальной сетки

def try_place_words(words: List[str]) -> Tuple[Optional[List[List]], Dict]:
    """
    Пытается разместить слова на сетке кроссворда.
    Возвращает (grid, word_positions) или (None, {}) при неудаче.

    Алгоритм:
    1. Первое слово — горизонтально в центре
    2. Каждое следующее: ищем все возможные пересечения с уже размещенными
    3. Выбираем пересечение с максимальным кол-вом общих букв (жадный алгоритм)
    4. Если пересечений нет — слово пропускается (станет бонусным)
    """
    if not words:
        return None, {}

    grid = [[None] * VIRTUAL_GRID for _ in range(VIRTUAL_GRID)]
    positions = {}  # word -> {row, col, direction}
    offset = VIRTUAL_GRID // 2

    def can_place(word, row, col, direction):
        """Проверяет, можно ли разместить слово без конфликтов."""
        dr = 1 if direction == 'vertical' else 0
        dc = 1 if direction == 'horizontal' else 0
        for i, char in enumerate(word):
            r, c = row + dr * i, col + dc * i
            if not (0 <= r < VIRTUAL_GRID and 0 <= c < VIRTUAL_GRID):
                return False
            cell = grid[r][c]
            if cell is not None and cell != char:
                return False
            # Проверяем соседние клетки на "прилипание" параллельных слов
            if cell is None:
                # Соседи перпендикулярно направлению
                for nr, nc in [(r - dc, c - dr), (r + dc, c + dr)]:
                    if 0 <= nr < VIRTUAL_GRID and 0 <= nc < VIRTUAL_GRID:
                        if grid[nr][nc] is not None:
                            return False
        # Проверяем края слова (клетки до и после)
        r_before = row - dr
        c_before = col - dc
        r_after  = row + dr * len(word)
        c_after  = col + dc * len(word)
        if (0 <= r_before < VIRTUAL_GRID and 0 <= c_before < VIRTUAL_GRID
                and grid[r_before][c_before] is not None):
            return False
        if (0 <= r_after < VIRTUAL_GRID and 0 <= c_after < VIRTUAL_GRID
                and grid[r_after][c_after] is not None):
            return False
        return True

    def place(word, row, col, direction):
        dr = 1 if direction == 'vertical' else 0
        dc = 1 if direction == 'horizontal' else 0
        for i, char in enumerate(word):
            grid[row + dr * i][col + dc * i] = char
        positions[word] = {'row': row, 'col': col, 'direction': direction}

    # Первое слово — горизонтально в центре
    first = words[0]
    start_col = offset - len(first) // 2
    place(first, offset, start_col, 'horizontal')

    placed_words = [first]
    skipped = []

    for word in words[1:]:
        best = None
        best_intersections = 0

        for placed in placed_words:
            ppos = positions[placed]
            pdir = ppos['direction']
            # Пробуем перпендикулярное направление
            new_dir = 'vertical' if pdir == 'horizontal' else 'horizontal'
            dr_p = 1 if pdir == 'vertical' else 0
            dc_p = 1 if pdir == 'horizontal' else 0
            dr_n = 1 if new_dir == 'vertical' else 0
            dc_n = 1 if new_dir == 'horizontal' else 0

            for pi, pc in enumerate(placed):
                for wi, wc in enumerate(word):
                    if pc != wc:
                        continue
                    # Позиция нового слова
                    new_row = ppos['row'] + dr_p * pi - dr_n * wi
                    new_col = ppos['col'] + dc_p * pi - dc_n * wi

                    if can_place(word, new_row, new_col, new_dir):
                        # Считаем пересечения
                        intersections = sum(
                            1 for k, ch in enumerate(word)
                            if grid[new_row + dr_n * k][new_col + dc_n * k] == ch
                        )
                        if intersections > best_intersections:
                            best_intersections = intersections
                            best = (new_row, new_col, new_dir)

        if best and best_intersections > 0:
            place(word, *best)
            placed_words.append(word)
        else:
            skipped.append(word)

    if len(placed_words) < 3:
        return None, {}

    # Обрезаем до минимального прямоугольника + отступ 1
    rows_used = [r for r in range(VIRTUAL_GRID)
                 if any(grid[r][c] is not None for c in range(VIRTUAL_GRID))]
    cols_used = [c for c in range(VIRTUAL_GRID)
                 if any(grid[r][c] is not None for r in range(VIRTUAL_GRID))]

    min_r = max(0, min(rows_used) - 1)
    max_r = min(VIRTUAL_GRID - 1, max(rows_used) + 1)
    min_c = max(0, min(cols_used) - 1)
    max_c = min(VIRTUAL_GRID - 1, max(cols_used) + 1)

    trimmed = [[grid[r][c] for c in range(min_c, max_c + 1)]
               for r in range(min_r, max_r + 1)]

    # Корректируем позиции
    for w in positions:
        positions[w]['row'] -= min_r
        positions[w]['col'] -= min_c

    # Убираем пропущенные слова из positions (они теперь бонусные)
    for s in skipped:
        if s in positions:
            del positions[s]

    return trimmed, positions

# ============================================================
# ГЕНЕРАЦИЯ ОДНОГО УРОВНЯ
# ============================================================
COMMON_RU_LETTERS = list("АААААЕЕЕЕЕЕИИИООООООУУУЫББВВВГДДДЖЗЙКККЛЛЛЛМММНННННППРРРРРСССССТТТТТФФХЦЧШЩ")

def generate_one_level(level_id: int, difficulty: int,
                        chapter: int, dictionary: Set[str]) -> Optional[Dict]:
    """
    Генерирует один уровень. Пробует до 100 раз.
    Возвращает dict с данными уровня или None при неудаче.
    """
    config = DIFFICULTY_CONFIG[difficulty]
    min_letters, max_letters = config['letter_count_range']
    min_words, max_words = config['word_count_range']
    min_wlen, max_wlen = config['min_word_length'], config['max_word_length']
    max_rows, max_cols = config['max_grid_rows'], config['max_grid_cols']
    min_time, max_time = config['estimated_time']

    for attempt in range(100):
        # Выбираем случайный набор букв.
        # Для гарантии наличия слов, выбираем "базовое слово" из словаря подходящей длины.
        candidates = [w for w in dictionary if min_letters <= len(w) <= max_letters]

        if candidates and random.random() < 0.9: # 90% chance to use smart generation
            base_word = random.choice(candidates)
            letters = list(base_word)
            # Если букв меньше максимума, можно добавить случайные, но осторожно
            if len(letters) < max_letters and random.random() < 0.3:
                letters.append(random.choice(COMMON_RU_LETTERS))
        else:
            # Fallback (или для разнообразия)
            n = random.randint(min_letters, max_letters)
            letters = random.choices(COMMON_RU_LETTERS, k=n)

        letters = list(set(letters))  # Уникальные буквы (иначе тривиально)
        if len(letters) < 3:
            continue

        # Ищем слова
        all_words_found = set()
        for length in range(min_wlen, min(len(letters), max_wlen) + 1):
            for perm in set(permutations(letters, length)):
                word = ''.join(perm)
                if word in dictionary:
                    all_words_found.add(word)

        if len(all_words_found) < min_words:
            # print(f"  Attempt failed: found {len(all_words_found)} words, need {min_words} (letters: {letters})")
            continue

        # Сортируем: длинные слова — в кроссворд
        all_sorted = sorted(all_words_found, key=lambda w: (-len(w), w))

        # Берём кандидатов для кроссворда
        crossword_candidates = all_sorted[:max_words + 5]

        # Пробуем разместить на сетке
        grid, word_positions = try_place_words(crossword_candidates)
        if grid is None:
            continue

        # Проверяем размер сетки
        rows, cols = len(grid), len(grid[0]) if grid else 0
        if rows > max_rows or cols > max_cols:
            continue

        # Слова, которые попали в сетку
        placed_words = list(word_positions.keys())
        if len(placed_words) < min_words:
            continue

        # Оставшиеся становятся бонусными
        bonus_words = [w for w in all_sorted if w not in placed_words][:10]

        chapter_data = CHAPTERS[min(chapter - 1, len(CHAPTERS) - 1)]
        story_text = STORY_ENTRIES[min(chapter - 1, len(STORY_ENTRIES) - 1)]

        return {
            "id": level_id,
            "chapter": chapter,
            "chapterName": chapter_data[1],
            "chapterTheme": {
                "background": chapter_data[2],
                "accentColor": chapter_data[3],
                "storyEntry": {
                    "chapter": chapter,
                    "title": f"Запись №{chapter}",
                    "text": story_text,
                    "unlockCondition": "complete_chapter"
                }
            },
            "letters": letters,
            "words": placed_words,
            "bonusWords": bonus_words,
            "grid": grid,
            "wordPositions": word_positions,
            "difficulty": difficulty,
            "estimatedTimeSeconds": random.randint(min_time, max_time),
        }

    return None  # Не удалось за 100 попыток

# ============================================================
# ВАЛИДАТОР
# ============================================================
def validate_level(level: Dict) -> List[str]:
    """Возвращает список ошибок. Пустой список = уровень валиден."""
    errors = []
    grid = level.get('grid', [])
    words = level.get('words', [])
    positions = level.get('wordPositions', {})
    letters = level.get('letters', [])

    if not words:
        errors.append("Нет слов в кроссворде")
    if not grid or not grid[0]:
        errors.append("Пустая сетка")
    if len(letters) < 3:
        errors.append("Слишком мало букв")

    # Проверяем что все слова из кроссворда реально в сетке
    for word in words:
        if word not in positions:
            errors.append(f"Слово {word} нет в wordPositions")
            continue
        pos = positions[word]
        row, col, direction = pos['row'], pos['col'], pos['direction']
        for i, char in enumerate(word):
            r = row + (i if direction == 'vertical' else 0)
            c = col + (i if direction == 'horizontal' else 0)
            if r >= len(grid) or c >= len(grid[0]):
                errors.append(f"Слово {word} выходит за пределы сетки")
                break
            if grid[r][c] != char:
                errors.append(f"Слово {word} не совпадает с сеткой на позиции [{r}][{c}]")
                break

    return errors

# ============================================================
# ОСНОВНАЯ ФУНКЦИЯ
# ============================================================
def generate_all(count: int, dictionary: Set[str]) -> Dict:
    output = {
        "meta": {
            "version": "1.0",
            "totalLevels": 0,
            "language": "ru",
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        },
        "levels": {}
    }

    success = 0
    failed = 0

    for i in range(1, count + 1):
        chapter = ((i - 1) // 10) + 1
        difficulty = get_difficulty(i)

        print(f"  Генерация уровня {i:3d} / {count} (глава {chapter}, сложность {difficulty})...", end="")
        level = generate_one_level(i, difficulty, chapter, dictionary)

        if not level:
            # Fallback: copy previous level or find any valid level
            print(f" (не удалось, используем копию) ", end="")

            if i == 1:
                # HARDCODED LEVEL 1 Fallback
                level = {
                    "id": 1,
                    "chapter": 1,
                    "chapterName": CHAPTERS[0][1],
                    "chapterTheme": {
                        "background": CHAPTERS[0][2],
                        "accentColor": CHAPTERS[0][3],
                        "storyEntry": {
                            "chapter": 1,
                            "title": "Запись №1",
                            "text": STORY_ENTRIES[0],
                            "unlockCondition": "complete_chapter"
                        }
                    },
                    "letters": ["К", "О", "Т"],
                    "words": ["КОТ"],
                    "bonusWords": ["ТОК"],
                    "grid": [[None, "К", "О", "Т", None]],
                    "wordPositions": {"КОТ": {"row": 0, "col": 1, "direction": "horizontal"}},
                    "difficulty": 1,
                    "estimatedTimeSeconds": 30
                }

            elif f"level_{i-1}" in output["levels"]:
                import copy
                level = copy.deepcopy(output["levels"][f"level_{i-1}"])
                level["id"] = i
                level["chapter"] = chapter
                # Update chapter info
                chapter_data = CHAPTERS[min(chapter - 1, len(CHAPTERS) - 1)]
                level["chapterName"] = chapter_data[1]
                level["chapterTheme"] = {
                    "background": chapter_data[2],
                    "accentColor": chapter_data[3],
                    "storyEntry": {
                        "chapter": chapter,
                        "title": f"Запись №{chapter}",
                        "text": STORY_ENTRIES[min(chapter - 1, len(STORY_ENTRIES) - 1)],
                        "unlockCondition": "complete_chapter"
                    }
                }

        if level:
            # Валидация
            errors = validate_level(level)
            if errors:
                print(f" ✗ ОШИБКИ ВАЛИДАЦИИ: {errors}")
                failed += 1
            else:
                output["levels"][f"level_{i}"] = level
                print(f" ✓ ({len(level['words'])} слов, {len(level['grid'])}×{len(level['grid'][0])} сетка)")
                success += 1
        else:
            print(f" ✗ ФАТАЛЬНО: Не удалось сгенерировать")
            failed += 1

    output["meta"]["totalLevels"] = success
    print(f"\n  Итого: {success} успешно, {failed} неудач")
    return output

def main():
    parser = argparse.ArgumentParser(description='WordQuest Level Generator')
    parser.add_argument('--count',    type=int, default=100,              help='Количество уровней')
    parser.add_argument('--dict',     type=str, default='dictionary.txt', help='Путь к словарю')
    parser.add_argument('--out',      type=str, default='../assets/levels.json', help='Выходной файл')
    parser.add_argument('--validate', action='store_true',                 help='Только валидация existing JSON')
    args = parser.parse_args()

    if args.validate:
        print("Валидация levels.json...")
        with open(args.out, 'r', encoding='utf-8') as f:
            data = json.load(f)
        all_ok = True
        for key, level in data['levels'].items():
            errors = validate_level(level)
            if errors:
                print(f"  ✗ {key}: {errors}")
                all_ok = False
        print("✓ Все уровни валидны" if all_ok else "✗ Найдены ошибки")
        return

    print("=" * 50)
    print("WordQuest Level Generator v2.0")
    print("=" * 50)
    print(f"\nНастройки: {args.count} уровней, словарь: {args.dict}")
    print(f"Выходной файл: {args.out}\n")

    print("Загрузка словаря...")
    dictionary = load_dictionary(args.dict)

    print(f"\nГенерация {args.count} уровней:")
    data = generate_all(args.count, dictionary)

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Готово! Сохранено в {args.out}")
    print(f"  Размер файла: {len(json.dumps(data)) / 1024:.1f} KB")

if __name__ == '__main__':
    main()
