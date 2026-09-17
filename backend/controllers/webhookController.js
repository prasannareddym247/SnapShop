const integrationRepository = require('../repositories/integrationRepository');

const webhookController = {
  async stripeWebhook(req, res) {
    const signature = req.headers['stripe-signature'];
    const event = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature header validation failed.' });
    }

    try {
      const eventId = event.id;
      const eventType = event.type;
      
      const storeId = req.storeId || 2;
      const tenantId = req.tenantId || 2;

      // Unpack payment detail metadata
      const sessionObj = event.data && event.data.object;
      const orderId = sessionObj && sessionObj.metadata && parseInt(sessionObj.metadata.orderId);

      // Prevent duplicate event logs
      const isLogged = await integrationRepository.logWebhookEvent(
        storeId,
        tenantId,
        'Stripe',
        eventId,
        eventType,
        event,
        'Success'
      );

      if (!isLogged) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      if (eventType === 'checkout.session.completed' && orderId) {
        // Transition order status
        await integrationRepository.updateOrderStatus(orderId, 'Paid');

        // Generate auto tracking shipment
        const trackingNum = 'ST-' + Math.floor(1000000000 + Math.random() * 9000000000);
        await integrationRepository.createShipmentTracking(orderId, storeId, tenantId, {
          trackingNumber: trackingNum,
          courierName: 'DHL (Stripe partner)',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Packed'
        });
        await integrationRepository.updateOrderStatus(orderId, 'Packed');
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[Webhooks] Stripe webhook error:', err.message);
      res.status(500).json({ error: 'Server error processing webhook event.' });
    }
  },

  async razorpayWebhook(req, res) {
    const signature = req.headers['x-razorpay-signature'];
    const event = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature header validation failed.' });
    }

    try {
      const eventId = event.id || ('rzp_evt_' + Math.random().toString(36).substring(7));
      const eventType = event.event;
      
      const storeId = req.storeId || 2;
      const tenantId = req.tenantId || 2;

      const paymentObj = event.payload && event.payload.payment && event.payload.payment.entity;
      const orderId = paymentObj && paymentObj.notes && parseInt(paymentObj.notes.orderId);

      const isLogged = await integrationRepository.logWebhookEvent(
        storeId,
        tenantId,
        'Razorpay',
        eventId,
        eventType,
        event,
        'Success'
      );

      if (!isLogged) {
        return res.status(200).json({ received: true, duplicate: true });
      }

      if (eventType === 'order.paid' && orderId) {
        await integrationRepository.updateOrderStatus(orderId, 'Paid');

        // Generate auto tracking shipment
        const trackingNum = 'RZP-' + Math.floor(1000000000 + Math.random() * 9000000000);
        await integrationRepository.createShipmentTracking(orderId, storeId, tenantId, {
          trackingNumber: trackingNum,
          courierName: 'Delhivery (Razorpay partner)',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Packed'
        });
        await integrationRepository.updateOrderStatus(orderId, 'Packed');
      }

      res.json({ received: true });
    } catch (err) {
      console.error('[Webhooks] Razorpay webhook error:', err.message);
      res.status(500).json({ error: 'Server error processing webhook event.' });
    }
  },

  async shippingWebhook(req, res) {
    // Shiprocket shipment status change updates mock
    try {
      const { trackingNumber, status, statusMessage } = req.body;
      if (!trackingNumber) {
        return res.status(400).json({ error: 'Tracking number required.' });
      }
      res.json({ received: true });
    } catch (err) {
      res.status(500).json({ error: 'Server error shipping webhook.' });
    }
  }
};

module.exports = webhookController;
