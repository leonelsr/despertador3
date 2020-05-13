'use strict';
const electron = require('electron');

const app = electron.app;

/*
const remote = require('electron').remote;
remote.app.relaunch();
remote.app.exit(0);
*/

// Adds debug features like hotkeys for triggering dev tools and reload
//require('electron-debug')();

// Prevent window being garbage collected
let mainWindow;

function onClosed() {
	// Dereference the window
	// For multiple windows store them in an array
	mainWindow = null;
}

const { ipcMain } = require('electron')

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

global.allowExit = false;

function createMainWindow() {
	const win = new electron.BrowserWindow({
		// width: 400,
		// height: 120,
		//frame: false,
		// x: 190,
		// y: 95,
        // transparent: true,
		//skipTaskbar: true,
		darkTheme: true,
		backgroundColor: '#222222',
		webPreferences: {
			nodeIntegration: true
		}
	});

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

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});
