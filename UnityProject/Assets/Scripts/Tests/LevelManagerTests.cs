using NUnit.Framework;
using WordQuest.Managers;
using WordQuest.Data;
using System;
using System.Collections.Generic;

namespace WordQuest.Tests
{
    [TestFixture]
    public class LevelManagerTests
    {
        private LevelManager _levelManager;

        [SetUp]
        public void SetUp()
        {
            _levelManager = new LevelManager();
        }

        [Test]
        public void LoadLevels_WithNullInput_DoesNotThrowAndSetsLevelContainerToNull()
        {
            Assert.DoesNotThrow(() => _levelManager.LoadLevels(null));
            Assert.IsNull(_levelManager.LevelContainer);
        }

        [Test]
        public void LoadLevels_WithEmptyObject_DoesNotThrowAndSetsLevelContainerToNonNull()
        {
            Assert.DoesNotThrow(() => _levelManager.LoadLevels("{}"));
            Assert.IsNotNull(_levelManager.LevelContainer);
        }

        [Test]
        public void LoadLevels_WithInvalidJson_DoesNotThrow()
        {
            Assert.DoesNotThrow(() => _levelManager.LoadLevels("invalid json"));
            Assert.IsNull(_levelManager.LevelContainer);
        }

        [Test]
        public void LoadLevels_WithEmptyLevels_DoesNotThrow()
        {
            string json = "{\"meta\": {\"totalLevels\": 0}, \"levels\": {}}";
            Assert.DoesNotThrow(() => _levelManager.LoadLevels(json));
            Assert.IsNotNull(_levelManager.LevelContainer);
            Assert.AreEqual(0, _levelManager.SortedLevels.Count);
        }

        [Test]
        public void LoadLevels_HappyPath_PopulatesSortedLevels()
        {
            string json = @"{
                ""meta"": {""totalLevels"": 1},
                ""levels"": {
                    ""1"": {
                        ""id"": 1,
                        ""words"": [""CAT""],
                        ""letters"": [""C"", ""A"", ""T""],
                        ""grid"": [[""C"", ""A"", ""T""]],
                        ""wordPositions"": {
                            ""CAT"": {""row"": 0, ""col"": 0, ""direction"": ""horizontal""}
                        }
                    }
                }
            }";

            _levelManager.LoadLevels(json);

            Assert.IsNotNull(_levelManager.LevelContainer);
            Assert.IsNotNull(_levelManager.SortedLevels);
            Assert.AreEqual(1, _levelManager.SortedLevels.Count);
            Assert.AreEqual("CAT", _levelManager.SortedLevels[0].Words[0]);
        }
    }
}
