import { useContext } from 'react';
import { DiaryContext } from '../context/DiaryContext';

export const useDiaryContext = () => {
  return useContext(DiaryContext);
};
