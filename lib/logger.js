const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors } = format;

const LOG_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const maskSensitive = (obj) => {
  try {
    const clone = JSON.parse(JSON.stringify(obj));
    if (clone && typeof clone === 'object') {
      const hide = (o) => {
        if (!o || typeof o !== 'object') return;
        for (const k of Object.keys(o)) {
          if (/(password|pass|pwd|token)/i.test(k)) o[k] = '****';
          else if (typeof o[k] === 'object') hide(o[k]);
        }
      };
      hide(clone);
    }
    return clone;
  } catch (e) {
    return obj;
  }
};

const myFormat = printf(({ level, message, timestamp, stack, meta }) => {
  let base = `${timestamp} ${level}: ${message}`;
  if (stack) base += `\n${stack}`;
  if (meta) {
    try {
      base += ` \nMETA: ${JSON.stringify(maskSensitive(meta), null, 2)}`;
    } catch (e) {}
  }
  return base;
});

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(errors({ stack: true }), timestamp(), colorize({ all: true }), myFormat),
  transports: [new transports.Console({ stderrLevels: ['error'] })],
});

module.exports = { logger, maskSensitive };
