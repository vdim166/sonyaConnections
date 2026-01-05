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
}

export const appSignals = new AppSignals();
