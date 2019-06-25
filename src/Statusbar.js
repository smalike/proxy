const vscode = require('vscode');

let statusbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 4.5);
statusbar.show();

function Init() {
  console.log('exec Init');
  Working('loading...');
  setTimeout(function () {
    Live();
  }, 1000);
}

function Working(workingMsg) {
  workingMsg = workingMsg || 'Working on it...';
  statusbar.text = `$(pulse)${workingMsg}`;
  statusbar.tooltip = 'In case if it takes long time, try to close all browser window.';
  statusbar.command = null;
}

function Live() {
  statusbar.text = '$(flame) Proxy';
  statusbar.command = 'extension.proxy.goOnline';
  statusbar.tooltip = 'Click to run live server';
}

function Offline(port) {
  statusbar.text = `$(circle-slash) Port : ${port}`;
  statusbar.command = 'extension.proxy.goOffline';
  statusbar.tooltip = 'Click to close server';
}

function dispose() {
  statusbar.dispose();
}

module.exports = {
  Init,
  Working,
  Live,
  Offline,
  dispose
};