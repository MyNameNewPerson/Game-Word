import { Audio } from 'expo-av';

// Звуковые файлы скачать бесплатно с freesound.org (лицензия CC0):
// letter_tap.mp3     — тихий клик при захвате буквы
// word_correct.mp3   — приятный звук "правильно"
// word_bonus.mp3     — звук монеты / бонуса
// word_error.mp3     — мягкий звук ошибки
// level_complete.mp3 — торжественный короткий звук победы
// hint_use.mp3       — звук открытия подсказки
// coin_earn.mp3      — звон монеты при получении

type SoundName =
  | 'letter_tap'
  | 'word_correct'
  | 'word_bonus'
  | 'word_error'
  | 'level_complete'
  | 'hint_use'
  | 'coin_earn';

class AudioManagerClass {
  private sounds: Partial<Record<SoundName, Audio.Sound>> = {};
  private isMuted = false;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
      const files: Record<SoundName, any> = {
        letter_tap:     require('../../assets/sounds/letter_tap.mp3'),
        word_correct:   require('../../assets/sounds/word_correct.mp3'),
        word_bonus:     require('../../assets/sounds/word_bonus.mp3'),
        word_error:     require('../../assets/sounds/word_error.mp3'),
        level_complete: require('../../assets/sounds/level_complete.mp3'),
        hint_use:       require('../../assets/sounds/hint_use.mp3'),
        coin_earn:      require('../../assets/sounds/coin_earn.mp3'),
      };
      await Promise.all(
        (Object.entries(files) as [SoundName, any][]).map(async ([name, file]) => {
          const { sound } = await Audio.Sound.createAsync(file, { shouldPlay: false });
          this.sounds[name] = sound;
        })
      );
      this.initialized = true;
    } catch (e) {
      // Звуки необязательны — игра работает без них
      // console.log('AudioManager: ошибка инициализации', e);
    }
  }

  async play(name: SoundName): Promise<void> {
    if (this.isMuted) return;
    try {
      const sound = this.sounds[name];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch {}
  }

  setMuted(v: boolean) { this.isMuted = v; }
  toggle() { this.isMuted = !this.isMuted; }
}

export const AudioManager = new AudioManagerClass();
