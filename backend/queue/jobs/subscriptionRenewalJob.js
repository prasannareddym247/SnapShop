const logger = require('../../logger');
const subscriptionService = require('../../services/subscriptionService');

async function handle(payload = {}) {
  logger.info('Checking subscription renewals...');
  const now = new Date();
  const subscriptions = await subscriptionService.getAllSubscriptions();
  let renewed = 0;
  let failed = 0;
  for (const sub of subscriptions) {
    if (sub.status === 'active' && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) <= now) {
      try {
        await subscriptionService.renewSubscription(sub.storeId || sub.StoreId);
        renewed++;
      } catch (err) {
        logger.error('Renewal failed', { storeId: sub.storeId || sub.StoreId, error: err.message });
        failed++;
      }
    }
  }
  logger.info('Subscription renewal check complete', { checked: subscriptions.length, renewed, failed });
  return { checked: subscriptions.length, renewed, failed };
}

module.exports = { handle };
