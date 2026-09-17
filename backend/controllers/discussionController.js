const discussionRepository = require('../repositories/discussionRepository');
const notificationRepository = require('../repositories/notificationRepository');

const discussionController = {
  async getDiscussions(req, res) {
    try {
      const { productId, sellerId } = req.query;
      const user = req.user;

      let targetSellerId = sellerId ? parseInt(sellerId) : null;
      let targetProductId = productId ? parseInt(productId) : null;

      // Access checks: Sellers can only view discussions where they are the sellerId
      if (user.role === 'Seller') {
        if (targetSellerId && targetSellerId !== user.userId) {
          return res.status(403).json({ error: 'Access denied. You can only view discussions for your own store.' });
        }
        targetSellerId = user.userId;
      }

      const discussions = await discussionRepository.getDiscussions(targetProductId, targetSellerId);
      res.json(discussions);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      res.status(500).json({ error: 'Server error fetching discussions.' });
    }
  },

  async createMessage(req, res) {
    try {
      const { productId, sellerId, message, attachmentUrl } = req.body;
      const user = req.user;

      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      let targetSellerId = sellerId ? parseInt(sellerId) : null;
      let targetProductId = productId ? parseInt(productId) : null;

      // Access checks: Sellers can only post messages for their own store context
      if (user.role === 'Seller') {
        if (targetSellerId && targetSellerId !== user.userId) {
          return res.status(403).json({ error: 'Access denied. You can only create messages for your own store.' });
        }
        targetSellerId = user.userId;
      } else if (user.role === 'Admin') {
        // Admin must specify who the seller is (or context)
        if (!targetSellerId) {
          return res.status(400).json({ error: 'Seller ID is required for administrative messages.' });
        }
      }

      const messageId = await discussionRepository.createMessage({
        productId: targetProductId,
        sellerId: targetSellerId,
        senderId: user.userId,
        senderRole: user.role,
        message,
        attachmentUrl
      });

      // Notify the other party
      if (user.role === 'Admin' && targetSellerId) {
        await notificationRepository.createNotification({
          userId: targetSellerId,
          message: `New message from Admin: "${message.substring(0, 80)}"`,
          type: 'ChatMessage'
        });
      } else if (user.role === 'Seller') {
        await notificationRepository.createNotification({
          userId: null,
          message: `New message from seller ${req.user.email}: "${message.substring(0, 80)}"`,
          type: 'ChatMessage'
        });
      }

      res.status(201).json({
        message: 'Message posted successfully.',
        id: messageId,
        productId: targetProductId,
        sellerId: targetSellerId,
        senderId: user.userId,
        senderRole: user.role,
        message,
        attachmentUrl,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error creating discussion message:', err);
      res.status(500).json({ error: 'Server error posting message.' });
    }
  }
};

module.exports = discussionController;
