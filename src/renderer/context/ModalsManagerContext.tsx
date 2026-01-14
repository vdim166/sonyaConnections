import { createContext } from 'react';
import { AddPersonModalType } from '../components/modals/AddPersonModal';
import { OpenDiaryModalProps } from '../components/modals/OpenDiaryModal';
import { ImageViewerProps } from '../components/modals/ImageViewer';

export const MODALS_STATES = {
  ADD_PERSON: 'ADD_PERSON',
  OPEN_DIARY: 'OPEN_DIARY',
  ADD_BLOCK: 'ADD_BLOCK',

  IMAGE_VIEWER: 'IMAGE_VIEWER',
} as const;

type addModalPropsType =
  | AddPersonModalType
  | OpenDiaryModalProps
  | ImageViewerProps
  | null;

export type addModalType = {
  type: keyof typeof MODALS_STATES;
  props: addModalPropsType;
};

export type ModalsManagerContextType = {
  modalState: addModalType[];
  addModal: (props: addModalType) => void;
  closeModals: () => void;
  deleteModalById: (id: keyof typeof MODALS_STATES) => void;
};

const init: ModalsManagerContextType = {
  modalState: [],
  addModal: () => {},
  closeModals: () => {},
  deleteModalById: () => {},
};

export const ModalsManagerContext =
  createContext<ModalsManagerContextType>(init);
