/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Tray, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs from 'fs';
import { APP_SIGNALS } from './consts';
import { configManager } from './classes/configManager';
import { databaseManager } from './classes/databaseManager';
import { pointsType } from './types/pointsType';
import { connectionType } from '../renderer/components/ZoomableStageWithControls';

export const userDataPath = app.getPath('userData');
export const mainFolder = path.join(userDataPath, 'sonyaConnections');

export const savedImagesPath = path.join(mainFolder, 'saved_images');

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

let widgetWindow: BrowserWindow | null = null;

let dragStartPosition: {
  mouseX: number;
  mouseY: number;
  winX: number;
  winY: number;
} | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

ipcMain.handle(APP_SIGNALS.SET_ZOOM, (_event, newScale: number) => {
  return configManager.setZoom(newScale);
});

ipcMain.handle(APP_SIGNALS.GET_ZOOM, (_event) => {
  return configManager.getZoom();
});

ipcMain.handle(APP_SIGNALS.ADD_PERSON, (_event, options) => {
  return databaseManager.addPerson(options);
});

ipcMain.handle(APP_SIGNALS.GET_FIGURES, (_event) => {
  return databaseManager.getFigures();
});

ipcMain.handle(APP_SIGNALS.UPDATE_PERSON_POSITION, (_event, id, x, y) => {
  return databaseManager.updatePersonPosition(id, x, y);
});

ipcMain.handle(APP_SIGNALS.UPDATE_FIGURE_NAME, (_event, id, name) => {
  return databaseManager.updateFigureName(id, name);
});

ipcMain.handle(APP_SIGNALS.GET_CANVAS_POSITION, () => {
  return configManager.getCansvasPosition();
});

ipcMain.handle(
  APP_SIGNALS.SAVE_CANVAS_POSITION,
  (_event, newPos: pointsType) => {
    return configManager.setCanvasPosition(newPos);
  },
);

ipcMain.handle(APP_SIGNALS.GET_ALL_CONNECTIONS, (_event) => {
  return databaseManager.getConnections();
});

ipcMain.handle(APP_SIGNALS.ADD_CONNECTION, (_event, con: connectionType) => {
  return databaseManager.addConnection(con);
});

ipcMain.handle(APP_SIGNALS.DELETE_CONNECTION, (_event, id: string) => {
  return databaseManager.deleteConnection(id);
});

ipcMain.handle(APP_SIGNALS.DELETE_FIGURE, (_event, id: string) => {
  return databaseManager.deleteFigure(id);
});

ipcMain.handle(APP_SIGNALS.OPEN_APP, async () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  } else {
    await createWindow();
  }
});

ipcMain.handle(
  APP_SIGNALS.ADD_IMAGES_FOR_FIGURE,
  async (_event, id, images) => {
    return databaseManager.addImagesForFigure(id, images);
  },
);

ipcMain.handle(
  APP_SIGNALS.REMOVE_IMAGE_FOR_FIGURE,
  async (_event, id, imageId) => {
    return databaseManager.removeImageForFigure(id, imageId);
  },
);

ipcMain.handle(APP_SIGNALS.GET_FIGURE_IMAGE, async (_event, id) => {
  return databaseManager.getFigureImage(id);
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const checkForMainFolder = () => {
  if (!fs.existsSync(mainFolder)) {
    fs.mkdirSync(mainFolder, {
      recursive: true,
    });
  }

  configManager.check();
  databaseManager.check();
};

function enableAutoLaunch() {
  if (process.env.NODE_ENV === 'production') {
    app.setLoginItemSettings({
      openAtLogin: true, // запускать при входе
      path: app.getPath('exe'), // путь к exe (на win/mac корректно работает)
      args: ['--hidden'],
    });
  }
}

function isAutoLaunchEnabled() {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
}

// Отключить автозагрузку
function disableAutoLaunch() {
  app.setLoginItemSettings({
    openAtLogin: false,
    path: app.getPath('exe'),
  });
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

let tray: Tray | null = null;

if (!isDebug) {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    app.quit();
    process.exit(0);
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      } else {
        createWindow();
      }
    });
  }
}

