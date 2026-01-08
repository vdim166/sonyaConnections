import { useEffect, useState } from 'react';
import { Menu } from '../components/Menu';
import ZoomableStageWithControls from '../components/ZoomableStageWithControls';
import { appSignals } from '../classes/appSignals';
import { Hints } from '../components/Hints';
import { useAppContext } from '../hooks/useAppContext';
import { FigureActionMenu } from '../components/FigureActionMenu';

export const MainPage = () => {
  const { scale } = useAppContext();

  if (scale === null) return;
  // add loading

  return (
    <>
      <Menu />
      <Hints />
      <FigureActionMenu />
      <ZoomableStageWithControls />
    </>
  );
};
