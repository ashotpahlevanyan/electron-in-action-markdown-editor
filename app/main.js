const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

let mainWindow = null;

app.on('ready', () => {

	mainWindow = new BrowserWindow({ width: 1150, height: 600, show: false});
	mainWindow.loadFile(__dirname + '/index.html');

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.webContents.openDevTools();
		//getFileFromUser();
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

});

const getFileFromUser = exports.getFileFromUser = () => {
	const files = dialog.showOpenDialog(mainWindow, {
		properties: ['openFile'],
		filters: [
			{
				name: 'Text Files', extensions: ['txt']
			},
			{
				name: 'Markdown Files', extensions: ['md', 'markdown']
			}
		]
	});
	if(files) {
		openFile(files[0]);
	}
};

const openFile = (file) => {
	const content = fs.readFileSync(file).toString();
	mainWindow.webContents.send('file-opened', file, content);
};