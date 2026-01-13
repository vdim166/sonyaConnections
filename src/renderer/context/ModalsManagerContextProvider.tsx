import { useState } from 'react';
import {
  addModalType,
  MODALS_STATES,
  ModalsManagerContext,
  ModalsManagerContextType,
} from './ModalsManagerContext';
import { AddPersonModalType } from '../components/modals/AddPersonModal';

type ModalsManagerContextProviderType = {
  children: React.ReactNode;
};

export const ModalsManagerContextProvider = ({
  children,
}: ModalsManagerContextProviderType) => {
  const [modalState, setModalState] = useState<
    keyof typeof MODALS_STATES | null
  >(null);

  const [modalProps, setModalProps] = useState<AddPersonModalType | null>(null);

  const addModal = ({ props, type }: addModalType) => {
    setModalState(type);
    setModalProps(props);
  };

  const closeModals = () => {
    setModalState(null);
    setModalProps(null);
  };

  const value: ModalsManagerContextType = {
    modalState,
    modalProps,
    addModal,
    closeModals,
  };

  return (
    <ModalsManagerContext.Provider value={value}>
      {children}
    </ModalsManagerContext.Provider>
  );
};
