import { useEffect, useState } from 'react';
import { useDiaryContext } from '../../hooks/useDiaryContext';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';
import './styles.css';
import { DiaryImages } from '../DiaryImages';
import { appSignals } from '../../classes/appSignals';
import { FETCH_SIGNALS } from '../../classes/consts/FETCH_SIGNALS';
import { DiaryBirthday } from '../DiaryBirthday';
import { Book } from '../bookComponent/Book';

export const EditDiary = () => {
  const { currentDiary, setCurrentDiary } = useDiaryContext();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const [paperContent, setPaperContent] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  useEffect(() => {
    let result = '';

    for (let i = 0; i < paperContent.length; ++i) {
      if (paperContent[i].trim() !== '') {
        result += paperContent[i] + ' ';
      }
    }

    setDesc(result.trim());
  }, [paperContent]);

  useEffect(() => {
    if (currentDiary) {
      setName(currentDiary.name);
      setDesc(currentDiary.description || '');

      setPaperContent((prev) => {
        const newState = [...prev];
        newState[0] = currentDiary.description || '';

        return newState;
      });
    } else {
      setName('');
      setDesc('');

      setPaperContent(['', '', '', '', '', '']);
    }
  }, [currentDiary]);

  if (!currentDiary) {
    return <div>Nothing...</div>;
  }

  const handleSubmit = async () => {
    try {
      if (desc !== currentDiary.description) {
        const newDiary = await appSignals.setFigureDescription(
          currentDiary.id,
          desc,
        );

        setCurrentDiary(newDiary);
      }

      const newDiary = await appSignals.updateFigureName(currentDiary.id, name);

      setCurrentDiary(newDiary);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_DIARY_FIGURES));

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  const shouldChange =
    name !== currentDiary.name || desc !== currentDiary.description;

  return (
    <div className="diary-container">
      <p>Name</p>
      <input
        className="open-diary-modal-diary-name-input"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      {!currentDiary.isBlock && <DiaryBirthday />}
      <Book paperContent={paperContent} setPaperContent={setPaperContent} />
      {!currentDiary.isBlock && <DiaryImages />}
      <div className="open-diary-modal-diary-save-button">
        <Button disabled={!shouldChange} onClick={handleSubmit}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export const EditDiary1 = () => {
  const { currentDiary, setCurrentDiary } = useDiaryContext();
  const [name, setName] = useState('');

  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (currentDiary) {
      setName(currentDiary.name);
      setDesc(currentDiary.description || '');
    } else {
      setName('');
      setDesc('');
    }
  }, [currentDiary]);

  if (!currentDiary) {
    return <div>Nothing...</div>;
  }

  const handleSubmit = async () => {
    try {
      if (desc !== currentDiary.description) {
        const newDiary = await appSignals.setFigureDescription(
          currentDiary.id,
          desc,
        );

        setCurrentDiary(newDiary);
      }

      const newDiary = await appSignals.updateFigureName(currentDiary.id, name);

      setCurrentDiary(newDiary);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_DIARY_FIGURES));

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));
    } catch (error) {
      console.log('error', error);
    }
  };

  const shouldChange =
    name !== currentDiary.name || desc !== currentDiary.description;

  return (
    <div className="open-diary-modal-diary">
      <p>Name</p>

      <input
        className="open-diary-modal-diary-name-input"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      {!currentDiary.isBlock && <DiaryBirthday />}

      <TextArea
        value={desc}
        className="open-diary-modal-diary-name-textarea"
        onChange={(e) => {
          setDesc(e.target.value);
        }}
      />

      {!currentDiary.isBlock && <DiaryImages />}

      <div className="open-diary-modal-diary-save-button">
        <Button disabled={!shouldChange} onClick={handleSubmit}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};
