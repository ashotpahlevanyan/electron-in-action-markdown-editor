const { remote, ipcRenderer } = require('electron');
const { Menu } = remote;
const path = require('path');
const mainProcess = remote.require('./main.js');
const currentWindow = remote.getCurrentWindow();

const marked = require('marked');

const	markdownView = document.querySelector('#markdown');
const	htmlView = document.querySelector('#html');
const	newFileButton = document.querySelector('#new-file');
const	openFileButton = document.querySelector('#open-file');
const	saveMarkdownButton = document.querySelector('#save-markdown');
const	revertButton = document.querySelector('#revert');
const	saveHtmlButton = document.querySelector('#save-html');
const	showFileButton = document.querySelector('#show-file');
const	openInDefaultButton = document.querySelector('#open-in-default');


document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());


let filePath = null;
let originalContent = '';

markdownView.addEventListener('keyup', (event) => {
	const currentContent = event.target.value;
	renderMarkdownToHtml(currentContent);
	updateUserInterface(currentContent !== originalContent);
});

markdownView.addEventListener('contextmenu', (event) => {
	event.preventDefault();
	markdownContextMenu.popup({});
});


openFileButton.addEventListener('click', () => {
	mainProcess.getFileFromUser(currentWindow);
});

newFileButton.addEventListener('click', () => {
	mainProcess.createWindow();
});

saveHtmlButton.addEventListener('click', () => {
	mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});

saveMarkdownButton.addEventListener('click', () => {
	mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', () => {
	markdownView.value = originalContent;
	renderMarkdownToHtml(originalContent);
});

markdownView.addEventListener('dragover', (event) => {
	const file = getDraggedFile(event);

	if(fileTypeIsSupported(file)) {
		markdownView.classList.add('drag-over');
	} else {
		markdownView.classList.add('drag-error');
	}
});

markdownView.addEventListener('drop', (event) => {
	const file = getDroppedFile(event);

	if(fileTypeIsSupported(file)) {
		mainProcess.openFile(currentWindow, file.path);
	} else {
		alert('That File type is not supported');
	}

	markdownView.classList.remove('drag-over');
	markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('dragleave', () => {
	markdownView.classList.remove('drag-over');
	markdownView.classList.remove('drag-error');
});

ipcRenderer.on('file-opened', (event, file, content) => {
	if(currentWindow.isDocumentEdited()) {
		const result = remote.dialog.showMessageBox(currentWindow, {
			type: 'warning',
			title: 'Overwrite Current Unsaved Changes ?',
			message: 'Opening new file in this window will overwrite your unsaved changes. ' +
			'Open this file anyway ?',
			buttons: [
				'Yes',
				'Cancel'
			],
			defaultId: 0,
			cancelId: 1
		});

		if(result === 1) {
			return;
		}
	}

	renderFile(file, content);
});

ipcRenderer.on('file-changed', (event, file, content) => {
	const result = remote.dialog.showMessageBox(currentWindow, {
		type: 'warning',
		title: 'Overwrite Current Unsaved Changes?',
		message: 'Another application has changed this file. Load changes?',
		buttons: [
			'Yes',
			'Cancel', ],
		defaultId: 0,
		cancelId: 1
	});

	renderFile(file, content);
});

ipcRenderer.on('save-markdown', () => {
	mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

ipcRenderer.on('save-html', () => {
	mainProcess.saveHtml(currentWindow, htmlView.innerHTML);
});


const updateUserInterface = (isEdited) => {
	let title = 'Fire Sale';
	if(filePath) {
		title = `${path.basename(filePath)} - ${title}`;
	}
	if(isEdited) {
		title = `${title} (Edited)`;
	}

	currentWindow.setTitle(title);
	currentWindow.setDocumentEdited(isEdited);

	saveMarkdownButton.disabled = !isEdited;
	revertButton.disabled = !isEdited;
};

const renderMarkdownToHtml = (markdown) => {
	htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
	return ['text/plain', 'text/markdown'].includes(file.type);
};

const renderFile = (file, content) => {
	filePath = file;
	originalContent = content;

	markdownView.value = content;
	renderMarkdownToHtml(content);

	updateUserInterface(false);
};

const markdownContextMenu = Menu.buildFromTemplate([
	{ label: 'Open File', click(){ mainProcess.getFileFromUser(currentWindow); } },
	{ type: 'separator' },
	{ label: 'Cut', role: 'cut' },
	{ label: 'Paste', role: 'paste' },
	{ label: 'SelectAll', role: 'selectall' }
]);