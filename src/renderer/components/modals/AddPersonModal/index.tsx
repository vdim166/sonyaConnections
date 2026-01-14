import { useState } from 'react';
import { appSignals } from '../../../classes/appSignals';
import { useModalsManagerContext } from '../../../hooks/useModalsManagerContext';
import { Button } from '../../shared/Button';
import { TextArea } from '../../shared/TextArea';
import { CloseModal } from '../shared/CloseModal';
import './styles.css';
import { FETCH_SIGNALS } from '../../../classes/consts/FETCH_SIGNALS';

export type AddPersonModalType = {
  points: {
    x: number;
    y: number;
  };

  isBlock: boolean;
};

export const AddPersonModal = ({ points, isBlock: ib }: AddPersonModalType) => {
  const { closeModals } = useModalsManagerContext();

  const [name, setName] = useState('');

  const [isBlock, setIsBlock] = useState(ib);

  const handleSubmit = async () => {
    try {
      if (!name) return;

      await appSignals.addPerson({ name, points, isBlock });

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_FIGURES));

      closeModals();
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <div className="add-person-modal">
      <CloseModal
        onClick={() => {
          closeModals();
        }}
      />
      <p className="add-person-modal-title">
        {isBlock ? 'Добавить блок' : 'Добавить пользователя'}
      </p>

      <div className="add-person-modal-container">
        <p>{isBlock ? 'Введите имя блока' : 'Введите имя пользователя'}</p>
        <TextArea
          className="add-person-modal-textarea"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <div className="add-person-modal-is-block">
          <input
            type="checkbox"
            checked={isBlock}
            onChange={(e) => setIsBlock(e.target.checked)}
          />{' '}
          <p>Is block?</p>
        </div>

        <Button onClick={handleSubmit}>Сохранить</Button>
      </div>
    </div>
  );
};
