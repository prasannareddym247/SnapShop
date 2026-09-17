const wishlistRepository = require('../repositories/wishlistRepository');
const reviewRepository = require('../repositories/reviewRepository');
const addressRepository = require('../repositories/addressRepository');
const orderRepository = require('../repositories/orderRepository');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');
const queryRepository = require('../repositories/queryRepository');
const productRepository = require('../repositories/productRepository');


const customerController = {
  // Wishlist
  async getWishlist(req, res) {
    try {
      const items = await wishlistRepository.getWishlist(req.user.userId);
      res.json(items);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      res.status(500).json({ error: 'Server error loading wishlist.' });
    }
  },

  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ error: 'Product ID is required.' });
      const product = await productRepository.getProductById(productId);
      if (!product || product.status !== 'Active') {
        return res.status(404).json({ error: 'Product not found or is inactive.' });
      }
      const wishlistId = await wishlistRepository.addToWishlist(req.user.userId, productId);
      res.status(201).json({ message: 'Added to wishlist successfully.', id: wishlistId });
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      res.status(500).json({ error: 'Server error adding to wishlist.' });
    }
  },

  async removeFromWishlist(req, res) {
    try {
      await wishlistRepository.removeFromWishlist(req.user.userId, req.params.productId);
      res.json({ message: 'Removed from wishlist successfully.' });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      res.status(500).json({ error: 'Server error removing from wishlist.' });
    }
  },

  // Reviews
  async getProductReviews(req, res) {
    try {
      const product = await productRepository.getProductById(req.params.productId);
      if (!product || product.status !== 'Active') {
        return res.status(404).json({ error: 'Product not found.' });
      }
      const reviews = await reviewRepository.getReviewsForProduct(req.params.productId);
      const ratingInfo = await reviewRepository.getAverageRating(req.params.productId);
      res.json({ reviews, ...ratingInfo });
    } catch (err) {
      console.error('Error getting reviews:', err);
      res.status(500).json({ error: 'Server error fetching reviews.' });
    }
  },

  async addReview(req, res) {
    try {
      const { rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating between 1 and 5 is required.' });
      }
      const product = await productRepository.getProductById(req.params.productId);
      if (!product || product.status !== 'Active') {
        return res.status(404).json({ error: 'Product not found.' });
      }
      const reviewId = await reviewRepository.addReview(req.user.userId, req.params.productId, rating, comment);
      res.status(201).json({ message: 'Review submitted successfully.', id: reviewId });
    } catch (err) {
      console.error('Error adding review:', err);
      res.status(500).json({ error: 'Server error saving review.' });
    }
  },

  // Addresses
  async getAddresses(req, res) {
    try {
      const addresses = await addressRepository.getAddresses(req.user.userId);
      res.json(addresses);
    } catch (err) {
      console.error('Error getting addresses:', err);
      res.status(500).json({ error: 'Server error fetching addresses.' });
    }
  },

  async addAddress(req, res) {
    try {
      const { addressType, line1, line2, city, state, postalCode, country } = req.body;
      if (!line1 || !city || !state || !postalCode) {
        return res.status(400).json({ error: 'Line1, city, state, and postal code are required.' });
      }
      const address = await addressRepository.addAddress(req.user.userId, { addressType, line1, line2, city, state, postalCode, country });
      res.status(201).json(address);
    } catch (err) {
      console.error('Error adding address:', err);
      res.status(500).json({ error: 'Server error saving address.' });
    }
  },

  async deleteAddress(req, res) {
    try {
      await addressRepository.deleteAddress(req.user.userId, req.params.id);
      res.json({ message: 'Address deleted successfully.' });
    } catch (err) {
      console.error('Error deleting address:', err);
      res.status(500).json({ error: 'Server error deleting address.' });
    }
  },

  // Returns
  async requestReturn(req, res) {
    try {
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ error: 'Reason for return is required.' });
      
      const returnId = await orderRepository.createReturn(req.params.orderId, reason);
      res.status(201).json({ message: 'Return request submitted successfully.', returnId });
    } catch (err) {
      console.error('Error requesting return:', err);
      res.status(500).json({ error: 'Server error submitting return request.' });
    }
  },

  // Payment Methods
  async getPaymentMethods(req, res) {
    try {
      // Mock saved payment cards
      res.json([
        { id: 1, type: 'Visa', last4: '4242', expDate: '12/28', bank: 'HDFC Bank' },
        { id: 2, type: 'Mastercard', last4: '9876', expDate: '08/29', bank: 'ICICI Bank' }
      ]);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  },

  async getNotifications(req, res) {
    try {
      const userId = req.user.role === 'Admin' ? null : req.user.userId;
      const list = await notificationRepository.getNotifications(userId);
      res.json(list);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ error: 'Server error loading notifications.' });
    }
  },

  async markNotificationRead(req, res) {
    try {
      await notificationRepository.markAsRead(req.params.id);
      res.json({ message: 'Notification marked as read.' });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      res.status(500).json({ error: 'Server error updating notification.' });
    }
  },

  async markAllNotificationsRead(req, res) {
    try {
      const userId = req.user.role === 'Admin' ? null : req.user.userId;
      await notificationRepository.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      res.status(500).json({ error: 'Server error updating notifications.' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, profilePicture, address, city, state, country, postalCode, alternatePhone } = req.body;
      if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required.' });
      }

      await userRepository.updateUserProfile(req.user.userId, {
        firstName,
        lastName,
        profilePicture,
        address,
        city,
        state,
        country,
        postalCode,
        alternatePhone
      });

      res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
      console.error('Error updating customer profile:', err);
      res.status(500).json({ error: 'Server error updating profile.' });
    }
  },

  async getQueries(req, res) {
    try {
      const list = await queryRepository.getQueriesForCustomer(req.user.userId);
      res.json(list);
    } catch (err) {
      console.error('Error fetching customer queries:', err);
      res.status(500).json({ error: 'Server error fetching support queries.' });
    }
  },

  async createQuery(req, res) {
    try {
      const { productId, subject, message } = req.body;
      if (!productId || !message) {
        return res.status(400).json({ error: 'Product ID and message are required.' });
      }

      const product = await productRepository.getProductById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const queryData = {
        customerId: req.user.userId,
        customerName: req.user.firstName + ' ' + req.user.lastName,
        productId: parseInt(productId),
        productName: product.name,
        vendorId: product.vendorId,
        subject: subject || `Query on: ${product.name}`,
        message: message
      };

      const query = await queryRepository.createQuery(queryData);
      res.status(201).json(query);
    } catch (err) {
      console.error('Error creating support query:', err);
      res.status(500).json({ error: 'Server error creating support query.' });
    }
  },

  async getOrderById(req, res) {
    try {
      const orderId = parseInt(req.params.id || req.params.orderId);
      const order = await orderRepository.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      if (req.storeId && order.storeId !== req.storeId) {
        return res.status(403).json({ error: 'Access denied: store context mismatch.' });
      }

      const integrationRepository = require('../repositories/integrationRepository');
      const tracking = await integrationRepository.getShipmentTracking(orderId);
      if (tracking) {
        order.shipmentTracking = tracking;
        order.orderStatus = tracking.shipmentStatus || order.orderStatus;
      }

      res.json(order);
    } catch (err) {
      console.error('[Customer] getOrderById error:', err);
      res.status(500).json({ error: 'Server error loading order details.' });
    }
  }
};

module.exports = customerController;
