const billingRepository = require('../repositories/billingRepository');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const subscriptionService = require('./subscriptionService');

const billingService = {
  async getStoreBilling(storeId) {
    const invoices = await billingRepository.getInvoicesByStore(storeId);
    const payments = await billingRepository.getPaymentsByStore(storeId);
    const subData = await subscriptionService.getStoreSubscriptionWithPlan(storeId);
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalPaid = paidInvoices.reduce((s, i) => s + i.total, 0);
    return { invoices, payments, subscription: subData, pendingInvoices, paidInvoices, totalPaid };
  },

  async markInvoicePaid(invoiceId, gateway, transactionId) {
    const invoice = await billingRepository.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    await billingRepository.updateInvoiceStatus(invoiceId, 'paid', new Date().toISOString(), gateway, transactionId);
    const sub = await subscriptionRepository.getStoreSubscription(invoice.storeId);
    if (sub) {
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await subscriptionRepository.upsertSubscription(invoice.storeId, invoice.tenantId, {
        planKey: sub.planKey, status: 'active',
        currentPeriodStart: now.toISOString(), currentPeriodEnd: periodEnd.toISOString()
      });
    }
    return true;
  },

  async handlePaymentWebhook(payload, gatewayName) {
    const { event, transactionId, invoiceNumber, status, amount, currency } = payload;
    if (status === 'captured' || status === 'completed') {
      const invoices = await billingRepository.getAllInvoices(100);
      let invoice = invoices.find(i => i.invoiceNumber === invoiceNumber);
      if (!invoice && transactionId) {
        invoice = invoices.find(i => i.paymentTransactionId === transactionId);
      }
      if (invoice) {
        await this.markInvoicePaid(invoice.id, gatewayName, transactionId);
        await billingRepository.recordPayment({
          storeId: invoice.storeId, tenantId: invoice.tenantId,
          invoiceId: invoice.id, gatewayName, transactionId,
          amount: amount || invoice.total, currency: currency || invoice.currency,
          paymentStatus: 'captured'
        });
        return { handled: true, invoiceId: invoice.id };
      }
    }
    return { handled: false };
  },

  async generateInvoicePdf(invoiceId) {
    const invoice = await billingRepository.getInvoiceById(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }
};

module.exports = billingService;
