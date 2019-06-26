const express = require('express');
const httpProxyMiddleware = require('http-proxy-middleware');
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
  function setupProxyFeature() {
    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (!Array.isArray(settings.proxy)) {
      if (Object.prototype.hasOwnProperty.call(settings.proxy, 'target')) {
        settings.proxy = [settings.proxy];
      } else {
        settings.proxy = Object.keys(settings.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof settings.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: settings.proxy[context],
            };
          } else {
            proxyOptions = Object.assign({}, settings.proxy[context]);
            proxyOptions.context = correctedContext;
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return httpProxyMiddleware(context, proxyConfig);
      }
    };
    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: ...,
     *     ...options...
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: ...,
     *       ...options...
     *     };
     *   }
     * ]
     */
    settings.proxy.forEach((proxyConfigOrCallback) => {
      let proxyConfig;
      let proxyMiddleware;

      if (typeof proxyConfigOrCallback === 'function') {
        proxyConfig = proxyConfigOrCallback();
      } else {
        proxyConfig = proxyConfigOrCallback;
      }

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      // if (proxyConfig.ws) {
      //   this.websocketProxies.push(proxyMiddleware);
      // }

      app.use((req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise byPassUrl would be null
        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined
          ? proxyConfig.bypass(req, res, proxyConfig)
          : null;

        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      });
    });
  }
  const app = express();

  // const contentBase = process.cwd();
  const contentBase = workspace.workspaceFolders[0].uri.fsPath;
  console.log('contentBase', contentBase);

  app.get('*', express.static(contentBase));
  app.get('*', serveIndex(contentBase));
  setupProxyFeature();
  // Object.keys(settings.proxy).forEach(key => {
  //   const options = settings.proxy[key];
  //   const exampleProxy = proxy(options);
  //   app.use(key, exampleProxy);
  // });
  app.use(compress());
  // listeningApp = http.createServer(app);
  return killable(app.listen(settings.port));
};