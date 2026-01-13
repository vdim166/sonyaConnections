import { useEffect, useState } from 'react';
import { Menu } from '../components/Menu';
import ZoomableStageWithControls from '../components/ZoomableStageWithControls';
import { Hints } from '../components/Hints';
import { useAppContext } from '../hooks/useAppContext';
import { FigureActionMenu } from '../components/FigureActionMenu';
import { APP_STATES } from '../context/AppContext';

export const MainPage = () => {
  const { scale, appState, setAppState } = useAppContext();

  useEffect(() => {
    const handleClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAppState(APP_STATES.IDLE);
      }
    };

    window.addEventListener('keydown', handleClose);

    return () => {
      window.removeEventListener('keydown', handleClose);
    };
  }, [appState]);

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
