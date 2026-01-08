import { pointsType } from '../../main/types/pointsType';
import { connectionType } from '../components/ZoomableStageWithControls';

class AppSignals {
  setZoom = async (newScale: number) => {
    await window.electron.ipcRenderer.setZoom(newScale);
  };
  getZoom: () => Promise<number> = async () => {
    return await window.electron.ipcRenderer.getZoom();
  };

  getPersons = async () => {
    const persons = await window.electron.ipcRenderer.getPersons();
    return persons;
  };

  addPerson = async (
    name: string,
    points: {
      x: number;
      y: number;
    },
  ) => {
    return await window.electron.ipcRenderer.addPerson({ name, points });
  };

  updatePersonPosition = async (id: string, x: number, y: number) => {
    return await window.electron.ipcRenderer.updatePersonPosition(id, x, y);
  };

  getCanvasPosition = async () => {
    return await window.electron.ipcRenderer.getCanvasPosition();
  };

  saveCanvasPosition = async (newPos: pointsType) => {
    return await window.electron.ipcRenderer.saveCanvasPosition(newPos);
  };

  getConnections = async () => {
    return await window.electron.ipcRenderer.getConnections();
  };

  addConnection = async (con: connectionType) => {
    return await window.electron.ipcRenderer.addConnection(con);
  };

  deleteConnection = async (id: string) => {
    return await window.electron.ipcRenderer.deleteConnection(id);
  };
}

export const appSignals = new AppSignals();
