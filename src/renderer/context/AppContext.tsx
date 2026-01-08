import { createContext, Dispatch, SetStateAction } from 'react';
// @ts-ignore
import Konva from 'konva';
import { pointsType } from '../../main/types/pointsType';

export const APP_STATES = {
  IDLE: 'IDLE',
  PICKING_PERSON: 'PICKING_PERSON',
} as const;

export type selectedType = {
  id: string;
  type: 'FIGURE' | 'CONNECTION';
};

export type AppContextType = {
  stageRef: { current: Konva.Stage | null } | null;

  appState: keyof typeof APP_STATES;
  setAppState: Dispatch<SetStateAction<keyof typeof APP_STATES>>;

  scale: number | null;
  setScale: Dispatch<SetStateAction<number | null>>;

  position: pointsType;
  setPosition: Dispatch<SetStateAction<pointsType>>;

  selected: selectedType | null;
  setSelected: Dispatch<SetStateAction<selectedType | null>>;

  actionMenu: pointsType | null;
  setActionMenu: Dispatch<SetStateAction<pointsType | null>>;
};

const init: AppContextType = {
  stageRef: null,
  appState: APP_STATES.IDLE,
  setAppState: () => {},
  scale: null,
  setScale: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
  selected: null,
  setSelected: () => {},
  actionMenu: null,
  setActionMenu: () => {},
};

export const AppContext = createContext<AppContextType>(init);
