using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using WordQuest.Data;

namespace WordQuest.Managers
{
    public class LevelManager
    {
        public LevelContainer LevelContainer { get; private set; }
        public List<LevelData> SortedLevels { get; private set; }

        // Pool of simple 3-letter words for fixing duplicates
        private readonly List<string> _simpleWordsPool = new List<string>
        {
            "ДОМ", "ЛЕС", "МИР", "ШАР", "СЫР", "ЛУК", "СОК", "РОГ",
            "БОР", "МЕЧ", "ЩИТ", "ЗУБ", "НОС", "УХО", "РЯД"
        };

        public void LoadLevels(string jsonContent)
        {
            try
            {
                LevelContainer = JsonConvert.DeserializeObject<LevelContainer>(jsonContent);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to parse level data: {ex.Message}");
                LevelContainer = null;
            }

            if (LevelContainer == null || LevelContainer.Levels == null)
            {
                if (LevelContainer == null)
                {
                    Console.WriteLine("Failed to parse level data.");
                }
                else
                {
                    Console.WriteLine("Level data contains no levels.");
                }
                SortedLevels = new List<LevelData>();
                return;
            }

            // Initial list population
            SortedLevels = LevelContainer.Levels.Values.ToList();

            SanitizeLevelData();
        }

        public void SanitizeLevelData()
        {
            if (SortedLevels == null || SortedLevels.Count == 0) return;

            FixDuplicates();
            SortByDifficulty();
        }

        private void FixDuplicates()
        {
            int poolIndex = 0;

            foreach (var level in SortedLevels)
            {
                // Logic: if level < 15 and word == "КОТ", replace it.
                // Note: The original requirement said "levels 1-15 are identical (word 'КОТ')".
                // We check if the level only has "КОТ" as a word to be safe.
                if (level.Id <= 15 && level.Words.Count == 1 && level.Words[0] == "КОТ")
                {
                    if (poolIndex < _simpleWordsPool.Count)
                    {
                        string newWord = _simpleWordsPool[poolIndex];
                        poolIndex++;

                        // 1. Update Words
                        level.Words = new List<string> { newWord };

                        // 2. Update Letters (shuffled or just the word chars)
                        // For simplicity, just the word chars. In a real game, we'd shuffle.
                        level.Letters = newWord.ToCharArray().Select(c => c.ToString()).ToList();

                        // 3. Update Bonus Words (clear them for these simple levels)
                        level.BonusWords = new List<string>();

                        // 4. Rebuild Grid (Simple horizontal placement)
                        RebuildGridForSingleWord(level, newWord);
                    }
                }
            }
        }

        private void RebuildGridForSingleWord(LevelData level, string word)
        {
            // Create a small grid, e.g., 5x5, enough for 3 letters
            int size = 5;
            level.Grid = new List<List<string>>();

            for (int i = 0; i < size; i++)
            {
                var row = new List<string>();
                for (int j = 0; j < size; j++)
                {
                    row.Add(null);
                }
                level.Grid.Add(row);
            }

            // Place word horizontally in the middle row (row 2)
            int startCol = (size - word.Length) / 2;
            int rowIdx = 2;

            for (int i = 0; i < word.Length; i++)
            {
                level.Grid[rowIdx][startCol + i] = word[i].ToString();
            }

            // Update WordPositions
            level.WordPositions = new Dictionary<string, WordPosition>
            {
                {
                    word,
                    new WordPosition
                    {
                        Row = rowIdx,
                        Col = startCol,
                        Direction = "horizontal"
                    }
                }
            };
        }

        private void SortByDifficulty()
        {
            // Sort criteria:
            // 1. Length of the longest word (ascending)
            // 2. Total number of words (ascending)
            // 3. Original ID (to keep stable sort for same difficulty)

            SortedLevels = SortedLevels.OrderBy(l => GetMaxWordLength(l))
                                       .ThenBy(l => l.Words.Count)
                                       .ThenBy(l => l.Id)
                                       .ToList();

            // Re-assign IDs to be sequential
            for (int i = 0; i < SortedLevels.Count; i++)
            {
                SortedLevels[i].Id = i + 1;
            }
        }

        private int GetMaxWordLength(LevelData level)
        {
            if (level.Words == null || level.Words.Count == 0) return 0;
            return level.Words.Max(w => w.Length);
        }
    }
}
