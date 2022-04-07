'use strict';
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");


const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main")

// setup the titlebar main process
setupTitlebar();



/*
https://stackoverflow.com/questions/43323565/how-to-structure-a-web-electron-app-code-will-be-in-both-places
root/ 
├── assets/ 
├── css/
├── js/ 
├── node_modules/
├── index.html
├── main.js
├── package.json
├── (ect..)


https://blog.logrocket.com/comparing-best-node-js-schedulers/
https://github.com/breejs/bree                                  https://blog.logrocket.com/getting-started-with-bree-js/
https://github.com/breejs/later

# Usado no TV Scheduler:
https://github.com/node-schedule/node-schedule

*/


//require('@electron/remote/main').initialize()

const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

/*
const remote = require('electron').remote;
remote.app.relaunch();
remote.app.exit(0);
*/

// Adds debug features like hotkeys for triggering dev tools and reload
//require('electron-debug')();

// Prevent window being garbage collected
let mainWindow = null;

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

/*
ipcMain.on('asynchronous-message', (event, arg) => {
console.log(arg) // prints "ping"
event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
console.log(arg) // prints "ping"
event.returnValue = 'pong'
})
*/

/*
ipcMain.on('synchronous-message', (event, arg) => {
    console.log(arg) // prints "ping"
    event.returnValue = 'pong'
})
*/

global.allowExit = true;

function createMainWindow() {
	const win = new electron.BrowserWindow({
		// width: 400,
		// height: 120,
		frame: false,
		// x: 190,
		// y: 95,
        // transparent: true,
		//skipTaskbar: true,
		//autoHideMenuBar: true,
		titleBarStyle: 'hidden',
		darkTheme: true,
		backgroundColor: '#222222',
		icon: __dirname + '/icon.ico',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
			preload: path.join(__dirname, 'js', 'preload.js')
		}
	});

	attachTitlebarToWindow(win)
	remoteMain.enable(win.webContents);

	//win.loadFile('index.html');
	win.loadURL(`file://${__dirname}/index.html`);
	win.on('close', function(e) {
		// const choice = require('electron').dialog.showMessageBoxSync(this,
		//   {
		// 	type: 'question',
		// 	buttons: ['Yes', 'No'],
		// 	title: 'Confirm',
		// 	message: 'Are you sure you want to quit?'
		//   });
		// if (choice === 1) {
		if (global.allowExit === false) {
		  e.preventDefault();
		}
	});
	
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});


const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // Create mainWindow, load the rest of the app, etc...
  app.whenReady().then(() => {
  //})
  //app.on('activate', () => {
	  if (!mainWindow) {
		  mainWindow = createMainWindow();
	  }
  });
}



app.on('ready', () => {
	mainWindow = createMainWindow();
});
