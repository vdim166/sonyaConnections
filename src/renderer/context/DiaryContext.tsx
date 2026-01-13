import { createContext } from 'react';
import { figureType } from '../../main/classes/databaseManager';

export type DiaryContextType = {
  currentDiary: figureType | null;
  setCurrentDiary: (diary: figureType | null) => void;
};
const init: DiaryContextType = {
  currentDiary: null,
  setCurrentDiary: () => {},
};

export const DiaryContext = createContext<DiaryContextType>(init);
