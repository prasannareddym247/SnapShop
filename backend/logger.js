const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] !== undefined ? LOG_LEVELS[process.env.LOG_LEVEL] : LOG_LEVELS.info;

function formatLog(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    pid: process.pid,
    host: require('os').hostname()
  };
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  const prefix = `[${level.toUpperCase()}]`;
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${prefix} ${message}${metaStr}`;
}

const logger = {
  debug: (msg, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.debug) console.debug(formatLog('debug', msg, meta)); },
  info: (msg, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.info) console.info(formatLog('info', msg, meta)); },
  warn: (msg, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.warn) console.warn(formatLog('warn', msg, meta)); },
  error: (msg, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.error) console.error(formatLog('error', msg, meta)); },
  fatal: (msg, meta) => { if (CURRENT_LEVEL <= LOG_LEVELS.fatal) console.error(formatLog('fatal', msg, meta)); },
  child: (defaultMeta) => {
    return Object.fromEntries(
      Object.entries(logger).filter(([k]) => k !== 'child').map(([k, fn]) => [
        k,
        (msg, meta) => fn(msg, { ...defaultMeta, ...meta })
      ])
    );
  }
};

module.exports = logger;
