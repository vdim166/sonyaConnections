// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { APP_SIGNALS } from './consts';
import { figureType } from './classes/databaseManager';

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

    addPerson(options: figureType) {
      return ipcRenderer.invoke(APP_SIGNALS.ADD_PERSON, options);
    },
    getPersons() {
      return ipcRenderer.invoke(APP_SIGNALS.GET_PERSONS);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
