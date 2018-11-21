const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('ready', () => {

	mainWindow = new BrowserWindow({ width: 1150, height: 600, show: false});
	mainWindow.loadFile(__dirname + '/index.html');

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.webContents.openDevTools();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

});