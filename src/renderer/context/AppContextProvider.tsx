import { useRef, useState } from 'react';
import { APP_STATES, AppContext, AppContextType } from './AppContext';

type AppContextProviderType = {
  children: React.ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProviderType) => {
  const stageRef = useRef(null);

  const [appState, setAppState] = useState<keyof typeof APP_STATES>(
    APP_STATES.IDLE,
  );

  const value: AppContextType = {
    stageRef,
    appState,
    setAppState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
