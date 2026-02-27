using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace WordQuest.Data
{
    [Serializable]
    public class LevelContainer
    {
        [JsonProperty("meta")]
        public MetaData Meta { get; set; }

        [JsonProperty("levels")]
        public Dictionary<string, LevelData> Levels { get; set; }
    }

    [Serializable]
    public class MetaData
    {
        [JsonProperty("version")]
        public string Version { get; set; }

        [JsonProperty("totalLevels")]
        public int TotalLevels { get; set; }

        [JsonProperty("language")]
        public string Language { get; set; }

        [JsonProperty("generatedAt")]
        public string GeneratedAt { get; set; }
    }

    [Serializable]
    public class LevelData
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("chapter")]
        public int Chapter { get; set; }

        [JsonProperty("chapterName")]
        public string ChapterName { get; set; }

        [JsonProperty("chapterTheme")]
        public ChapterTheme ChapterTheme { get; set; }

        [JsonProperty("letters")]
        public List<string> Letters { get; set; }

        [JsonProperty("words")]
        public List<string> Words { get; set; }

        [JsonProperty("bonusWords")]
        public List<string> BonusWords { get; set; }

        [JsonProperty("grid")]
        public List<List<string>> Grid { get; set; }

        [JsonProperty("wordPositions")]
        public Dictionary<string, WordPosition> WordPositions { get; set; }

        [JsonProperty("difficulty")]
        public int Difficulty { get; set; }

        [JsonProperty("estimatedTimeSeconds")]
        public int EstimatedTimeSeconds { get; set; }
    }

    [Serializable]
    public class ChapterTheme
    {
        [JsonProperty("background")]
        public string Background { get; set; }

        [JsonProperty("accentColor")]
        public string AccentColor { get; set; }

        [JsonProperty("storyEntry")]
        public StoryEntry StoryEntry { get; set; }
    }

    [Serializable]
    public class StoryEntry
    {
        [JsonProperty("chapter")]
        public int Chapter { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("unlockCondition")]
        public string UnlockCondition { get; set; }
    }

    [Serializable]
    public class WordPosition
    {
        [JsonProperty("row")]
        public int Row { get; set; }

        [JsonProperty("col")]
        public int Col { get; set; }

        [JsonProperty("direction")]
        public string Direction { get; set; } // "horizontal" or "vertical"
    }
}
