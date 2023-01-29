const { app, BrowserWindow, ipcMain } = require("electron");
const { PosPrinter } = require("electron-pos-printer-parseint");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    // titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),      
      devTools: false,
      nodeIntegration: true,
    },
  });
  // win.loadFile('index.html')
  win.loadURL("http://localhost:8011/");
  win.setIcon(path.join(__dirname, "/src/assets/home_screen.png"));
  win.maximize();
  console.log(process.env.USERNAME); // Aim Sarik

  // ipcMain clear cache
  ipcMain.on("clear-cache", (event, arg) => {
    const {session} = require('electron');
    session.defaultSession.clearCache();
  });

  ipcMain.on('set-printer', (event, data_print, options, saleType, printer_name) => {
    const data = [
      {
          type: 'text',
          value: ' ',
          style: `text-align:center;`,
          css: {"font-weight": "700", "font-size": "10px"}
      },
      {
          type: 'image',                                       
          path: path.join(__dirname, 'assets/gray_logo.png'),
          position: 'center',
          width: '250px',
          height: '152px',
      }
    ];
    const new_data = [...data, ...data_print];
    if (saleType == 0) {
      const data_print_qr = {
        type: 'image',                                       
        path: path.join(__dirname, 'assets/qr_code_aba.png'),
        position: 'center',
        width: '208px',
        height: '200px',
        style: `margin-top: 12px;`,
      };
      new_data.push(data_print_qr);
    }
    PosPrinter.print(new_data, options).catch((error) => console.error(error));
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
