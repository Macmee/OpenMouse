import robot from 'robotjs';
import Messages from './messages';
import settings from './settings';
import log from './log';

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
