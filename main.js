const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const isDev = require("electron-is-dev");
const ProgressBar = require('electron-progressbar');
const {PosPrinter} = require("electron-pos-printer");
const path = require("path");
const Alert = require("electron-alert");    
const sound = require("sound-play");
const { log } = require("console");

// const log = require('electron-log');
// log.transports.file.resolvePath = () => path.join('C:/xampp/htdocs/app.soma/soma_electron_app', 'logs/main.log');
// get app name
const appName = app.getName();
console.log(appName);
let alert = new Alert();
function createWindow() {
  // check app is running or not
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    let swalOptions = {
      title: "កំហុស",
      text: "មានកម្មវិធីកំពុងដំណើរការ សូមបិទកម្មវិធីចាស់ជាមុនសិន",
      icon: "error"
    }; 
    const filePath_dev = path.join(__dirname, "/src/assets/alarm_1.mp3");
    const filePath_build = path.dirname(__dirname) + '/src/assets/alarm_1.mp3';
    let wheel_sound = '';
    if (isDev) {
      wheel_sound = filePath_dev;
      console.log("dev");
    }else{
      wheel_sound = filePath_build;
    }
    const volume = 1;
    sound.play(wheel_sound, volume);
    let promise = alert.fireFrameless(swalOptions, null, true, false);
    promise.then((result) => {
      if (result.value) {
        // confirmed 
        app.quit();
      } else if (result.dismiss === Alert.DismissReason.cancel) {
        // canceled
      }
    });
  }else {
    const win = new BrowserWindow({
      width: 1024,
      height: 768,
      // titleBarStyle: 'hidden',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),      
        nodeIntegration: true,
        devTools: false,
      }
    });
    // open the DevTools.
    // win.webContents.openDevTools();
    win.loadURL("https://eysan.aimsarik.com/");
    win.setIcon(path.join(__dirname, "/src/assets/home_screen.png"));
    win.maximize();
    // console.log(process.env.USERNAME); // Aim Sarik
    if (!isDev) {
      autoUpdater.checkForUpdates();
    };
    
    // wait and show progress bar
    var progressBar = new ProgressBar({
      text: 'កំពុងទាញទិន្នន័យ...',
      detail: 'សូមរង់ចាំ...'
    });
    progressBar
      .on('completed', function() {
        console.info(`completed...`);
        progressBar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', function() {
        console.info(`aborted...`);
      });
      win.webContents.on('did-finish-load',WindowsReady);

      function WindowsReady() {
          console.log('Ready');
          progressBar.setCompleted();
      }
    /* setTimeout(() => {
    }, 1000); */
    ipcMain.on('set-printer', (event, data) => {
      const logo = [
        {
            type: 'image',                               
            path: path.join(__dirname, 'src/assets/gray_logo.png'),
            position: 'center',
            width: '35mm',
        }
      ];
      let new_data = [];
      if (data.logo == true) {
        new_data = [...logo, ...data.data];
      }else {
        new_data = [...data.data];
      }
      // check printer is connected or not
      const printers_check = win.webContents.getPrintersAsync(); 
      printers_check.then((printers) => {
        // console.log(printers);
        let printer = printers.find((item) => item.name === data.printer_name);
        if (printer) {
          // print
          try {
            PosPrinter.print(new_data, data.options)
                .then(() => console.log('done'))
                .catch((error) => {
                    console.error(error);
                });
          } catch (e) {
              console.log(PosPrinter)
              console.log(e);
          }
        }else{
          // printer is not connected
          /* let swalOptions = {
            title: "កំហុស",
            text: "មិនមានម៉ាស៊ីនបោះពុម្ពទេ!"
          };
          let promise = alert.fireFrameless(swalOptions, null, true, false);
          promise.then((result) => {
            if (result.value) {
              // confirmed
            } else if (result.dismiss === Alert.DismissReason.cancel) {
              // canceled
            }
          }); */
        }
      }).catch((error) => {
        console.log(error);
      });
    });
  }
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

autoUpdater.on("checking-for-update", () => {
});

autoUpdater.on("update-available", () => {
  // progresbar with percentage
  var progressBarPer = new ProgressBar({
    indeterminate: false,
    text: 'កំពុងរៀបចំទិន្នន័យ ដើម្បីធ្វើបច្ចុប្បន្នភាព...',
    detail: 'សូមរង់ចាំ...'
  });

  progressBarPer
    .on('completed', function() {
      console.info(`completed...`);
      progressBarPer.detail = 'Task completed. Exiting...';
    })
    .on('aborted', function(value) {
      console.info(`aborted... ${value}`);
    })
    .on('progress', function(value) {
      progressBarPer.detail = `Value ${value} out of ${progressBarPer.getOptions().maxValue}...`;
    });

  autoUpdater.on("download-progress", (processTrack) => {
    if (processTrack.percent > 0) {
      progressBarPer.value = processTrack.percent;
    }
  });
});

autoUpdater.on("update-not-available", () => {
});

autoUpdater.on("error", (error) => {
});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  // restart the app and install the update
  const {session} = require('electron');
  session.defaultSession.clearCache();
  autoUpdater.quitAndInstall();
});

// ipcMain clear cache
ipcMain.on("clear-cache", (event, arg) => {
  const {session} = require('electron');
  session.defaultSession.clearCache();
  let swalOptions = {
    icon: "info",
    title: `<span style="font-family: 'Battambang'">ធ្វើបច្ចុប្បន្នភាព</span>`,
    html: `<div style="font-family: 'Battambang'">
          កម្មវិធីត្រូវការធ្វើបច្ចុប្បន្នភាព <b style="color: #dc3545;">ក្នុងរយៈពេល 10នាទី</b><br>
          សូមរក្សាទុកទិន្នន័យរបស់អ្នកអោយបានរួចរាល់</div>`,
    showConfirmButton: false,
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false
  };    
  // alert.fireFrameless(swalOptions, null, true, false);
  let promise = alert.fireWithFrame(swalOptions, null, true, false, {
        freq: "1109",
        type: "square",
        duration: "6"
      }, false);

  promise.then(() => {
    // wait 15 minutes and restart the app
    setTimeout(() => {
      let swalOptions = {
        position: "top-end",
        title: `<span style="font-family: 'Battambang'">ជោគជ័យ</span>`,
        icon: "success",
        showConfirmButton: false,
        timer: 6000
      };
      
      Alert.fireToast(swalOptions, {
        freq: "1109",
        type: "square",
        duration: "6"
      });
      setTimeout(() => {
        app.quit();
        app.relaunch();
      }, 6000);
    }, 540000);
  });
});