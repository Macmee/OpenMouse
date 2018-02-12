![OpenMouse](https://github.com/Macmee/OpenMouse/blob/master/open-mouse-header-grapic.png?raw=true)

-----

## What
OpenMouse is a **FREE AND OPEN SOURCE** alternative to payware such as Synergy or ShareMouse. It is currently under development and not ready for real use (but getting close!).

## Features

Feel free to request more features by filing an issue, or by forking and submitting a pull request.

- [x] 100% free and open source
- [x] Mouse sharing
- [x] Basic keyboard sharing
- [ ] Advanced keyboard sharing (escape/fn-keys)
- [ ] Custom keyboard shortcut forwarding to specific screen 
- [x] Scroll-wheel sharing
- [ ] Clipboard syncing
- [ ] Screensaver syncing
- [ ] File drag 'n drop
- [ ] Touchpad gesture support
- [x] CLI interface
- [ ] Graphical interface for connecting
- [ ] Graphical interface for managing screens/machines
- [ ] Audio relay
- [x] Multiplayform support (MacOS/Linux/Windows)
- [ ] Auto reconnect

## Building
To build it at the moment you require nodejs and nvm (I am running 6.3.1 and 5.5.1). Clone this repo and run `npm install`.

## Running
You can launch the server with `npm start -- --type server --nickname imac` as well as a client with `npm start -- --type client --nickname macbook --ip <server-ip>` and now you can move your cursor all the way to the right side of your machine and it will appear on the other machine. You can also try typing and scrolling.
