import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { generateRandomId } from '../utils/generateRandomId';
import { connectionType } from '../../renderer/components/ZoomableStageWithControls';
import { savedImagesPath } from '../main';

const userDataPath = app.getPath('userData');
const mainFolder = path.join(userDataPath, 'sonyaConnections');

export type figureTypeDTO = {
  name: string;
  points: {
    x: number;
    y: number;
  };
  isBlock: boolean;
  description?: string;
};

export type figureType = {
  id: string;
  images?: string[];
  date?: string;

  cover?: string | null;
} & figureTypeDTO;

type dataType = {
  figures: figureType[];
  connections: connectionType[];
};

class DatabaseManager {
  private dataPath = path.join(mainFolder, 'data.json');

  check() {
    if (!fs.existsSync(this.dataPath)) {
      const init: dataType = {
        figures: [],
        connections: [],
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

  getFigure(id: string) {
    try {
      const data = this.readData();
      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) {
        return null;
      }

      return data.figures[index] || null;
    } catch (error) {
      console.log('error', error);
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

  deleteFigure(id: string) {
    try {
      const data = this.readData();

      data.figures = data.figures.filter((item) => item.id !== id);

      const connectionsIdsToDelete: string[] = [];

      for (let i = 0; i < data.connections.length; ++i) {
        const con = data.connections[i];

        const [startId] = con.startAnchorId.split('-');

        if (startId === id) {
          connectionsIdsToDelete.push(con.id);
          continue;
        }

        const [endId] = con.endAnchorId.split('-');
        if (endId === id) {
          connectionsIdsToDelete.push(con.id);
          continue;
        }
      }

      data.connections = data.connections.filter(
        (item) => !connectionsIdsToDelete.includes(item.id),
      );

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');
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

  updateFigureName(id: string, name: string) {
    try {
      const data = this.readData();

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      data.figures[index].name = name;

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  getConnections() {
    try {
      const data = this.readData();

      return data.connections;
    } catch (error) {
      console.log('error', error);
    }
  }

  addConnection(con: connectionType) {
    try {
      const data = this.readData();

      data.connections.push(con);
      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.log('error', error);
    }
  }

  deleteConnection(id: string) {
    try {
      const data = this.readData();

      data.connections = data.connections.filter((item) => item.id !== id);

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.log('error', error);
    }
  }

  addImagesForFigure(id: string, images: Uint8Array<ArrayBuffer>[]) {
    try {
      const data = this.readData();

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      if (!data.figures[index].images) {
        data.figures[index].images = [];
      }

      if (!fs.existsSync(savedImagesPath))
        fs.mkdirSync(savedImagesPath, { recursive: true });

      for (let i = 0; i < images.length; ++i) {
        const image = images[i];

        const imageId = generateRandomId();

        const savePath = path.join(savedImagesPath, `${imageId}.jpg`);

        fs.writeFileSync(savePath, image);

        data.figures[index].images.push(imageId);
      }

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  addCoverForFigure(id: string, image: Uint8Array<ArrayBuffer>) {
    try {
      const data = this.readData();

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      if (!fs.existsSync(savedImagesPath))
        fs.mkdirSync(savedImagesPath, { recursive: true });

      const imageId = generateRandomId();

      const savePath = path.join(savedImagesPath, `${imageId}.jpg`);

      fs.writeFileSync(savePath, image);

      data.figures[index].cover = imageId;

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  deleteCoverForFigure(id: string) {
    try {
      const data = this.readData();

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      if (!fs.existsSync(savedImagesPath))
        fs.mkdirSync(savedImagesPath, { recursive: true });

      const figure = data.figures[index];

      if (!figure.cover) return;

      const savePath = path.join(savedImagesPath, `${figure.cover}.jpg`);

      data.figures[index].cover = null;

      fs.unlinkSync(savePath);

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  removeImageForFigure(id: string, imageId: string) {
    try {
      const data = this.readData();

      if (!fs.existsSync(savedImagesPath))
        fs.mkdirSync(savedImagesPath, { recursive: true });

      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      if (data.figures[index].images) {
        data.figures[index].images = data.figures[index].images.filter(
          (item) => item !== imageId,
        );
      }

      const imagePath = path.join(savedImagesPath, `${imageId}.jpg`);

      fs.unlinkSync(imagePath);

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  getFigureImage(id: string) {
    try {
      if (!fs.existsSync(savedImagesPath))
        fs.mkdirSync(savedImagesPath, { recursive: true });

      const imagePath = path.join(savedImagesPath, `${id}.jpg`);
      const data = fs.readFileSync(imagePath);
      return data.toString('base64');
    } catch (error) {
      console.log('error', error);
    }
  }

  setFigureDescription(id: string, description: string) {
    try {
      const data = this.readData();
      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      data.figures[index].description = description;

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');

      return data.figures[index];
    } catch (error) {
      console.log('error', error);
    }
  }

  getFigureDate(id: string) {
    try {
      const data = this.readData();
      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      return data.figures[index].date;
    } catch (error) {
      console.log('error', error);
    }
  }

  saveFigureDate(id: string, date: string) {
    try {
      const data = this.readData();
      const index = data.figures.findIndex((item) => item.id === id);

      if (index === -1) return;

      data.figures[index].date = date;

      fs.writeFileSync(this.dataPath, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.log('error', error);
    }
  }
}

export const databaseManager = new DatabaseManager();
