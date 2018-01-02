import os from 'os';

const ifaces = os.networkInterfaces();

const interfaces = [];

Object.keys(ifaces).forEach(ifname => {
  let alias = 0;
  ifaces[ifname].forEach(iface => {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    if (alias >= 1) {
      interfaces.push(iface.address);
    } else {
      interfaces.push(iface.address);
    }
    alias++;
  });
});

export default interfaces;
