import { figureType, figureTypeDTO } from '../../main/classes/databaseManager';
import { pointsType } from '../../main/types/pointsType';
import { connectionType } from '../components/ZoomableStageWithControls';

class AppSignals {
  setZoom = async (newScale: number) => {
    await window.electron.ipcRenderer.setZoom(newScale);
  };
  getZoom: () => Promise<number> = async () => {
    return await window.electron.ipcRenderer.getZoom();
  };

  getFigures = async () => {
    const figures: figureType[] =
      await window.electron.ipcRenderer.getFigures();
    return figures;
  };

  addPerson = async (options: figureTypeDTO) => {
    return await window.electron.ipcRenderer.addPerson(options);
  };

  updatePersonPosition = async (id: string, x: number, y: number) => {
    return await window.electron.ipcRenderer.updatePersonPosition(id, x, y);
  };

  updateFigureName = async (id: string, name: string) => {
    return await window.electron.ipcRenderer.updateFigureName(id, name);
  };

  getCanvasPosition = async () => {
    return await window.electron.ipcRenderer.getCanvasPosition();
  };

  saveCanvasPosition = async (newPos: pointsType) => {
    return await window.electron.ipcRenderer.saveCanvasPosition(newPos);
  };

  getConnections = async () => {
    const connections: connectionType[] | undefined =
      await window.electron.ipcRenderer.getConnections();
    return connections;
  };

  addConnection = async (con: connectionType) => {
    return await window.electron.ipcRenderer.addConnection(con);
  };

  deleteConnection = async (id: string) => {
    return await window.electron.ipcRenderer.deleteConnection(id);
  };

  deleteFigure = async (id: string) => {
    return await window.electron.ipcRenderer.deleteFigure(id);
  };
}

export const appSignals = new AppSignals();
