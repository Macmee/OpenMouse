import parseArgs from 'minimist';

const args = parseArgs(process.argv.slice(2));

const constants = Object.assign({
  type: 'client',
  port: '5872',
  screenConfig: './config.json',
  nickname: require('os').hostname(),
}, args);

export default constants;
