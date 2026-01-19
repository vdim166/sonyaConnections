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

  getFigure: (id: string) => Promise<figureType | null> = async (
    id: string,
  ) => {
    const figure: figureType = await window.electron.ipcRenderer.getFigure(id);
    return figure;
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

  addImagesForFigure = async (
    id: string,
    images: Uint8Array<ArrayBuffer>[],
  ) => {
    return await window.electron.ipcRenderer.addImagesForFigure(id, images);
  };

  removeImageForFigure = async (id: string, imageId: string) => {
    return await window.electron.ipcRenderer.removeImageForFigure(id, imageId);
  };

  getFigureImage = async (id: string) => {
    return await window.electron.ipcRenderer.getFigureImage(id);
  };

  setFigureDescription = async (id: string, description: string) => {
    return await window.electron.ipcRenderer.setFigureDescription(
      id,
      description,
    );
  };

  addCoverForFigure = async (id: string, cover: Uint8Array<ArrayBuffer>) => {
    return await window.electron.ipcRenderer.addCoverForFigure(id, cover);
  };

  deleteCoverForFigure = async (id: string) => {
    return await window.electron.ipcRenderer.deleteCoverForFigure(id);
  };

  getFigureDate = async (id: string) => {
    return await window.electron.ipcRenderer.getFigureDate(id);
  };

  saveFigureDate = async (id: string, date: string) => {
    return await window.electron.ipcRenderer.saveFigureDate(id, date);
  };
}

export const appSignals = new AppSignals();
