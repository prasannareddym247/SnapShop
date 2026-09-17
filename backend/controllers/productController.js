const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const cmsRepository = require('../repositories/cmsRepository');

const productController = {
  async getProducts(req, res) {
    try {
      const { category, search, sort } = req.query;
      let products = await productRepository.getProducts(req.tenantId);

      // Filter by store context for non-Admin users (including guest customers)
      if (req.storeId && (!req.user || req.user.role !== 'Admin')) {
        products = products.filter(p => parseInt(p.storeId) === parseInt(req.storeId));
      }

      // Only return Active products from APPROVED sellers to customers
      products = products.filter(p => p.status === 'Active');

      // Use repository to get latest seller statuses (supports both SQL and JSON)
      const allUsers = await userRepository.getAllUsers();
      const hiddenVendorIds = allUsers
        .filter(u => u.role === 'Seller' && u.sellerStatus !== 'Approved')
        .map(u => u.id);
      if (hiddenVendorIds.length > 0) {
        products = products.filter(p => !hiddenVendorIds.includes(p.vendorId));
      }

      // Transform prices and calculate discounted prices directly (stored as INR)
      products = products.map(p => {
        const discountPercentage = parseFloat(p.discount) || parseFloat(p.vendorDiscount) || 0;
        
        // Transform product price
        if (p.price && typeof p.price === 'number') {
          const originalPriceInr = p.price;
          p.price = originalPriceInr;
          
          // Calculate discounted price
          if (discountPercentage > 0) {
            const discountAmount = (originalPriceInr * discountPercentage) / 100;
            p.discountedPrice = Math.round(originalPriceInr - discountAmount);
            p.originalPrice = originalPriceInr;
          } else {
            p.originalPrice = originalPriceInr;
            p.discountedPrice = originalPriceInr;
          }
        }
        
        // Transform variant prices
        if (p.variants && Array.isArray(p.variants)) {
          p.variants = p.variants.map(v => {
            if (v.price && typeof v.price === 'number') {
              const variantOriginalPrice = v.price;
              v.price = variantOriginalPrice;
              
              // Calculate discounted price for variant
              if (discountPercentage > 0) {
                const discountAmount = (variantOriginalPrice * discountPercentage) / 100;
                v.discountedPrice = Math.round(variantOriginalPrice - discountAmount);
                v.originalPrice = variantOriginalPrice;
              } else {
                v.originalPrice = variantOriginalPrice;
                v.discountedPrice = variantOriginalPrice;
              }
            }
            return v;
          });
        }
        
        return p;
      });

      // 1. Filter by category with grouped categories mapping
      if (category && category !== 'All') {
        const catLower = category.toLowerCase();
        if (catLower === 'electronics') {
          products = products.filter(p => ['computers', 'speakers', 'television', 'electronics'].includes(p.category.toLowerCase()));
        } else if (catLower === 'fashion') {
          products = products.filter(p => ['men fashion', 'woman fashion', 'watches', 'fashion'].includes(p.category.toLowerCase()));
        } else if (catLower === 'home & furniture') {
          products = products.filter(p => ['furniture', 'kitchen', 'home & furniture'].includes(p.category.toLowerCase()));
        } else if (catLower === 'appliances') {
          products = products.filter(p => ['air conditioners', 'refrigerators', 'appliances'].includes(p.category.toLowerCase()));
        } else {
          products = products.filter(p => p.category.toLowerCase() === catLower);
        }
      }

      // 2. Filter by search query
      if (search) {
        const term = search.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }

      // 3. Sorting logic (based on first variant price)
      if (sort) {
        products.sort((a, b) => {
          const pA = a.variants && a.variants.length > 0 ? a.variants[0].price : 0;
          const pB = b.variants && b.variants.length > 0 ? b.variants[0].price : 0;

          if (sort === 'price-asc') return pA - pB;
          if (sort === 'price-desc') return pB - pA;
          if (sort === 'name-asc') return a.name.localeCompare(b.name);
          if (sort === 'name-desc') return b.name.localeCompare(a.name);
          return 0;
        });
      }

      // Inject discount: per-product discount takes priority, fallback to vendor-level respecting scope
      const vendorDiscountMap = {};
      const vendorScopeMap = {};
      const vendorProductIdsMap = {};
      allUsers.forEach(u => {
        if (u.role === 'Seller') {
          vendorDiscountMap[u.id] = parseFloat(u.discountRate) || 0;
          vendorScopeMap[u.id] = u.discountScope || 'all';
          const ids = u.discountProductIds;
          vendorProductIdsMap[u.id] = Array.isArray(ids) ? ids : (ids ? ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []);
        }
      });
      products = products.map(p => {
        const perProductDiscount = parseFloat(p.discount) || 0;
        if (perProductDiscount > 0) {
          return { ...p, vendorDiscount: perProductDiscount };
        }
        const vId = p.vendorId;
        const scope = vendorScopeMap[vId] || 'all';
        const rate = vendorDiscountMap[vId] || 0;
        if (rate > 0 && (scope === 'all' || vendorProductIdsMap[vId].includes(p.id))) {
          return { ...p, vendorDiscount: rate };
        }
        return { ...p, vendorDiscount: 0 };
      });

      res.json(products);
    } catch (err) {
      console.error('Error fetching products controller:', err);
      res.status(500).json({ error: 'Server error fetching products.' });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await productRepository.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      // Scoped storefront isolation check
      if (req.storeId && parseInt(product.storeId) !== parseInt(req.storeId)) {
        let isAuthorized = false;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const user = require('../services/authService').verifyToken(token);
            if (user && (user.role === 'Admin' || parseInt(product.vendorId) === parseInt(user.userId))) {
              isAuthorized = true;
            }
          } catch (e) {}
        }
        if (!isAuthorized) {
          return res.status(404).json({ error: 'Product not found in this storefront.' });
        }
      }

      // Check if product's seller is approved (not pending/rejected/suspended)
      const allUsers = await userRepository.getAllUsers();
      const vendor = allUsers.find(u => u.id === parseInt(product.vendorId));
      const isSellerBlocked = vendor && vendor.role === 'Seller' && vendor.sellerStatus !== 'Approved';

      // If the product is not Active or its seller is not approved, restrict access to Admin or the seller who owns it
      if (product.status !== 'Active' || isSellerBlocked) {
        let isAuthorized = false;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const user = require('../services/authService').verifyToken(token);
            if (user) {
              if (user.role === 'Admin' || parseInt(product.vendorId) === parseInt(user.userId)) {
                isAuthorized = true;
              }
            }
          } catch (e) {
            // Ignore error, treat as guest
          }
        }
        
        if (!isAuthorized) {
          return res.status(404).json({ error: 'Product not found.' });
        }
      }

      // Transform prices and calculate discounted prices directly (stored as INR)
      const discountPercentage = parseFloat(product.discount) || parseFloat(product.vendorDiscount) || 0;
      
      if (product.price && typeof product.price === 'number') {
        const originalPriceInr = product.price;
        product.price = originalPriceInr;
        
        // Calculate discounted price
        if (discountPercentage > 0) {
          const discountAmount = (originalPriceInr * discountPercentage) / 100;
          product.discountedPrice = Math.round(originalPriceInr - discountAmount);
          product.originalPrice = originalPriceInr;
        } else {
          product.originalPrice = originalPriceInr;
          product.discountedPrice = originalPriceInr;
        }
      }
      
      if (product.variants && Array.isArray(product.variants)) {
        product.variants = product.variants.map(v => {
          if (v.price && typeof v.price === 'number') {
            const variantOriginalPrice = v.price;
            v.price = variantOriginalPrice;
            
            // Calculate discounted price for variant
            if (discountPercentage > 0) {
              const discountAmount = (variantOriginalPrice * discountPercentage) / 100;
              v.discountedPrice = Math.round(variantOriginalPrice - discountAmount);
              v.originalPrice = variantOriginalPrice;
            } else {
              v.originalPrice = variantOriginalPrice;
              v.discountedPrice = variantOriginalPrice;
            }
          }
          return v;
        });
      }

      // Inject discount: per-product takes priority, fallback to vendor-level respecting scope
      const perProductDiscount = parseFloat(product.discount) || 0;
      if (perProductDiscount > 0) {
        product.vendorDiscount = perProductDiscount;
      } else {
        const vDiscount = parseFloat(vendor?.discountRate) || 0;
        const scope = vendor?.discountScope || 'all';
        const ids = vendor?.discountProductIds;
        const selectedIds = Array.isArray(ids) ? ids : (ids ? ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []);
        if (vDiscount > 0 && (scope === 'all' || selectedIds.includes(product.id))) {
          product.vendorDiscount = vDiscount;
        } else {
          product.vendorDiscount = 0;
        }
      }

      res.json(product);
    } catch (err) {
      console.error('Error fetching product detail controller:', err);
      res.status(500).json({ error: 'Server error fetching product details.' });
    }
  },

  async getBanners(req, res) {
    try {
      const banners = await cmsRepository.getBanners();
      res.json(banners);
    } catch (err) {
      console.error('Error fetching banners:', err);
      res.status(500).json({ error: 'Server error fetching banners.' });
    }
  }
};

module.exports = productController;
