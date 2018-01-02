require('import-export');

const settings = require('./settings');

require(settings.type === 'server' ? './server' : './client');
