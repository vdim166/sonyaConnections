import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { AddPersonModal, AddPersonModalType } from '../modals/AddPersonModal';
import { UniversalModal } from '../modals/UniversalModal';

export const ModalsManager = () => {
  const { modalState, modalProps } = useModalsManagerContext();

  if (modalState === MODALS_STATES.ADD_PERSON) {
    return (
      <UniversalModal>
        <AddPersonModal {...(modalProps as AddPersonModalType)} />
      </UniversalModal>
    );
  }
};
