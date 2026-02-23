import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, SIZES } from '../../constants';

const STORY_ENTRIES: Record<number, { title: string; text: string }> = {
  1: {
    title: 'Первая запись',
    text: 'Архив молчал долго. Пыльные страницы хранили тайны ушедших. Но одно слово, найденное в глубине старого фолианта, изменило всё. Кто-то оставил эту дорогу специально.',
  },
  2: {
    title: 'Голос леса',
    text: 'Лес не случайно привёл тебя к этой тропе. Каждое дерево здесь помнит тех, кто проходил до тебя. Впереди — берег. Вода расскажет больше.',
  },
  3: {
    title: 'Что несёт вода',
    text: 'Река хранит всё что в неё брошено. Слова, дни, секреты. Ты нашёл кое-что важное. Осень сохранит это лучше любого сейфа.',
  },
  4: {
    title: 'Осенняя страница',
    text: 'Опавший лист — это послание. Ты умеешь их читать. Ночь принесёт ответы которые день скрывает.',
  },
  5: {
    title: 'Голос тишины',
    text: 'В поле под звёздами всё становится ясным. Деревня впереди хранит то, что ты ищешь. Там живёт тот, кто знает.',
  },
  6: {
    title: 'Память предметов',
    text: 'Старая изба помнит хозяев. Каждый предмет — свидетель. Ты нашёл ключ. Буквально. Горы откроют то, что равнина скрыла.',
  },
  7: {
    title: 'Над облаками',
    text: 'С вершины виден весь путь. Ты проделал его — и это говорит о многом. Море ждёт. У него тоже есть что рассказать.',
  },
  8: {
    title: 'Свет маяка',
    text: 'Маяк светил для кого-то конкретного. Для тебя. Сообщение было здесь всё это время. Зима сохранила последнее.',
  },
  9: {
    title: 'Под льдом',
    text: 'Мороз консервирует истину лучше любого архива. То что ты нашёл под снегом — это начало. И конец. Архив ждёт.',
  },
  10: {
    title: 'Разгадка',
    text: 'Ты вернулся туда, откуда начал. Архив открылся. Эхо тайн наконец стихло. Ты знаешь всё. Или почти всё.',
  },
};

interface Props {
  visible: boolean;
  chapterId: number;
  onClose: () => void;
}

export const StoryModal: React.FC<Props> = ({ visible, chapterId, onClose }) => {
  const entry = STORY_ENTRIES[chapterId];
  if (!visible || !entry) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.chapterLabel}>Глава {chapterId} завершена</Text>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.text}>{entry.text}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Продолжить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: COLORS.OVERLAY,
    justifyContent: 'center', alignItems: 'center', padding: SPACING.LG,
  },
  card: {
    backgroundColor: '#1C160A', borderRadius: 16,
    borderWidth: 1, borderColor: '#6B4A1A',
    padding: SPACING.XL, width: '100%', maxWidth: 340,
  },
  chapterLabel: {
    fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.SM,
    color: COLORS.TEXT_SECONDARY, marginBottom: SPACING.SM, textAlign: 'center',
  },
  title: {
    fontFamily: 'Cinzel-Bold', fontSize: FONT_SIZES.XL,
    color: COLORS.ACCENT_GOLD, textAlign: 'center', marginBottom: SPACING.LG,
  },
  text: {
    fontFamily: 'CrimsonText-Italic', fontSize: FONT_SIZES.MD,
    color: COLORS.TEXT_PRIMARY, lineHeight: 24, textAlign: 'center',
    marginBottom: SPACING.XL,
  },
  button: {
    borderWidth: 1, borderColor: COLORS.GRID_BORDER,
    borderRadius: SIZES.BORDER_RADIUS, paddingVertical: 12, alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'CrimsonText-Regular', fontSize: FONT_SIZES.MD, color: COLORS.TEXT_SECONDARY,
  },
});
