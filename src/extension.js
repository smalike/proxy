const vscode = require('vscode');
const open = require('open');
const app = require('./app');

const { commands, window, workspace, Event, EventEmitter } = vscode;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // context.subscriptions.push(commands
  //   .registerCommand('extension.proxy', function () {
  //     vscode.window.showInformationMessage('proxy!');
  //     open('http://localhost:3000/');
  //   })
  // );
  console.log('exec activate');
  context.subscriptions.push(commands
    .registerCommand('extension.proxy.goOnline', async (fileUri) => {
      app.Golive(fileUri ? fileUri.fsPath : null);
    })
  );

  context.subscriptions.push(commands
    .registerCommand('extension.proxy.goOffline', () => {
      app.GoOffline();
    })
  );

  context.subscriptions.push(app);
}
// exports.activate = activate;

function deactivate() { }

module.exports = {
  activate,
  deactivate
}
