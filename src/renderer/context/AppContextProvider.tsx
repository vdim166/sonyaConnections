import { useEffect, useRef, useState } from 'react';
import {
  APP_STATES,
  AppContext,
  AppContextType,
  selectedType,
} from './AppContext';
import { appSignals } from '../classes/appSignals';
import { pointsType } from '../../main/types/pointsType';

type AppContextProviderType = {
  children: React.ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProviderType) => {
  const stageRef = useRef(null);

  const [appState, setAppState] = useState<keyof typeof APP_STATES>(
    APP_STATES.IDLE,
  );

  const [scale, setScale] = useState<number | null>(null);
  const [position, setPosition] = useState<pointsType>({ x: 0, y: 0 });
  const [selected, setSelected] = useState<selectedType | null>(null);
  const [actionMenu, setActionMenu] = useState<pointsType | null>(null);

  useEffect(() => {
    const getZoom = async () => {
      try {
        const zoom = await appSignals.getZoom();
        setScale(zoom);
      } catch (error) {
        console.log('error', error);
      }
    };

    getZoom();
  }, []);

  const value: AppContextType = {
    stageRef,
    appState,
    setAppState,
    scale,
    setScale,
    position,
    setPosition,

    selected,
    setSelected,
    actionMenu,
    setActionMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
