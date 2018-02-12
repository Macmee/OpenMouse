![OpenMouse](open-mouse-header-graphic.png)

OpenMouse is a free and open source alternative to payware such as Synergy or ShareMouse.

It is currently under development.

To build it at the moment you require nodejs and nvm (I am running 6.3.1 and 5.5.1). Clone this repo and run `npm install`.

You can launch the server with `npm start -- --type server --nickname imac` as well as a client with `npm start -- --type client --nickname macbook --ip <server-ip>` and now you can move your cursor all the way to the right side of your machine and it will appear on the other machine. You can also try typing and scrolling.

Again, this is still being developed, so stay tuned.
