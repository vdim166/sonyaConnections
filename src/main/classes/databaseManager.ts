import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { generateRandomId } from '../utils/generateRandomId';

const userDataPath = app.getPath('userData');
const mainFolder = path.join(userDataPath, 'sonyaConnections');

export type figureTypeDTO = {
  name: string;
  points: {
    x: number;
    y: number;
  };
};

export type figureType = {
  id: string;
} & figureTypeDTO;

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

  addPerson(options: figureTypeDTO) {
    try {
      const data = this.readData();

      const id = generateRandomId();
      data.figures.push({ ...options, id });

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures;
    } catch (error) {
      console.log('error', error);
    }
  }

  updatePersonPosition(id: string, x: number, y: number) {
    try {
      const data = this.readData();

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      data.figures[index].points.x = x;
      data.figures[index].points.y = y;

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.log('error', error);
    }
  }
}

export const databaseManager = new DatabaseManager();
