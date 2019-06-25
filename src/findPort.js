const pRetry = require('p-retry');
const portfinder = require('portfinder');
const defaultPort = require('./defaultPort');

const defaultPortRetry = 3;

function runPortFinder() {
    return new Promise((resolve, reject) => {
      portfinder.basePort = defaultPort;
      portfinder.getPort((error, port) => {
        if (error) {
          return reject(error);
        }
  
        return resolve(port);
      });
    });
  }
  
  function findPort(port) {
    if (port) {
      return Promise.resolve(port);
    }
  
    return pRetry(runPortFinder, { retries: defaultPortRetry });
  }
  
  module.exports = findPort;