const express = require('express');
const proxy = require('http-proxy-middleware');
const vscode = require('vscode');
const { commands, window, workspace, Event, EventEmitter } = vscode;
const serveIndex = require('serve-index');
const compress = require('compression');
const chokidar = require('chokidar');
const killable = require('killable');


module.exports = function (settings) {
  let contentBaseWatchers = [];

  function close(cb) {
    this.sockets.forEach((socket) => {
      this.socketServer.close(socket);
    });

    this.sockets = [];

    this.contentBaseWatchers.forEach((watcher) => {
      watcher.close();
    });

    this.contentBaseWatchers = [];

    this.listeningApp.kill(() => {
      this.middleware.close(cb);
    });
  }
  function sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      socketServer.send(socket, JSON.stringify({ type, data }));
    });
  }
  function _watch(watchPath) {
    const usePolling = true;
    const interval = 5;

    const watchOptions = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
      ignored: null,
      usePolling,
      interval,
    };

    const watcher = chokidar.watch(watchPath, watchOptions);
    // disabling refreshing on changing the content
    // if (this.options.liveReload !== false) {
    watcher.on('change', () => {
      sockWrite(this.sockets, 'content-changed');
    });
    // }
    contentBaseWatchers.push(watcher);
  }
  const app = express();

  // const contentBase = process.cwd();
  const contentBase = workspace.workspaceFolders[0].uri.fsPath;
  console.log('contentBase', contentBase);

  app.get('*', express.static(contentBase));
  app.get('*', serveIndex(contentBase));

  Object.keys(settings.proxy).forEach(key => {
    const options = settings.proxy[key];
    const exampleProxy = proxy(options);
    app.use(key, exampleProxy);
  });
  app.use(compress());
  // listeningApp = http.createServer(app);
  return killable(app.listen(settings.port));
};