import { createContext } from 'react';
import { AddPersonModalType } from '../components/modals/AddPersonModal';
import { OpenDiaryModalProps } from '../components/modals/OpenDiaryModal';

export const MODALS_STATES = {
  ADD_PERSON: 'ADD_PERSON',
  OPEN_DIARY: 'OPEN_DIARY',
  ADD_BLOCK: 'ADD_BLOCK',
} as const;

type addModalPropsType = AddPersonModalType | OpenDiaryModalProps | null;

export type addModalType = {
  type: keyof typeof MODALS_STATES;
  props: addModalPropsType;
};

export type ModalsManagerContextType = {
  modalState: keyof typeof MODALS_STATES | null;
  addModal: (props: addModalType) => void;
  modalProps: addModalPropsType;
  closeModals: () => void;
};

const init: ModalsManagerContextType = {
  modalState: null,
  addModal: () => {},
  modalProps: null,
  closeModals: () => {},
};

export const ModalsManagerContext =
  createContext<ModalsManagerContextType>(init);
