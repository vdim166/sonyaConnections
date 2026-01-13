import { DiaryContextProvider } from '../../context/DiaryContextProvider';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { AddPersonModal, AddPersonModalType } from '../modals/AddPersonModal';
import { OpenDiaryModal, OpenDiaryModalProps } from '../modals/OpenDiaryModal';
import { UniversalModal } from '../modals/UniversalModal';

export const ModalsManager = () => {
  const { modalState, modalProps } = useModalsManagerContext();

  if (modalState === MODALS_STATES.ADD_PERSON) {
    return (
      <UniversalModal>
        <AddPersonModal {...(modalProps as AddPersonModalType)} />
      </UniversalModal>
    );
  } else if (modalState === MODALS_STATES.ADD_BLOCK) {
    return (
      <UniversalModal>
        <AddPersonModal {...(modalProps as AddPersonModalType)} />
      </UniversalModal>
    );
  } else if (modalState === MODALS_STATES.OPEN_DIARY) {
    return (
      <UniversalModal>
        <DiaryContextProvider>
          <OpenDiaryModal {...(modalProps as OpenDiaryModalProps)} />
        </DiaryContextProvider>
      </UniversalModal>
    );
  }
};
