const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();

app.on('ready', () => {
	createWindow();
});

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
	const files = dialog.showOpenDialog(targetWindow, {
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
		openFile(targetWindow, files[0]);
	}
};

const createWindow = exports.createWindow = () => {
	let x, y;

	const currentWindow = BrowserWindow.getFocusedWindow();

	if(currentWindow) {
		const [currentWindowX, currentWindowY] = currentWindow.getPosition();
		x = currentWindowX + 20;
		y = currentWindowY + 20;
	}
	let newWindow = new BrowserWindow({x, y, width: 1150, height: 600, show: false });
	newWindow.loadFile(__dirname + '/index.html');

	newWindow.once('ready-to-show', () => {
		newWindow.show();
		newWindow.webContents.openDevTools();
	});

	newWindow.on('closed', () => {
		windows.delete(newWindow);
		newWindow = null;
	});

	windows.add(newWindow);

	return newWindow;
};

const openFile = (targetWindow, file) => {
	const content = fs.readFileSync(file).toString();
	targetWindow.webContents.send('file-opened', file, content);
};