const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 780,
    height: 820,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'public/assets/app-icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Wall Chess'
  });

  // Определяем режим запуска (разработка или продакшн)
  // В режиме разработки путь к файлам отличается от пакетной сборки
  const isPackaged = app.isPackaged;
  
  // Пути к файлам в зависимости от режима
  let indexPath;
  
  if (isPackaged) {
    // В продакшн режиме файлы находятся в корне приложения
    indexPath = path.join(__dirname, 'index.html');
  } else {
    // В режиме разработки пробуем загрузить из локального сервера
    // или из build директории
    const devPath = 'http://localhost:3000';
    const buildPath = path.join(__dirname, 'build/index.html');
    
    // Сначала пытаемся загрузить сервер разработки
    mainWindow.loadURL(devPath)
      .then(() => {
        console.log('Загрузили сервер разработки');
      })
      .catch(() => {
        // Если не удалось, загружаем из сборки
        mainWindow.loadFile(buildPath)
          .then(() => {
            console.log('Загрузили из сборки');
          })
          .catch(err => {
            console.error('Не удалось загрузить приложение:', err);
          });
      });
      
    // Выходим, т.к. загрузка уже выполнена
    setupWindowControls();
    return;
  }
  
  // В продакшн режиме загружаем файлы из корня приложения
  mainWindow.loadFile(indexPath)
    .then(() => {
      console.log('Приложение успешно загружено');
    })
    .catch(err => {
      console.error('Ошибка загрузки приложения:', err);
    });
  
  // Настраиваем управление окном
  setupWindowControls();
}

// Вынесем настройку управления окном в отдельную функцию
function setupWindowControls() {
  // Настраиваем функции управления окном
  ipcMain.handle('window-minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window-maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window-close', () => {
    mainWindow.close();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
}); 