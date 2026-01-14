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

    startDrag: (mouseX: number, mouseY: number) => {
      ipcRenderer.send('drag-start', { x: mouseX, y: mouseY });
    },

    dragWindow: (mouseX: number, mouseY: number) => {
      ipcRenderer.send('window-drag', { x: mouseX, y: mouseY });
    },

    endDrag: (mouseX: number, mouseY: number) => {
      ipcRenderer.send('drag-end', { x: mouseX, y: mouseY });
    },

    openApp: () => {
      return ipcRenderer.invoke(APP_SIGNALS.OPEN_APP);
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
    getFigures() {
      return ipcRenderer.invoke(APP_SIGNALS.GET_FIGURES);
    },

    updatePersonPosition(id: string, x: number, y: number) {
      return ipcRenderer.invoke(APP_SIGNALS.UPDATE_PERSON_POSITION, id, x, y);
    },

    updateFigureName(id: string, name: string) {
      return ipcRenderer.invoke(APP_SIGNALS.UPDATE_FIGURE_NAME, id, name);
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

    deleteFigure(id: string) {
      return ipcRenderer.invoke(APP_SIGNALS.DELETE_FIGURE, id);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
