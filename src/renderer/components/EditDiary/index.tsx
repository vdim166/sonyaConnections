import { useEffect, useState } from 'react';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';
import './styles.css';
import { DiaryImages } from '../DiaryImages';
import { appSignals } from '../../classes/appSignals';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';

export const EditDiary = () => {
  const { currentDiary, setCurrentDiary } = useDiaryContext();
  const [name, setName] = useState('');

  useEffect(() => {
    if (currentDiary) {
      setName(currentDiary.name);
    } else {
      setName('');
    }
  }, [currentDiary]);

  if (!currentDiary) {
    return <div>Nothing...</div>;
  }

  const handleSubmit = async () => {
    try {
      const newDiary = await appSignals.updateFigureName(currentDiary.id, name);

      setCurrentDiary(newDiary);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_DIARY_FIGURES));

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="open-diary-modal-diary">
      <p>Name</p>
      <TextArea
        className=""
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      <DiaryImages />

      <div className="open-diary-modal-diary-save-button">
        <Button disabled={name === currentDiary.name} onClick={handleSubmit}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};
