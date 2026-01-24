import { useEffect, useState } from 'react';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import './styles.css';
import { appSignals } from '../../classes/appSignals';

function calculateAge(birthDateString: string) {
  // Преобразуем строку в объект Date
  const birthDate = new Date(birthDateString);
  const today = new Date();

  // Проверяем, что дата рождения валидна
  if (isNaN(birthDate.getTime())) {
    throw new Error('Неверный формат даты рождения');
  }

  // Проверяем, что дата рождения не в будущем
  if (birthDate > today) {
    throw new Error('Дата рождения не может быть в будущем');
  }

  // Вычисляем год рождения и текущий год
  const birthYear = birthDate.getFullYear();
  const currentYear = today.getFullYear();

  // Вычисляем базовый возраст
  let age = currentYear - birthYear;

  // Получаем месяц и день для рождения и сегодня
  const birthMonth = birthDate.getMonth();
  const currentMonth = today.getMonth();
  const birthDay = birthDate.getDate();
  const currentDay = today.getDate();

  // Если день рождения еще не наступил в этом году, уменьшаем возраст на 1
  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
}

export const DiaryBirthday = () => {
  const { currentDiary } = useDiaryContext();

  const [currentDate, setCurrentDate] = useState<string>('');

  const [years, setYears] = useState<number | null>(null);

  useEffect(() => {
    const fetchDate = async () => {
      try {
        setYears(null);
        if (!currentDiary) return;

        const date = await appSignals.getFigureDate(currentDiary.id);

        setCurrentDate(date || '');

        if (date) {
          const age = calculateAge(date);

          setYears(age);
        }
      } catch (error) {
        console.log('error', error);
      }
    };

    fetchDate();
  }, [currentDiary]);

  const handleSaveDate = async (date: string) => {
    try {
      if (!currentDiary) return;

      setCurrentDate(date);

      await appSignals.saveFigureDate(currentDiary.id, date);

      if (date) {
        const age = calculateAge(date);

        setYears(age);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="diary-birthday-container">
      <input
        type="date"
        value={currentDate}
        onChange={(e) => {
          handleSaveDate(e.target.value);
        }}
      />

      {years && <div className="diary-birthday-show-age">({years} лет)</div>}
    </div>
  );
};
