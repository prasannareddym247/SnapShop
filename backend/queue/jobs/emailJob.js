const emailService = require('../../services/emailService');
const logger = require('../../logger');

async function handle(payload) {
  const { type, to, data } = payload;
  logger.info('Processing email job', { type, to });
  switch (type) {
    case 'order_confirmed': await emailService.sendOrderConfirmed(to, data); break;
    case 'order_shipped': await emailService.sendOrderShipped(to, data); break;
    case 'order_delivered': await emailService.sendDelivered(to, data); break;
    case 'order_cancelled': await emailService.sendOrderCancelled(to, data); break;
    case 'payment_received': await emailService.sendPaymentReceived(to, data); break;
    case 'seller_approved': await emailService.sendSellerApproved(to, data); break;
    case 'password_reset': await emailService.sendPasswordReset(to, data); break;
    default: throw new Error(`Unknown email type: ${type}`);
  }
  logger.info('Email job completed', { type, to });
}

module.exports = { handle };
