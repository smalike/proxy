const findPort = require('./findPort');
const vscode = require('vscode');
const { commands, window, workspace, Event, EventEmitter } = vscode;
const proxy = require('./proxy');
let defaultPort = require('./defaultPort');

let server;

module.exports = {
  start: function start() {
    console.log('proxy start');
    return new Promise((resolve) => {
      workspace.findFiles('**/.proxyrc.js')
        .then(async (files) => {
          console.log('files', files);
          if (files && files.length) {
            let proxyrc = require(files[0].path);
            console.log('proxyrc', proxyrc);
            defaultPort = proxyrc.port;
            return findPort().then((port) => {
              proxyrc.port = port;
              server = proxy(proxyrc);
              return resolve({ server, port });
            });
          }
        });
    });
  },
  stop: function stop() {
    console.log('proxy stop');
    return new Promise((resolve) => {
      server.kill();
      return resolve();
    });
  }
};
