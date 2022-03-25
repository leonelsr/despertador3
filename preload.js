const { Menu, getCurrentWindow } = require('@electron/remote');
const Titlebar = require('@6c65726f79/custom-titlebar');
const { platform } = require('process');

const currentWindow = getCurrentWindow();
let titlebar;

currentWindow.webContents.once('dom-ready', () => {
    titlebar = new Titlebar({
        menu: Menu.getApplicationMenu(),
        backgroundColor: '#444',
        platform: platform,
        browserWindow: currentWindow, /* Only needed if you use MenuItem roles */
        onMinimize: () => currentWindow.minimize(),
        onMaximize: () => currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize(),
        onClose: () => currentWindow.close(),
        isMaximized: () => currentWindow.isMaximized()
    });
});
