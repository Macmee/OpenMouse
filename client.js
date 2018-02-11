import robot from 'robotjs';
import keycode from 'keycode';
import Messages from './messages';
import settings from './settings';
import log from './log';

import electron from 'electron';

if (!settings.ip) {
  log('IP_MISSING', 'Please provide an IP address to connect to with the --ip flag', true);
}

const client = new Messages(settings.port);

client.on('CONNECTED', data => {
  log('REQUEST_NICKNAME', `attempting to set nickname to ${settings.nickname}`);
  client.send(data.id, 'REQUEST_NICKNAME', { nickname: settings.nickname });
});

client.connect(settings.ip, settings.port);

client.on('coord', data => {
  robot.moveMouse(data.x, data.y);
});

client.on('md', data => {
  robot.mouseToggle('down');
});

client.on('mu', data => {
  robot.mouseToggle('up');
});

client.on('kd', data => {
  robot.keyToggle(keycode(data.c), 'down');
});

client.on('ku', data => {
  robot.keyToggle(keycode(data.c), 'up');
});

client.on('wh', data => {
  robot.scrollMouse(data.x || 0, data.y || 0);
});

//electron.app.commandLine.appendSwitch('disable-renderer-backgrounding');
electron.powerSaveBlocker.start('prevent-app-suspension');
