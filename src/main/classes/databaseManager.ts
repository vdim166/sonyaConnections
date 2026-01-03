import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const userDataPath = app.getPath('userData');
const mainFolder = path.join(userDataPath, 'sonyaConnections');

export type figureType = {
  name: string;
  points: {
    x: number;
    y: number;
  };
};

type dataType = {
  figures: figureType[];
};

class DatabaseManager {
  private dataPath = path.join(mainFolder, 'data.json');

  check() {
    if (!fs.existsSync(this.dataPath)) {
      const init: dataType = {
        figures: [],
      };
      fs.writeFileSync(this.dataPath, JSON.stringify(init), 'utf-8');
    }
  }

  readData: () => dataType = () => {
    const data = fs.readFileSync(this.dataPath, 'utf-8');
    return JSON.parse(data);
  };

  getFigures(): figureType[] {
    try {
      const data = this.readData();
      return data.figures;
    } catch (error) {
      console.log('error', error);
      return [];
    }
  }

  addPerson(options: figureType) {
    const data = this.readData();
    data.figures.push(options);

    fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

    return data.figures;
  }
}

export const databaseManager = new DatabaseManager();
