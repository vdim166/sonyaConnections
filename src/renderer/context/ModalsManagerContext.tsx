import { createContext } from 'react';
import { AddPersonModalType } from '../components/modals/AddPersonModal';

export const MODALS_STATES = {
  ADD_PERSON: 'ADD_PERSON',
} as const;

type addModalPropsType = AddPersonModalType;

export type addModalType = {
  type: keyof typeof MODALS_STATES;
  props: addModalPropsType;
};

export type ModalsManagerContextType = {
  modalState: keyof typeof MODALS_STATES | null;
  addModal: (props: addModalType) => void;
  modalProps: AddPersonModalType | null;
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
