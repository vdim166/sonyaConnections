import { useState } from 'react';
import { DiaryContext, DiaryContextType } from './DiaryContext';
import { figureType } from '../../main/classes/databaseManager';

type DiaryContextProviderProps = {
  children: React.ReactNode;
};

export const DiaryContextProvider = ({
  children,
}: DiaryContextProviderProps) => {
  const [currentDiary, setCurrentDiary] = useState<figureType | null>(null);

  const value: DiaryContextType = {
    currentDiary,
    setCurrentDiary,
  };

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  );
};
