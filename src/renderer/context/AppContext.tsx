import { createContext, Dispatch, SetStateAction } from 'react';
// @ts-ignore
import Konva from 'konva';

export const APP_STATES = {
  IDLE: 'IDLE',
  PICKING_PERSON: 'PICKING_PERSON',
} as const;

export type AppContextType = {
  stageRef: { current: Konva.Stage | null } | null;

  appState: keyof typeof APP_STATES;
  setAppState: Dispatch<SetStateAction<keyof typeof APP_STATES>>;
};

const init: AppContextType = {
  stageRef: null,
  appState: APP_STATES.IDLE,
  setAppState: () => {},
};

export const AppContext = createContext<AppContextType>(init);
