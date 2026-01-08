// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { APP_SIGNALS } from './consts';
import { figureType, figureTypeDTO } from './classes/databaseManager';
import { pointsType } from './types/pointsType';
import { connectionType } from '../renderer/components/ZoomableStageWithControls';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },

    setZoom(newScale: number) {
      return ipcRenderer.invoke(APP_SIGNALS.SET_ZOOM, newScale);
    },

    getZoom(): Promise<number> {
      return ipcRenderer.invoke(APP_SIGNALS.GET_ZOOM);
    },

    addPerson(options: figureTypeDTO) {
      return ipcRenderer.invoke(APP_SIGNALS.ADD_PERSON, options);
    },
    getPersons() {
      return ipcRenderer.invoke(APP_SIGNALS.GET_PERSONS);
    },

    updatePersonPosition(id: string, x: number, y: number) {
      return ipcRenderer.invoke(APP_SIGNALS.UPDATE_PERSON_POSITION, id, x, y);
    },

    getCanvasPosition() {
      return ipcRenderer.invoke(APP_SIGNALS.GET_CANVAS_POSITION);
    },

    saveCanvasPosition(newPos: pointsType) {
      return ipcRenderer.invoke(APP_SIGNALS.SAVE_CANVAS_POSITION, newPos);
    },

    getConnections() {
      return ipcRenderer.invoke(APP_SIGNALS.GET_ALL_CONNECTIONS);
    },

    addConnection(con: connectionType) {
      return ipcRenderer.invoke(APP_SIGNALS.ADD_CONNECTION, con);
    },

    deleteConnection(id: string) {
      return ipcRenderer.invoke(APP_SIGNALS.DELETE_CONNECTION, id);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
