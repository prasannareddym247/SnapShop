const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const cmsRepository = require('../repositories/cmsRepository');
const notificationRepository = require('../repositories/notificationRepository');
const adminNotificationRepository = require('../repositories/adminNotificationRepository');
const auditRepository = require('../repositories/auditRepository');
const emailService = require('../services/emailService');
const db = require('../config/db');
const supportTicketRepository = require('../repositories/supportTicketRepository');
const billingRepository = require('../repositories/billingRepository');
const subscriptionRepository = require('../repositories/subscriptionRepository');
const storeRepository = require('../repositories/storeRepository');

async function findOrCreateCategory(name) {
  const useSqlServer = db.getUseSqlServer();
  const pool = db.getPool();
  const localDb = db.getLocalDb();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  if (useSqlServer) {
    let res = await pool.request()
      .input('name', db.sql.NVarChar, name)
      .query('SELECT CategoryId FROM Categories WHERE Name = @name');
    if (res.recordset.length > 0) return res.recordset[0].CategoryId;
    
    res = await pool.request()
      .input('name', db.sql.NVarChar, name)
      .input('slug', db.sql.NVarChar, slug)
      .query('INSERT INTO Categories (Name, Slug, Description) OUTPUT INSERTED.CategoryId VALUES (@name, @slug, @name)');
    return res.recordset[0].CategoryId;
  } else {
    let cat = localDb.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (cat) return cat.id;
    const newId = localDb.categories.length > 0 ? Math.max(...localDb.categories.map(c => c.id)) + 1 : 1;
    localDb.categories.push({ id: newId, name, slug, description: name });
    db.saveLocalDb();
    return newId;
  }
}

