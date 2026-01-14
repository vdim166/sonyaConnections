import { DiaryContextProvider } from '../../context/DiaryContextProvider';
import { MODALS_STATES } from '../../context/ModalsManagerContext';
import { useModalsManagerContext } from '../../hooks/useModalsManagerContext';
import { AddPersonModal, AddPersonModalType } from '../modals/AddPersonModal';
import { ImageViewer, ImageViewerProps } from '../modals/ImageViewer';
import { OpenDiaryModal, OpenDiaryModalProps } from '../modals/OpenDiaryModal';
import { UniversalModal } from '../modals/UniversalModal';

export const ModalsManager = () => {
  const { modalState } = useModalsManagerContext();

  return modalState.map((state) => {
    if (state.type === MODALS_STATES.ADD_PERSON) {
      return (
        <UniversalModal>
          <AddPersonModal {...(state.props as AddPersonModalType)} />
        </UniversalModal>
      );
    } else if (state.type === MODALS_STATES.ADD_BLOCK) {
      return (
        <UniversalModal>
          <AddPersonModal {...(state.props as AddPersonModalType)} />
        </UniversalModal>
      );
    } else if (state.type === MODALS_STATES.OPEN_DIARY) {
      return (
        <UniversalModal>
          <DiaryContextProvider>
            <OpenDiaryModal {...(state.props as OpenDiaryModalProps)} />
          </DiaryContextProvider>
        </UniversalModal>
      );
    } else if (state.type === MODALS_STATES.IMAGE_VIEWER) {
      return (
        <UniversalModal>
          <ImageViewer {...(state.props as ImageViewerProps)} />
        </UniversalModal>
      );
    }
  });
};
