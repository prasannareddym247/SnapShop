import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import sellerService from '../../services/sellerService';
import api from '../../services/api';
import { buildProductMockupDataUrl, getProductImageSrc } from '../../features/catalog/productHelpers';
import DashboardLayout from '../../layouts/DashboardLayout';
import BillingDashboard from './BillingDashboard';

const decodeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const SellerDashboardPage = ({ mobileSidebarOpen, setMobileSidebarOpen, view, impersonateTenantId, impersonateStoreId, readOnly }) => {
  const { token, user } = useAuth();
  const isReadOnly = readOnly === 'true';

  const [activeTab, setActiveTab] = useState('overview');
  const [activeFormTab, setActiveFormTab] = useState('basic');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  useEffect(() => {
    if (view === 'seller/notifications' && activeTab !== 'notifications') {
      setActiveTab('notifications');
    }
  }, [view]);

  const [loading, setLoading] = useState(true);

  // Dashboard states
  const [stats, setStats] = useState({
    totalRevenue: '0.00',
    totalOrders: 0,
    payoutAmount: '0.00',
    lowStockAlerts: [],
    bestSellers: [],
    payoutHistory: [],
    orderStatusBreakdown: {},
    categorySales: [],
    revenueTrend: [],
    maxTrendRevenue: 1,
    totalProducts: 0,
    activeProducts: 0
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [sellerSubscription, setSellerSubscription] = useState(null);
  const [sellerPlan, setSellerPlan] = useState(null);

  // Profile and Store Settings States
  const [profile, setProfile] = useState({
    storeName: '',
    storeDescription: '',
    sellerStatus: 'Pending',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    businessType: '',
    selectedTemplate: ''
  });

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'My Multi-tenant Shop',
    themeColor: '#10b981',
    supportEmail: 'support@snapshop.com',
    contactPhone: '9876543210',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    taxId: 'GSTIN12345',
    invoicePrefix: 'FK-',
    storeStatus: 'Open',
    logoUrl: '',
    bannerUrl: ''
  });

  const [storeSlug, setStoreSlug] = useState('acme-organics-d8k3');

  const [sellerChatMessages, setSellerChatMessages] = useState([]);
  const [newSellerChatMessage, setNewSellerChatMessage] = useState('');
  const [sellerChatLoading, setSellerChatLoading] = useState(false);

  // Integrations states
  const [paymentsData, setPaymentsData] = useState({
    methods: [
      { MethodName: 'COD', IsEnabled: false, IsDefault: false },
      { MethodName: 'Razorpay', IsEnabled: false, IsDefault: false },
      { MethodName: 'Stripe', IsEnabled: false, IsDefault: false }
    ],
    credentials: [
      { GatewayName: 'Razorpay', ApiKey: '', ApiSecret: '', WebhookSecret: '', IsTestMode: true },
      { GatewayName: 'Stripe', ApiKey: '', ApiSecret: '', WebhookSecret: '', IsTestMode: true }
    ]
  });
  const [shippingData, setShippingData] = useState([
    { ProviderName: 'Manual', IsEnabled: false, ApiKey: '', ApiSecret: '', WarehouseAddress: '', PackagingPreferences: '', ShippingRates: '' },
    { ProviderName: 'Shiprocket', IsEnabled: false, ApiKey: '', ApiSecret: '', WarehouseAddress: '', PackagingPreferences: '', ShippingRates: '' }
  ]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [testingGateway, setTestingGateway] = useState(null);

  // Phase 7 CMS & Theme Customizer States
  const [onlineTab, setOnlineTab] = useState('themes'); // 'themes', 'customizer', 'pages', 'navigation', 'blog', 'media'
  const [activeTheme, setActiveTheme] = useState({ name: 'Modern', themeKey: 'modern', settings: {}, sections: [] });
  const [starterThemes, setStarterThemes] = useState([]);
  
  // CMS Pages
  const [cmsPages, setCmsPages] = useState([]);
  const [editingPage, setEditingPage] = useState(null); // page object or null for list
  const [pageForm, setPageForm] = useState({ title: '', slug: '', content: '', isPublished: true, seoTitle: '', seoDescription: '' });

  // Navigation Menus
  const [navigationMenus, setNavigationMenus] = useState([]);
  const [editingMenuKey, setEditingMenuKey] = useState('header'); // 'header' or 'footer'
  const [menuItems, setMenuItems] = useState([]); // array of { title, url }
  const [newItemForm, setNewItemForm] = useState({ title: '', url: '' });

  // Blog Posts
  const [blogPosts, setBlogPosts] = useState([]);
  const [editingBlogPost, setEditingBlogPost] = useState(null);
  const [blogPostForm, setBlogPostForm] = useState({ title: '', slug: '', content: '', category: 'News', featuredImageUrl: '', isPublished: true, seoTitle: '', seoDescription: '' });

  // Media Library
  const [mediaAssets, setMediaAssets] = useState([]);
  const [mediaUploadUrl, setMediaUploadUrl] = useState('');
  const [mediaUploadName, setMediaUploadName] = useState('');
  
  const [loadingCms, setLoadingCms] = useState(false);

  const loadCmsData = async () => {
    setLoadingCms(true);
    try {
      const themeRes = await api.get('/themes/active');
      if (themeRes) setActiveTheme(themeRes);

      const starters = await api.get('/themes');
      if (starters) setStarterThemes(starters);

      const pages = await api.get('/cms/pages');
      if (pages) setCmsPages(pages);

      const menus = await api.get('/cms/menus');
      if (menus) {
        setNavigationMenus(menus);
        const activeM = menus.find(m => m.menuKey === editingMenuKey);
        if (activeM) setMenuItems(activeM.menuItems || []);
      }

      const blogs = await api.get('/cms/blog');
      if (blogs) setBlogPosts(blogs);

      const media = await api.get('/cms/media');
      if (media) setMediaAssets(media);

    } catch (err) {
      console.warn('Failed to load CMS customizer details:', err);
    } finally {
      setLoadingCms(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'online-store') {
      loadCmsData();
    }
  }, [activeTab, editingMenuKey]);

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const payRes = await api.get('/store/payments');
      if (payRes) {
        const mergedMethods = paymentsData.methods.map(m => {
          const dbM = payRes.methods && payRes.methods.find(x => x.MethodName === m.MethodName);
          return dbM ? dbM : m;
        });
        const mergedCreds = paymentsData.credentials.map(c => {
          const dbC = payRes.credentials && payRes.credentials.find(x => x.GatewayName === c.GatewayName);
          return dbC ? dbC : c;
        });
        setPaymentsData({ methods: mergedMethods, credentials: mergedCreds });
      }

      const shipRes = await api.get('/store/shipping');
      if (shipRes && shipRes.length > 0) {
        const mergedShip = shippingData.map(s => {
          const dbS = shipRes.find(x => x.ProviderName === s.ProviderName);
          return dbS ? dbS : s;
        });
        setShippingData(mergedShip);
      }

      const logsRes = await api.get('/store/webhook-logs');
      if (logsRes) {
        setWebhookLogs(logsRes);
      }
    } catch (err) {
      console.error('Error loading integration settings:', err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'integrations') {
      loadIntegrations();
    }
  }, [activeTab]);

  const handleSavePayments = async (e) => {
    e.preventDefault();
    try {
      await api.put('/store/payments', paymentsData);
      alert('Payment configurations updated successfully.');
      loadIntegrations();
    } catch (err) {
      alert('Failed to save payment settings.');
    }
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    try {
      await api.put('/store/shipping', { providers: shippingData });
      alert('Shipping configurations updated successfully.');
      loadIntegrations();
    } catch (err) {
      alert('Failed to save shipping settings.');
    }
  };

  const handleTestPayment = async (gatewayName) => {
    setTestingGateway(gatewayName);
    try {
      const cred = paymentsData.credentials.find(c => c.GatewayName === gatewayName);
      const res = await api.post('/store/payments/test', {
        gatewayName,
        apiKey: cred.ApiKey,
        apiSecret: cred.ApiSecret
      });
      alert(res.message);
    } catch (err) {
      alert(err.error || 'Connection failed.');
    } finally {
      setTestingGateway(null);
    }
  };

  const handleTestShipping = async (providerName) => {
    try {
      const prov = shippingData.find(s => s.ProviderName === providerName);
      const res = await api.post('/store/shipping/test', {
        providerName,
        apiKey: prov.ApiKey,
        apiSecret: prov.ApiSecret
      });
      alert(res.message);
    } catch (err) {
      alert(err.error || 'Connection failed.');
    }
  };

  // Forms
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: '',
    brand: '',
    description: '',
    status: 'Active',
    imageUrl: '',
    discount: 0,
    variants: [{ weightGrams: 500, price: 150, stock: 100, sku: '' }],
    seoTitle: '',
    seoDescription: '',
    collectionName: '',
    warrantyInformation: '',
    rating: 4.41
  });

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: '',
    slug: '',
    description: '',
    parentCategoryId: '',
    isActive: true
  });

  const [stockAdjustForm, setStockAdjustForm] = useState({
    variantId: '',
    adjustment: '10',
    reason: 'Stock intake'
  });

  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: 10,
    expiryDate: '',
    usageLimit: 100
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [orderNotes, setOrderNotes] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Load SaaS dashboard metrics and config tables
  const loadDashboardData = async (tabOverride) => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Load store profile
      try {
        const profData = await sellerService.getProfile();
        setProfile(profData);
      } catch (err) {
        console.error('Failed to load store profile API:', err);
        if (user?.sellerStatus === 'Approved') {
          setProfile(prev => ({
            ...prev,
            sellerStatus: 'Approved',
            email: user.email || '',
            storeName: user.storeName || '',
            firstName: user.firstName || '',
            lastName: user.lastName || ''
          }));
        }
      }

      // 2. Load subscription status
      try {
        const subData = await api.get('/subscription/my');
        if (subData) {
          setSellerSubscription(subData.subscription);
          setSellerPlan(subData.plan);
        }
      } catch (err) {
        // not all sellers may have a subscription yet
      }

      // 3. Load custom store settings if any
      try {
        const storeRes = await sellerService.getMyStore();
        if (storeRes) {
          if (storeRes.store && storeRes.store.slug) {
            setStoreSlug(storeRes.store.slug);
          }
          if (storeRes.settings) {
            setStoreSettings(prev => ({ ...prev, ...storeRes.settings }));
          }
        }
      } catch (err) {
        console.warn('Failed to load specific store settings, falling back to defaults.');
      }

      const currentTab = tabOverride || activeTab;

      // 4. Load tab specific metrics
      if (currentTab === 'overview') {
        const data = await sellerService.getAnalytics();
        setStats(data);
        const ordData = await sellerService.getOrders();
        setOrders(ordData.slice(0, 5));
        const custData = await sellerService.getCustomers();
        setCustomers(custData.slice(0, 5));
        sellerService.getAnnouncements().then(setAnnouncements).catch(() => {});
      } else if (currentTab === 'products') {
        const prodData = await sellerService.getProducts();
        setProducts(prodData);
        const catData = await sellerService.getCategories();
        setCategories(catData);
      } else if (currentTab === 'categories') {
        const catData = await sellerService.getCategories();
        setCategories(catData);
        const prodData = await sellerService.getProducts();
        setProducts(prodData);

      } else if (currentTab === 'orders') {
        const ordData = await sellerService.getOrders();
        setOrders(ordData);
      } else if (currentTab === 'customers') {
        const custData = await sellerService.getCustomers();
        setCustomers(custData);
      } else if (currentTab === 'coupons') {
        const cpData = await sellerService.getCoupons();
        setCoupons(cpData);
      } else if (currentTab === 'reports') {
        const data = await sellerService.getAnalytics();
        setStats(data);
      } else if (currentTab === 'inventory-logs') {
        const logs = await sellerService.getInventoryLogs();
        setInventoryLogs(logs || []);
        const prodData = await sellerService.getProducts();
        setProducts(prodData || []);
      } else if (currentTab === 'notifications') {
        // Compute active notices based on inventory/order levels
        const data = await sellerService.getAnalytics();
        const alerts = [];
        data.lowStockAlerts.forEach(a => {
          alerts.push({ id: `low-${a.sku}`, type: 'low-stock', message: `Low Stock: "${a.productName}" (SKU: ${a.sku}) has only ${a.stock} items left.`, date: new Date().toISOString() });
        });
        setNotifications(alerts);
      } else if (currentTab === 'chat') {
        loadSellerChat();
      }
    } catch (err) {
      console.error('Error loading seller dashboard details:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerChat = async () => {
    if (!user || !user.id) return;
    setSellerChatLoading(true);
    try {
      const res = await api.get(`/discussions?sellerId=${user.id}`);
      setSellerChatMessages(res);
    } catch (err) {
      console.error('Error fetching seller chat:', err);
    } finally {
      setSellerChatLoading(false);
    }
  };

  const handleSendSellerChatMessage = async (e) => {
    e.preventDefault();
    if (!newSellerChatMessage.trim()) return;
    try {
      await api.post('/discussions', {
        sellerId: user.id,
        productId: null,
        message: newSellerChatMessage,
        attachmentUrl: ''
      });
      setNewSellerChatMessage('');
      loadSellerChat();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab, token]);

  useEffect(() => {
    if (sellerSubscription && activeTab !== 'billing') {
      const end = sellerSubscription.currentPeriodEnd ? new Date(sellerSubscription.currentPeriodEnd) : null;
      const daysLeft = end ? Math.ceil((end - new Date()) / (1000*60*60*24)) : null;
      if (sellerSubscription.status === 'expired' || daysLeft <= 0) {
        setActiveTab('billing');
      }
    }
  }, [sellerSubscription]);

  // Read only permission guard helper
  const assertWritePrivilege = () => {
    if (isReadOnly) {
      alert('Action blocked: Super Admin Impersonation is in read-only mode.');
      return false;
    }
    return true;
  };

  // Categories helper mapping product counts
  const getProductCountForCategory = (catId) => {
    return products.filter(p => Number(p.categoryId) === Number(catId)).length;
  };

  // Build category hierarchy tree
  const getCategoryTree = () => {
    const map = {};
    const roots = [];
    categories.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });
    categories.forEach(c => {
      if (c.parentCategoryId && map[c.parentCategoryId]) {
        map[c.parentCategoryId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  // Add/Edit Product submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    
    // Client-side validations
    const errors = {};
    if (!productForm.name || !productForm.name.trim()) {
      errors.name = 'Product Title is required';
    }
    if (!productForm.brand || !productForm.brand.trim()) {
      errors.brand = 'Brand is required';
    }
    if (!productForm.category) {
      errors.category = 'Category is required';
    }
    if (!productForm.description || !productForm.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!productForm.images || productForm.images.length === 0) {
      errors.images = 'At least one product image is required';
    }
    
    if (!productForm.variants || productForm.variants.length === 0) {
      errors.variants = 'At least one variant configuration is required';
    } else {
      productForm.variants.forEach((v, idx) => {
        if (!v.sku || !v.sku.trim()) {
          errors[`variant_${idx}_sku`] = `SKU for variant #${idx + 1} is required`;
        }
        if (parseFloat(v.price) <= 0 || isNaN(parseFloat(v.price))) {
          errors[`variant_${idx}_price`] = `Price for variant #${idx + 1} must be greater than zero`;
        }
        if (parseInt(v.stock) < 0 || isNaN(parseInt(v.stock))) {
          errors[`variant_${idx}_stock`] = `Stock for variant #${idx + 1} cannot be negative`;
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Auto-switch tab to locate the first error
      if (errors.name || errors.category || errors.brand || errors.description) {
        setActiveFormTab('basic');
      } else if (errors.images) {
        setActiveFormTab('images');
      } else if (errors.variants || Object.keys(errors).some(k => k.startsWith('variant_'))) {
        setActiveFormTab('variants');
      }
      alert('Please fill out all required fields and resolve the input errors before saving.');
      return;
    }

    try {
      const payload = { ...productForm };
      
      // Ensure featured_image / imageUrl represents the cover image selection
      if (!payload.featured_image && payload.images.length > 0) {
        payload.featured_image = payload.images[0];
      }
      payload.imageUrl = payload.featured_image || payload.imageUrl || buildProductMockupDataUrl(payload.name, payload.category || 'Grains');
      
      if (payload.id) {
        payload.variants = payload.variants.map(v => {
          const adj = parseInt(v.stockAdjustment) || 0;
          const updated = { ...v };
          updated.stock = Math.max(0, parseInt(v.stock) + adj);
          delete updated.stockAdjustment;
          return updated;
        });
        console.log("Saving product with payload:", payload);
        const result = await sellerService.updateProduct(payload.id, payload);
        if (result.product) {
          setProducts(prev => prev.map(p => p.id === payload.id ? { ...p, ...result.product } : p));
        }
        alert('Product details updated successfully!');
      } else {
        const createResult = await sellerService.createProduct(payload);
        if (createResult.product) {
          setProducts(prev => [...prev, createResult.product]);
        }
        alert('Product listed successfully!');
      }
      
      setProductForm({ 
        id: null, 
        name: '', 
        category: '', 
        brand: '', 
        description: '', 
        status: 'Active', 
        imageUrl: '', 
        discount: 0, 
        variants: [{ name: 'Default Variant', weightGrams: 500, price: 150, stock: 100, sku: '', variantImage: '' }], 
        seoTitle: '', 
        seoDescription: '', 
        collectionName: '', 
        warrantyInformation: 'No warranty', 
        rating: 4.41, 
        images: [], 
        featured_image: '', 
        minimumOrderQuantity: 1, 
        shippingInformation: 'Ships in 1-2 business days', 
        returnPolicy: '7 days return policy', 
        availabilityStatus: 'In Stock' 
      });
      setFormErrors({});
      setActiveTab('products');
      loadDashboardData('products');
    } catch (err) {
      alert(err.error || 'Failed to save product details.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!assertWritePrivilege()) return;
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await sellerService.deleteProduct(id);
      alert('Product listing removed.');
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete listing.');
    }
  };

  // Bulk status updates
  const handleBulkStatusChange = async (status) => {
    if (!assertWritePrivilege()) return;
    if (selectedProducts.length === 0) return alert('Select products to update.');
    try {
      for (let id of selectedProducts) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          await sellerService.updateProduct(id, { ...prod, status });
        }
      }
      alert(`Set ${selectedProducts.length} products to ${status}!`);
      setSelectedProducts([]);
      loadDashboardData();
    } catch (err) {
      alert('Failed to apply bulk status changes.');
    }
  };

  // Bulk delete action
  const handleBulkDelete = async () => {
    if (!assertWritePrivilege()) return;
    if (selectedProducts.length === 0) return alert('Select products to delete.');
    if (!confirm(`Delete all ${selectedProducts.length} selected products?`)) return;
    try {
      for (let id of selectedProducts) {
        await sellerService.deleteProduct(id);
      }
      alert('Selected products deleted.');
      setSelectedProducts([]);
      loadDashboardData();
    } catch (err) {
      alert('Failed to execute bulk delete.');
    }
  };

  // Categories CRUD
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      const payload = { ...categoryForm };
      if (!payload.slug) payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (payload.id) {
        await sellerService.updateCategory(payload.id, payload);
        alert('Category updated successfully.');
      } else {
        await sellerService.createCategory(payload);
        alert('Category created successfully.');
      }
      setCategoryForm({ id: null, name: '', slug: '', description: '', parentCategoryId: '', isActive: true });
      loadDashboardData();
    } catch (err) {
      alert(err.error || 'Failed to save category.');
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    if (!assertWritePrivilege()) return;
    try {
      await sellerService.updateCategory(cat.id, { ...cat, isActive: !cat.isActive });
      loadDashboardData();
    } catch (err) {
      alert('Failed to toggle category state.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!assertWritePrivilege()) return;
    if (!confirm('Are you sure you want to remove this category? Parent references will clear.')) return;
    try {
      await sellerService.deleteCategory(id);
      alert('Category deleted.');
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  // Inventory Adjustments
  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    
    let targetVariantId = stockAdjustForm.variantId;
    if (!targetVariantId && productForm.variants && productForm.variants.length > 0) {
      targetVariantId = productForm.variants[0].id;
    }

    const adjVal = parseInt(stockAdjustForm.adjustment);
    if (!targetVariantId || isNaN(adjVal) || adjVal === 0) {
      return alert('Specify a valid target Variant and non-zero stock correction level.');
    }
    try {
      await sellerService.adjustStock(targetVariantId, adjVal, stockAdjustForm.reason);
      alert('Stock ledger updated successfully.');
      
      // Load updated dashboard, logs, and refresh active form variant stock
      loadDashboardData();
      const logs = await sellerService.getInventoryLogs();
      setInventoryLogs(logs || []);
      const prodData = await sellerService.getProducts();
      setProducts(prodData || []);
      
      const firstVarId = productForm.variants && productForm.variants.length > 0 ? productForm.variants[0].id : '';
      setStockAdjustForm({ variantId: firstVarId, adjustment: '10', reason: 'Stock intake' });

      if (productForm.id) {
        const updatedProd = prodData.find(prod => prod.id === productForm.id);
        if (updatedProd) {
          setProductForm(prev => ({
            ...prev,
            variants: updatedProd.variants && updatedProd.variants.length > 0 ? updatedProd.variants.map((v, idx) => ({
              id: v.id,
              name: v.name || `Variant ${idx + 1}`,
              weightGrams: v.weightGrams || 500,
              price: v.price || 0,
              stock: v.stock || 0,
              sku: v.sku || '',
              variantImage: v.variantImage || v.imageUrl || ''
            })) : prev.variants
          }));
        }
      }
    } catch (err) {
      alert(err.error || 'Failed to register stock correction.');
    }
  };

  // Order timeline changes and notes saves
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!assertWritePrivilege()) return;
    try {
      await sellerService.updateOrderStatus(orderId, newStatus, orderNotes || undefined);
      alert(`Order status marked as ${newStatus}!`);
      setOrderNotes('');
      setSelectedOrder(null);
      loadDashboardData();
    } catch (err) {
      console.error('Order status update failed:', err);
      alert(err?.error || 'Failed to update order status.');
    }
  };

  // Save detailed order notes manually
  const handleSaveOrderNotes = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    if (!selectedOrder) return;
    try {
      await sellerService.updateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, orderNotes);
      alert('Order notes updated successfully.');
      setOrderNotes('');
      setSelectedOrder(null);
      loadDashboardData();
    } catch (err) {
      console.error('Save order notes failed:', err);
      alert(err?.error || 'Failed to save order notes.');
    }
  };

  // Coupons CRUD
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      await sellerService.createCoupon(couponForm);
      setCouponForm({ code: '', discountType: 'Percentage', discountValue: 10, expiryDate: '', usageLimit: 100 });
      alert('Store Coupon created!');
      loadDashboardData();
    } catch (err) {
      alert(err.error || 'Failed to create coupon.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!assertWritePrivilege()) return;
    if (!confirm('Remove this coupon?')) return;
    try {
      await sellerService.deleteCoupon(id);
      loadDashboardData();
    } catch (err) {
      alert('Failed to delete coupon.');
    }
  };

  // Save Settings
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      await sellerService.updateStoreSettings(storeSettings);
      alert('Store settings saved successfully!');
      loadDashboardData();
    } catch (err) {
      alert('Failed to save store configurations.');
    }
  };

  // Phase 7 Actions
  const handleSelectTheme = async (themeKey) => {
    if (!assertWritePrivilege()) return;
    try {
      const res = await api.post('/themes/select', { themeKey });
      alert(res.message || 'Theme published successfully!');
      loadCmsData();
    } catch (err) {
      alert('Failed to select theme.');
    }
  };

  const handleDuplicateTheme = async (themeKey) => {
    if (!assertWritePrivilege()) return;
    try {
      const res = await api.post('/themes/duplicate', { themeKey });
      alert(res.message || 'Theme duplicated!');
      loadCmsData();
    } catch (err) {
      alert('Failed to duplicate theme.');
    }
  };

  const handleResetTheme = async (themeKey) => {
    if (!assertWritePrivilege()) return;
    if (!window.confirm('Are you sure you want to revert theme customizations to defaults?')) return;
    try {
      const res = await api.post('/themes/reset', { themeKey });
      alert(res.message || 'Theme reset successfully!');
      loadCmsData();
    } catch (err) {
      alert('Failed to reset theme.');
    }
  };

  const handlePublishCustomizer = async () => {
    if (!assertWritePrivilege()) return;
    try {
      const res = await api.put('/themes/customize', {
        themeKey: activeTheme.themeKey,
        settings: activeTheme.settings,
        sections: activeTheme.sections
      });
      alert(res.message || 'Customizations published!');
      loadCmsData();
    } catch (err) {
      alert('Failed to publish customizations.');
    }
  };

  // CMS Pages Action Handlers
  const handleEditPageClick = (page) => {
    if (page) {
      setEditingPage(page);
      setPageForm({
        title: page.title,
        slug: page.slug,
        content: page.content,
        isPublished: page.isPublished,
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || ''
      });
    } else {
      setEditingPage('new');
      setPageForm({ title: '', slug: '', content: '', isPublished: true, seoTitle: '', seoDescription: '' });
    }
  };

  const handleSaveCmsPage = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      if (editingPage === 'new') {
        await api.post('/cms/pages', pageForm);
        alert('Page created successfully!');
      } else {
        await api.put(`/cms/pages/${editingPage.id}`, pageForm);
        alert('Page updated successfully!');
      }
      setEditingPage(null);
      loadCmsData();
    } catch (err) {
      alert('Failed to save page.');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!assertWritePrivilege()) return;
    if (!window.confirm('Delete this page permanently?')) return;
    try {
      await api.delete(`/cms/pages/${pageId}`);
      alert('Page deleted.');
      loadCmsData();
    } catch (err) {
      alert('Failed to delete page.');
    }
  };

  // Navigation Menus Action Handlers
  const handleSaveMenu = async () => {
    if (!assertWritePrivilege()) return;
    try {
      await api.post('/cms/menus', {
        menuKey: editingMenuKey,
        name: editingMenuKey === 'header' ? 'Header Navigation' : 'Footer Links',
        menuItems: menuItems
      });
      alert('Menu saved successfully!');
      loadCmsData();
    } catch (err) {
      alert('Failed to save menu.');
    }
  };

  // Blogs Action Handlers
  const handleEditBlogPostClick = (post) => {
    if (post) {
      setEditingBlogPost(post);
      setBlogPostForm({
        title: post.title,
        slug: post.slug,
        content: post.content,
        category: post.category || 'News',
        featuredImageUrl: post.featuredImageUrl || '',
        isPublished: post.isPublished,
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || ''
      });
    } else {
      setEditingBlogPost('new');
      setBlogPostForm({ title: '', slug: '', content: '', category: 'News', featuredImageUrl: '', isPublished: true, seoTitle: '', seoDescription: '' });
    }
  };

  const handleSaveBlogPost = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      if (editingBlogPost === 'new') {
        await api.post('/cms/blog', blogPostForm);
        alert('Blog article created!');
      } else {
        await api.put(`/cms/blog/${editingBlogPost.id}`, blogPostForm);
        alert('Blog article updated!');
      }
      setEditingBlogPost(null);
      loadCmsData();
    } catch (err) {
      alert('Failed to save blog post.');
    }
  };

  const handleDeleteBlogPost = async (id) => {
    if (!assertWritePrivilege()) return;
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/cms/blog/${id}`);
      alert('Blog article deleted.');
      loadCmsData();
    } catch (err) {
      alert('Failed to delete article.');
    }
  };

  // Media Library
  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    if (!mediaUploadUrl) { alert('Please provide image url.'); return; }
    try {
      await api.post('/cms/media', {
        fileName: mediaUploadName || 'image_asset.png',
        fileUrl: mediaUploadUrl,
        fileSize: 153600
      });
      alert('Asset registered in library!');
      setMediaUploadUrl('');
      setMediaUploadName('');
      loadCmsData();
    } catch (err) {
      alert('Failed to register media asset.');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!assertWritePrivilege()) return;
    if (!window.confirm('Delete this asset?')) return;
    try {
      await api.delete(`/cms/media/${id}`);
      alert('Asset removed.');
      loadCmsData();
    } catch (err) {
      alert('Failed to delete asset.');
    }
  };

  // Update Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    try {
      await sellerService.updateStoreProfile(profile);
      alert('Profile details saved.');
      loadDashboardData();
    } catch (err) {
      alert('Failed to save profile details.');
    }
  };

  // Update Password
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!assertWritePrivilege()) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return alert('New passwords do not match.');
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.error || 'Failed to update account password.');
    }
  };

  // Fetch detailed customer metrics
  const handleViewCustomerDetail = async (customerId) => {
    setLoading(true);
    try {
      const details = await sellerService.getCustomerDetail(customerId);
      setSelectedCustomer(details);
    } catch (err) {
      alert('Failed to load customer profiles.');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload handler helpers
  const handleProductImageFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductForm(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Validate format
    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Images must be smaller than 5MB.');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Images must be in JPG, JPEG, PNG, or WebP format.');
        return;
      }
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 800);
          return 100;
        }
        return prev + 30;
      });
    }, 100);

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setProductForm(prev => {
          const nextImgs = Array.isArray(prev.images) ? [...prev.images, reader.result] : [reader.result];
          return {
            ...prev,
            images: nextImgs,
            featured_image: prev.featured_image || reader.result
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReplaceImage = (idx, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('File is too large (> 5MB).');
    const reader = new FileReader();
    reader.onload = () => {
      setProductForm(prev => {
        const nextImgs = [...prev.images];
        const oldImg = nextImgs[idx];
        nextImgs[idx] = reader.result;
        return {
          ...prev,
          images: nextImgs,
          featured_image: prev.featured_image === oldImg ? reader.result : prev.featured_image
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (idx) => {
    setProductForm(prev => {
      const nextImgs = prev.images.filter((_, i) => i !== idx);
      let nextCover = prev.featured_image;
      if (prev.featured_image === prev.images[idx]) {
        nextCover = nextImgs.length > 0 ? nextImgs[0] : '';
      }
      return {
        ...prev,
        images: nextImgs,
        featured_image: nextCover
      };
    });
  };

  const handleMoveImage = (idx, direction) => {
    const nextImgs = [...productForm.images];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= nextImgs.length) return;
    const temp = nextImgs[idx];
    nextImgs[idx] = nextImgs[targetIdx];
    nextImgs[targetIdx] = temp;
    setProductForm({ ...productForm, images: nextImgs });
  };

  const handleMoveVariant = (idx, direction) => {
    const nextVars = [...productForm.variants];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= nextVars.length) return;
    const temp = nextVars[idx];
    nextVars[idx] = nextVars[targetIdx];
    nextVars[targetIdx] = temp;
    setProductForm({ ...productForm, variants: nextVars });
  };

  const handleVariantImageUpload = (idx, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductForm(prev => {
        const nextVars = [...prev.variants];
        nextVars[idx].variantImage = reader.result;
        return { ...prev, variants: nextVars };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleStoreLogoFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setStoreSettings(prev => ({ ...prev, logoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleStoreBannerFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setStoreSettings(prev => ({ ...prev, bannerUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Sidebar Menu mapping
  const sidebarMenu = (
    <>
      <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📊</span>
        <span className="admin-tab-text">Overview</span>
      </button>
      <button className={`admin-tab ${activeTab === 'products' || activeTab === 'add-product' ? 'active' : ''}`} onClick={() => { setActiveTab('products'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📦</span>
        <span className="admin-tab-text">Products</span>
      </button>
      <button className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => { setActiveTab('categories'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🏷️</span>
        <span className="admin-tab-text">Categories</span>
      </button>

      <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🚚</span>
        <span className="admin-tab-text">Orders timeline</span>
      </button>
      <button className={`admin-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => { setActiveTab('customers'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">👥</span>
        <span className="admin-tab-text">Store Customers</span>
      </button>
      <button className={`admin-tab ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => { setActiveTab('coupons'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🎫</span>
        <span className="admin-tab-text">Discounts & Coupons</span>
      </button>
      <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">⚙️</span>
        <span className="admin-tab-text">Store Settings</span>
      </button>
      <button className={`admin-tab ${activeTab === 'online-store' ? 'active' : ''}`} onClick={() => { setActiveTab('online-store'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🌐</span>
        <span className="admin-tab-text">Online Store</span>
      </button>
      <button className={`admin-tab ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => { setActiveTab('integrations'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🔌</span>
        <span className="admin-tab-text">Integrations</span>
      </button>
      <button className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📈</span>
        <span className="admin-tab-text">Reports</span>
      </button>
      <button className={`admin-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🔔</span>
        <span className="admin-tab-text">Notifications</span>
      </button>
      <button className={`admin-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => { setActiveTab('chat'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">💬</span>
        <span className="admin-tab-text">Chat with Admin</span>
      </button>
      <button className={`admin-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">👤</span>
        <span className="admin-tab-text">Owner Profile</span>
      </button>
      <button className={`admin-tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => { setActiveTab('billing'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">💳</span>
        <span className="admin-tab-text">Billing & Plan</span>
      </button>
    </>
  );

  return (
    <DashboardLayout
      sidebarTitle="Store Dashboard"
      sidebarIcon="🏪"
      sidebarSubtitle={profile.storeName ? `Store: ${profile.storeName}` : 'Store Settings'}
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
      sidebarMenu={sidebarMenu}
    >
      {/* Impersonation alert notification */}
      {isReadOnly && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid #fecaca',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span>🔍</span>
          Super Admin Impersonation Mode — Viewing Store #{impersonateStoreId} (Tenant #{impersonateTenantId}) in READ-ONLY mode.
        </div>
      )}

      {/* Subscription Status Banner */}
      {sellerSubscription && (() => {
        const now = new Date();
        const end = sellerSubscription.currentPeriodEnd ? new Date(sellerSubscription.currentPeriodEnd) : null;
        const daysLeft = end ? Math.ceil((end - now) / (1000*60*60*24)) : null;
        const isExpired = sellerSubscription.status === 'expired' || daysLeft <= 0;
        const isExpiring = daysLeft >= 0 && daysLeft <= 7;
        if (sellerSubscription.status === 'active' && !isExpiring && !isExpired) return null;
        return (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            border: `1px solid ${isExpired ? '#fecaca' : '#fde68a'}`,
            background: isExpired ? '#fef2f2' : '#fffbeb',
            color: isExpired ? '#b91c1c' : '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <span>{isExpired ? '🔴' : '🟡'}</span>
            <span style={{ flex: 1 }}>
              {isExpired
                ? `Your subscription has expired. Please renew your plan to restore access.`
                : isExpiring && daysLeft <= 1
                  ? `Your subscription expires tomorrow! Renew now to avoid losing access.`
                  : `Your subscription expires in ${daysLeft} days. Please renew soon to avoid service interruption.`
              }
            </span>
            <button className="action-btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }} onClick={() => setActiveTab('billing')}>
              {isExpired ? 'Renew Now' : 'View Plan'}
            </button>
          </div>
        );
      })()}

      {announcements.length > 0 && announcements.map((a, i) => (
        <div key={a.id || i} style={{
          background: a.priority === 'urgent' ? '#fef2f2' : a.priority === 'high' ? '#fffbeb' : '#f0fdf4',
          border: `1px solid ${a.priority === 'urgent' ? '#fca5a5' : a.priority === 'high' ? '#fcd34d' : '#86efac'}`,
          borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '0.75rem',
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem'
        }}>
          <span style={{ fontSize: '1.1rem' }}>{a.priority === 'urgent' ? '🔴' : a.priority === 'high' ? '🟡' : '🟢'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>{a.title}</div>
            <div style={{ color: 'var(--text-dark)', lineHeight: 1.5 }}>{a.content}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      ))}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading store data...</div>
      ) : profile.sellerStatus && profile.sellerStatus !== 'Approved' && user?.sellerStatus !== 'Approved' ? (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>
            {profile.sellerStatus === 'Suspended' ? '🚫' : profile.sellerStatus === 'Rejected' ? '❌' : '⏳'}
          </span>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            {profile.sellerStatus === 'Suspended' ? 'Store Suspended' : profile.sellerStatus === 'Rejected' ? 'Application Rejected' : 'Store Registration Pending'}
          </h2>
          <p style={{ color: 'var(--text-dark)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {profile.sellerStatus === 'Suspended'
              ? 'Your store account has been suspended by the platform administrator. You cannot log in or manage listings at this time.'
              : profile.sellerStatus === 'Rejected'
                ? 'Your application to sell on SnapShop has been rejected. Please contact support for details.'
                : `Thank you for registering your store! Your account is currently under review by our platform administration team.`}
          </p>
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--text-muted)'
          }}>
            {profile.sellerStatus === 'Suspended'
              ? 'For disputes or status reactivations, please reach out to admin support.'
              : `Registered Email: ${profile.email}`}
          </div>
          <button
            className="secondary-btn"
            onClick={() => logout()}
            style={{ padding: '0.6rem 1.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', cursor: 'pointer' }}
          >
            Logout Securely
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {storeSettings.logoUrl ? (
                  <img src={storeSettings.logoUrl} alt="logo" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                    {profile.storeName ? profile.storeName.charAt(0) : 'S'}
                  </div>
                )}
                <div>
                  <h1 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{profile.storeName || 'My Store Workspace'}</h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>{profile.storeDescription || 'Manage store catalogs, nested categories, inventory levels, order timeline actions, and configurations.'}</p>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>GROSS REVENUE</span>
                  <h2 style={{ color: 'var(--primary-light)', marginTop: '0.5rem', fontSize: '2rem' }}>₹{Math.round(stats.totalRevenue)}</h2>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL SHIPPED ORDERS</span>
                  <h2 style={{ color: 'var(--accent)', marginTop: '0.5rem', fontSize: '2rem' }}>{stats.totalOrders}</h2>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>PRODUCT LISTINGS</span>
                  <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem', fontSize: '2rem' }}>{stats.totalProducts} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({stats.activeProducts} active)</span></h2>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>LOW STOCK ALERTS</span>
                  <h2 style={{ color: stats.lowStockAlerts.length > 0 ? '#ef4444' : 'var(--success)', marginTop: '0.5rem', fontSize: '2rem' }}>{stats.lowStockAlerts.length}</h2>
                </div>
              </div>

              {/* Charts and Action Items Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>📈 Sales Summary Trends</h4>
                  {stats.revenueTrend && stats.revenueTrend.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px', paddingTop: '1rem' }}>
                      {stats.revenueTrend.map((r, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                          <div style={{
                            width: '100%',
                            height: `${Math.max((r.revenue / stats.maxTrendRevenue) * 100, 2)}%`,
                            background: r.revenue > 0 ? 'var(--primary-light)' : 'var(--border)',
                            borderRadius: '3px 3px 0 0',
                            minHeight: '4px'
                          }} title={`${r.date}: ₹${r.revenue}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sales data logged yet.</p>
                  )}
                </div>

                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>⚡ Quick Actions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="action-btn" style={{ width: '100%' }} onClick={() => { setProductForm({ id: null, name: '', category: '', description: '', status: 'Active', imageUrl: '', discount: 0, variants: [{ weightGrams: 500, price: 150, stock: 100, sku: '' }], seoTitle: '', seoDescription: '', collectionName: '' }); setActiveTab('products'); }}>+ List Product</button>
                    <button className="secondary-btn" style={{ width: '100%' }} onClick={() => { setActiveTab('categories'); }}>+ Add Category</button>
                    <button className="secondary-btn" style={{ width: '100%' }} onClick={() => { setActiveTab('coupons'); }}>+ Generate Coupon</button>
                    <button className="secondary-btn" style={{ width: '100%' }} onClick={() => { setActiveTab('settings'); }}>⚙️ Configure Shop</button>
                  </div>
                </div>
              </div>

              {/* Lists of Recent Orders and Low Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Recent Order Submissions</h4>
                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed.</p>
                  ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Status</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td><span className={`order-status-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span></td>
                            <td>₹{Math.round(o.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>Low Stock Inventory</h4>
                  {stats.lowStockAlerts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stock levels normal.</p>
                  ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.lowStockAlerts.slice(0, 5).map((a, i) => (
                          <tr key={i}>
                            <td>{a.productName}</td>
                            <td><code>{a.sku}</code></td>
                            <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{a.stock} left</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (() => {
            const displayedProducts = products.filter(p => {
              const status = p.status === 'Approved' ? 'Active' : (p.status || 'Active');
              return (productFilter === 'all' || status === productFilter) &&
                     (categoryFilter === 'all' || Number(p.categoryId) === Number(categoryFilter));
            });
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2>Product Catalog Scoping</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="sort-select" style={{ minWidth: '160px' }}>
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{decodeHtml(cat.name)}</option>
                      ))}
                    </select>
                    <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="sort-select">
                      <option value="all">All States</option>
                      <option value="Active">Active Only</option>
                      <option value="Draft">Drafts Only</option>
                      <option value="Archived">Archived Only</option>
                    </select>
                    <button className="action-btn" onClick={() => { 
                      setProductForm({ 
                        id: null, 
                        name: '', 
                        category: '', 
                        brand: '',
                        description: '', 
                        status: 'Active', 
                        imageUrl: '', 
                        discount: 0, 
                        variants: [{ name: 'Default Variant', weightGrams: 500, price: 150, stock: 100, sku: '', variantImage: '' }], 
                        seoTitle: '', 
                        seoDescription: '', 
                        collectionName: '',
                        warrantyInformation: 'No warranty',
                        rating: 4.41,
                        images: [],
                        featured_image: '',
                        minimumOrderQuantity: 1,
                        shippingInformation: 'Ships in 1-2 business days',
                        returnPolicy: '7 days return policy',
                        availabilityStatus: 'In Stock'
                      }); 
                      setActiveFormTab('basic');
                      setFormErrors({});
                      setActiveTab('add-product'); 
                    }}>+ List New Product</button>
                  </div>
                </div>

                {selectedProducts.length > 0 && (
                  <div style={{ background: 'var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>With {selectedProducts.length} selected:</span>
                    <button className="secondary-btn" onClick={() => handleBulkStatusChange('Active')}>Set Active</button>
                    <button className="secondary-btn" onClick={() => handleBulkStatusChange('Draft')}>Set Draft</button>
                    <button className="secondary-btn" onClick={() => handleBulkStatusChange('Archived')}>Archive Selected</button>
                    <button className="secondary-btn" style={{ background: '#fecaca', color: '#b91c1c' }} onClick={handleBulkDelete}>Delete Selected</button>
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input type="checkbox" onChange={e => {
                            if (e.target.checked) setSelectedProducts(displayedProducts.map(p => p.id));
                            else setSelectedProducts([]);
                          }} checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0} />
                        </th>
                        <th>Product Info</th>
                        <th>Category</th>
                        <th>Base Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map(p => {
                      const baseVar = p.variants && p.variants.length > 0 ? p.variants[0] : null;
                      return (
                        <tr key={p.id}>
                          <td>
                            <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={e => {
                              if (e.target.checked) setSelectedProducts([...selectedProducts, p.id]);
                              else setSelectedProducts(selectedProducts.filter(id => id !== p.id));
                            }} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <img src={getProductImageSrc(p)} alt="prod" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                              <div>
                                <strong style={{ color: 'var(--primary)' }}>{decodeHtml(p.name)}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td>{decodeHtml(p.category)}</td>
                          <td>₹{baseVar ? Math.round(baseVar.price) : '0'}</td>
                          <td>
                            <span className={`order-status-badge ${(p.status === 'Approved' ? 'Active' : (p.status || 'Active')).toLowerCase()}`}>
                              {p.status === 'Approved' ? 'Active' : (p.status || 'Active')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => {
                                setProductForm({
                                  id: p.id,
                                  name: decodeHtml(p.name),
                                  category: decodeHtml(p.category),
                                  brand: decodeHtml(p.brand || ''),
                                  description: decodeHtml(p.description || ''),
                                  status: p.status === 'Approved' ? 'Active' : (p.status || 'Active'),
                                  imageUrl: p.image || p.imageUrl || '',
                                  discount: p.discount || 0,
                                  variants: p.variants && p.variants.length > 0 ? p.variants.map((v, idx) => {
                                    return {
                                      id: v.id,
                                      name: v.name || `Variant ${idx + 1}`,
                                      weightGrams: v.weightGrams || 500, 
                                      price: v.price || 0, 
                                      stock: v.stock || 0, 
                                      sku: v.sku || '',
                                      variantImage: v.variantImage || v.imageUrl || ''
                                    };
                                  }) : [{ 
                                    id: `v-default-${p.id}`,
                                    name: 'Default Variant', 
                                    weightGrams: 500, 
                                    price: p.price || 0, 
                                    stock: p.stock || 100, 
                                    sku: p.sku || '', 
                                    variantImage: p.image || p.imageUrl || '' 
                                  }],
                                  seoTitle: p.seoTitle || '',
                                  seoDescription: p.seoDescription || '',
                                  collectionName: p.collectionName || '',
                                  warrantyInformation: p.warrantyInformation || '',
                                  rating: p.rating || 4.41,
                                  images: Array.isArray(p.images) ? p.images : (p.image || p.imageUrl ? [p.image || p.imageUrl] : []),
                                  featured_image: p.featured_image || p.image || p.imageUrl || '',
                                  minimumOrderQuantity: p.minimumOrderQuantity || 1,
                                  shippingInformation: p.shippingInformation || 'Ships in 1-2 business days',
                                  returnPolicy: p.returnPolicy || '7 days return policy',
                                  availabilityStatus: p.availabilityStatus || 'In Stock'
                                });
                                setActiveFormTab('basic');
                                setFormErrors({});
                                setActiveTab('add-product');
                                const firstVarId = p.variants && p.variants.length > 0 ? p.variants[0].id : '';
                                setStockAdjustForm({
                                  variantId: firstVarId,
                                  adjustment: 10,
                                  reason: 'Stock intake'
                                });
                                sellerService.getInventoryLogs().then(setInventoryLogs).catch(() => {});
                              }}>Edit</button>
                              <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#ef4444' }} onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })()}

          {/* SUB-TAB: ADD / EDIT PRODUCT */}
          {activeTab === 'add-product' && (
            <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {productForm.id ? `Modify Product: ${productForm.name}` : 'List New Store Product'}
                </h3>
                <button type="button" className="secondary-btn" onClick={() => setActiveTab('products')} style={{ fontSize: '0.85rem' }}>Back to Listings</button>
              </div>

              <form onSubmit={handleProductSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', minHeight: '500px' }}>
                  {/* Left Tab navigation */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border)', paddingRight: '1.5rem' }}>
                    {[
                      { id: 'basic', label: '📋 Basic Info', desc: 'Title, brand, category, description' },
                      { id: 'pricing', label: '💰 Pricing & Discount', desc: 'Base price, discount rates' },
                      { id: 'images', label: '🖼️ Product Images', desc: 'Upload multiple gallery images' },
                      { id: 'inventory', label: '📦 Inventory Status', desc: 'Stock level, preorder, MOQ' },
                      { id: 'variants', label: '🤝 Variants configurations', desc: 'Sizes, colors, pricing, images' },
                      { id: 'shipping', label: '🚚 Shipping & Returns', desc: 'Warranty, return guidelines' },
                      { id: 'seo', label: '🔍 Search Engine Optimization', desc: 'Meta tags, page titles' }
                    ].map(tab => {
                      const hasError = tab.id === 'basic' ? (formErrors.name || formErrors.brand || formErrors.category || formErrors.description) :
                                       tab.id === 'images' ? formErrors.images :
                                       tab.id === 'variants' ? (formErrors.variants || Object.keys(formErrors).some(k => k.startsWith('variant_'))) : false;
                      
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFormTab(tab.id)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            padding: '0.75rem 1rem',
                            border: 'none',
                            background: activeFormTab === tab.id ? 'rgba(37, 99, 235, 0.08)' : 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.2s',
                            borderLeft: activeFormTab === tab.id ? '4px solid var(--primary)' : '4px solid transparent'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: activeFormTab === tab.id ? 'var(--primary)' : 'var(--text)' }}>
                            {tab.label} {hasError && <span style={{ color: '#ef4444' }}>⚠️</span>}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{tab.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Tab Content */}
                  <div style={{ flex: 1 }}>
                    {/* Tab 1: Basic Info */}
                    {activeFormTab === 'basic' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Basic Product Details</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="form-label">Product Title <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className={`form-input ${formErrors.name ? 'error' : ''}`} required />
                            {formErrors.name && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.name}</div>}
                          </div>
                          <div>
                            <label className="form-label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                            <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className={`form-input ${formErrors.category ? 'error' : ''}`} required>
                              <option value="">Select Category</option>
                               {categories.map(c => (
                                 <option key={c.id} value={decodeHtml(c.name)}>{decodeHtml(c.name)}</option>
                               ))}
                             </select>
                            {formErrors.category && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.category}</div>}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="form-label">Brand <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} className={`form-input ${formErrors.brand ? 'error' : ''}`} placeholder="e.g. Zara, Nike" required />
                            {formErrors.brand && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.brand}</div>}
                          </div>
                          <div>
                            <label className="form-label">Collection Name</label>
                            <input type="text" value={productForm.collectionName} onChange={e => setProductForm({ ...productForm, collectionName: e.target.value })} className="form-input" placeholder="e.g. Summer Collection, Classic Drops" />
                          </div>
                        </div>

                        <div>
                          <label className="form-label">Catalog Description <span style={{ color: '#ef4444' }}>*</span></label>
                          <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className={`form-input ${formErrors.description ? 'error' : ''}`} style={{ minHeight: '120px' }} required />
                          {formErrors.description && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{formErrors.description}</div>}
                        </div>

                        <div>
                          <label className="form-label">Status</label>
                          <select value={productForm.status} onChange={e => setProductForm({ ...productForm, status: e.target.value })} className="form-input" style={{ maxWidth: '200px' }}>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Pricing */}
                    {activeFormTab === 'pricing' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Pricing Configuration</h4>
                        
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          📝 <strong>Pricing Guidelines:</strong> Pricing parameters are managed per variant. Use this section to set the base price of the default variant, or manage variant lists on the <strong>Variants configurations</strong> tab.
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="form-label">Base Price (INR) <span style={{ color: '#ef4444' }}>*</span></label>
                            <input 
                              type="number" 
                              value={productForm.variants[0]?.price || ''} 
                              onChange={e => {
                                const nextVars = [...productForm.variants];
                                if (nextVars[0]) {
                                  nextVars[0].price = parseFloat(e.target.value) || 0;
                                  setProductForm({ ...productForm, variants: nextVars });
                                }
                              }} 
                              className="form-input" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="form-label">Discount Percentage (%)</label>
                            <input 
                              type="number" 
                              min="0" 
                              max="99" 
                              value={productForm.discount} 
                              onChange={e => setProductForm({ ...productForm, discount: parseInt(e.target.value) || 0 })} 
                              className="form-input" 
                            />
                          </div>
                        </div>

                        {productForm.variants[0]?.price > 0 && (
                          <div style={{ display: 'flex', gap: '2rem', background: '#ecfdf5', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#065f46', display: 'block' }}>Original Base Price (MRP)</span>
                              <strong style={{ fontSize: '1.1rem', color: '#047857', textDecoration: productForm.discount > 0 ? 'line-through' : 'none' }}>
                                ₹{Math.round(productForm.variants[0].price)}
                              </strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.75rem', color: '#065f46', display: 'block' }}>Price After Discount (Storefront Price)</span>
                              <strong style={{ fontSize: '1.1rem', color: '#047857' }}>
                                ₹{Math.round(productForm.variants[0].price * (1 - (productForm.discount || 0) / 100))}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Images */}
                    {activeFormTab === 'images' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Product Images Gallery</h4>
                        
                        <div 
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault();
                            handleGalleryUpload({ target: { files: e.dataTransfer.files } });
                          }}
                          style={{
                            border: '2px dashed var(--primary)',
                            borderRadius: 'var(--radius-md)',
                            padding: '2.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: 'rgba(37, 99, 235, 0.02)',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => document.getElementById('gallery-file-input').click()}
                        >
                          <span style={{ fontSize: '2rem' }}>📤</span>
                          <h5 style={{ margin: '0.5rem 0', fontWeight: 'bold' }}>Drag & Drop Showcase Images</h5>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports JPG, JPEG, PNG, and WebP (Max 5MB each)</p>
                          <input 
                            type="file" 
                            id="gallery-file-input" 
                            multiple 
                            accept="image/*" 
                            onChange={handleGalleryUpload} 
                            style={{ display: 'none' }} 
                          />
                        </div>

                        {uploadProgress !== null && (
                          <div style={{ background: '#f1f5f9', borderRadius: '10px', height: '8px', overflow: 'hidden', width: '100%' }}>
                            <div style={{ background: 'var(--primary)', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.15s ease' }} />
                          </div>
                        )}

                        {formErrors.images && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ {formErrors.images}</div>}

                        {productForm.images && productForm.images.length > 0 && (
                          <div>
                            <label className="form-label" style={{ marginBottom: '0.75rem' }}>Active Showcase Gallery ({productForm.images.length} images)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                              {productForm.images.map((img, idx) => {
                                const isCover = productForm.featured_image === img;
                                return (
                                  <div key={idx} style={{ border: isCover ? '2px solid #ffb300' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                                    <img src={img} alt={`gallery-${idx}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-xs)' }} />
                                    
                                    {isCover ? (
                                      <div style={{ background: '#ffb300', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.2rem', textAlign: 'center', borderRadius: '2px' }}>
                                        ★ Cover Image
                                      </div>
                                    ) : (
                                      <button 
                                        type="button" 
                                        onClick={() => setProductForm({ ...productForm, featured_image: img })}
                                        style={{ padding: '0.25rem', fontSize: '0.65rem', background: '#f8fafc', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '2px', fontWeight: 'bold' }}
                                      >
                                        Set as Cover
                                      </button>
                                    )}

                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                      <button 
                                        type="button" 
                                        disabled={idx === 0} 
                                        onClick={() => handleMoveImage(idx, -1)}
                                        style={{ padding: '2px 6px', fontSize: '0.65rem', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}
                                      >
                                        ◀
                                      </button>
                                      <button 
                                        type="button" 
                                        disabled={idx === productForm.images.length - 1} 
                                        onClick={() => handleMoveImage(idx, 1)}
                                        style={{ padding: '2px 6px', fontSize: '0.65rem', cursor: idx === productForm.images.length - 1 ? 'not-allowed' : 'pointer' }}
                                      >
                                        ▶
                                      </button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                                      <label style={{ flex: 1, padding: '0.25rem 0', background: '#f1f5f9', border: '1px solid var(--border)', fontSize: '0.65rem', cursor: 'pointer', textAlign: 'center', borderRadius: '2px', fontWeight: 'bold' }}>
                                        Replace
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={e => handleReplaceImage(idx, e.target.files[0])} 
                                          style={{ display: 'none' }} 
                                        />
                                      </label>
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteImage(idx)}
                                        style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.65rem', cursor: 'pointer', borderRadius: '2px', fontWeight: 'bold' }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Inventory */}
                    {activeFormTab === 'inventory' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Inventory Status</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label className="form-label">Availability Status</label>
                            <select value={productForm.availabilityStatus} onChange={e => setProductForm({ ...productForm, availabilityStatus: e.target.value })} className="form-input">
                              <option value="In Stock">In Stock</option>
                              <option value="Out of Stock">Out of Stock</option>
                              <option value="Preorder">Preorder</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Minimum Order Quantity (MOQ)</label>
                            <input type="number" min="1" value={productForm.minimumOrderQuantity} onChange={e => setProductForm({ ...productForm, minimumOrderQuantity: parseInt(e.target.value) || 1 })} className="form-input" />
                          </div>
                        </div>

                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Aggregate Stock (Sum of all Variants)</span>
                          <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
                            {productForm.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)} units
                          </strong>
                        </div>

                        {productForm.id && (
                          <div style={{ display: 'grid', gap: '1.25rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--primary)' }}>📋 Stock Correction & Audit logs</h4>
                            
                            {/* Form card */}
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '1rem', alignItems: 'end' }}>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Target Variant</label>
                                <select 
                                  value={stockAdjustForm.variantId} 
                                  onChange={e => setStockAdjustForm({ ...stockAdjustForm, variantId: e.target.value })}
                                  className="form-input"
                                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                                  required
                                >
                                  <option value="">-- Select Variant --</option>
                                  {(productForm.variants || []).map((v, idx) => (
                                    <option key={v.id || idx} value={v.id}>
                                      {v.name || `Variant ${idx + 1}`} (Stock: {v.stock})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Adjustment (+/-)</label>
                                <input 
                                  type="number" 
                                  value={stockAdjustForm.adjustment} 
                                  onChange={e => setStockAdjustForm({ ...stockAdjustForm, adjustment: e.target.value })} 
                                  className="form-input"
                                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                                  required 
                                />
                              </div>
                              <div>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Reason for Correction</label>
                                <select 
                                  value={stockAdjustForm.reason} 
                                  onChange={e => setStockAdjustForm({ ...stockAdjustForm, reason: e.target.value })} 
                                  className="form-input"
                                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                                  required 
                                >
                                  <option value="Stock intake">Stock Intake (Restock)</option>
                                  <option value="Damaged goods">Damaged / Defective Goods</option>
                                  <option value="Audit correction">Inventory Audit Correction</option>
                                  <option value="Customer return">Customer Return Restock</option>
                                  <option value="Promotional giveaway">Promotional / Marketing Sample</option>
                                  <option value="Seasonal clearance">Seasonal Clearance Reduction</option>
                                  <option value="Theft or loss">Theft, Shrinkage, or Loss</option>
                                </select>
                              </div>
                              <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                                <button 
                                  type="button" 
                                  onClick={handleStockAdjustment} 
                                  className="action-btn"
                                  style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                >
                                  Post Stock Correction
                                </button>
                              </div>
                            </div>

                            {/* Audit Logs Table for this product */}
                            <div>
                              <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '0.5rem 0 0.5rem 0' }}>History Log for this Product</h5>
                              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0 }}>
                                      <th style={{ padding: '0.5rem 0.75rem' }}>Date & Time</th>
                                      <th style={{ padding: '0.5rem 0.75rem' }}>Variant</th>
                                      <th style={{ padding: '0.5rem 0.75rem' }}>Change</th>
                                      <th style={{ padding: '0.5rem 0.75rem' }}>Stock After</th>
                                      <th style={{ padding: '0.5rem 0.75rem' }}>Reason</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const pVariantIds = (productForm.variants || []).map(v => parseInt(v.id)).filter(id => !isNaN(id));
                                      const filteredLogs = inventoryLogs.filter(log => pVariantIds.includes(parseInt(log.variantId)));
                                      
                                      if (filteredLogs.length === 0) {
                                        return (
                                          <tr>
                                            <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No inventory corrections logged for this product.</td>
                                          </tr>
                                        );
                                      }

                                      return filteredLogs.map(log => {
                                        const matchingVariant = (productForm.variants || []).find(v => parseInt(v.id) === parseInt(log.variantId));
                                        return (
                                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.5rem 0.75rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                            <td style={{ padding: '0.5rem 0.75rem' }}>
                                              <strong>{matchingVariant ? matchingVariant.name : `Variant (ID: ${log.variantId})`}</strong>
                                              {log.sku ? <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {log.sku}</div> : null}
                                            </td>
                                            <td style={{ padding: '0.5rem 0.75rem' }}>
                                              <span style={{ 
                                                color: log.adjustment > 0 ? '#10b981' : log.adjustment < 0 ? '#ef4444' : '#6b7280',
                                                fontWeight: 'bold',
                                                background: log.adjustment > 0 ? '#ecfdf5' : log.adjustment < 0 ? '#fef2f2' : '#f3f4f6',
                                                padding: '1px 6px',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem'
                                              }}>
                                                {log.adjustment > 0 ? `+${log.adjustment}` : log.adjustment}
                                              </span>
                                            </td>
                                            <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{log.stockAfter}</td>
                                            <td style={{ padding: '0.5rem 0.75rem', color: '#4b5563' }}>{log.reason}</td>
                                          </tr>
                                        );
                                      });
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 5: Variants */}
                    {activeFormTab === 'variants' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Variants Configurations</h4>
                          <button type="button" className="action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => {
                            const nextIdx = productForm.variants.length + 1;
                            setProductForm({ 
                              ...productForm, 
                              variants: [...productForm.variants, { name: `Variant ${nextIdx}`, weightGrams: 500, price: 150, stock: 50, sku: '', variantImage: '' }] 
                            });
                          }}>
                            + Add Variant Spec
                          </button>
                        </div>

                        {formErrors.variants && <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>⚠️ {formErrors.variants}</div>}

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                          {productForm.variants.map((v, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Variant #{idx + 1}</strong>
                                
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button type="button" disabled={idx === 0} onClick={() => handleMoveVariant(idx, -1)} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>▲ Move Up</button>
                                  <button type="button" disabled={idx === productForm.variants.length - 1} onClick={() => handleMoveVariant(idx, 1)} style={{ padding: '2px 6px', fontSize: '0.7rem' }}>▼ Move Down</button>
                                  {productForm.variants.length > 1 && (
                                    <button type="button" onClick={() => setProductForm({ ...productForm, variants: productForm.variants.filter((_, i) => i !== idx) })} style={{ padding: '2px 8px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: '0.7rem', borderRadius: '3px' }}>Delete</button>
                                  )}
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Variant Name</label>
                                  <input type="text" placeholder="e.g. Size M / Black" value={v.name} onChange={e => {
                                    const nextVars = [...productForm.variants];
                                    nextVars[idx].name = e.target.value;
                                    setProductForm({ ...productForm, variants: nextVars });
                                  }} className="form-input" style={{ fontSize: '0.8rem' }} required />
                                </div>

                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Price (INR)</label>
                                  <input type="number" value={v.price} onChange={e => {
                                    const nextVars = [...productForm.variants];
                                    nextVars[idx].price = parseFloat(e.target.value) || 0;
                                    setProductForm({ ...productForm, variants: nextVars });
                                  }} className={`form-input ${formErrors[`variant_${idx}_price`] ? 'error' : ''}`} style={{ fontSize: '0.8rem' }} required />
                                  {formErrors[`variant_${idx}_price`] && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '2px' }}>{formErrors[`variant_${idx}_price`]}</div>}
                                </div>

                                <div>
                                  {productForm.id ? (
                                   <div>
                                     <label className="form-label" style={{ fontSize: '0.75rem' }}>Current Stock: {v.stock} units</label>
                                     <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                       <input 
                                         type="number" 
                                         placeholder="Add / Remove Stock (e.g. +10 or -5)" 
                                         value={v.stockAdjustment !== undefined ? v.stockAdjustment : ''} 
                                         onChange={e => {
                                           const val = e.target.value === '' ? '' : parseInt(e.target.value);
                                           const nextVars = [...productForm.variants];
                                           nextVars[idx].stockAdjustment = val;
                                           setProductForm({ ...productForm, variants: nextVars });
                                         }}
                                         className="form-input" 
                                         style={{ fontSize: '0.8rem', flex: 1 }} 
                                       />
                                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                         New total: {parseInt(v.stock) + (parseInt(v.stockAdjustment) || 0)}
                                       </div>
                                     </div>
                                   </div>
                                 ) : (
                                   <div>
                                     <label className="form-label" style={{ fontSize: '0.75rem' }}>Stock Quantity</label>
                                     <input type="number" value={v.stock} onChange={e => {
                                       const nextVars = [...productForm.variants];
                                       nextVars[idx].stock = parseInt(e.target.value) || 0;
                                       setProductForm({ ...productForm, variants: nextVars });
                                     }} className={`form-input ${formErrors[`variant_${idx}_stock`] ? 'error' : ''}`} style={{ fontSize: '0.8rem' }} required />
                                     {formErrors[`variant_${idx}_stock`] && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '2px' }}>{formErrors[`variant_${idx}_stock`]}</div>}
                                   </div>
                                 )}
                                </div>

                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>SKU <span style={{ color: '#ef4444' }}>*</span></label>
                                  <input type="text" value={v.sku} onChange={e => {
                                    const nextVars = [...productForm.variants];
                                    nextVars[idx].sku = e.target.value;
                                    setProductForm({ ...productForm, variants: nextVars });
                                  }} className={`form-input ${formErrors[`variant_${idx}_sku`] ? 'error' : ''}`} style={{ fontSize: '0.8rem' }} required />
                                  {formErrors[`variant_${idx}_sku`] && <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '2px' }}>{formErrors[`variant_${idx}_sku`]}</div>}
                                </div>

                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Weight (grams)</label>
                                  <input type="number" value={v.weightGrams} onChange={e => {
                                    const nextVars = [...productForm.variants];
                                    nextVars[idx].weightGrams = parseInt(e.target.value) || 0;
                                    setProductForm({ ...productForm, variants: nextVars });
                                  }} className="form-input" style={{ fontSize: '0.8rem' }} />
                                </div>

                                <div>
                                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Variant Image (optional)</label>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <label style={{ flex: 1, padding: '0.45rem', background: '#fff', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                                      Choose Image
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={e => handleVariantImageUpload(idx, e.target.files[0])} 
                                        style={{ display: 'none' }} 
                                      />
                                    </label>
                                    {v.variantImage && (
                                      <img src={v.variantImage} alt="v-preview" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 6: Shipping & Returns */}
                    {activeFormTab === 'shipping' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Shipping & Returns</h4>
                        
                        <div>
                          <label className="form-label">Warranty Details</label>
                          <input type="text" placeholder="e.g. 1 Year Brand Warranty, No warranty" value={productForm.warrantyInformation} onChange={e => setProductForm({ ...productForm, warrantyInformation: e.target.value })} className="form-input" />
                        </div>

                        <div>
                          <label className="form-label">Shipping Details</label>
                          <input type="text" placeholder="e.g. Ships in 1-2 business days" value={productForm.shippingInformation} onChange={e => setProductForm({ ...productForm, shippingInformation: e.target.value })} className="form-input" />
                        </div>

                        <div>
                          <label className="form-label">Return Policy</label>
                          <input type="text" placeholder="e.g. 7 days return policy" value={productForm.returnPolicy} onChange={e => setProductForm({ ...productForm, returnPolicy: e.target.value })} className="form-input" />
                        </div>
                      </div>
                    )}

                    {/* Tab 7: SEO */}
                    {activeFormTab === 'seo' && (
                      <div style={{ display: 'grid', gap: '1.25rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>Search Engine Optimization</h4>
                        
                        <div>
                          <label className="form-label">SEO Title Tag</label>
                          <input type="text" placeholder="Custom browser tab title preview" value={productForm.seoTitle} onChange={e => setProductForm({ ...productForm, seoTitle: e.target.value })} className="form-input" />
                        </div>

                        <div>
                          <label className="form-label">SEO Meta Description</label>
                          <textarea placeholder="Snippet displayed in search engine summaries" value={productForm.seoDescription} onChange={e => setProductForm({ ...productForm, seoDescription: e.target.value })} className="form-input" style={{ minHeight: '100px' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', justifyContent: 'flex-end' }}>
                  <button type="button" className="secondary-btn" onClick={() => setActiveTab('products')} style={{ minWidth: '100px' }}>Cancel</button>
                  <button type="submit" className="action-btn" style={{ minWidth: '120px' }}>Save Product</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Form creation */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3>{categoryForm.id ? 'Edit Category Item' : 'Create Custom Category'}</h3>
                <form onSubmit={handleCategorySubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <label className="form-label">Category Name</label>
                    <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">URL Slug (auto-generated if empty)</label>
                    <input type="text" value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Parent Category</label>
                    <select value={categoryForm.parentCategoryId} onChange={e => setCategoryForm({ ...categoryForm, parentCategoryId: e.target.value })} className="form-input">
                      <option value="">None (Top-Level)</option>
                      {categories.filter(c => c.id !== categoryForm.id).map(c => (
                        <option key={c.id} value={c.id}>{decodeHtml(c.name)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Description</label>
                    <textarea value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="form-input" style={{ minHeight: '60px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="catActive" checked={categoryForm.isActive} onChange={e => setCategoryForm({ ...categoryForm, isActive: e.target.checked })} />
                    <label htmlFor="catActive">Enable Category in catalogs</label>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="action-btn">Save Category</button>
                    {categoryForm.id && (
                      <button type="button" className="secondary-btn" onClick={() => setCategoryForm({ id: null, name: '', slug: '', description: '', parentCategoryId: '', isActive: true })}>Cancel Edit</button>
                    )}
                  </div>
                </form>
              </div>

              {/* Hierarchy Tree */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3>Category Hierarchies Tree</h3>
                <div style={{ marginTop: '1.25rem' }}>
                  {categories.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No custom categories seeded.</p>
                  ) : (
                    (() => {
                      const renderNode = (node, depth = 0) => (
                        <div key={node.id} style={{ marginLeft: `${depth * 1.5}rem`, borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                              <strong>{decodeHtml(node.name)}</strong>{' '}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({getProductCountForCategory(node.id)} products)</span>
                              <span 
                                style={{ 
                                  marginLeft: '0.75rem', 
                                  fontSize: '0.75rem', 
                                  color: 'var(--primary, #10b981)', 
                                  cursor: 'pointer', 
                                  textDecoration: 'underline',
                                  fontWeight: '600'
                                }} 
                                onClick={() => { 
                                  setCategoryFilter(node.id); 
                                  setActiveTab('products'); 
                                }}
                              >
                                View Products
                              </span>
                              {!node.isActive && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#fee2e2', color: '#ef4444', padding: '1px 4px', borderRadius: '2px' }}>Disabled</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button style={{ padding: '2px 6px', fontSize: '0.75rem', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }} onClick={() => handleToggleCategoryActive(node)}>Status</button>
                              <button style={{ padding: '2px 6px', fontSize: '0.75rem', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }} onClick={() => setCategoryForm({ id: node.id, name: decodeHtml(node.name), slug: node.slug, description: decodeHtml(node.description || ''), parentCategoryId: node.parentCategoryId || '', isActive: node.isActive })}>Edit</button>
                              <button style={{ padding: '2px 6px', fontSize: '0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer' }} onClick={() => handleDeleteCategory(node.id)}>Delete</button>
                            </div>
                          </div>
                          {node.children && node.children.map(child => renderNode(child, depth + 1))}
                        </div>
                      );
                      return getCategoryTree().map(root => renderNode(root, 0));
                    })()
                  )}
                </div>
              </div>
            </div>
          )}


          {/* TAB 5: ORDERS TIMELINE */}
          {activeTab === 'orders' && (
            <div>
              <h2>Store Orders Shipments</h2>
              <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer info</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Notes / Notes Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders placed yet.</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td>
                            <strong>{o.customerName || 'Guest'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                          </td>
                          <td>₹{Math.round(o.totalAmount)}</td>
                          <td>
                            <span className={`order-status-badge ${o.orderStatus.toLowerCase()}`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td>
                            <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => {
                              setSelectedOrder(o);
                              setOrderNotes(o.notes || '');
                            }}>Timeline & Notes</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order Fulfill modal */}
              {selectedOrder && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                  <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3>Order #{selectedOrder.id} Fulfillment Timeline</h3>
                      <button style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedOrder(null)}>×</button>
                    </div>

                    {/* Timeline Flow */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                      {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                        const isCurrent = selectedOrder.orderStatus === step;
                        const isCompleted = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered'].indexOf(selectedOrder.orderStatus) >= idx;
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                            <div style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              backgroundColor: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--primary-light)' : 'var(--border)'),
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--primary)' : 'var(--text-muted)' }}>{step}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Action Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {selectedOrder.orderStatus === 'Pending' && <button className="action-btn" onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Confirmed')}>Confirm Order</button>}
                      {selectedOrder.orderStatus === 'Confirmed' && <button className="action-btn" onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Packed')}>Mark as Packed</button>}
                      {selectedOrder.orderStatus === 'Packed' && <button className="action-btn" onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Shipped')}>Ship Package</button>}
                      {selectedOrder.orderStatus === 'Shipped' && <button className="action-btn" onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Delivered')}>Mark Delivered</button>}
                      {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && (
                        <button className="secondary-btn" style={{ background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Cancelled')}>Cancel Order</button>
                      )}
                    </div>

                    {/* Notes Editor */}
                    <form onSubmit={handleSaveOrderNotes}>
                      <label className="form-label">Fulfillment Order Notes / Instructions</label>
                      <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} className="form-input" style={{ minHeight: '80px', marginBottom: '1rem' }} placeholder="Add shipping details, weight confirmations, customer replies..." />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="action-btn">Save Notes</button>
                        <button type="button" className="secondary-btn" onClick={() => setSelectedOrder(null)}>Close</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div>
              <h2>Store Customers Spend Summary</h2>
              <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email ID</th>
                      <th>Phone</th>
                      <th>Total Orders</th>
                      <th>Total Spend</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customer history found.</td>
                      </tr>
                    ) : (
                      customers.map(c => (
                        <tr key={c.id}>
                          <td><strong>{c.name}</strong></td>
                          <td>{c.email}</td>
                          <td>{c.phone || '-'}</td>
                          <td>{c.totalOrders}</td>
                          <td><strong>₹{Math.round(c.totalSpent || 0)}</strong></td>
                          <td>
                            <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleViewCustomerDetail(c.id)}>View Details</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Customer Detail modal */}
              {selectedCustomer && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                  <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-md)', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3>Customer Profile: {selectedCustomer.customer.name}</h3>
                      <button style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setSelectedCustomer(null)}>×</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Contact Info</h4>
                        <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {selectedCustomer.customer.email}</p>
                        <p style={{ margin: '0.25rem 0' }}><strong>Phone:</strong> {selectedCustomer.customer.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Registered Addresses</h4>
                        {selectedCustomer.addresses.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No addresses specified.</p>
                        ) : (
                          selectedCustomer.addresses.map(a => (
                            <p key={a.id} style={{ fontSize: '0.85rem', margin: '0.25rem 0', padding: '0.25rem', borderLeft: '2px solid var(--border)' }}>
                              <strong>{a.addressType}:</strong> {a.line1}, {a.line2 ? `${a.line2}, ` : ''}{a.city}, {a.state} - {a.postalCode}
                            </p>
                          ))
                        )}
                      </div>
                    </div>

                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Orders history</h4>
                    {selectedCustomer.orders.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No transaction logs.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {selectedCustomer.orders.map(o => (
                          <div key={o.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span><strong>Order #{o.id}</strong> ({new Date(o.createdAt).toLocaleDateString()})</span>
                              <span className={`order-status-badge ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {o.items.map((item, idx) => (
                                <div key={idx}>{item.productName} ({item.weightGrams}g) × {item.quantity} - ₹{Math.round(item.unitPrice)}</div>
                              ))}
                            </div>
                            {o.notes && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', background: '#f8fafc', padding: '4px' }}>📝 Notes: {o.notes}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DISCOUNTS (COUPONS) */}
          {activeTab === 'coupons' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3>Generate Shop Coupon</h3>
                <form onSubmit={handleCouponSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <label className="form-label">Coupon Code</label>
                    <input type="text" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="form-input" placeholder="e.g. HARVEST20" required />
                  </div>
                  <div>
                    <label className="form-label">Discount Type</label>
                    <select value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} className="form-input">
                      <option value="Percentage">Percentage Discount (%)</option>
                      <option value="Flat">Flat Rate Discount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Discount Value</label>
                    <input type="number" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: parseFloat(e.target.value) || 0 })} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Expiry Date</label>
                    <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm({ ...couponForm, expiryDate: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Usage Limit count</label>
                    <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({ ...couponForm, usageLimit: parseInt(e.target.value) || 100 })} className="form-input" />
                  </div>
                  <button type="submit" className="action-btn" style={{ marginTop: '0.5rem' }}>Save Coupon</button>
                </form>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                <h3>Active Store Coupons</h3>
                <table className="data-table" style={{ fontSize: '0.85rem', marginTop: '1.25rem' }}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Discount</th>
                      <th>Expiry</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No coupons generated.</td>
                      </tr>
                    ) : (
                      coupons.map(c => (
                        <tr key={c.id}>
                          <td><code>{c.code}</code></td>
                          <td>{c.discountType === 'Percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}</td>
                          <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                          <td>
                            <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDeleteCoupon(c.id)}>Remove</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '700px', background: '#fff', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3>Configure Tenant Store settings</h3>
              <form onSubmit={handleSaveStoreSettings} style={{ display: 'grid', gap: '1.25rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Store Public Name</label>
                    <input type="text" value={storeSettings.storeName} onChange={e => setStoreSettings({ ...storeSettings, storeName: e.target.value })} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Shop Status</label>
                    <select value={storeSettings.storeStatus} onChange={e => setStoreSettings({ ...storeSettings, storeStatus: e.target.value })} className="form-input">
                      <option value="Open">Active (Open to Orders)</option>
                      <option value="Closed">Inactive (Maintenance mode)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Support Email ID</label>
                    <input type="email" value={storeSettings.supportEmail} onChange={e => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Support Phone</label>
                    <input type="text" value={storeSettings.contactPhone} onChange={e => setStoreSettings({ ...storeSettings, contactPhone: e.target.value })} className="form-input" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Currency</label>
                    <select value={storeSettings.currency} onChange={e => setStoreSettings({ ...storeSettings, currency: e.target.value })} className="form-input" style={{ fontSize: '0.8rem' }}>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Timezone</label>
                    <input type="text" value={storeSettings.timezone} onChange={e => setStoreSettings({ ...storeSettings, timezone: e.target.value })} className="form-input" style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Invoice Prefix</label>
                    <input type="text" value={storeSettings.invoicePrefix} onChange={e => setStoreSettings({ ...storeSettings, invoicePrefix: e.target.value })} className="form-input" style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>GSTIN / Tax ID</label>
                    <input type="text" value={storeSettings.taxId} onChange={e => setStoreSettings({ ...storeSettings, taxId: e.target.value })} className="form-input" style={{ fontSize: '0.8rem' }} />
                  </div>
                </div>

                {/* Logo & Banner select */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Store Brand Logo</label>
                    <input type="file" onChange={handleStoreLogoFile} className="form-input" style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Hero Showcase Banner</label>
                    <input type="file" onChange={handleStoreBannerFile} className="form-input" style={{ fontSize: '0.8rem' }} />
                  </div>
                </div>

                <button type="submit" className="action-btn" style={{ justifySelf: 'start' }}>Save Configurations</button>
              </form>
            </div>
          )}

          {/* TAB: ONLINE STORE CUSTOMIZER */}
          {activeTab === 'online-store' && (
            <div>
              <h2>🌐 Online Store Customizer</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Configure storefront branding, customize layout sections, and publish pages or blog updates.</p>

              {/* Subtab selection headers */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                {['themes', 'customizer', 'pages', 'navigation', 'blog', 'media'].map(tab => (
                  <span
                    key={tab}
                    onClick={() => setOnlineTab(tab)}
                    style={{
                      cursor: 'pointer',
                      fontWeight: onlineTab === tab ? 'bold' : 'normal',
                      color: onlineTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: onlineTab === tab ? '2px solid var(--primary)' : 'none',
                      paddingBottom: '0.25rem',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              {/* SUBTAB 1: THEME SELECTION */}
              {onlineTab === 'themes' && (
                <div>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Published Theme</span>
                    <h3 style={{ margin: '0.25rem 0', color: 'var(--primary)' }}>🎨 Theme: {activeTheme.name}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Branding Primary: <strong>{activeTheme.settings?.primaryColor}</strong> | Font Family: <strong>{activeTheme.settings?.typography}</strong></p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="action-btn" onClick={() => window.open(`#/store/${storeSlug}`, '_blank')}>View Live Storefront</button>
                      <button className="secondary-btn" style={{ padding: '0.5rem 1rem' }} onClick={() => handleResetTheme(activeTheme.themeKey)}>Reset defaults</button>
                      <button className="secondary-btn" style={{ padding: '0.5rem 1rem' }} onClick={() => handleDuplicateTheme(activeTheme.themeKey)}>Duplicate settings</button>
                    </div>
                  </div>

                  <h4 style={{ marginBottom: '1rem' }}>Select Store Starter Templates</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {(() => {
                      const CATEGORY_MAP = {
                        fashion: 'Fashion',
                        beauty: 'Beauty',
                        electronics: 'Electronics',
                        grocery: 'Grocery',
                        'home-living': 'Home & Living',
                        sports: 'Sports',
                        automotive: 'Automotive'
                      };
                      const THEME_CATEGORIES = {
                        'ajio-inspired': 'Fashion',
                        'zara-inspired': 'Fashion',
                        'streetwear-inspired': 'Fashion',
                        'boutique-inspired': 'Fashion',
                        'nykaa-inspired': 'Beauty',
                        'sephora-inspired': 'Beauty',
                        'skincare-inspired': 'Beauty',
                        'luxury-beauty-inspired': 'Beauty',
                        'makeup-inspired': 'Beauty',
                        'apple-inspired': 'Electronics',
                        'samsung-inspired': 'Electronics',
                        'amazon-tech-inspired': 'Electronics',
                        'gaming-inspired': 'Electronics',
                        'gadgets-inspired': 'Electronics',
                        'blinkit-inspired': 'Grocery',
                        'bigbasket-inspired': 'Grocery',
                        'organic-themed': 'Grocery',
                        'supermarket-inspired': 'Grocery',
                        'daily-essentials-inspired': 'Grocery',
                        'ikea-inspired': 'Home & Living',
                        'modern-inspired': 'Home & Living',
                        'luxury-inspired': 'Home & Living',
                        'wooden-inspired': 'Home & Living',
                        'decor-inspired': 'Home & Living',
                        'nike-performance-inspired': 'Sports',
                        'nike-inspired': 'Sports',
                        'adidas-inspired': 'Sports',
                        'gym-inspired': 'Sports',
                        'outdoor-inspired': 'Sports',
                        'equipment-inspired': 'Sports',
                        'spare-parts-inspired': 'Automotive',
                        'bike-inspired': 'Automotive',
                        'accessories-inspired': 'Automotive',
                        'luxury-auto-inspired': 'Automotive',
                        'garage-inspired': 'Automotive'
                      };
                      const userCategory = profile.businessType ? CATEGORY_MAP[profile.businessType.toLowerCase()] : null;
                      const filtered = userCategory 
                        ? starterThemes.filter(t => THEME_CATEGORIES[t.themeKey] === userCategory)
                        : starterThemes;
                      return filtered.map(theme => (
                        <div key={theme.themeKey} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                          <h4 style={{ margin: 0 }}>{theme.name} Theme Template</h4>
                          <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0', flexWrap: 'wrap' }}>
                            <span style={{ background: theme.settings?.primaryColor, width: '16px', height: '16px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{theme.settings?.typography} font</span>
                          </div>
                          <button className="action-btn" style={{ width: '100%', padding: '0.5rem' }} onClick={() => handleSelectTheme(theme.themeKey)}>Select & Publish</button>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: BRAND CUSTOMIZER & HOMEPAGE SECTIONS */}
              {onlineTab === 'customizer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Left Column: Branding Customizer settings */}
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Branding Styles</h3>
                    <div style={{ display: 'grid', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div>
                        <label className="form-label">Primary Color</label>
                        <input
                          type="color"
                          value={activeTheme.settings?.primaryColor || '#10b981'}
                          onChange={e => setActiveTheme({
                            ...activeTheme,
                            settings: { ...activeTheme.settings, primaryColor: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Secondary Color</label>
                        <input
                          type="color"
                          value={activeTheme.settings?.secondaryColor || '#1e293b'}
                          onChange={e => setActiveTheme({
                            ...activeTheme,
                            settings: { ...activeTheme.settings, secondaryColor: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <label className="form-label">Typography Style</label>
                        <select
                          className="form-input"
                          value={activeTheme.settings?.typography || 'Inter'}
                          onChange={e => setActiveTheme({
                            ...activeTheme,
                            settings: { ...activeTheme.settings, typography: e.target.value }
                          })}
                        >
                          <option value="Inter">Inter (Sans-Serif Modern)</option>
                          <option value="Roboto">Roboto (Sleek Clean)</option>
                          <option value="Outfit">Outfit (Vibrant Round)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Border Radius</label>
                        <select
                          className="form-input"
                          value={activeTheme.settings?.borderRadius || '8px'}
                          onChange={e => setActiveTheme({
                            ...activeTheme,
                            settings: { ...activeTheme.settings, borderRadius: e.target.value }
                          })}
                        >
                          <option value="4px">4px (Sharp Minimalist)</option>
                          <option value="8px">8px (Standard Rounded)</option>
                          <option value="16px">16px (Extremely Curved)</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Header Announcement Bar Text</label>
                        <input
                          type="text"
                          className="form-input"
                          value={activeTheme.settings?.announcementText || ''}
                          onChange={e => setActiveTheme({
                            ...activeTheme,
                            settings: { ...activeTheme.settings, announcementText: e.target.value }
                          })}
                        />
                      </div>
                      <button className="action-btn" onClick={handlePublishCustomizer}>Publish Customizations</button>
                    </div>
                  </div>

                  {/* Right Column: Homepage Layout Builder */}
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Homepage Builder Layout</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Sort and customize section rendering order.</p>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {activeTheme.sections?.map((section, index) => (
                        <div key={section.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>🧩 {section.type}</strong>
                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                              {/* Reorder actions */}
                              <button
                                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                onClick={() => {
                                  if (index === 0) return;
                                  const list = [...activeTheme.sections];
                                  const temp = list[index];
                                  list[index] = list[index - 1];
                                  list[index - 1] = temp;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                              >
                                ▲
                              </button>
                              <button
                                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                onClick={() => {
                                  if (index === activeTheme.sections.length - 1) return;
                                  const list = [...activeTheme.sections];
                                  const temp = list[index];
                                  list[index] = list[index + 1];
                                  list[index + 1] = temp;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                              >
                                ▼
                              </button>
                              <input
                                type="checkbox"
                                checked={section.isVisible}
                                onChange={e => {
                                  const list = [...activeTheme.sections];
                                  list[index].isVisible = e.target.checked;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                              />
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visible</span>
                            </div>
                          </div>

                          {/* Section configuration options */}
                          {section.type === 'Hero Banner' && (
                            <div style={{ display: 'grid', gap: '0.25rem', fontSize: '0.8rem' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.25rem' }}
                                value={section.title}
                                onChange={e => {
                                  const list = [...activeTheme.sections];
                                  list[index].title = e.target.value;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                                placeholder="Hero Title"
                              />
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.25rem' }}
                                value={section.subtitle}
                                onChange={e => {
                                  const list = [...activeTheme.sections];
                                  list[index].subtitle = e.target.value;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                                placeholder="Hero Subtitle"
                              />
                            </div>
                          )}

                          {section.type === 'Featured Products' && (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
                              <span>Show limit count:</span>
                              <input
                                type="number"
                                className="form-input"
                                style={{ width: '60px', padding: '0.25rem' }}
                                value={section.limit || 4}
                                onChange={e => {
                                  const list = [...activeTheme.sections];
                                  list[index].limit = parseInt(e.target.value) || 4;
                                  setActiveTheme({ ...activeTheme, sections: list });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: CMS PAGES */}
              {onlineTab === 'pages' && (
                <div>
                  {editingPage ? (
                    <form onSubmit={handleSaveCmsPage} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'grid', gap: '1rem' }}>
                      <h3>{editingPage === 'new' ? '📝 Create CMS Page' : '✏️ Edit Page'}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="form-label">Page Title</label>
                          <input type="text" className="form-input" value={pageForm.title} onChange={e => setPageForm({ ...pageForm, title: e.target.value })} required />
                        </div>
                        <div>
                          <label className="form-label">URL Slug</label>
                          <input type="text" className="form-input" value={pageForm.slug} onChange={e => setPageForm({ ...pageForm, slug: e.target.value })} required />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">HTML Content Body</label>
                        <textarea rows="6" className="form-input" value={pageForm.content} onChange={e => setPageForm({ ...pageForm, content: e.target.value })} required />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={pageForm.isPublished} onChange={e => setPageForm({ ...pageForm, isPublished: e.target.checked })} />
                        <span>Publish page live on store site</span>
                      </div>
                      <h4 style={{ margin: '0.5rem 0 0 0' }}>SEO Settings</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="form-label">SEO Meta Title</label>
                          <input type="text" className="form-input" value={pageForm.seoTitle} onChange={e => setPageForm({ ...pageForm, seoTitle: e.target.value })} />
                        </div>
                        <div>
                          <label className="form-label">SEO Meta Description</label>
                          <input type="text" className="form-input" value={pageForm.seoDescription} onChange={e => setPageForm({ ...pageForm, seoDescription: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="action-btn">Save Page</button>
                        <button type="button" className="secondary-btn" onClick={() => setEditingPage(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4>Active CMS Pages</h4>
                        <button className="action-btn" onClick={() => handleEditPageClick(null)}>Create Custom Page</button>
                      </div>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Page Title</th>
                            <th>Slug Path</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cmsPages.map(page => (
                            <tr key={page.id}>
                              <td>{page.title}</td>
                              <td><code>/page/{page.slug}</code></td>
                              <td>
                                <span style={{ background: page.isPublished ? '#dcfce7' : '#f1f5f9', color: page.isPublished ? '#15803d' : '#475569', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                  {page.isPublished ? 'Live' : 'Draft'}
                                </span>
                              </td>
                              <td>{new Date(page.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button className="secondary-btn" style={{ marginRight: '0.5rem', padding: '0.2rem 0.5rem' }} onClick={() => handleEditPageClick(page)}>Edit</button>
                                <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem', color: '#dc2626' }} onClick={() => handleDeletePage(page.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                          {cmsPages.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No custom pages created yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: NAVIGATION BUILDER */}
              {onlineTab === 'navigation' && (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button className={editingMenuKey === 'header' ? 'action-btn' : 'secondary-btn'} onClick={() => setEditingMenuKey('header')}>Header Menu Links</button>
                    <button className={editingMenuKey === 'footer' ? 'action-btn' : 'secondary-btn'} onClick={() => setEditingMenuKey('footer')}>Footer Links Column</button>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Manage Links for: {editingMenuKey.toUpperCase()}</h3>
                    
                    {/* Add Item form */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Link Title</label>
                        <input type="text" className="form-input" style={{ width: '180px' }} value={newItemForm.title} onChange={e => setNewItemForm({ ...newItemForm, title: e.target.value })} placeholder="e.g. Products" />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Destination URL</label>
                        <input type="text" className="form-input" style={{ width: '220px' }} value={newItemForm.url} onChange={e => setNewItemForm({ ...newItemForm, url: e.target.value })} placeholder="e.g. /products or /page/about" />
                      </div>
                      <button
                        className="action-btn"
                        type="button"
                        onClick={() => {
                          if (!newItemForm.title || !newItemForm.url) return;
                          setMenuItems([...menuItems, { title: newItemForm.title, url: newItemForm.url }]);
                          setNewItemForm({ title: '', url: '' });
                        }}
                      >
                        Add Link
                      </button>
                    </div>

                    {/* Current Links list */}
                    <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {menuItems.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                          <div>
                            <strong>{item.title}</strong>
                            <code style={{ marginLeft: '1rem', color: 'var(--primary)' }}>{item.url}</code>
                          </div>
                          <button
                            className="secondary-btn"
                            type="button"
                            style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}
                            onClick={() => setMenuItems(menuItems.filter((_, idx) => idx !== index))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button className="action-btn" onClick={handleSaveMenu}>Save Navigation Menu</button>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: BLOG MANAGER */}
              {onlineTab === 'blog' && (
                <div>
                  {editingBlogPost ? (
                    <form onSubmit={handleSaveBlogPost} style={{ background: '#fff', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'grid', gap: '1rem' }}>
                      <h3>{editingBlogPost === 'new' ? '✍️ Write Blog Article' : '✏️ Edit Article'}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="form-label">Article Title</label>
                          <input type="text" className="form-input" value={blogPostForm.title} onChange={e => setBlogPostForm({ ...blogPostForm, title: e.target.value })} required />
                        </div>
                        <div>
                          <label className="form-label">URL Slug</label>
                          <input type="text" className="form-input" value={blogPostForm.slug} onChange={e => setBlogPostForm({ ...blogPostForm, slug: e.target.value })} required />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label className="form-label">Blog Category</label>
                          <input type="text" className="form-input" value={blogPostForm.category} onChange={e => setBlogPostForm({ ...blogPostForm, category: e.target.value })} />
                        </div>
                        <div>
                          <label className="form-label">Featured Image URL</label>
                          <input type="text" className="form-input" value={blogPostForm.featuredImageUrl} onChange={e => setBlogPostForm({ ...blogPostForm, featuredImageUrl: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Content Body (HTML or Plain Text)</label>
                        <textarea rows="6" className="form-input" value={blogPostForm.content} onChange={e => setBlogPostForm({ ...blogPostForm, content: e.target.value })} required />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="checkbox" checked={blogPostForm.isPublished} onChange={e => setBlogPostForm({ ...blogPostForm, isPublished: e.target.checked })} />
                        <span>Publish blog article live</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="action-btn">Publish Post</button>
                        <button type="button" className="secondary-btn" onClick={() => setEditingBlogPost(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4>Published Blog Posts</h4>
                        <button className="action-btn" onClick={() => handleEditBlogPostClick(null)}>Write Article</button>
                      </div>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Blog Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogPosts.map(post => (
                            <tr key={post.id}>
                              <td>{post.title}</td>
                              <td>{post.category}</td>
                              <td>
                                <span style={{ background: post.isPublished ? '#dcfce7' : '#f1f5f9', color: post.isPublished ? '#15803d' : '#475569', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                                  {post.isPublished ? 'Live' : 'Draft'}
                                </span>
                              </td>
                              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                              <td>
                                <button className="secondary-btn" style={{ marginRight: '0.5rem', padding: '0.2rem 0.5rem' }} onClick={() => handleEditBlogPostClick(post)}>Edit</button>
                                <button className="secondary-btn" style={{ padding: '0.2rem 0.5rem', color: '#dc2626' }} onClick={() => handleDeleteBlogPost(post.id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                          {blogPosts.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No blog posts written yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 6: MEDIA LIBRARY */}
              {onlineTab === 'media' && (
                <div>
                  <form onSubmit={handleUploadMedia} style={{ background: '#f8fafc', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Image Asset URL</label>
                      <input type="text" className="form-input" style={{ width: '280px' }} value={mediaUploadUrl} onChange={e => setMediaUploadUrl(e.target.value)} placeholder="e.g. /assets/groceesary/1.png" required />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Display Name</label>
                      <input type="text" className="form-input" style={{ width: '180px' }} value={mediaUploadName} onChange={e => setMediaUploadName(e.target.value)} placeholder="e.g. Banner 1 Image" />
                    </div>
                    <button type="submit" className="action-btn">Add Image</button>
                  </form>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {mediaAssets.map(asset => (
                      <div key={asset.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                        <img src={asset.fileUrl} alt={asset.fileName} style={{ width: '100%', height: '100px', objectFit: 'contain', background: '#f8fafc', marginBottom: '0.75rem' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.fileName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>Size: {(asset.fileSize / 1024).toFixed(1)} KB</span>
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: 'auto' }}>
                          <button
                            className="secondary-btn"
                            type="button"
                            style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              navigator.clipboard.writeText(asset.fileUrl);
                              alert('Copied URL to clipboard!');
                            }}
                          >
                            Copy URL
                          </button>
                          <button
                            className="secondary-btn"
                            type="button"
                            style={{ padding: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}
                            onClick={() => handleDeleteMedia(asset.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {mediaAssets.length === 0 && (
                      <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>No media assets uploaded yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <h2>Store Ledger Reports Metrics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DAILY REVENUE</span>
                  <h3 style={{ color: 'var(--primary-light)', marginTop: '0.25rem' }}>₹{Math.round(stats.totalRevenue * 0.05)}</h3>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WEEKLY TOTAL SALES</span>
                  <h3 style={{ color: 'var(--accent)', marginTop: '0.25rem' }}>₹{Math.round(stats.totalRevenue * 0.25)}</h3>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MONTHLY ACCRUED SALES</span>
                  <h3 style={{ color: 'var(--success)', marginTop: '0.25rem' }}>₹{Math.round(stats.totalRevenue)}</h3>
                </div>
              </div>

              {/* Placeholder graphs details */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4>📊 Visual Inventory Category breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {stats.categorySales.map((c, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span>{c.category}</span>
                        <span>₹{Math.round(c.revenue)}</span>
                      </div>
                      <div style={{ background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary)', height: '100%', width: `${Math.min((c.revenue / (stats.totalRevenue || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <h2>Dashboard Notifications & Alarms</h2>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No unread alarms or low stock notices.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                      <span>⚠️</span>
                      <div>
                        <strong>{n.message}</strong>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{new Date(n.date).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* TAB 11: OWNER PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3>Update Personal Details</h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label">First Name</label>
                      <input type="text" value={profile.firstName || ''} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <input type="text" value={profile.lastName || ''} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className="form-input" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input type="text" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Business Address</label>
                    <textarea value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} className="form-input" style={{ minHeight: '60px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label className="form-label">City</label>
                      <input type="text" value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} className="form-input" />
                    </div>
                    <div>
                      <label className="form-label">Postal Code</label>
                      <input type="text" value={profile.postalCode || ''} onChange={e => setProfile({ ...profile, postalCode: e.target.value })} className="form-input" />
                    </div>
                  </div>
                  <button type="submit" className="action-btn">Save profile details</button>
                </form>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3>Change Password</h3>
                <form onSubmit={handleChangePasswordSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <label className="form-label">Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="form-input" required />
                  </div>
                  <button type="submit" className="action-btn">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 12: BILLING */}
          {activeTab === 'billing' && (
            <BillingDashboard impersonateStoreId={impersonateStoreId} impersonateTenantId={impersonateTenantId} />
          )}

          {/* TAB 13: CHAT WITH ADMIN */}
          {activeTab === 'chat' && (
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Chat with Admin</h3>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Send a message to the platform administrator</span>
                </div>
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                  {sellerChatLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Loading messages...</div>
                  ) : sellerChatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>💬</span>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No messages yet. Send a message to the admin!</p>
                    </div>
                  ) : (
                    sellerChatMessages.map(m => {
                      const isAdmin = m.senderRole === 'Admin';
                      return (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isAdmin ? 'flex-start' : 'flex-end', maxWidth: '75%' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                            {isAdmin ? 'Admin' : 'You'} • {new Date(m.createdAt).toLocaleTimeString()}
                          </span>
                          <div style={{
                            background: isAdmin ? '#e2e8f0' : 'var(--primary)',
                            color: isAdmin ? 'var(--text-dark)' : 'white',
                            padding: '0.75rem 1rem',
                            borderRadius: isAdmin ? '0px 12px 12px 12px' : '12px 0px 12px 12px',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.9rem',
                            wordBreak: 'break-word'
                          }}>
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleSendSellerChatMessage} style={{ borderTop: '1px solid var(--border)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#ffffff' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Type your message..."
                    value={newSellerChatMessage}
                    onChange={e => setNewSellerChatMessage(e.target.value)}
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button type="submit" className="action-btn" style={{ padding: '0.5rem 1.25rem' }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 14: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div style={{ display: 'grid', gap: '2rem' }}>

              {/* Payment Settings Card */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>🔌 Payment Gateway Integrations</h3>

                <form onSubmit={handleSavePayments} style={{ display: 'grid', gap: '2rem' }}>
                  {/* Toggles */}
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-dark)' }}>Enabled Gateways</h4>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                      {paymentsData.methods.map((m, idx) => (
                        <label key={m.MethodName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={m.IsEnabled}
                            onChange={e => {
                              const newMethods = [...paymentsData.methods];
                              newMethods[idx].IsEnabled = e.target.checked;
                              setPaymentsData({ ...paymentsData, methods: newMethods });
                            }}
                          />
                          <strong>{m.MethodName}</strong>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gateway Credentials */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {paymentsData.credentials.map((c, idx) => (
                      <div key={c.GatewayName} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', background: '#f8fafc' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>{c.GatewayName} Configuration</h4>

                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          <div>
                            <label className="form-label">{c.GatewayName === 'Stripe' ? 'Publishable Key / API Key' : 'Key ID'}</label>
                            <input
                              type="text"
                              value={c.ApiKey || ''}
                              onChange={e => {
                                const newCreds = [...paymentsData.credentials];
                                newCreds[idx].ApiKey = e.target.value;
                                setPaymentsData({ ...paymentsData, credentials: newCreds });
                              }}
                              className="form-input"
                              placeholder={c.GatewayName === 'Stripe' ? 'pk_test_...' : 'rzp_test_...'}
                            />
                          </div>

                          <div>
                            <label className="form-label">{c.GatewayName === 'Stripe' ? 'Secret Key' : 'Key Secret'}</label>
                            <input
                              type="password"
                              value={c.ApiSecret || ''}
                              onChange={e => {
                                const newCreds = [...paymentsData.credentials];
                                newCreds[idx].ApiSecret = e.target.value;
                                setPaymentsData({ ...paymentsData, credentials: newCreds });
                              }}
                              className="form-input"
                              placeholder="••••••••••••••••"
                            />
                          </div>

                          <div>
                            <label className="form-label">Webhook Secret / Signature Key</label>
                            <input
                              type="password"
                              value={c.WebhookSecret || ''}
                              onChange={e => {
                                const newCreds = [...paymentsData.credentials];
                                newCreds[idx].WebhookSecret = e.target.value;
                                setPaymentsData({ ...paymentsData, credentials: newCreds });
                              }}
                              className="form-input"
                              placeholder="whsec_..."
                            />
                          </div>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={c.IsTestMode}
                              onChange={e => {
                                const newCreds = [...paymentsData.credentials];
                                newCreds[idx].IsTestMode = e.target.checked;
                                setPaymentsData({ ...paymentsData, credentials: newCreds });
                              }}
                            />
                            <span style={{ fontSize: '0.85rem' }}>Sandbox Test Mode</span>
                          </label>

                          <div style={{ marginTop: '1rem' }}>
                            <button
                              type="button"
                              className="secondary-btn"
                              style={{ width: '100%', padding: '0.4rem' }}
                              onClick={() => handleTestPayment(c.GatewayName)}
                            >
                              Test Connection
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <button type="submit" className="action-btn">Save Payment Settings</button>
                  </div>
                </form>
              </div>

              {/* Shipping Settings Card */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>🚚 Shipping Provider Settings</h3>

                <form onSubmit={handleSaveShipping} style={{ display: 'grid', gap: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {shippingData.map((s, idx) => (
                      <div key={s.ProviderName} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                          <h4 style={{ color: 'var(--primary)', margin: 0 }}>{s.ProviderName} Shipping</h4>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input
                              type="checkbox"
                              checked={s.IsEnabled}
                              onChange={e => {
                                const newShips = [...shippingData];
                                newShips[idx].IsEnabled = e.target.checked;
                                setShippingData(newShips);
                              }}
                            />
                            <strong>Enable</strong>
                          </label>
                        </div>

                        {s.ProviderName !== 'Manual' ? (
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div>
                              <label className="form-label">API Key / Client ID</label>
                              <input
                                type="text"
                                value={s.ApiKey || ''}
                                onChange={e => {
                                  const newShips = [...shippingData];
                                  newShips[idx].ApiKey = e.target.value;
                                  setShippingData(newShips);
                                }}
                                className="form-input"
                              />
                            </div>

                            <div>
                              <label className="form-label">API Secret / Access Token</label>
                              <input
                                type="password"
                                value={s.ApiSecret || ''}
                                onChange={e => {
                                  const newShips = [...shippingData];
                                  newShips[idx].ApiSecret = e.target.value;
                                  setShippingData(newShips);
                                }}
                                className="form-input"
                              />
                            </div>
                          </div>
                        ) : (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Manual flat-rate calculations are applied instantly at checkout based on weight thresholds.</p>
                        )}

                        <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                          <div>
                            <label className="form-label">Warehouse Dispatch Address</label>
                            <input
                              type="text"
                              value={s.WarehouseAddress || ''}
                              onChange={e => {
                                const newShips = [...shippingData];
                                newShips[idx].WarehouseAddress = e.target.value;
                                setShippingData(newShips);
                              }}
                              className="form-input"
                              placeholder="Street, City, Pin Code"
                            />
                          </div>

                          <div>
                            <label className="form-label">Packaging Preferences</label>
                            <input
                              type="text"
                              value={s.PackagingPreferences || ''}
                              onChange={e => {
                                const newShips = [...shippingData];
                                newShips[idx].PackagingPreferences = e.target.value;
                                setShippingData(newShips);
                              }}
                              className="form-input"
                              placeholder="Boxes, Bubble wrap"
                            />
                          </div>

                          {s.ProviderName !== 'Manual' && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <button
                                type="button"
                                className="secondary-btn"
                                style={{ width: '100%', padding: '0.4rem' }}
                                onClick={() => handleTestShipping(s.ProviderName)}
                              >
                                Test API Connection
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <button type="submit" className="action-btn">Save Shipping Settings</button>
                  </div>
                </form>
              </div>

              {/* Webhook Logs Card */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>📋 Webhook Delivery Logs</h3>
                {webhookLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No webhook events received yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '0.75rem' }}>Gateway</th>
                          <th style={{ padding: '0.75rem' }}>Event ID</th>
                          <th style={{ padding: '0.75rem' }}>Event Type</th>
                          <th style={{ padding: '0.75rem' }}>Timestamp</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {webhookLogs.map(l => (
                          <tr key={l.eventId} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem' }}><strong>{l.gatewayName}</strong></td>
                            <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l.eventId}</td>
                            <td style={{ padding: '0.75rem' }}><code style={{ background: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>{l.eventType}</code></td>
                            <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{new Date(l.createdAt).toLocaleString()}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                background: l.processingStatus === 'Success' ? '#dcfce7' : '#fee2e2',
                                color: l.processingStatus === 'Success' ? '#15803d' : '#b91c1c'
                              }}>
                                {l.processingStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default SellerDashboardPage;
