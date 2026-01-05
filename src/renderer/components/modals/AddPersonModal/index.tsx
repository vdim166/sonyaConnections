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
};

export const AddPersonModal = ({ points }: AddPersonModalType) => {
  const { closeModals } = useModalsManagerContext();

  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      if (!name) return;

      await appSignals.addPerson(name, points);

      window.dispatchEvent(new Event(FETCH_SIGNALS.FETCH_PERSONS));
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
      <p className="add-person-modal-title">Добавить пользователя</p>

      <div className="add-person-modal-container">
        <p>Введите имя пользователя</p>
        <TextArea
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <Button onClick={handleSubmit}>Сохранить</Button>
      </div>
    </div>
  );
};
