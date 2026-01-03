import fs from 'fs';
import path from 'path';
import { app } from 'electron';

type ConfigType = {
  zoom: number;
};

const userDataPath = app.getPath('userData');
const mainFolder = path.join(userDataPath, 'sonyaConnections');

class ConfigManager {
  private configPath = path.join(mainFolder, 'config.json');

  check() {
    if (!fs.existsSync(this.configPath)) {
      const initData: ConfigType = { zoom: 1 };

      fs.writeFileSync(this.configPath, JSON.stringify(initData), 'utf-8');
    }
  }

  readData(): ConfigType | null {
    try {
      const data = fs.readFileSync(this.configPath, 'utf-8');

      return JSON.parse(data);
    } catch (error) {
      console.log('error', error);

      return null;
    }
  }

  setZoom(newScale: number) {
    try {
      const data = this.readData();

      if (!data) return;

      data.zoom = newScale;

      fs.writeFileSync(this.configPath, JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.log('error', error);
    }
  }

  getZoom(): number {
    try {
      const data = this.readData();
      if (!data) return 1;
      return data.zoom;
    } catch (error) {
      console.log('error', error);
      return 1;
    }
  }
}

export const configManager = new ConfigManager();
