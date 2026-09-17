const logger = require('../logger');

const QUEUE_DRIVER = process.env.QUEUE_DRIVER || 'sync';

const handlers = {};

function register(jobName, handler) {
  handlers[jobName] = handler;
}

async function dispatch(jobName, payload, options = {}) {
  logger.info(`Queue dispatch: ${jobName}`, { driver: QUEUE_DRIVER, payloadKeys: Object.keys(payload) });
  if (QUEUE_DRIVER === 'sync') {
    const handler = handlers[jobName];
    if (!handler) {
      logger.error(`No handler registered for job: ${jobName}`);
      return { success: false, error: `No handler for ${jobName}` };
    }
    try {
      const result = await handler(payload);
      logger.info(`Job completed: ${jobName}`, { success: true });
      return { success: true, result };
    } catch (err) {
      logger.error(`Job failed: ${jobName}`, { error: err.message, stack: err.stack });
      return { success: false, error: err.message };
    }
  }
  logger.warn(`Queue driver "${QUEUE_DRIVER}" not implemented — job "${jobName}" skipped`);
  return { success: false, error: `Driver ${QUEUE_DRIVER} not available` };
}

async function schedule(jobName, cronExpression, payload) {
  logger.info(`Job scheduled: ${jobName}`, { cron: cronExpression, driver: QUEUE_DRIVER });
  if (QUEUE_DRIVER === 'sync') {
    logger.warn('Scheduled jobs not supported with sync driver — install BullMQ or similar');
    return;
  }
}

module.exports = { register, dispatch, schedule };
