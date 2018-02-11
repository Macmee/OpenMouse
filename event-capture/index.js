import electron from 'electron';
import path from 'path';
import url from 'url';
import Observable from '../observable';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

/* disgusting hack to prevent electron from backgrounding */

electron.powerSaveBlocker.start('prevent-app-suspension');

class EventCapture extends Observable {

  createWindow () {
    this.window = new BrowserWindow({
      width: 500,
      height: 500,
      frame: false,
      transparent: true,
    });
    this.window.loadURL(url.format({
      pathname: path.join(__dirname, 'event-capture.html'),
      protocol: 'file:',
      slashes: true,
    }));
    this.window.on('closed', () => {
      this.window = null;
    });
    this.window.setPosition(250, 250);
    this.window.hide();
  }

  constructor() {
    super();
    this.window = null;
    app.on('ready', this.createWindow.bind(this));
    app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    app.on('activate', function () {
      if (this.window === null) {
        this.createWindow();
      }
    });
  }

  start() {
    this.window.show();
  }

  stop() {
    this.window.hide();
  }

}

export default (new EventCapture);
