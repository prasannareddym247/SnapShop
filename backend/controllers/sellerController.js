const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const couponRepository = require('../repositories/couponRepository');
const reviewRepository = require('../repositories/reviewRepository');
const queryRepository = require('../repositories/queryRepository');
const userRepository = require('../repositories/userRepository');
const notificationRepository = require('../repositories/notificationRepository');
const addressRepository = require('../repositories/addressRepository');
const emailService = require('../services/emailService');
const announcementService = require('../services/announcementService');




const sellerController = {
  // Store Profile
  async getProfile(req, res) {
    try {
      const user = await userRepository.getUserById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'Seller profile not found.' });
      res.json({
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        sellerStatus: user.sellerStatus,
        discountRate: user.discountRate || 0,
        discountScope: user.discountScope || 'all',
        discountProductIds: user.discountProductIds || [],
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gstin: user.gstin,
        panNumber: user.panNumber,
        bankAccountHolder: user.bankAccountHolder,
        bankName: user.bankName,
        bankAccountNumber: user.bankAccountNumber,
        bankIfscCode: user.bankIfscCode,
        docGovId: user.docGovId,
        docPan: user.docPan,
        docGst: user.docGst,
        docBizReg: user.docBizReg,
        docBank: user.docBank,
        businessType: user.businessType,
        selectedTemplate: user.selectedTemplate
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading profile.' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { storeName, storeDescription, discountRate, discountScope, discountProductIds } = req.body;
      if (!storeName) return res.status(400).json({ error: 'Store name is required.' });
      await userRepository.updateSellerProfile(req.user.userId, {
        storeName,
        storeDescription,
        discountRate: parseFloat(discountRate) || 0,
        discountScope: discountScope || 'all',
        discountProductIds: discountProductIds || []
      });
      res.json({ message: 'Store profile updated successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating profile.' });
    }
  },

  // Products CRUD
  async getProducts(req, res) {
    try {
      const products = await productRepository.getProducts(req.tenantId);
      // Filter for this seller
      const sellerProducts = products.filter(p => p.vendorId === req.user.userId);
      res.json(sellerProducts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading products.' });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, category, description, storageInstructions, imageUrl, imagePrompt, bullets, variants, discount, saleStartDate, saleEndDate, brand, warrantyInformation, rating, images, featured_image, minimumOrderQuantity, shippingInformation, returnPolicy, availabilityStatus } = req.body;
      if (!name || !category || !description || !variants || variants.length === 0) {
        return res.status(400).json({ error: 'Name, category, description, and at least one variant are required.' });
      }
      const product = await productRepository.createProduct(
        { 
          name, category, description, storageInstructions, imageUrl, imagePrompt, bullets, 
          vendorId: req.user.userId, 
          tenantId: req.tenantId, 
          storeId: req.storeId, 
          status: 'Active',
          discount: parseFloat(discount) || 0, 
          saleStartDate, 
          saleEndDate,
          brand,
          warrantyInformation,
          rating,
          images,
          featured_image,
          minimumOrderQuantity,
          shippingInformation,
          returnPolicy,
          availabilityStatus,
          variants // Pass variants details too
        },
        variants
      );

      // Notify admin
      await notificationRepository.createNotification({
        userId: null,
        message: `New product "${name}" created by ${req.user.email}.`,
        type: 'ProductCreated'
      });
      
      res.status(201).json({ message: 'Product created successfully.', product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error creating product.' });
    }
  },

  async updateProduct(req, res) {
    try {
      const { name, category, description, storageInstructions, imageUrl, imagePrompt, bullets, variants, discount, brand, warrantyInformation, rating, images, featured_image, minimumOrderQuantity, shippingInformation, returnPolicy, availabilityStatus, status } = req.body;
      console.log(`[SELLER UPDATE] Product ID: ${req.params.id}, Category received: "${category}", Status received: "${status}"`);
      if (!name || !category || !description) {
        return res.status(400).json({ error: 'Name, category, and description are required.' });
      }
      
      // Verify ownership
      const existing = await productRepository.getProductById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Product not found.' });
      if (existing.vendorId !== req.user.userId) return res.status(403).json({ error: 'Access denied. You do not own this product.' });
      
      const product = await productRepository.updateProduct(
        req.params.id,
        { name, category, description, storageInstructions, status: status || 'Active', imageUrl, imagePrompt, bullets, discount: parseFloat(discount) || 0, brand, warrantyInformation, rating, images, featured_image, minimumOrderQuantity, shippingInformation, returnPolicy, availabilityStatus, variants },
        variants
      );
      
      // Notify Admin
      await notificationRepository.createNotification({
        userId: null, // null userId means it goes to Admin
        message: `Product "${name}" has been updated by seller.`,
        type: 'ProductUpdated'
      });
      
      // Return the product including the status used for the update
      res.json({ message: 'Product updated successfully.', product, statusUsed: status || 'Active', debugBody: req.body });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating product.' });
    }
  },

  async deleteProduct(req, res) {
    try {
      // Verify ownership
      const existing = await productRepository.getProductById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Product not found.' });
      if (existing.vendorId !== req.user.userId) return res.status(403).json({ error: 'Access denied. You do not own this product.' });
      
      await productRepository.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error deleting product.' });
    }
  },

  // Orders Fulfillment
  async getOrders(req, res) {
    try {
      const orderItems = await orderRepository.getSellerOrders(req.user.userId);
      res.json(orderItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading orders.' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status, notes } = req.body; // e.g. Processing, Confirmed, Packed, Shipped, Delivered, Cancelled
      if (!status) return res.status(400).json({ error: 'Status is required.' });
      
      // Check if this order contains seller products
      const orderItems = await orderRepository.getSellerOrders(req.user.userId);
      const belongs = orderItems.some(oi => oi.id === parseInt(req.params.orderId));
      if (!belongs) return res.status(403).json({ error: 'Access denied. Order does not belong to your store.' });

      await orderRepository.updateOrderStatus(req.params.orderId, status, notes);

      // Send order status email
      try {
        const orders = await orderRepository.getAllOrders();
        const order = orders.find(o => o.id === parseInt(req.params.orderId));
        if (order) {
          const user = await userRepository.getUserByIdWithEmail(order.userId);
          if (user && user.email) {
            const statusEmailMap = {
              'Processing': emailService.sendOrderConfirmed,
              'Shipped': emailService.sendOrderShipped,
              'Delivered': emailService.sendDelivered,
              'Cancelled': emailService.sendOrderCancelled
            };
            const sendFn = statusEmailMap[status];
            if (sendFn) {
              await sendFn(user.email, { userName: user.firstName, orderId: order.id });
            }
          }
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send status update email:', emailErr.message);
      }

      res.json({ message: 'Order status updated successfully.', orderId: req.params.orderId, status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating order.' });
    }
  },

  // Coupons CRUD
  async getCoupons(req, res) {
    try {
      const coupons = await couponRepository.getCoupons(req.user.userId);
      res.json(coupons);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading coupons.' });
    }
  },

  async createCoupon(req, res) {
    try {
      const { code, discountType, discountValue, expiryDate, minOrderValue, usageLimit, perCustomerLimit } = req.body;
      if (!code || !discountType || !discountValue) {
        return res.status(400).json({ error: 'Code, discountType, and discountValue are required.' });
      }
      const coupon = await couponRepository.createCoupon({
        code,
        discountType,
        discountValue,
        expiryDate,
        minOrderValue,
        usageLimit,
        perCustomerLimit,
        vendorId: req.user.userId
      });
      res.status(201).json(coupon);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error creating coupon.' });
    }
  },

  async deleteCoupon(req, res) {
    try {
      // Validate coupon belongs to seller
      const coupons = await couponRepository.getCoupons(req.user.userId);
      const exists = coupons.some(c => c.id === parseInt(req.params.id));
      if (!exists) return res.status(403).json({ error: 'Access denied.' });
      
      await couponRepository.deleteCoupon(req.params.id);
      res.json({ message: 'Coupon deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error deleting coupon.' });
    }
  },

  // Analytics
  async getAnalytics(req, res) {
    try {
      const orderItems = await orderRepository.getSellerOrders(req.user.userId);
      const tenantId = req.user.tenantId || req.tenantId || 1;
      const products = await productRepository.getProducts(tenantId);
      const sellerProducts = products.filter(p => p.vendorId === req.user.userId);
      
      // Calculate revenue from paid/delivered orders
      let totalRevenue = 0;
      const uniqueOrders = new Set();
      const lowStockAlerts = [];
      const productSales = {};

      orderItems.forEach(oi => {
        if (oi.orderStatus !== 'Cancelled' && oi.orderStatus !== 'Pending') {
          totalRevenue += parseFloat(oi.unitPrice) * parseInt(oi.quantity);
          uniqueOrders.add(oi.id);
          
          productSales[oi.productName] = (productSales[oi.productName] || 0) + parseInt(oi.quantity);
        }
      });

      // Low stock check
      sellerProducts.forEach(p => {
        p.variants && p.variants.forEach(v => {
          if (v.stock <= 10) {
            lowStockAlerts.push({
              productName: p.name,
              sku: v.sku,
              stock: v.stock
            });
          }
        });
      });

      // Best selling products mapping
      const bestSellers = Object.keys(productSales).map(name => ({
        name,
        quantity: productSales[name]
      })).sort((a,b) => b.quantity - a.quantity).slice(0, 5);

      const reviews = await reviewRepository.getReviewsForVendor(req.user.userId);

      // Enhanced analytics: trends & breakdowns
      const orderStatusBreakdown = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
      const categorySales = {};
      const dailyRevenue = {};

      orderItems.forEach(oi => {
        const status = oi.orderStatus || 'Pending';
        orderStatusBreakdown[status] = (orderStatusBreakdown[status] || 0) + 1;

        if (oi.orderStatus !== 'Cancelled' && oi.orderStatus !== 'Pending') {
          const amount = parseFloat(oi.unitPrice) * parseInt(oi.quantity);
          const cat = oi.category || 'Uncategorized';
          categorySales[cat] = (categorySales[cat] || 0) + amount;

          if (oi.createdAt) {
            const day = oi.createdAt.split('T')[0];
            dailyRevenue[day] = (dailyRevenue[day] || 0) + amount;
          }
        }
      });

      const today = new Date();
      const revenueTrend = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        revenueTrend.push({ date: key, revenue: dailyRevenue[key] || 0 });
      }

      const maxTrendRevenue = Math.max(...revenueTrend.map(r => r.revenue), 1);

      // Payout History from real seller orders
      const payoutHistory = orderItems
        .filter(oi => oi.orderStatus !== 'Cancelled')
        .map(oi => {
          const grossAmount = parseFloat(oi.unitPrice) * parseInt(oi.quantity);
          return {
            id: oi.id,
            date: oi.createdAt ? new Date(oi.createdAt).toISOString().split('T')[0] : 'N/A',
            amount: grossAmount.toFixed(2),
            status: oi.orderStatus === 'Delivered' || oi.orderStatus === 'Shipped' ? 'Completed' : oi.orderStatus,
            productName: oi.productName
          };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      res.json({
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: uniqueOrders.size,
        lowStockAlerts,
        bestSellers,
        reviews,
        payoutHistory,
        orderStatusBreakdown,
        categorySales: Object.keys(categorySales).map(k => ({ category: k, revenue: categorySales[k] })).sort((a, b) => b.revenue - a.revenue),
        revenueTrend,
        maxTrendRevenue,
        totalProducts: sellerProducts.length,
        activeProducts: sellerProducts.filter(p => p.status === 'Active').length
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error generating analytics.' });
    }
  },

  // Customer Queries
  async getQueries(req, res) {
    try {
      const queries = await queryRepository.getQueriesForVendor(req.user.userId);
      res.json(queries);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading queries.' });
    }
  },

  async replyToQuery(req, res) {
    try {
      const { reply } = req.body;
      if (!reply) return res.status(400).json({ error: 'Reply content is required.' });
      
      const query = await queryRepository.getQueryById(req.params.id);
      if (!query) return res.status(404).json({ error: 'Query not found.' });
      
      // Verify query ownership
      if (query.vendorId !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied. This query does not belong to your store.' });
      }
      
      const success = await queryRepository.replyToQuery(req.params.id, reply);
      if (!success) return res.status(404).json({ error: 'Query not found.' });
      
      res.json({ message: 'Reply sent successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error sending reply.' });
    }
  },

  async getCustomers(req, res) {
    try {
      const storeId = req.storeId;
      // Use StoreCustomers table for per-seller customer scoping
      let customers;
      if (storeId) {
        customers = await userRepository.getCustomersByStore(storeId);
      } else {
        customers = await orderRepository.getSellerCustomers(req.user.userId);
      }
      res.json(customers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading customers.' });
    }
  },

  async getInventory(req, res) {
    try {
      const tenantId = req.user.tenantId || req.tenantId || 1;
      const products = await productRepository.getProducts(tenantId);
      const sellerProducts = products.filter(p => p.vendorId === req.user.userId);
      const inventory = sellerProducts.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        status: p.status,
        variants: (p.variants || []).map(v => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          weightGrams: v.weightGrams
        })),
        totalStock: (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0),
        lowStock: (p.variants || []).filter(v => v.stock <= 10).length > 0
      }));
      res.json(inventory);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading inventory.' });
    }
  },

  async updateStock(req, res) {
    try {
      const { variantId, stock } = req.body;
      if (!variantId || stock === undefined) {
        return res.status(400).json({ error: 'variantId and stock are required.' });
      }
      await productRepository.updateVariantStock(variantId, stock);
      res.json({ message: 'Stock updated successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating stock.' });
    }
  },

  async getCustomerDetail(req, res) {
    try {
      const customerId = req.params.customerId;
      const tenantId = req.tenantId || 1;
      
      const user = await userRepository.getUserById(customerId);
      if (!user) return res.status(404).json({ error: 'Customer not found.' });

      // Enforce Tenant Ownership context check
      if (user.role === 'Customer' && user.tenantId && parseInt(user.tenantId) !== parseInt(tenantId)) {
        return res.status(403).json({ error: 'Access denied. This customer does not belong to your store.' });
      }

      const orders = await orderRepository.getCustomerOrdersForTenant(customerId, tenantId);
      const addresses = await addressRepository.getAddresses(customerId);

      res.json({
        customer: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || ''
        },
        orders,
        addresses
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading customer detail.' });
    }
  },

  async getInventoryHistory(req, res) {
    try {
      const tenantId = req.tenantId || 1;
      const logs = await productRepository.getInventoryLogs(tenantId);
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading inventory logs.' });
    }
  },

  async adjustStock(req, res) {
    try {
      const { variantId, adjustment, reason } = req.body;
      if (!variantId || adjustment === undefined || !reason) {
        return res.status(400).json({ error: 'variantId, adjustment, and reason are required.' });
      }
      
      const tenantId = req.tenantId || 1;
      const newStock = await productRepository.adjustVariantStock(variantId, adjustment, reason, tenantId);
      if (newStock === null) {
        return res.status(404).json({ error: 'Product variant not found.' });
      }

      res.json({ message: 'Stock adjusted successfully.', newStock });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error adjusting stock.' });
    }
  },

  async getAnnouncements(req, res) {
    try {
      const announcements = await announcementService.getActiveAnnouncements();
      const normalized = announcements.map(a => ({
        id: a.AnnouncementId || a.announcementId,
        title: a.Title || a.title,
        content: a.Content || a.content,
        targetType: a.TargetType || a.targetType,
        priority: a.Priority || a.priority,
        createdAt: a.CreatedAt || a.createdAt
      }));
      res.json(normalized);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching announcements.' });
    }
  }
};

module.exports = sellerController;
