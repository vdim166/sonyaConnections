import { useState } from 'react';
import {
  addModalType,
  MODALS_STATES,
  ModalsManagerContext,
  ModalsManagerContextType,
} from './ModalsManagerContext';

type ModalsManagerContextProviderType = {
  children: React.ReactNode;
};

export const ModalsManagerContextProvider = ({
  children,
}: ModalsManagerContextProviderType) => {
  const [modalState, setModalState] = useState<addModalType[]>([]);

  const addModal = ({ props, type }: addModalType) => {
    setModalState((prev) => [
      ...prev,
      {
        type,
        props,
      },
    ]);
  };

  const closeModals = () => {
    setModalState([]);
  };

  const deleteModalById = (id: keyof typeof MODALS_STATES) => {
    setModalState((prev) => {
      return prev.filter((m) => m.type !== id);
    });
  };

  const value: ModalsManagerContextType = {
    modalState,
    addModal,
    closeModals,
    deleteModalById,
  };

  return (
    <ModalsManagerContext.Provider value={value}>
      {children}
    </ModalsManagerContext.Provider>
  );
};
