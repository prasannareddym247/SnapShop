const orderRepository = require('../repositories/orderRepository');
const userRepository = require('../repositories/userRepository');
const storeRepository = require('../repositories/storeRepository');
const invoiceService = require('../services/invoiceService');
const notificationRepository = require('../repositories/notificationRepository');
const emailService = require('../services/emailService');

const orderController = {
  async checkout(req, res) {
    try {
      const { items, totalAmount, taxAmount, shippingAmount, paymentMethod, shippingAddress } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty.' });
      }

      const orderId = await orderRepository.createOrder(
        req.user.userId,
        { totalAmount, taxAmount, shippingAmount, shippingAddress: shippingAddress || null },
        items,
        req.tenantId,
        req.storeId,
        paymentMethod
      );

      // Populate StoreCustomers mapping (customer → store)
      try {
        await userRepository.updateStoreCustomerTotals(req.user.userId, req.storeId, totalAmount);
      } catch (scErr) {
        console.error('[StoreCustomers] Failed to update mapping:', scErr.message);
      }

      const integrationRepository = require('../repositories/integrationRepository');

      if (!paymentMethod || paymentMethod === 'COD') {
        const details = {
          trackingNumber: 'MAN-COD-' + Math.floor(100000 + Math.random() * 900000),
          courierName: 'Local COD Fleet',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Packed'
        };
        await integrationRepository.createShipmentTracking(orderId, req.storeId, req.tenantId, details);
        await integrationRepository.updateOrderStatus(orderId, 'Packed');
      }

      let checkoutUrl = null;
      if (paymentMethod && paymentMethod !== 'COD') {
        const PaymentFactory = require('../services/payment/PaymentFactory');
        const settings = await integrationRepository.getPaymentSettings(req.storeId);
        const methodSetting = settings.methods.find(m => m.MethodName === paymentMethod);
        if (methodSetting && methodSetting.IsEnabled) {
          const provider = PaymentFactory.getProvider(paymentMethod);
          const creds = settings.credentials.find(c => c.GatewayName === paymentMethod);
          const session = await provider.createPaymentSession({ orderId, totalAmount }, creds);
          if (session && session.checkoutUrl) {
            checkoutUrl = session.checkoutUrl;
          }
        }
      }
      
      await notificationRepository.createNotification({
        userId: req.user.userId,
        message: `Your order #${orderId} of ₹${totalAmount} has been placed successfully!`,
        type: 'OrderPlaced'
      });

      // Send order placed email
      try {
        const user = await userRepository.getUserByIdWithEmail(req.user.userId);
        if (user && user.email) {
          await emailService.sendOrderPlaced(user.email, {
            userName: user.firstName,
            orderId,
            totalAmount,
            itemsCount: items.length
          });
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send order placed email:', emailErr.message);
      }
      
      res.status(201).json({ message: 'Order placed successfully.', orderId, checkoutUrl });
    } catch (err) {
      console.error('Checkout controller error:', err);
      res.status(400).json({ error: err.message || 'Error processing checkout.' });
    }
  },

  async getMyOrders(req, res) {
    try {
      const orders = await orderRepository.getOrders(req.user.userId, req.storeId);
      res.json(orders);
    } catch (err) {
      console.error('Error fetching orders controller:', err);
      res.status(500).json({ error: 'Server error fetching orders.' });
    }
  },

  async getInvoice(req, res) {
    try {
      const orders = await orderRepository.getOrders(req.user.userId);
      const order = orders.find(o => o.id === parseInt(req.params.orderId));

      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      if (!order.items || order.items.length === 0) {
        return res.status(400).json({ error: 'Cannot generate invoice for an empty order.' });
      }

      if (order.orderStatus !== 'Paid' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Confirmed' && order.orderStatus !== 'Shipped' && order.orderStatus !== 'Processing' && order.orderStatus !== 'Packed') {
        return res.status(400).json({ error: 'Invoice can only be generated for completed or paid orders.' });
      }

      const user = await userRepository.getUserByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ error: 'User profile not found.' });
      }

      let storeInfo = null;
      try {
        const storeId = req.storeId || order.storeId;
        if (storeId) {
          storeInfo = await storeRepository.getStoreSettings(storeId);
        }
      } catch (e) {
        // Non-critical, continue without store info
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.id}.pdf`);

      invoiceService.generateInvoicePdf(order, user, res, storeInfo);
    } catch (err) {
      console.error('Invoice controller error:', err);
      res.status(500).json({ error: 'Server error generating PDF invoice.' });
    }
  }
};

module.exports = orderController;
