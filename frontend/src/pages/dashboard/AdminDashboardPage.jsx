import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import api from '../../services/api';
import adminService from '../../services/adminService';
import subscriptionService from '../../services/subscriptionService';
import { buildProductMockupDataUrl, getCategoryFallbackImage, getProductImageSrc, getCategorySpecificDescription } from '../../features/catalog/productHelpers';
import useToast from '../../hooks/useToast';
import DashboardLayout from '../../layouts/DashboardLayout';
import ExecutiveDashboard from './admin/ExecutiveDashboard';
import StoresManagement from './admin/StoresManagement';
import SupportCenter from './admin/SupportCenter';
import AnnouncementsPanel from './admin/AnnouncementsPanel';
import PlatformSettingsPanel from './admin/PlatformSettingsPanel';
import AuditLogViewer from './admin/AuditLogViewer';
import SystemHealthPanel from './admin/SystemHealthPanel';
import ReportsPanel from './admin/ReportsPanel';

const loadCDNLibrary = (url, globalName) => {
  return new Promise((resolve, reject) => {
    if (window[globalName]) {
      resolve(window[globalName]);
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve(window[globalName]);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

const AdminDashboardPage = ({ products = [], refreshProducts = () => {}, prefilledProduct, clearPrefilledProduct, mobileSidebarOpen, setMobileSidebarOpen, view }) => {
  const { token, user } = useAuth();
  
  const [adminTab, setAdminTab] = useState('overview');
  useEffect(() => {
    const viewTabMap = {
      'admin/notifications': 'notifications',
      'admin/stores': 'stores',
      'admin/support': 'support',
      'admin/announcements': 'announcements',
      'admin/settings': 'settings',
      'admin/audit-logs': 'audit-logs',
      'admin/system-health': 'system-health',
      'admin/reports': 'reports',
      'admin/billing': 'subscriptions'
    };
    if (viewTabMap[view] && adminTab !== viewTabMap[view]) {
      setAdminTab(viewTabMap[view]);
    }
  }, [view]);
  
  
  const [adminProductSearch, setAdminProductSearch] = useState('');
  
  // Admin Data states
  const [platformStats, setPlatformStats] = useState({
    totalSales: '0.00',
    activeVendors: 0,
    activeCustomers: 0,
    revenue: '0.00',
    fraudAlerts: []
  });
  const [usersList, setUsersList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [storesList, setStoresList] = useState([]);


  const [vendorSearch, setVendorSearch] = useState('');

  // Advanced seller filters & search states
  const [vendorStatusFilter, setVendorStatusFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSellerFilter, setProductSellerFilter] = useState('All');
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [adminAllProducts, setAdminAllProducts] = useState([]);

  // New features states
  const [pendingProductsList, setPendingProductsList] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  const [datasetFile, setDatasetFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [parsedProducts, setParsedProducts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('General');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [bulkBrand, setBulkBrand] = useState('');
  const [bulkCategoryNew, setBulkCategoryNew] = useState('');
  const [bulkSubcategoryNew, setBulkSubcategoryNew] = useState('');
  const [bulkBrandNew, setBulkBrandNew] = useState('');
  const [bulkAddingCategory, setBulkAddingCategory] = useState(false);
  const [bulkAddingSubcategory, setBulkAddingSubcategory] = useState(false);
  const [bulkAddingBrand, setBulkAddingBrand] = useState(false);
  const [bulkSeller, setBulkSeller] = useState('');
  const [sellersList, setSellersList] = useState([]);

  // Derived lists from existing products
  const existingSubcategories = useMemo(() => {
    const subs = new Set();
    adminAllProducts.forEach(p => {
      if (p.bullets && Array.isArray(p.bullets)) {
        p.bullets.forEach(b => {
          const m = typeof b === 'string' ? b.match(/^Subcategory:\s*(.+)/i) : null;
          if (m) subs.add(m[1].trim());
        });
      }
    });
    return [...subs].sort();
  }, [adminAllProducts]);

  const existingBrands = useMemo(() => {
    const brands = new Set();
    adminAllProducts.forEach(p => {
      if (p.bullets && Array.isArray(p.bullets)) {
        p.bullets.forEach(b => {
          const m = typeof b === 'string' ? b.match(/^Brand:\s*(.+)/i) : null;
          if (m) brands.add(m[1].trim());
        });
      }
    });
    return [...brands].sort();
  }, [adminAllProducts]);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [loadingLibraries, setLoadingLibraries] = useState(false);

  // Subscription tab states
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [subscriptionSort, setSubscriptionSort] = useState('expiry');
  const [expiryCheckResult, setExpiryCheckResult] = useState(null);

  // Admin Chat / Onboarding review states
  const [chatTarget, setChatTarget] = useState(null); // { sellerId, productId, type: 'seller' | 'product', name: string, vendorObj, productObj }
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminChatMessages, setAdminChatMessages] = useState([]);
  const [newAdminChatMessage, setNewAdminChatMessage] = useState('');
  const [adminChatAttachment, setAdminChatAttachment] = useState('');
  const [adminChatLoading, setAdminChatLoading] = useState(false);

  // Forms
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Grains',
    description: '',
    storageInstructions: '',
    imageUrl: '',
    imagePrompt: '',
    bullets: [],
    vendorId: '',
    variants: [{ weightGrams: 500, price: 150, stock: 100, sku: '' }]
  });

  const [editProduct, setEditProduct] = useState(null);

  const loadAdminData = async () => {
    if (!token) return;
    try {
      if (adminTab === 'overview') {
        const stats = await adminService.getAnalytics();
        setPlatformStats(stats);
        const vendors = await adminService.getVendors();
        setVendorsList(vendors);
      } else if (adminTab === 'users') {
        const users = await adminService.getUsers();
        setUsersList(users);
        const stores = await adminService.getStores();
        setStoresList(Array.isArray(stores) ? stores : []);
      } else if (adminTab === 'vendors' || adminTab === 'seller-chat') {
        const vendors = await adminService.getVendors();
        setVendorsList(vendors);
      } else if (adminTab === 'bulk-upload') {
        const allProds = await api.get('/products?category=All');
        setAdminAllProducts(allProds);
        const sellers = await adminService.getApprovedSellers();
        setSellersList(sellers);
      } else if (adminTab === 'products' || adminTab === 'add-product' || adminTab === 'edit-product') {
        const sellers = await adminService.getApprovedSellers();
        setApprovedSellers(sellers);
        const allProds = await api.get('/products?category=All');
        setAdminAllProducts(allProds);
      } else if (adminTab === 'notifications') {
        const data = await adminService.getAdminNotifications();
        setNotificationsList(data);
      } else if (adminTab === 'subscriptions') {
        const plansRes = await api.get('/admin/subscription/plans');
        if (plansRes) setAdminAllProducts(Array.isArray(plansRes) ? plansRes : []);
        const subsRes = await api.get('/admin/subscription/subscriptions');
        if (subsRes) setVendorsList(Array.isArray(subsRes) ? subsRes : []);
        const statsRes = await api.get('/admin/subscription/subscriptions/stats');
        if (statsRes) setPlatformStats({ ...platformStats, ...statsRes });
        const trialsRes = await api.get('/admin/subscription/subscriptions/trials');
        if (trialsRes) setPendingProductsList(Array.isArray(trialsRes) ? trialsRes : []);
        const expiryRes = await api.post('/admin/subscription/subscriptions/check-expiry');
        if (expiryRes) setExpiryCheckResult(expiryRes);
      }
    } catch (err) {
      console.error('Error loading admin page tab data:', err);
    }
  };

  const loadAdminChat = async (target) => {
    if (!target) return;
    setAdminChatLoading(true);
    try {
      let url = `/discussions?sellerId=${target.sellerId}`;
      if (target.productId) {
        url += `&productId=${target.productId}`;
      }
      const res = await api.get(url);
      setAdminChatMessages(res);
    } catch (err) {
      console.error('Error fetching admin chats:', err);
    } finally {
      setAdminChatLoading(false);
    }
  };

  const handleSendAdminChatMessage = async (e) => {
    e.preventDefault();
    if (!newAdminChatMessage.trim() && !adminChatAttachment) return;
    try {
      await api.post('/discussions', {
        sellerId: chatTarget.sellerId,
        productId: chatTarget.productId || null,
        message: newAdminChatMessage,
        attachmentUrl: adminChatAttachment
      });
      setNewAdminChatMessage('');
      setAdminChatAttachment('');
      loadAdminChat(chatTarget);
    } catch (err) {
      showToast('Failed to send message.', 'error');
    }
  };

  const handleAdminChatAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminChatAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverrideUserStatus = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      showToast(`User status overridden to ${status}!`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to override status.', 'error');
    }
  };

  const handleResetUserPassword = async (userId) => {
    const newPassword = prompt('Enter new password for this user:');
    if (!newPassword) return;
    try {
      await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
      showToast('User credentials reset successfully!', 'success');
    } catch (err) {
      showToast('Failed to reset credentials.', 'error');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [adminTab, token]);

  useEffect(() => {
    if (chatTarget) {
      loadAdminChat(chatTarget);
    }
  }, [chatTarget]);

  useEffect(() => {
    if (prefilledProduct) {
      setNewProduct(prev => ({
        ...prev,
        name: prefilledProduct.name || '',
        category: prefilledProduct.category || 'Grains',
        description: prefilledProduct.description || '',
        storageInstructions: prefilledProduct.storageInstructions || '',
        imageUrl: prefilledProduct.imageUrl || '',
        imagePrompt: prefilledProduct.imagePrompt || '',
        bullets: prefilledProduct.bullets || [],
        vendorId: prefilledProduct.vendorId || ''
      }));
      setAdminTab('add-product');
      clearPrefilledProduct();
    }
  }, [prefilledProduct]);

  // Product actions
  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Product deleted successfully.', 'success');
      refreshProducts();
      loadAdminData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  const handleEditProductClick = (product) => {
    setEditProduct(JSON.parse(JSON.stringify(product)));
    setAdminTab('edit-product');
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const productData = { ...newProduct };
    if (!productData.imageUrl) {
      productData.imageUrl = buildProductMockupDataUrl(productData.name || 'SnapShop Product', productData.category);
    }
    try {
      await api.post('/admin/products', productData);
      showToast('Product added successfully!', 'success');
      setNewProduct({
        name: '',
        category: 'Grains',
        description: '',
        storageInstructions: '',
        imageUrl: '',
        imagePrompt: '',
        bullets: [],
        vendorId: '',
        variants: [{ weightGrams: 500, price: 150, stock: 100, sku: '' }]
      });
      refreshProducts();
      setAdminTab('products');
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.error || 'Server error'}`, 'error');
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    const productData = { ...editProduct };
    if (!productData.imageUrl) {
      productData.imageUrl = buildProductMockupDataUrl(productData.name || 'SnapShop Product', productData.category);
    }
    try {
      await api.put(`/admin/products/${productData.id}`, productData);
      showToast('Product updated successfully!', 'success');
      setEditProduct(null);
      refreshProducts();
      setAdminTab('products');
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.error || 'Server error'}`, 'error');
    }
  };

  // Vendor actions
  const handleApproveVendor = async (id) => {
    try {
      await adminService.approveVendor(id);
      showToast('Seller account approved!', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to approve vendor.', 'error');
    }
  };

  const handleRejectVendor = async (id) => {
    try {
      await adminService.rejectVendor(id);
      showToast('Seller account rejected.', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to reject vendor.', 'error');
    }
  };

  const handleApproveAllPendingVendors = async () => {
    const pendingVendors = vendorsList.filter(v => v.sellerStatus === 'Pending');
    if (pendingVendors.length === 0) {
      showToast('No pending vendors to approve.', 'info');
      return;
    }
    if (!confirm(`Are you sure you want to approve all ${pendingVendors.length} pending sellers?`)) return;
    try {
      await Promise.all(pendingVendors.map(v => adminService.approveVendor(v.id)));
      showToast(`Successfully approved all ${pendingVendors.length} pending sellers!`, 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to approve all pending vendors.', 'error');
    }
  };


  // User actions
  const handleUpdateUserRole = async (id, role) => {
    try {
      await adminService.updateUserRole(id, role);
      showToast('User role updated successfully.', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Failed to update role.', 'error');
    }
  };

  // Image upload helpers
  const handleProductImageFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const generateProductPreviewImage = () => {
    setNewProduct(prev => ({
      ...prev,
      imageUrl: buildProductMockupDataUrl(prev.name || 'SnapShop Product', prev.category)
    }));
  };

  const handleEditProductImageFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditProduct(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const generateEditProductPreviewImage = () => {
    setEditProduct(prev => ({
      ...prev,
      imageUrl: buildProductMockupDataUrl(prev.name || 'SnapShop Product', prev.category)
    }));
  };

  // Variant helper methods
  const handleAddVariantToNewProduct = () => {
    setNewProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { weightGrams: 500, price: 100, stock: 50, sku: '' }]
    }));
  };

  const handleRemoveVariantFromNewProduct = (idx) => {
    if (newProduct.variants.length <= 1) return;
    setNewProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleAddVariantToEdit = () => {
    setEditProduct(prev => ({
      ...prev,
      variants: [...prev.variants, { weightGrams: 500, price: 100, stock: 50, sku: '' }]
    }));
  };

  const handleRemoveVariantFromEdit = (idx) => {
    if (editProduct.variants.length <= 1) return;
    setEditProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  // Bulk Upload logic
  const loadLibraries = async () => {
    if (librariesLoaded) return true;
    setLoadingLibraries(true);
    try {
      await loadCDNLibrary('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', 'XLSX');
      await loadCDNLibrary('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'JSZip');
      setLibrariesLoaded(true);
      return true;
    } catch (err) {
      console.error('Error loading Excel/ZIP libraries:', err);
      showToast('Failed to load import libraries from CDN.', 'error');
      return false;
    } finally {
      setLoadingLibraries(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'bulk-upload') {
      loadLibraries();
    }
  }, [adminTab]);

  const handleParseFiles = async () => {
    if (!datasetFile) {
      showToast('Please select a dataset file (CSV, Excel, JSON, or JS).', 'warning');
      return;
    }

    try {
      const XLSX = window.XLSX;
      const JSZip = window.JSZip;
      if (!XLSX || !JSZip) {
        showToast('Required libraries are not loaded yet.', 'error');
        return;
      }

      // Step 1: Parse zip if exists
      let imagesMap = {};
      if (zipFile) {
        const zipData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(zipFile);
        });
        const zip = await JSZip.loadAsync(zipData);
        for (let filename of Object.keys(zip.files)) {
          const file = zip.files[filename];
          if (!file.dir && /\.(png|jpe?g|webp|gif)$/i.test(filename)) {
            const base64 = await file.async('base64');
            const ext = filename.split('.').pop().toLowerCase();
            const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
            const cleanName = filename.split('/').pop();
            imagesMap[cleanName] = `data:${mime};base64,${base64}`;
          }
        }
      }

      // Step 2: Parse dataset
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (err) => reject(err);
        if (datasetFile.name.endsWith('.json') || datasetFile.name.endsWith('.js')) {
          reader.readAsText(datasetFile);
        } else {
          reader.readAsArrayBuffer(datasetFile);
        }
      });

      let rows = [];
      if (datasetFile.name.endsWith('.json') || datasetFile.name.endsWith('.js')) {
        let content = fileData.trim();
        if (content.includes('[')) {
          const startIndex = content.indexOf('[');
          const endIndex = content.lastIndexOf(']');
          if (startIndex !== -1 && endIndex !== -1) {
            const arrayString = content.substring(startIndex, endIndex + 1);
            try {
              rows = JSON.parse(arrayString);
            } catch (err) {
              try {
                rows = Function(`return ${arrayString}`)();
              } catch (evalErr) {
                throw new Error('Failed to parse JS/JSON array: ' + evalErr.message);
              }
            }
          } else {
            throw new Error('Could not find starting [ and ending ] in file content.');
          }
        } else {
          rows = JSON.parse(content);
        }
      } else {
        const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(worksheet);
      }

      // Ensure rows is an array
      if (!Array.isArray(rows)) {
        rows = [rows];
      }

      // Use user-selected category from UI, row.category takes precedence
      const resolvedCategory = bulkAddingCategory ? (bulkCategoryNew.trim() || bulkCategory) : bulkCategory;
      const resolvedSubcategory = bulkAddingSubcategory ? (bulkSubcategoryNew.trim() || bulkSubcategory) : bulkSubcategory;
      const resolvedBrand = bulkAddingBrand ? (bulkBrandNew.trim() || bulkBrand) : bulkBrand;
      const userCategory = resolvedCategory !== 'General' ? resolvedCategory : null;

      // Step 3: Match and format
      const formatted = rows.map((row) => {
        const imageKey = row.imageName || row.imageUrl || row.image || row.filename || '';
        const base64Image = imagesMap[imageKey] || imagesMap[imageKey.split('/').pop()];
        
        // Construct product name/title robustly
        const name = row.name || row.title || (row.brand && row.model ? (row.brand + ' ' + row.model) : null) || row.model || row.brand || 'Unnamed Import';
        
        const category = row.category && row.category !== 'General' ? row.category : (userCategory || 'General');
        
        // Build bullets
        let bullets = row.bullets ? (Array.isArray(row.bullets) ? row.bullets : String(row.bullets).split(';')) : [];
        if (resolvedSubcategory) {
          const subcatBullet = `Subcategory: ${resolvedSubcategory}`;
          if (!bullets.some(b => b.toLowerCase().startsWith('subcategory:'))) bullets.push(subcatBullet);
        }
        if (resolvedBrand) {
          const brandBullet = `Brand: ${resolvedBrand}`;
          if (!bullets.some(b => b.toLowerCase().startsWith('brand:'))) bullets.push(brandBullet);
        }
        
        return {
          name: name,
          category: category,
          description: row.description || `${name} imported product description.`,
          price: parseFloat(row.price) || 100,
          storageInstructions: row.storageInstructions || 'Store in cool dry place',
          imageUrl: base64Image || row.imageUrl || null,
          bullets: bullets,
          variants: row.variants || []
        };
      });

      setParsedProducts(formatted);
      showToast(`Successfully parsed ${formatted.length} products!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error parsing files: ' + err.message, 'error');
    }
  };

  const handleBulkUploadSubmit = async () => {
    if (parsedProducts.length === 0) {
      showToast('No parsed products to upload.', 'warning');
      return;
    }
    setImporting(true);
    try {
      const res = await adminService.bulkUpload(parsedProducts, bulkSeller);
      showToast(`Bulk upload completed! Imported ${res.importedCount} products.`, 'success');
      setParsedProducts([]);
      setDatasetFile(null);
      setZipFile(null);
      refreshProducts();
      setAdminTab('products');
    } catch (err) {
      console.error('Bulk upload error:', err);
      showToast(`Bulk upload failed: ${err.error || err.message || JSON.stringify(err)}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  const sidebarMenu = (
    <>
      <button className={`admin-tab ${adminTab === 'overview' ? 'active' : ''}`} onClick={() => { setAdminTab('overview'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🏠</span>
        <span className="admin-tab-text">Dashboard</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'notifications' ? 'active' : ''}`} onClick={() => { setAdminTab('notifications'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🔔</span>
        <span className="admin-tab-text">Notifications</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'stores' ? 'active' : ''}`} onClick={() => { setAdminTab('stores'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🏪</span>
        <span className="admin-tab-text">Store Management</span>
      </button>

      
      <button className={`admin-tab ${adminTab === 'users' ? 'active' : ''}`} onClick={() => { setAdminTab('users'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">👥</span>
        <span className="admin-tab-text">Users Directory</span>
      </button>
      
      
      <button className={`admin-tab ${adminTab === 'seller-chat' ? 'active' : ''}`} onClick={() => { setAdminTab('seller-chat'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">💬</span>
        <span className="admin-tab-text">Chat with Seller</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'subscriptions' ? 'active' : ''}`} onClick={() => { setAdminTab('subscriptions'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">💳</span>
        <span className="admin-tab-text">Subscriptions</span>
      </button>

      <div className="admin-sidebar-section-label">SYSTEM CONTROLS</div>
      
      <button className={`admin-tab ${adminTab === 'support' ? 'active' : ''}`} onClick={() => { setAdminTab('support'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">🎫</span>
        <span className="admin-tab-text">Support Center</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'announcements' ? 'active' : ''}`} onClick={() => { setAdminTab('announcements'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📢</span>
        <span className="admin-tab-text">Announcements</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'settings' ? 'active' : ''}`} onClick={() => { setAdminTab('settings'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">⚙️</span>
        <span className="admin-tab-text">Platform Settings</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'audit-logs' ? 'active' : ''}`} onClick={() => { setAdminTab('audit-logs'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📋</span>
        <span className="admin-tab-text">Audit Logs</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'system-health' ? 'active' : ''}`} onClick={() => { setAdminTab('system-health'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">❤️</span>
        <span className="admin-tab-text">System Health</span>
      </button>
      
      <button className={`admin-tab ${adminTab === 'reports' ? 'active' : ''}`} onClick={() => { setAdminTab('reports'); setMobileSidebarOpen(false); }}>
        <span className="admin-tab-icon">📊</span>
        <span className="admin-tab-text">Reports</span>
      </button>
    </>
  );

  return (
    <DashboardLayout
      sidebarTitle="Admin Center"
      sidebarIcon="🛠️"
      sidebarSubtitle="Full platform control"
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
      sidebarMenu={sidebarMenu}
    >
        {/* Overview Tab */}
        {adminTab === 'overview' && (
          <div>
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">Global Platform Analytics</h2>
              </div>
            </div>
            
            {/* Stats grid */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-label">PLATFORM GROSS VOLUME</div>
                <div className="admin-stat-value" style={{ color: 'var(--primary-accent)' }}>₹{Math.round(platformStats.totalSales)}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">ACTIVE VENDORS</div>
                <div className="admin-stat-value" style={{ color: 'var(--accent)' }}>{platformStats.activeVendors} Sellers</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-label">REGISTERED CUSTOMERS</div>
                <div className="admin-stat-value">{platformStats.activeCustomers} Buyers</div>
              </div>
            </div>

            {/* Tasks Awaiting Approval Section */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                📋 Tasks Awaiting Admin Approval
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Column 1: Pending Sellers */}
                <div className="admin-card" style={{ background: 'var(--bg-elevated)' }}>
                  <h4 style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                    🏪 Pending Sellers ({vendorsList.filter(v => v.sellerStatus === 'Pending').length})
                  </h4>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {vendorsList.filter(v => v.sellerStatus === 'Pending').length === 0 ? (
                      <p className="empty-state" style={{ padding: '1.5rem' }}>No pending seller registrations.</p>
                    ) : (
                      vendorsList.filter(v => v.sellerStatus === 'Pending').map(vendor => (
                        <div key={vendor.id} className="admin-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
                          <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', lineHeight: 1.3 }}>
                            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor.storeName || `${vendor.firstName}'s Store`}</strong>
                            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor.firstName} {vendor.lastName} ({vendor.email})</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            <button className="action-btn" style={{ padding: '0.2rem 0.4rem', fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }} onClick={() => handleApproveVendor(vendor.id)}>Approve</button>
                            <button className="cart-remove" style={{ padding: '0.2rem 0.4rem', fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)' }} onClick={() => handleRejectVendor(vendor.id)}>Reject</button>
                            <button className="pill" style={{ background: 'var(--accent-blue)', color: 'white', border: 'none' }} onClick={() => { setChatTarget({ sellerId: vendor.id, type: 'seller', name: vendor.storeName || `${vendor.firstName}'s Store`, vendorObj: vendor }); setReviewModalOpen(true); setAdminTab('vendors'); }}>View</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Fraud Alerts panel */}
            <div className="admin-card">
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>🛡️ Security Audit Fraud Alerts</h4>
              {platformStats.fraudAlerts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No suspicious transaction values detected on the platform.</p>
              ) : (
                platformStats.fraudAlerts.map((alert, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.75rem', borderBottom: '1px solid var(--border-light)', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', marginBottom: '0.4rem' }}>
                    <div>
                      <strong style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{alert.reason}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Order ID: #{alert.orderId} | Customer: {alert.customerEmail}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--danger)', whiteSpace: 'nowrap' }}>₹{Math.round(alert.totalAmount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Catalog Management Tab */}
        {adminTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)' }}>Catalogue Listings Management</h2>
              <button className="action-btn" onClick={() => setAdminTab('add-product')}>+ List New Product</button>
            </div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Search catalog products..."
                value={adminProductSearch}
                onChange={e => setAdminProductSearch(e.target.value)}
                style={{ maxWidth: '250px' }}
              />
              <select
                className="form-input"
                value={productSellerFilter}
                onChange={e => setProductSellerFilter(e.target.value)}
                style={{ maxWidth: '200px' }}
              >
                <option value="All">All Sellers</option>
                {approvedSellers.map(s => (
                  <option key={s.id} value={s.id}>{s.storeName || `${s.firstName} ${s.lastName}`}</option>
                ))}
              </select>
              {(adminProductSearch || productSellerFilter !== 'All') && (
                <button className="pill" onClick={() => { setAdminProductSearch(''); setProductSellerFilter('All'); }}>Clear</button>
              )}
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Image</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Store Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(adminAllProducts.length > 0 ? adminAllProducts : products)
                  .filter(p => {
                    if (adminProductSearch && !p.name.toLowerCase().includes(adminProductSearch.toLowerCase())) return false;
                    if (productSellerFilter !== 'All' && parseInt(p.vendorId) !== parseInt(productSellerFilter)) return false;
                    return true;
                  })
                  .map((p, idx) => {
                    const seller = approvedSellers.find(s => parseInt(s.id) === parseInt(p.vendorId));
                    return (
                    <tr key={p.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <img src={getProductImageSrc(p)} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} onError={e => { e.target.onerror = null; e.target.src = getCategoryFallbackImage(p.category); }} />
                      </td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category}</td>
                      <td>{seller ? (seller.storeName || `${seller.firstName} ${seller.lastName}`) : `Store #${p.vendorId || 1}`}</td>
                      <td>
                        <button className="action-btn" style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleEditProductClick(p)}>Edit</button>
                        <button className="cart-remove" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Product Form */}
        {adminTab === 'add-product' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>List New Product Listing</h2>
            <form onSubmit={handleAddProductSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input className="form-input" type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Air Conditioners">Air Conditioners</option>
                  <option value="Books">Books</option>
                  <option value="Computers">Computers</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Men Fashion">Men Fashion</option>
                  <option value="Refrigerators">Refrigerators</option>
                  <option value="Speakers">Speakers</option>
                  <option value="Television">Television</option>
                  <option value="Watches">Watches</option>
                  <option value="Woman Fashion">Woman Fashion</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Seller</label>
                <select className="form-input" value={newProduct.vendorId} onChange={e => setNewProduct({ ...newProduct, vendorId: e.target.value })}>
                  <option value="">-- Select a seller --</option>
                  {approvedSellers.map(s => (
                    <option key={s.id} value={s.id}>{s.storeName || `${s.firstName} ${s.lastName}`} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="3" required value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
              </div>
              <div className="form-group">
                <label>Storage Instructions</label>
                <input className="form-input" type="text" value={newProduct.storageInstructions} onChange={e => setNewProduct({ ...newProduct, storageInstructions: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input className="form-input" type="file" accept="image/*" onChange={handleProductImageFile} />
                <input
                  className="form-input"
                  type="text"
                  placeholder="Image URL or generated preview data"
                  value={newProduct.imageUrl}
                  onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  style={{ marginTop: '0.75rem' }}
                />
                <div className="image-preview-panel">
                  <img
                    src={newProduct.imageUrl || buildProductMockupDataUrl(newProduct.name || 'SnapShop Product', newProduct.category)}
                    alt="preview"
                    onError={e => { e.target.onerror = null; e.target.src = getCategoryFallbackImage(newProduct.category); }}
                  />
                </div>
              </div>

              <h5 style={{ margin: '1rem 0 0.5rem' }}>Variant Definitions</h5>
              {newProduct.variants.map((v, vIdx) => (
                <div key={vIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                  <div style={{ flex: '1', minWidth: '90px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight (g)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      required
                      value={v.weightGrams}
                      onChange={e => {
                        const newVars = [...newProduct.variants];
                        newVars[vIdx].weightGrams = parseInt(e.target.value) || 0;
                        setNewProduct({ ...newProduct, variants: newVars });
                      }}
                    />
                  </div>
                  <div style={{ flex: '1.5' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      required
                      min="0"
                      value={v.price}
                      onChange={e => {
                        const newVars = [...newProduct.variants];
                        newVars[vIdx].price = parseFloat(e.target.value) || 0;
                        setNewProduct({ ...newProduct, variants: newVars });
                      }}
                    />
                  </div>
                  <div style={{ flex: '1.5' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock</label>
                    <input
                      className="form-input"
                      type="number"
                      required
                      min="0"
                      value={v.stock}
                      onChange={e => {
                        const newVars = [...newProduct.variants];
                        newVars[vIdx].stock = parseInt(e.target.value) || 0;
                        setNewProduct({ ...newProduct, variants: newVars });
                      }}
                    />
                  </div>
                </div>
              ))}
              <button type="submit" className="auth-btn">Save Product</button>
            </form>
          </div>
        )}

        {/* Edit Product Form */}
        {adminTab === 'edit-product' && editProduct && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Edit Product Details</h2>
            <form onSubmit={handleEditProductSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input className="form-input" type="text" required value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-input" value={editProduct.category} onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}>
                  <option value="Mobiles">Mobiles</option>
                  <option value="Air Conditioners">Air Conditioners</option>
                  <option value="Books">Books</option>
                  <option value="Computers">Computers</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Men Fashion">Men Fashion</option>
                  <option value="Refrigerators">Refrigerators</option>
                  <option value="Speakers">Speakers</option>
                  <option value="Television">Television</option>
                  <option value="Watches">Watches</option>
                  <option value="Woman Fashion">Woman Fashion</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Seller</label>
                <select className="form-input" value={editProduct.vendorId || ''} onChange={e => setEditProduct({ ...editProduct, vendorId: e.target.value })}>
                  <option value="">-- Select a seller --</option>
                  {approvedSellers.map(s => (
                    <option key={s.id} value={s.id}>{s.storeName || `${s.firstName} ${s.lastName}`} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="3" required value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Storage Instructions</label>
                <input className="form-input" type="text" required value={editProduct.storageInstructions} onChange={e => setEditProduct({ ...editProduct, storageInstructions: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={editProduct.status || 'Active'} onChange={e => setEditProduct({ ...editProduct, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="action-btn" style={{ flex: 1 }}>Update</button>
                <button type="button" className="pill" style={{ flex: 1, background: 'transparent' }} onClick={() => setAdminTab('products')}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Users list Tab */}
        {adminTab === 'users' && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Platform Users Directory</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Store</th>
                  <th>Role Modification</th>
                  <th>Account Status</th>
                  <th>Overriding Actions</th>
                  <th>Reset Password</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => {
                  const store = storesList.find(s => s.storeId === u.storeId);
                  return (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td><strong>{u.role}</strong></td>
                    <td>{u.role === 'Admin' ? 'N/A' : (store ? (store.storeName || store.name) : (u.storeName || '-'))}</td>
                    <td>
                      <select 
                        value={u.role}
                        onChange={e => handleUpdateUserRole(u.id, e.target.value)}
                        style={{ padding: '0.2rem', fontSize: '0.85rem' }}
                      >
                        <option value="Customer">Customer</option>
                        <option value="Seller">Seller</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`order-status-badge ${u.sellerStatus === 'Approved' ? 'paid' : (u.sellerStatus === 'Pending' ? 'pending' : 'cancelled')}`}>
                        {u.sellerStatus || 'Approved'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {u.sellerStatus !== 'Approved' && (
                          <button className="action-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOverrideUserStatus(u.id, 'Approved')}>
                            Activate
                          </button>
                        )}
                        {u.sellerStatus !== 'Suspended' && (
                          <button className="pill" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#fef3c7', border: '1px solid #f59e0b', color: '#b45309' }} onClick={() => handleOverrideUserStatus(u.id, 'Suspended')}>
                            Suspend
                          </button>
                        )}
                        {u.sellerStatus !== 'Blocked' && (
                          <button className="cart-remove" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOverrideUserStatus(u.id, 'Blocked')}>
                            Block
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <button className="pill" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => handleResetUserPassword(u.id)}>
                        🔑 Reset
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications Tab */}
        {adminTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)' }}>System Log Notifications</h2>
              {notificationsList.some(n => !n.isRead) && (
                <button 
                  className="pill" 
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.4rem 1rem', cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      await adminService.markAllNotificationsRead();
                      showToast('All notifications marked read.', 'success');
                      const data = await adminService.getAdminNotifications();
                      setNotificationsList(data);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notificationsList.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No admin notifications logged.</p>
              ) : (
                notificationsList.map(n => (
                  <div 
                    key={n.id} 
                    style={{ 
                      background: n.isRead ? '#ffffff' : 'rgba(59, 130, 246, 0.05)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '1.25rem', 
                      border: `1px solid ${n.isRead ? 'var(--border)' : 'rgba(59, 130, 246, 0.2)'}`, 
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: n.isRead ? 'normal' : '600' }}>{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button 
                        className="pill" 
                        style={{ background: 'transparent', color: 'var(--primary-light)', border: '1px solid var(--primary-light)', padding: '0.2rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={async () => {
                          try {
                            await adminService.markNotificationRead(n.id);
                            const data = await adminService.getAdminNotifications();
                            setNotificationsList(data);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bulk Upload Tab */}
        {adminTab === 'bulk-upload' && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Bulk Product Import</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Upload spreadsheets (CSV, XLSX) or JSON datasets containing product details, and select a corresponding images ZIP file.
              Spreadsheet columns should include: <code>name</code> (or <code>title</code>), <code>category</code>, <code>price</code>, <code>description</code>, and optionally <code>imageName</code> to map files from the zip.
            </p>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', marginBottom: '2rem' }}>
              {loadingLibraries ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading XLSX & JSZip parsing engines from CDN...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>1. Catalog Dataset (CSV, Excel, JSON, JS)</label>
                    <input 
                      type="file" 
                      accept=".csv,.xlsx,.xls,.json,.js" 
                      onChange={e => setDatasetFile(e.target.files?.[0] || null)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>2. Product Images ZIP (Optional)</label>
                    <input 
                      type="file" 
                      accept=".zip" 
                      onChange={e => setZipFile(e.target.files?.[0] || null)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Category */}
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                  {!bulkAddingCategory ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <select className="form-input" value={bulkCategory} onChange={e => {
                        if (e.target.value === '__add_new__') { setBulkAddingCategory(true); setBulkCategoryNew(''); }
                        else setBulkCategory(e.target.value);
                      }} style={{ flex: 1 }}>
                        <option value="General">General</option>
                        {['Mobiles','Air Conditioners','Books','Computers','Refrigerators','Furniture','Kitchen','Men Fashion','Woman Fashion','Speakers','Television','Watches','Smart Home','Climate Control','Security','Wearables','Entertainment'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__add_new__">+ Add new category...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input className="form-input" type="text" placeholder="Type new category name" value={bulkCategoryNew} onChange={e => setBulkCategoryNew(e.target.value)} style={{ flex: 1 }} />
                      <button className="action-btn" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={() => { setBulkAddingCategory(false); setBulkCategoryNew(''); }}>Cancel</button>
                    </div>
                  )}
                </div>
                {/* Subcategory */}
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subcategory</label>
                  {!bulkAddingSubcategory ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <select className="form-input" value={bulkSubcategory} onChange={e => {
                        if (e.target.value === '__add_new__') { setBulkAddingSubcategory(true); setBulkSubcategoryNew(''); }
                        else setBulkSubcategory(e.target.value);
                      }} style={{ flex: 1 }}>
                        <option value="">-- None --</option>
                        {existingSubcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="__add_new__">+ Add new subcategory...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input className="form-input" type="text" placeholder="Type new subcategory name" value={bulkSubcategoryNew} onChange={e => setBulkSubcategoryNew(e.target.value)} style={{ flex: 1 }} />
                      <button className="action-btn" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={() => { setBulkAddingSubcategory(false); setBulkSubcategoryNew(''); }}>Cancel</button>
                    </div>
                  )}
                </div>
                {/* Brand */}
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Brand</label>
                  {!bulkAddingBrand ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <select className="form-input" value={bulkBrand} onChange={e => {
                        if (e.target.value === '__add_new__') { setBulkAddingBrand(true); setBulkBrandNew(''); }
                        else setBulkBrand(e.target.value);
                      }} style={{ flex: 1 }}>
                        <option value="">-- None --</option>
                        {existingBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="__add_new__">+ Add new brand...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <input className="form-input" type="text" placeholder="Type new brand name" value={bulkBrandNew} onChange={e => setBulkBrandNew(e.target.value)} style={{ flex: 1 }} />
                      <button className="action-btn" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }} onClick={() => { setBulkAddingBrand(false); setBulkBrandNew(''); }}>Cancel</button>
                    </div>
                  )}
                </div>
                {/* Seller */}
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Assign to Seller</label>
                  <select className="form-input" value={bulkSeller} onChange={e => setBulkSeller(e.target.value)}>
                    <option value="">-- Auto (by category) --</option>
                    {sellersList.map(s => (
                      <option key={s.id} value={s.id}>{s.storeName || s.firstName + ' ' + s.lastName} ({s.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="action-btn" 
                  disabled={!datasetFile || loadingLibraries}
                  onClick={handleParseFiles}
                >
                  Parse & Preview Upload
                </button>
                {parsedProducts.length > 0 && (
                  <button 
                    className="action-btn" 
                    style={{ background: 'var(--success)' }}
                    disabled={importing}
                    onClick={handleBulkUploadSubmit}
                  >
                    {importing ? 'Importing...' : `Execute Bulk Import (${parsedProducts.length} Items)`}
                  </button>
                )}
              </div>
            </div>

            {parsedProducts.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Preview Queue ({parsedProducts.length} Products)</h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price (INR)</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Image</span>
                            )}
                          </td>
                          <td><strong>{p.name}</strong></td>
                          <td>{p.category}</td>
                          <td>₹{Math.round(p.price)}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat with Seller Tab */}
        {adminTab === 'seller-chat' && (
          <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Direct Seller Communications</h2>
            
            <div style={{ flex: 1, display: 'flex', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {/* Left Panel: Sellers List */}
              <div style={{ width: '30%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: '#ffffff' }}>
                  <input 
                    className="form-input"
                    type="text"
                    placeholder="Search sellers..."
                    value={vendorSearch}
                    onChange={e => setVendorSearch(e.target.value)}
                    style={{ margin: 0 }}
                  />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {vendorsList
                    .filter(v => 
                      !vendorSearch || 
                      (v.firstName && v.firstName.toLowerCase().includes(vendorSearch.toLowerCase())) ||
                      (v.lastName && v.lastName.toLowerCase().includes(vendorSearch.toLowerCase())) ||
                      (v.email && v.email.toLowerCase().includes(vendorSearch.toLowerCase())) ||
                      (v.storeName && v.storeName.toLowerCase().includes(vendorSearch.toLowerCase()))
                    )
                    .map(vendor => {
                      const isSelected = chatTarget?.sellerId === vendor.id && chatTarget?.type === 'seller';
                      return (
                        <div 
                          key={vendor.id}
                          onClick={() => setChatTarget({ sellerId: vendor.id, type: 'seller', name: vendor.storeName || `${vendor.firstName}'s Store`, vendorObj: vendor })}
                          style={{ 
                            padding: '1rem', 
                            borderBottom: '1px solid var(--border)', 
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary-glow)' : 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <strong style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'var(--text-dark)' }}>
                            {vendor.storeName || `${vendor.firstName}'s Store`}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {vendor.firstName} {vendor.lastName} • {vendor.email}
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className={`order-status-badge ${vendor.sellerStatus === 'Approved' ? 'paid' : (vendor.sellerStatus === 'Rejected' ? 'cancelled' : 'pending')}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>
                              {vendor.sellerStatus || 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  {vendorsList.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.9rem' }}>No vendors registered.</p>
                  )}
                </div>
              </div>

              {/* Right Panel: Inline Chat Window */}
              <div style={{ width: '70%', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
                {chatTarget && chatTarget.type === 'seller' ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Chat Header */}
                    <div style={{ background: '#ffffff', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--primary)' }}>{chatTarget.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: {chatTarget.vendorObj?.sellerStatus || 'Pending'} | Contact: {chatTarget.vendorObj?.phone || 'N/A'}</span>
                      </div>
                      <button className="pill" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.3rem 0.6rem' }} onClick={() => loadAdminChat(chatTarget)}>
                        🔄 Sync Chat
                      </button>
                    </div>

                    {/* Chat Messages scroll area */}
                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                      {adminChatLoading ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Loading thread...</div>
                      ) : adminChatMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                          <span style={{ fontSize: '2.5rem' }}>💬</span>
                          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No messages yet. Send a direct request below!</p>
                        </div>
                      ) : (
                        adminChatMessages.map(m => {
                          const isAdmin = m.senderRole === 'Admin';
                          return (
                            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                                {isAdmin ? 'You (Admin)' : 'Seller'} • {new Date(m.createdAt).toLocaleTimeString()}
                              </span>
                              <div style={{ 
                                background: isAdmin ? 'var(--primary)' : '#e2e8f0', 
                                color: isAdmin ? 'white' : 'var(--text-dark)', 
                                padding: '0.75rem 1rem', 
                                borderRadius: isAdmin ? '12px 0px 12px 12px' : '0px 12px 12px 12px',
                                boxShadow: 'var(--shadow-sm)',
                                fontSize: '0.9rem',
                                wordBreak: 'break-word'
                              }}>
                                {m.message}
                                {m.attachmentUrl && (
                                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>
                                    <img src={m.attachmentUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', display: 'block' }} />
                                    <a href={m.attachmentUrl} download="attachment" style={{ fontSize: '0.75rem', color: isAdmin ? 'white' : 'var(--primary)', textDecoration: 'underline', marginTop: '0.25rem', display: 'inline-block' }}>
                                      📥 Download file
                                    </a>
                                  </div>
                                )}
                  </div>
                </div>
              );
                        })
                      )}
                    </div>

                    {/* Message input footer */}
                    <form onSubmit={handleSendAdminChatMessage} style={{ borderTop: '1px solid var(--border)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#ffffff' }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <label style={{ cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }} title="Attach image file">
                          📎
                          <input type="file" accept="image/*" onChange={handleAdminChatAttachment} style={{ display: 'none' }} />
                        </label>
                        {adminChatAttachment && (
                          <div style={{ position: 'absolute', bottom: '40px', left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
                            <img src={adminChatAttachment} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            <button type="button" onClick={() => setAdminChatAttachment('')} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', marginLeft: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                          </div>
                        )}
                      </div>
                      <input 
                        className="form-input" 
                        type="text" 
                        placeholder="Type feedback or request details..." 
                        value={newAdminChatMessage} 
                        onChange={e => setNewAdminChatMessage(e.target.value)} 
                        style={{ flex: 1, margin: 0 }}
                      />
                      <button type="submit" className="action-btn" style={{ padding: '0.5rem 1.25rem' }}>
                        Send
                      </button>
                    </form>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '4rem' }}>💬</span>
                    <h3 style={{ marginTop: '1rem' }}>No Conversations Active</h3>
                    <p style={{ fontSize: '0.9rem' }}>Select a seller store from the left sidebar to read discussion logs or send direct inquiries.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Management Tab */}
        {adminTab === 'subscriptions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>Subscription & Plan Management</h2>
              {expiryCheckResult && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Checked {expiryCheckResult.checked} subscriptions
                  {expiryCheckResult.sent?.length > 0 && ` - ${expiryCheckResult.sent.length} notices sent`}
                </span>
              )}
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL</span>
                <h2 style={{ color: 'var(--primary-light)', marginTop: '0.25rem', fontSize: '1.8rem' }}>{platformStats.total || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>🟢 ACTIVE</span>
                <h2 style={{ color: 'var(--success)', marginTop: '0.25rem', fontSize: '1.8rem' }}>{platformStats.active || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>🟡 EXPIRING SOON</span>
                <h2 style={{ color: '#f59e0b', marginTop: '0.25rem', fontSize: '1.8rem' }}>{platformStats.expiringSoon || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>🔴 EXPIRED</span>
                <h2 style={{ color: '#ef4444', marginTop: '0.25rem', fontSize: '1.8rem' }}>{platformStats.expired || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>🧪 TRIAL</span>
                <h2 style={{ color: 'var(--accent)', marginTop: '0.25rem', fontSize: '1.8rem' }}>{platformStats.trial || 0}</h2>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-input"
                type="text"
                placeholder="Search by store name or email..."
                value={subscriptionSearch}
                onChange={e => setSubscriptionSearch(e.target.value)}
                style={{ flex: 1, minWidth: '250px' }}
              />
              <select className="form-input" style={{ width: 'auto' }} value={subscriptionFilter} onChange={e => setSubscriptionFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select className="form-input" style={{ width: 'auto' }} value={subscriptionSort} onChange={e => setSubscriptionSort(e.target.value)}>
                <option value="expiry">Sort by Expiry (nearest)</option>
                <option value="name">Sort by Store Name</option>
                <option value="plan">Sort by Plan</option>
              </select>
            </div>

            {/* Store Subscriptions Table */}
            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--primary)', margin: 0 }}>Store Subscriptions</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vendorsList.length} records</span>
              </div>
              {(() => {
                const planMap = {};
                adminAllProducts.forEach(p => { planMap[p.key || p.planKey] = p; });
                const now = new Date();
                let filtered = vendorsList.filter(s => {
                  const nameMatch = !subscriptionSearch || (s.storeName || '').toLowerCase().includes(subscriptionSearch.toLowerCase()) || (s.ownerEmail || '').toLowerCase().includes(subscriptionSearch.toLowerCase()) || (s.ownerFirstName || '').toLowerCase().includes(subscriptionSearch.toLowerCase());
                  if (subscriptionFilter === 'all') return nameMatch;
                  if (subscriptionFilter === 'expiring') {
                    const end = new Date(s.currentPeriodEnd);
                    const diff = Math.ceil((end - now) / (1000*60*60*24));
                    return nameMatch && diff >= 0 && diff <= 7 && (s.status === 'active' || s.status === 'trial');
                  }
                  return nameMatch && s.status === subscriptionFilter;
                });
                filtered.sort((a, b) => {
                  if (subscriptionSort === 'name') return (a.storeName || '').localeCompare(b.storeName || '');
                  if (subscriptionSort === 'plan') return (a.planKey || '').localeCompare(b.planKey || '');
                  return new Date(a.currentPeriodEnd) - new Date(b.currentPeriodEnd);
                });
                return filtered.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Store / Owner</th>
                          <th>Plan</th>
                          <th>Timeline</th>
                          <th>Days Left</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(s => {
                          const plan = planMap[s.planKey];
                          const end = new Date(s.currentPeriodEnd);
                          const start = new Date(s.currentPeriodStart);
                          const daysRemaining = Math.ceil((end - now) / (1000*60*60*24));
                          const isExpiring = daysRemaining >= 0 && daysRemaining <= 7;
                          const isExpired = daysRemaining <= 0 || s.status === 'expired';
                          const statusIcon = isExpired ? '🔴' : isExpiring ? '🟡' : '🟢';
                          const statusText = !s.status ? 'No Plan' : isExpired ? 'Expired' : isExpiring ? 'Expiring Soon' : s.status === 'trial' ? 'Trial' : 'Active';
                          return (
                            <tr key={s.storeId || s.id} style={{ background: isExpired ? '#fef2f2' : isExpiring ? '#fffbeb' : 'transparent' }}>
                              <td>
                                <strong>{s.storeName || 'Unknown Store'}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {s.ownerFirstName ? `${s.ownerFirstName} ${s.ownerLastName || ''}` : '—'} • {s.ownerEmail || '—'}
                                </div>
                              </td>
                              <td>
                                <strong>{plan?.name || s.planKey || 'No Plan'}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.planKey}</div>
                              </td>
                              <td style={{ fontSize: '0.8rem' }}>
                                <div>Start: {start.toLocaleDateString()}</div>
                                <div>End: {end.toLocaleDateString()}</div>
                              </td>
                              <td>
                                <span style={{
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : '#10b981'
                                }}>
                                  {isExpired ? '0' : daysRemaining}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                                  {isExpired ? 'days overdue' : 'days left'}
                                </span>
                              </td>
                              <td>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                  padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                  background: isExpired ? '#fef2f2' : isExpiring ? '#fffbeb' : '#f0fdf4',
                                  color: isExpired ? '#ef4444' : isExpiring ? '#f59e0b' : '#10b981',
                                  border: `1px solid ${isExpired ? '#fecaca' : isExpiring ? '#fde68a' : '#bbf7d0'}`
                                }}>
                                  {statusIcon} {statusText}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="pill"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none' }}
                                  onClick={() => { setChatTarget({ sellerId: s.ownerId || s.storeId, type: 'seller', name: s.storeName, vendorObj: { firstName: s.ownerFirstName, lastName: s.ownerLastName, email: s.ownerEmail, phone: s.ownerPhone, sellerStatus: s.status } }); setAdminTab('seller-chat'); }}
                                >
                                  💬 Chat
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subscription records match your criteria.</p>
                );
              })()}
            </div>

            {/* Plan Definitions */}
            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Plan Definitions</h3>
              {adminAllProducts.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Trial Days</th>
                        <th>Max Products</th>
                        <th>Orders/Month</th>
                        <th>Storage</th>
                        <th>Custom Domain</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAllProducts.map(p => (
                        <tr key={p.key || p.id}>
                          <td><code>{p.key || p.planKey}</code></td>
                          <td><strong>{p.name}</strong></td>
                          <td>₹{p.price || 0}</td>
                          <td>{p.trialDays || 0}</td>
                          <td>{p.features?.maxProducts === -1 ? '∞' : p.features?.maxProducts}</td>
                          <td>{p.features?.maxOrdersPerMonth === -1 ? '∞' : p.features?.maxOrdersPerMonth}</td>
                          <td>{p.features?.storageMB === -1 ? '∞' : `${p.features?.storageMB} MB`}</td>
                          <td>{p.features?.customDomain ? '✓' : '-'}</td>
                          <td><span className={`order-status-badge ${p.isActive ? 'paid' : 'cancelled'}`}>{p.isActive ? 'Active' : 'Archived'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No plans defined.</p>
              )}
            </div>

            {/* Trial Stores */}
            {pendingProductsList.length > 0 && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Trial Stores</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Store</th>
                        <th>Plan</th>
                        <th>Trial Started</th>
                        <th>Trial Ends</th>
                        <th>Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProductsList.map(t => {
                        const now = new Date();
                        const trialEnd = t.trialEnd ? new Date(t.trialEnd) : t.trialEndsAt ? new Date(t.trialEndsAt) : null;
                        const daysLeft = trialEnd ? Math.ceil((trialEnd - now) / (1000*60*60*24)) : '-';
                        return (
                          <tr key={t.storeId || t.id}>
                            <td><strong>{t.storeName || t.storeId}</strong></td>
                            <td><strong>{t.plan?.name || t.planKey}</strong></td>
                            <td>{t.trialStart ? new Date(t.trialStart).toLocaleDateString() : (t.trialStartedAt ? new Date(t.trialStartedAt).toLocaleDateString() : '-')}</td>
                            <td>{trialEnd ? trialEnd.toLocaleDateString() : '-'}</td>
                            <td><span style={{ fontWeight: 600, color: daysLeft <= 3 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981' }}>{daysLeft}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {adminTab === 'stores' && <div style={{ maxWidth: 1200, margin: '0 auto' }}><StoresManagement user={user} /></div>}
        {adminTab === 'support' && <div style={{ maxWidth: 1200, margin: '0 auto' }}><SupportCenter user={user} /></div>}
        {adminTab === 'announcements' && <div style={{ maxWidth: 800, margin: '0 auto' }}><AnnouncementsPanel user={user} /></div>}
        {adminTab === 'settings' && <div style={{ maxWidth: 800, margin: '0 auto' }}><PlatformSettingsPanel user={user} /></div>}
        {adminTab === 'audit-logs' && <div style={{ maxWidth: 1200, margin: '0 auto' }}><AuditLogViewer user={user} /></div>}
        {adminTab === 'system-health' && <div style={{ maxWidth: 1000, margin: '0 auto' }}><SystemHealthPanel user={user} /></div>}
        {adminTab === 'reports' && <div style={{ maxWidth: 1000, margin: '0 auto' }}><ReportsPanel user={user} /></div>}

      {/* Review Chat Modal Overlay */}
      {reviewModalOpen && chatTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '1050px', height: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: 'var(--text-dark)' }}>
            
            {/* Modal Header */}
            <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Review Panel: {chatTarget.name}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Target: {chatTarget.type === 'seller' ? 'Seller Account Onboarding Verification' : 'Pending Product Listing Review'}</p>
              </div>
              <button 
                onClick={() => { setChatTarget(null); setReviewModalOpen(false); }} 
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 600 }}
              >
                ✕
              </button>
            </div>

            {/* Split Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              
              {/* Left Panel: Verification Info & Document displays */}
              <div style={{ width: '50%', padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
                {chatTarget.type === 'seller' && chatTarget.vendorObj ? (
                  <div>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '0.5rem' }}>Store Compliance Details</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <div><strong>Owner:</strong> {chatTarget.vendorObj.firstName} {chatTarget.vendorObj.lastName}</div>
                      <div><strong>Email:</strong> {chatTarget.vendorObj.email}</div>
                      <div><strong>Phone:</strong> {chatTarget.vendorObj.phone || 'N/A'}</div>
                      <div><strong>GSTIN:</strong> {chatTarget.vendorObj.gstin || 'N/A'}</div>
                      <div><strong>PAN:</strong> {chatTarget.vendorObj.panNumber || 'N/A'}</div>
                    </div>

                    <h5 style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }}>Bank details</h5>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                      <div><strong>Holder Name:</strong> {chatTarget.vendorObj.bankAccountHolder}</div>
                      <div><strong>Bank Name:</strong> {chatTarget.vendorObj.bankName}</div>
                      <div><strong>Account Number:</strong> {chatTarget.vendorObj.bankAccountNumber}</div>
                      <div><strong>IFSC Code:</strong> {chatTarget.vendorObj.bankIfscCode}</div>
                    </div>

                    <h5 style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }}>Uploaded Verification Documents</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {chatTarget.vendorObj.docGovId && (
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>Government ID Document:</p>
                          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border)', background: '#f1f5f9' }}>
                            <img src={chatTarget.vendorObj.docGovId} alt="Gov ID" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}
                      {chatTarget.vendorObj.docPan && (
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>PAN Card Document:</p>
                          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border)', background: '#f1f5f9' }}>
                            <img src={chatTarget.vendorObj.docPan} alt="PAN Card" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}
                      {chatTarget.vendorObj.docGst && (
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>GST Certificate:</p>
                          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border)', background: '#f1f5f9' }}>
                            <img src={chatTarget.vendorObj.docGst} alt="GST Cert" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}
                      {chatTarget.vendorObj.docBizReg && (
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>Business Reg / License:</p>
                          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border)', background: '#f1f5f9' }}>
                            <img src={chatTarget.vendorObj.docBizReg} alt="Biz Reg" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}
                      {chatTarget.vendorObj.docBank && (
                        <div>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>Cancelled Cheque / Passbook:</p>
                          <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--border)', background: '#f1f5f9' }}>
                            <img src={chatTarget.vendorObj.docBank} alt="Bank Doc" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : chatTarget.type === 'product' && chatTarget.productObj ? (
                  <div>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '2px solid var(--primary-glow)', paddingBottom: '0.5rem' }}>Product Listing Info</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <img src={getProductImageSrc(chatTarget.productObj)} alt="Product" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} onError={e => { e.target.onerror = null; e.target.src = getCategoryFallbackImage(chatTarget.productObj.category); }} />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{chatTarget.productObj.name}</h4>
                        <span className="order-status-badge pending" style={{ fontSize: '0.7rem' }}>{chatTarget.productObj.status}</span>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category: {chatTarget.productObj.category}</p>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <p style={{ fontSize: '0.85rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>{chatTarget.productObj.description}</p>
                    </div>
                    <div className="form-group">
                      <label>Storage Instructions</label>
                      <p style={{ fontSize: '0.85rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>{chatTarget.productObj.storageInstructions || 'N/A'}</p>
                    </div>
                    <h5 style={{ color: 'var(--primary-light)', marginBottom: '0.5rem' }}>Variant specs</h5>
                    <table className="data-table" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Weight</th>
                          <th>Price</th>
                          <th>Stock Qty</th>
                          <th>SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chatTarget.productObj.variants && chatTarget.productObj.variants.map((v, i) => (
                          <tr key={i}>
                            <td>{v.weightGrams >= 1000 ? `${v.weightGrams/1000}kg` : `${v.weightGrams}g`}</td>
                          <td>₹{Math.round(v.price)}</td>
                          <td>{v.stock} units</td>
                            <td><code>{v.sku}</code></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No data context found.</p>
                )}
              </div>

              {/* Right Panel: Chat integration */}
              <div style={{ width: '50%', display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
                <div style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Discussion Feed</span>
                  <button className="pill" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.5rem' }} onClick={() => loadAdminChat(chatTarget)}>🔄 Sync chat</button>
                </div>

                {/* Chat window */}
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {adminChatLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>Loading thread...</div>
                  ) : adminChatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                      <span style={{ fontSize: '2rem' }}>💬</span>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>No messages yet. Send a direct request below!</p>
                    </div>
                  ) : (
                    adminChatMessages.map(m => {
                      const isAdmin = m.senderRole === 'Admin';
                      return (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                            {isAdmin ? 'You' : 'Seller'} • {new Date(m.createdAt).toLocaleTimeString()}
                          </span>
                          <div style={{ 
                            background: isAdmin ? 'var(--primary)' : '#e2e8f0', 
                            color: isAdmin ? 'white' : 'var(--text-dark)', 
                            padding: '0.75rem 1rem', 
                            borderRadius: isAdmin ? '12px 0px 12px 12px' : '0px 12px 12px 12px',
                            boxShadow: 'var(--shadow-sm)',
                            fontSize: '0.9rem',
                            wordBreak: 'break-word'
                          }}>
                            {m.message}
                            
                            {m.attachmentUrl && (
                              <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>
                                <img src={m.attachmentUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', display: 'block' }} />
                                <a href={m.attachmentUrl} download="attachment" style={{ fontSize: '0.75rem', color: isAdmin ? 'white' : 'var(--primary)', textDecoration: 'underline', marginTop: '0.25rem', display: 'inline-block' }}>
                                  📥 Download file
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendAdminChatMessage} style={{ borderTop: '1px solid var(--border)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#ffffff' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <label style={{ cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }} title="Attach image file">
                      📎
                      <input type="file" accept="image/*" onChange={handleAdminChatAttachment} style={{ display: 'none' }} />
                    </label>
                    {adminChatAttachment && (
                      <div style={{ position: 'absolute', bottom: '40px', left: 0, background: 'white', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
                        <img src={adminChatAttachment} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setAdminChatAttachment('')} style={{ background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', marginLeft: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                  </div>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Type feedback or request details..." 
                    value={newAdminChatMessage} 
                    onChange={e => setNewAdminChatMessage(e.target.value)} 
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button type="submit" className="action-btn" style={{ padding: '0.5rem 1.25rem' }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