app
  .whenReady()
  .then(() => {
    checkForMainFolder();

    if (!app.commandLine.hasSwitch('hidden')) {
      createWindow();
    }

    if (!isAutoLaunchEnabled()) {
      enableAutoLaunch();
    }

    tray = new Tray(getAssetPath('icon.png'));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Открыть',
        click: () => {
          if (!mainWindow) {
            createWindow();
          } else {
            mainWindow.show();
          }
        },
      },
      {
        label: 'Выход',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setToolTip('Sonya Connections');

    tray.on('click', () => {
      // левый клик

      if (!mainWindow) {
        createWindow();
      } else {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    });

    tray.on('right-click', () => {
      // правый клик → вручную показываем контекстное меню

      if (tray) tray.popUpContextMenu(contextMenu);
    });

    // клик по иконке (например, чтобы сворачивать/разворачивать окно)
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    createWidgetWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

const createWidgetWindow = () => {
  const userDataPath = app.getPath('userData');
  const filePath = path.join(
    userDataPath,
    'sonyaConnections',
    'widget-settings.json',
  );

  const status = fs.existsSync(filePath);

  if (!status) {
    fs.writeFileSync(
      filePath,
      JSON.stringify({
        autoStart: true,
        position: {
          x: 0,
          y: 0,
        },
      }),
    );
  }

  const oldSettings = fs.readFileSync(filePath, 'utf-8');

  const widgetSettings = JSON.parse(oldSettings);

  if (!widgetSettings.autoStart) return;

  if (widgetWindow) {
    widgetWindow.focus();
    return;
  }

  widgetWindow = new BrowserWindow({
    width: 300,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: false,
    skipTaskbar: true,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    fullscreenable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // enableRemoteModule: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  widgetWindow.loadFile(getAssetPath('html', 'widget.html'));

  widgetWindow.once('ready-to-show', () => {
    if (widgetWindow) {
      if (widgetSettings.position) {
        widgetWindow.setPosition(
          widgetSettings.position.x,
          widgetSettings.position.y,
        );
      }

      widgetWindow.show();
    }
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
    dragStartPosition = null;
  });
};

ipcMain.on('drag-start', (event, mousePosition) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const [winX, winY] = win.getPosition();
    dragStartPosition = {
      mouseX: mousePosition.x,
      mouseY: mousePosition.y,
      winX: winX,
      winY: winY,
    };
  }
});

// Обработчик перетаскивания - используем относительное смещение
ipcMain.on('window-drag', (event, mousePosition) => {
  if (!dragStartPosition) return;

  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    // Вычисляем смещение мыши от начальной точки
    const deltaX = mousePosition.x - dragStartPosition.mouseX;
    const deltaY = mousePosition.y - dragStartPosition.mouseY;

    // Новая позиция = начальная позиция окна + смещение мыши
    const newX = dragStartPosition.winX + deltaX;
    const newY = dragStartPosition.winY + deltaY;

    // Устанавливаем новую позицию
    win.setPosition(newX, newY);
  }
});

// Обработчик окончания перетаскивания
ipcMain.on('drag-end', (event, mousePosition) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (dragStartPosition) {
      const deltaX = mousePosition.x - dragStartPosition.mouseX;
      const deltaY = mousePosition.y - dragStartPosition.mouseY;

      const newX = dragStartPosition.winX + deltaX;
      const newY = dragStartPosition.winY + deltaY;

      // win.setPosition(newX, newY);

      const userDataPath = app.getPath('userData');
      const filePath = path.join(
        userDataPath,
        'sonyaConnections',
        'widget-settings.json',
      );

      const status = fs.existsSync(filePath);

      if (status) {
        const oldSettings = fs.readFileSync(filePath, 'utf-8');

        const parsed = JSON.parse(oldSettings);

        (parsed.position.x = newX),
          (parsed.position.y = newY),
          fs.writeFile(filePath, JSON.stringify(parsed), (error) => {
            if (error) {
              console.log('error', error);
            }
          });
      } else {
        const newData = {
          position: {
            x: newX,
            y: newY,
          },
        };

        fs.writeFile(filePath, JSON.stringify(newData), (error) => {
          if (error) {
            console.log('error', error);
          }
        });
      }
    }
  }

  dragStartPosition = null;
});
