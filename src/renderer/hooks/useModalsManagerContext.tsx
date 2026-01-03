import { useContext } from 'react';
import { ModalsManagerContext } from '../context/ModalsManagerContext';

export const useModalsManagerContext = () => {
  return useContext(ModalsManagerContext);
};