const adminController = {
  // Existing functions
  async createProduct(req, res) {
    try {
      const { name, category, description, storageInstructions, imageUrl, imagePrompt, bullets, variants, vendorId } = req.body;
      if (!name || !category || !description || !variants || variants.length === 0) {
        return res.status(400).json({ error: 'Name, category, description, and at least one variant are required.' });
      }
      const product = await productRepository.createProduct(
        { name, category, description, storageInstructions, imageUrl, imagePrompt, bullets, vendorId: vendorId || 1 },
        variants
      );
      res.status(201).json({ message: 'Product created successfully.', product });
    } catch (err) {
      console.error('Error creating product controller:', err);
      res.status(500).json({ error: 'Server error creating product.' });
    }
  },

  async updateProduct(req, res) {
    try {
      const { name, category, description, storageInstructions, status, imageUrl, imagePrompt, bullets, variants, vendorId, brand, warrantyInformation, rating, images, featured_image, minimumOrderQuantity, shippingInformation, returnPolicy, availabilityStatus, discount } = req.body;
      if (!name || !category || !description) {
        return res.status(400).json({ error: 'Name, category, and description are required.' });
      }
      const product = await productRepository.updateProduct(
        req.params.id,
        { name, category, description, storageInstructions, status, imageUrl, imagePrompt, bullets, vendorId, brand, warrantyInformation, rating, images, featured_image, minimumOrderQuantity, shippingInformation, returnPolicy, availabilityStatus, discount: parseFloat(discount) || 0, variants },
        variants
      );
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      res.json({ message: 'Product updated successfully.', product });
    } catch (err) {
      console.error('Error updating product controller:', err);
      res.status(500).json({ error: 'Server error updating product.' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const success = await productRepository.deleteProduct(req.params.id);
      if (!success) return res.status(404).json({ error: 'Product not found.' });
      res.json({ message: 'Product deleted successfully.', id: req.params.id });
    } catch (err) {
      console.error('Error deleting product controller:', err);
      res.status(500).json({ error: 'Server error deleting product.' });
    }
  },

  // New admin functions
  async getAllUsers(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error('Error getting users:', err);
      res.status(500).json({ error: 'Server error listing users.' });
    }
  },

  async updateUserRole(req, res) {
    try {
      const { role } = req.body;
      if (!role) return res.status(400).json({ error: 'Role is required.' });
      await userRepository.updateUserRole(req.params.id, role);
      res.json({ message: 'User role updated successfully.' });
    } catch (err) {
      console.error('Error changing user role:', err);
      res.status(500).json({ error: 'Server error changing role.' });
    }
  },

  async updateUserStatus(req, res) {
    try {
      const { status } = req.body; // e.g. Approved, Suspended, Blocked, Pending
      if (!status) return res.status(400).json({ error: 'Status is required.' });
      await userRepository.updateVendorStatus(req.params.id, status);
      
      await notificationRepository.createNotification({
        userId: req.params.id,
        message: `Your account status has been updated to: ${status}`,
        type: 'AccountStatusChanged'
      });
      res.json({ message: 'User status updated successfully.' });
    } catch (err) {
      console.error('Error updating user status:', err);
      res.status(500).json({ error: 'Server error updating user status.' });
    }
  },

  async resetUserPassword(req, res) {
    try {
      const { newPassword } = req.body;
      if (!newPassword) return res.status(400).json({ error: 'New password is required.' });
      const authService = require('../services/authService');
      const hash = await authService.hashPassword(newPassword);
      await userRepository.updateUserCredentials(req.params.id, hash);
      res.json({ message: 'User password reset successfully.' });
    } catch (err) {
      console.error('Error resetting user password:', err);
      res.status(500).json({ error: 'Server error resetting password.' });
    }
  },

  async getVendors(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      // Filter for sellers
      const vendors = users.filter(u => u.role === 'Seller');
      res.json(vendors);
    } catch (err) {
      console.error('Error getting vendors:', err);
      res.status(500).json({ error: 'Server error listing vendors.' });
    }
  },

  async approveVendor(req, res) {
    try {
      const vendorId = req.params.id;
      const user = await userRepository.getUserById(vendorId);
      if (!user) return res.status(404).json({ error: 'Seller not found.' });

      await userRepository.updateVendorStatus(vendorId, 'Approved');

      await auditRepository.create({
        userId: req.user.userId || req.user.id, userEmail: req.user.email,
        action: 'SellerApproved', resourceType: 'User', resourceId: vendorId,
        details: { approvedBy: req.user.email }
      });

      await notificationRepository.createNotification({
        userId: vendorId,
        message: 'Your seller account has been approved! You can now log in and create products. Each product will need individual approval before going live.',
        type: 'SellerApproved'
      });

      await adminNotificationRepository.create({
        type: 'SellerApproved',
        title: 'Seller Approved',
        message: `Seller ${user.storeName || user.email} has been approved by ${req.user.email}.`,
        priority: 'normal'
      });

      // Resolve the open Seller Verification ticket for this user
      try {
        const tickets = await supportTicketRepository.getAll({ userId: vendorId, category: 'Seller Verification', status: 'open' });
        const ticket = tickets && tickets.length > 0 ? tickets[0] : null;
        if (ticket) {
          const ticketId = ticket.TicketId || ticket.ticketId;
          await supportTicketRepository.update(ticketId, { status: 'resolved', assignedTo: req.user.userId || req.user.id });
            await supportTicketRepository.addReply(ticketId, {
              userId: req.user.userId || req.user.id, userRole: 'Admin',
              message: `Seller approved by ${req.user.email}. Account is now active.`,
              isInternal: true
            });
        }
      } catch (ticketErr) {
        console.error('[ADMIN] Failed to update support ticket on approval:', ticketErr);
      }

      // Generate invoice for the trial subscription
      try {
        const store = await storeRepository.getStoreByOwnerId(vendorId);
        if (store) {
          const sub = await subscriptionRepository.getStoreSubscription(store.id || store.StoreId);
          const plan = sub ? await subscriptionRepository.getPlanByKey(sub.planKey) : null;
          if (sub && plan) {
            const invoiceNumber = await billingRepository.generateInvoiceNumber();
            const total = 0;
            await billingRepository.createInvoice({
              storeId: store.id || store.StoreId,
              tenantId: store.tenantId,
              invoiceNumber,
              planName: plan.name,
              amount: 0,
              total: 0,
              tax: 0,
              status: 'paid',
              periodStart: sub.currentPeriodStart || sub.trialStart,
              periodEnd: sub.currentPeriodEnd || sub.trialEnd
            });
            await adminNotificationRepository.create({
              type: 'InvoiceGenerated',
              title: 'Invoice Generated',
              message: `Invoice ${invoiceNumber} generated for ${plan.name} plan (trial) — Store: ${store.name}`,
              priority: 'normal'
            });
          }
        }
      } catch (invErr) {
        console.error('[ADMIN] Failed to generate invoice on approval:', invErr);
      }

      res.json({ message: 'Vendor approved successfully. Products still need individual approval.' });
    } catch (err) {
      console.error('Error approving vendor:', err);
      res.status(500).json({ error: 'Server error approving vendor.' });
    }
  },

  async rejectVendor(req, res) {
    try {
      const vendorId = req.params.id;
      await userRepository.updateVendorStatus(vendorId, 'Rejected');

      await auditRepository.create({
        userId: req.user.userId || req.user.id, userEmail: req.user.email,
        action: 'SellerRejected', resourceType: 'User', resourceId: vendorId,
        details: { rejectedBy: req.user.email }
      });

      await notificationRepository.createNotification({
        userId: vendorId,
        message: 'Your seller profile application was rejected.',
        type: 'SellerRejected'
      });

      const rejectedUser = await userRepository.getUserById(vendorId);
      await adminNotificationRepository.create({
        type: 'SellerRejected',
        title: 'Seller Rejected',
        message: `Seller ${rejectedUser?.storeName || rejectedUser?.email || vendorId} has been rejected by ${req.user.email}.`,
        priority: 'normal'
      });

      // Close the open Seller Verification ticket for this user
      try {
        const tickets = await supportTicketRepository.getAll({ userId: vendorId, category: 'Seller Verification', status: 'open' });
        const ticket = tickets && tickets.length > 0 ? tickets[0] : null;
        if (ticket) {
          const ticketId = ticket.TicketId || ticket.ticketId;
          await supportTicketRepository.update(ticketId, { status: 'closed', assignedTo: req.user.userId || req.user.id });
          await supportTicketRepository.addReply(ticketId, {
            userId: req.user.userId || req.user.id, userRole: 'Admin',
            message: `Seller rejected by ${req.user.email}. Application has been declined.`,
            isInternal: true
          });
        }
      } catch (ticketErr) {
        console.error('[ADMIN] Failed to update support ticket on rejection:', ticketErr);
      }

      res.json({ message: 'Vendor rejected successfully.' });
    } catch (err) {
      console.error('Error rejecting vendor:', err);
      res.status(500).json({ error: 'Server error rejecting vendor.' });
    }
  },

  async suspendVendor(req, res) {
    try {
      const vendorId = req.params.id;
      await userRepository.updateVendorStatus(vendorId, 'Suspended');
      await productRepository.updateProductStatusByVendorId(vendorId, 'Inactive');

      await auditRepository.create({
        userId: req.user.userId || req.user.id, userEmail: req.user.email,
        action: 'SellerSuspended', resourceType: 'User', resourceId: vendorId,
        details: { suspendedBy: req.user.email }
      });

      await notificationRepository.createNotification({
        userId: parseInt(vendorId),
        message: 'Your seller account has been suspended. All your products are now hidden from customers until reactivation.',
        type: 'AccountStatusChanged'
      });

      res.json({ message: 'Seller suspended successfully. All products set to inactive.' });
    } catch (err) {
      console.error('Error suspending vendor:', err);
      res.status(500).json({ error: 'Server error suspending seller.' });
    }
  },

  async reactivateVendor(req, res) {
    try {
      const vendorId = req.params.id;
      await userRepository.updateVendorStatus(vendorId, 'Approved');

      await auditRepository.create({
        userId: req.user.userId || req.user.id, userEmail: req.user.email,
        action: 'SellerReactivated', resourceType: 'User', resourceId: vendorId,
        details: { reactivatedBy: req.user.email }
      });

      await notificationRepository.createNotification({
        userId: parseInt(vendorId),
        message: 'Your seller account has been reactivated. You can now manage your products.',
        type: 'AccountStatusChanged'
      });

      res.json({ message: 'Seller reactivated successfully.' });
    } catch (err) {
      console.error('Error reactivating vendor:', err);
      res.status(500).json({ error: 'Server error reactivating seller.' });
    }
  },

  async deleteVendor(req, res) {
    try {
      const vendorId = parseInt(req.params.id);

      const users = await userRepository.getAllUsers();
      const vendor = users.find(u => u.id === vendorId);
      if (!vendor) return res.status(404).json({ error: 'Seller not found.' });

      await productRepository.deleteProductsByVendorId(vendorId);
      await userRepository.deleteUser(vendorId);

      await notificationRepository.createNotification({
        userId: null,
        message: `Seller ${vendor.storeName || vendor.email || vendorId} and all associated products have been deleted from the system.`,
        type: 'AccountDeleted'
      });

      res.json({ message: 'Seller and all associated products, variants, and records deleted successfully.' });
    } catch (err) {
      console.error('Error deleting vendor:', err);
      res.status(500).json({ error: 'Server error deleting seller.' });
    }
  },

  async getApprovedSellers(req, res) {
    try {
      const users = await userRepository.getAllUsers();
      const sellers = users.filter(u => u.role === 'Seller' && u.sellerStatus === 'Approved');
      const result = sellers.map(s => ({ id: s.id, firstName: s.firstName, lastName: s.lastName, email: s.email, storeName: s.storeName }));
      res.json(result);
    } catch (err) {
      console.error('Error getting approved sellers:', err);
      res.status(500).json({ error: 'Server error listing approved sellers.' });
    }
  },

  async getPlatformAnalytics(req, res) {
    try {
      const orders = await orderRepository.getAllOrders();
      const users = await userRepository.getAllUsers();
      
      const activeCustomers = users.filter(u => u.role === 'Customer').length;
      const activeVendors = users.filter(u => u.role === 'Seller').length;
      
      const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
      const paidOrders = orders.filter(o => o.orderStatus === 'Paid' || o.orderStatus === 'Processing' || o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered');
      
      // Fraud alerts logic: flag any order > 50,000 INR
      const fraudAlerts = [];
      orders.forEach(o => {
        if (parseFloat(o.totalAmount) > 50000) {
          fraudAlerts.push({
            orderId: o.id,
            totalAmount: o.totalAmount,
            customerEmail: o.customerEmail,
            reason: 'High Transaction Value Alert (> ₹50,000)'
          });
        }
      });

      res.json({
        totalSales: totalSales.toFixed(2),
        activeVendors,
        activeCustomers,
        revenue: totalSales.toFixed(2),
        fraudAlerts
      });
    } catch (err) {
      console.error('Error generating platform analytics:', err);
      res.status(500).json({ error: 'Server error generating analytics.' });
    }
  },

  // Categories CRUD
  // Banners & CMS
  async getBanners(req, res) {
    try {
      const banners = await cmsRepository.getBanners();
      res.json(banners);
    } catch (err) {
      res.status(500).json({ error: 'Server error loading banners.' });
    }
  },

  async addBanner(req, res) {
    try {
      const banner = await cmsRepository.addBanner(req.body);
      res.json(banner);
    } catch (err) {
      res.status(500).json({ error: 'Server error adding banner.' });
    }
  },

  async deleteBanner(req, res) {
    try {
      await cmsRepository.deleteBanner(req.params.id);
      res.json({ message: 'Banner deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error deleting banner.' });
    }
  },

  async getCmsPages(req, res) {
    try {
      const pages = await cmsRepository.getCmsPages();
      res.json(pages);
    } catch (err) {
      res.status(500).json({ error: 'Server error loading pages.' });
    }
  },

  async saveCmsPage(req, res) {
    try {
      const page = await cmsRepository.saveCmsPage(req.params.slug, req.body);
      res.json(page);
    } catch (err) {
      res.status(500).json({ error: 'Server error saving page.' });
    }
  },

  async getPendingProducts(req, res) {
    try {
      const products = await productRepository.getProducts();
      const allUsers = await userRepository.getAllUsers();
      const pending = products.filter(p => {
        if (p.status !== 'Pending Approval') return false;
        const vendor = allUsers.find(u => u.id === parseInt(p.vendorId));
        if (vendor && vendor.role === 'Seller' && vendor.sellerStatus !== 'Approved') return false;
        return true;
      });
      res.json(pending);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error fetching pending products.' });
    }
  },

  async bulkApproveProducts(req, res) {
    try {
      const { productIds } = req.body;
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: 'No product IDs provided.' });
      }

      const allUsers = await userRepository.getAllUsers();
      let approved = 0;
      let skipped = 0;

      console.log(`[Bulk Approve] Approving ${productIds.length} products...`);
      for (let id of productIds) {
        const product = await productRepository.getProductById(id);
        if (!product || product.status === 'Active') continue;

        // Check that the product's seller is approved
        const vendor = allUsers.find(u => u.id === parseInt(product.vendorId));
        const sellerBlocked = vendor && vendor.role === 'Seller' && vendor.sellerStatus !== 'Approved';
        if (sellerBlocked) {
          console.log(`[Bulk Approve] Skipping product ${id}: seller ${product.vendorId} not approved`);
          skipped++;
          continue;
        }

        await productRepository.updateProductStatus(id, 'Active');
          
        // Notify seller
        await notificationRepository.createNotification({
          userId: product.vendorId,
          message: `Your product '${product.name}' has been approved.`,
          type: 'ProductApproved'
        });
        approved++;
      }

      res.json({ message: `Approved ${approved} product(s). ${skipped > 0 ? skipped + ' skipped (seller not approved).' : ''}` });
    } catch (err) {
      console.error('Error in bulkApproveProducts controller:', err);
      res.status(500).json({ error: 'Server error bulk approving products.' });
    }
  },

  async approveProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.getProductById(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });

      // Check that the product's seller is approved
      const allUsers = await userRepository.getAllUsers();
      const vendor = allUsers.find(u => u.id === parseInt(product.vendorId));
      if (vendor && vendor.role === 'Seller' && vendor.sellerStatus !== 'Approved') {
        return res.status(400).json({ error: 'Cannot approve product. The seller account must be approved first.' });
      }

      await productRepository.updateProductStatus(id, 'Active');
      
      // Notify seller
      await notificationRepository.createNotification({
        userId: product.vendorId,
        message: `Your product '${product.name}' has been approved.`,
        type: 'ProductApproved'
      });
      
      res.json({ message: 'Product approved successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error approving product.' });
    }
  },

  async rejectProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productRepository.getProductById(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      
      await productRepository.updateProductStatus(id, 'Rejected');
      
      // Notify seller
      await notificationRepository.createNotification({
        userId: product.vendorId,
        message: `Your product '${product.name}' was rejected by the administrator.`,
        type: 'ProductRejected'
      });
      
      res.json({ message: 'Product rejected successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error rejecting product.' });
    }
  },

  async requestProductChanges(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) return res.status(400).json({ error: 'Reason for changes is required.' });
      
      const product = await productRepository.getProductById(id);
      if (!product) return res.status(404).json({ error: 'Product not found.' });
      
      await productRepository.updateProductStatus(id, 'Pending Approval');
      
      // Notify seller
      await notificationRepository.createNotification({
        userId: product.vendorId,
        message: `Modification requested for your product '${product.name}': ${reason}`,
        type: 'ProductModificationRequested'
      });
      
      res.json({ message: 'Changes requested successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error requesting product changes.' });
    }
  },

  async getNotifications(req, res) {
    try {
      const list = await adminNotificationRepository.getAll(req.query);
      const normalized = list.map(n => ({
        id: n.NotificationId || n.notificationId,
        type: n.Type || n.type,
        title: n.Title || n.title,
        message: n.Message || n.message,
        priority: n.Priority || n.priority,
        isRead: n.IsRead ?? n.isRead ?? false,
        referenceType: n.ReferenceType || n.referenceType,
        referenceId: n.ReferenceId || n.referenceId,
        createdAt: n.CreatedAt || n.createdAt
      }));
      res.json(normalized);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error loading notifications.' });
    }
  },

  async markNotificationRead(req, res) {
    try {
      await adminNotificationRepository.markRead(req.params.id);
      res.json({ message: 'Notification marked as read.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating notification.' });
    }
  },

  async markAllNotificationsRead(req, res) {
    try {
      await adminNotificationRepository.markAllRead();
      res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating notifications.' });
    }
  },

  async bulkUpload(req, res) {
    try {
      const { products, vendorId } = req.body;
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided for import.' });
      }

      let importedCount = 0;
      let newSellersCount = 0;

      for (let p of products) {
        const categoryName = p.category || 'General';
        
        // Find or create Category
        await findOrCreateCategory(categoryName);
        
        // Find seller: use provided vendorId, or auto-map by category
        let seller;
        let emailPrefix;
        if (vendorId) {
          seller = await userRepository.getUserById(vendorId);
          if (!seller) return res.status(400).json({ error: `Selected seller (ID ${vendorId}) not found.` });
          emailPrefix = seller.email.split('@')[0];
        } else {
          emailPrefix = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
          const email = `${emailPrefix}@snapshop.com`;
          seller = await userRepository.getUserByEmail(email);
          if (!seller) {
            seller = await userRepository.findOrCreateCategorySeller(categoryName);
            newSellersCount++;
            
            // Notify Admin of new seller approval request
            await notificationRepository.createNotification({
              userId: null,
              message: `New Seller Approval Request: ${categoryName} Store (${email})`,
              type: 'NewSellerRequest'
            });
          }
        }
        
        // Insert Product
        const price = parseFloat(p.price) || 100;
        const name = p.title || p.name || 'Imported Product';
        const description = p.description || `${name} imported product description.`;
        
        const uniqueSuffix = Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 6);
        let variants = p.variants;
        if (!variants || variants.length === 0) {
          const cleanEmail = emailPrefix.substring(0, 10);
          const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
          variants = [{ weightGrams: 500, price: price, stock: 100, sku: `FK-IMP-${cleanEmail}-${cleanName}-${uniqueSuffix}` }];
        } else {
          variants = variants.map(v => ({
            ...v,
            sku: v.sku ? `${v.sku.substring(0, 40)}-${uniqueSuffix}` : `FK-IMP-${emailPrefix.substring(0, 10)}-${name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}-${v.weightGrams}-${uniqueSuffix}`
          }));
        }
        
        await productRepository.createProduct(
          {
            name,
            category: categoryName,
            description,
            storageInstructions: p.storageInstructions || 'Store in cool dry place',
            imageUrl: p.imageUrl || null,
            imagePrompt: p.imagePrompt || name,
            bullets: p.bullets || [],
            vendorId: seller.id || seller.UserId,
            status: 'Pending Approval'
          },
          variants
        );
        
        importedCount++;

        // Notify Admin of new product approval request
        await notificationRepository.createNotification({
          userId: null,
          message: `New Product Approval Request: '${name}' from ${categoryName} Store`,
          type: 'NewProductRequest'
        });
      }

      // Notify Admin: Bulk Import Completed
      await notificationRepository.createNotification({
        userId: null,
        message: `Bulk Import Completed: ${importedCount} products imported, ${newSellersCount} new category sellers created.`,
        type: 'BulkImportCompleted'
      });

      res.status(200).json({
        message: 'Bulk upload completed successfully.',
        importedCount,
        newSellersCount
      });
    } catch (err) {
      console.error('Error in bulk upload controller:', err);
      res.status(500).json({ error: 'Server error processing bulk upload.' });
    }
  },

};

module.exports = adminController;
