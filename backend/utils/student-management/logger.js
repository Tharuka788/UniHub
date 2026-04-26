function logInfo(message, meta = {}) {
  console.log(JSON.stringify({ level: 'info', message, ...meta }));
}

function logWarn(message, meta = {}) {
  console.warn(JSON.stringify({ level: 'warn', message, ...meta }));
}

function logError(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', message, ...meta }));
}

module.exports = {
  logInfo,
  logWarn,
  logError,
};
