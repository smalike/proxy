const vscode = require('vscode');
const ips = require('ips');
const open = require('open');
const Statusbar = require('./Statusbar');
const server = require('./server');

const { commands, window, workspace, Event, EventEmitter } = vscode;
const _ips = ips();
const localIps = _ips.local;
let IsStaging = false;
let IsServerRunning = false;
let runningPort;
const SUPPRORTED_EXT = [
  '.proxyrc.js'
];

function ToggleStatusBar() {
  IsStaging = false;
  if (!IsServerRunning) {
    Statusbar.Offline(runningPort);
  }
  else {
    Statusbar.Live();
  }

  IsServerRunning = !IsServerRunning;
}

function Golive() {
  IsStaging = true;
  console.log('Server star...');
  server.start().then((ser) => {
    console.log('ser', ser);
    runningPort = ser.port;
    ToggleStatusBar();
    openBrowser(runningPort, '');
  });
  Statusbar.Working('Starting...');
}

function GoOffline() {
  if (IsStaging) {
    return;
  }
  if (!IsServerRunning) {
    this.showPopUpMsg(`Server is not already running`);
    return;
  }
  console.log('Server stop');
  server.stop().then(() => {
    ToggleStatusBar();
  });
  showPopUpMsg('Server is now offline.');
  Statusbar.Working('Disposing...');
}

haveAnySupportedFile().then(() => {
  Statusbar.Init();
});

function haveAnySupportedFile() {
  return new Promise(resolve => {
    const globFormat = `**/${SUPPRORTED_EXT}`;
    workspace.findFiles(globFormat, '**/node_modules/**', 1)
      .then(async (files) => {
        console.log('files', files);
        if (files && files.length) return resolve();
      });
    // return resolve();
  });
}

function showPopUpMsg(msg, isErrorMsg, isWarning) {
  if (isErrorMsg) {
    window.showErrorMessage(msg);
  }
  else if (isWarning) {
    const donotShowMsg = 'I understand, Don\'t show again';
    window.showWarningMessage(msg, donotShowMsg)
      .then(choise => {
        if (choise && choise === donotShowMsg) {
          // Config.setDonotVerifyTags(true, true);
        }
      });
  }
  else {
    const donotShowMsg = 'Don\'t show again';
    window.showInformationMessage(msg, donotShowMsg)
      .then(choice => {
        if (choice && choice === donotShowMsg) {
          // Config.setDonotShowInfoMsg(true, true);
        }
      });
  }
}

function openBrowser(port, path) {
  const host = localIps;
  const protocol = 'http';
  if (path.startsWith('\\') || path.startsWith('/')) {
    path = path.substring(1, path.length);
  }
  path = path.replace(/\\/gi, '/');
  try {
    open(`${protocol}://${host}:${port}/${path}`);
  } catch (error) {
    showPopUpMsg(`Server is started at ${runningPort} but failed to open browser. Try to change the CustomBrowser settings.`, true);
    console.log('\n\nError Log to open Browser : ', error);
    console.log('\n\n');
  }
}

function dispose() {
  Statusbar.dispose();
}

module.exports = {
  Golive,
  GoOffline
};