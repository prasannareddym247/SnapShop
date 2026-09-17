const invoiceService = require('../../services/invoiceService');
const logger = require('../../logger');

async function handle(payload) {
  const { orderId, storeId } = payload;
  logger.info('Processing invoice generation job', { orderId, storeId });
  const invoice = await invoiceService.generateInvoice(orderId, storeId);
  logger.info('Invoice generated', { orderId, invoiceId: invoice?.id });
  return invoice;
}

module.exports = { handle };
