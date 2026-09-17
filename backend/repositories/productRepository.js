const db = require('../config/db');

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'");
}

const productRepository = {
  _enrichProduct(product, variants, dummyJsonData) {
    if (variants && variants.length > 0) {
      product.variants = variants.map((v, idx) => ({
        ...v,
        name: `Variant ${idx + 1}`,
        variantImage: ''
      }));
    }

    // Use new columns if available, fall back to dummyJsonData parsing
    const hasNewCols = product.brand !== undefined || product.rating !== undefined;
    if (!hasNewCols && dummyJsonData) {
      try {
        const extra = JSON.parse(dummyJsonData);
        Object.assign(product, {
          images: extra.images,
          reviews: extra.reviews,
          dimensions: extra.dimensions,
          weight: extra.weight,
          sku: extra.sku,
          warrantyInformation: extra.warrantyInformation,
          shippingInformation: extra.shippingInformation,
          returnPolicy: extra.returnPolicy,
          availabilityStatus: extra.availabilityStatus,
          stock: extra.stock || product.stock,
          brand: extra.brand,
          rating: extra.rating,
          discountPercentage: extra.discountPercentage,
          featured_image: extra.featured_image,
          minimumOrderQuantity: extra.minimumOrderQuantity,
          meta: extra.meta
        });
        if (extra.discountPercentage !== undefined) {
          product.discount = parseFloat(extra.discountPercentage) || 0;
        } else if (extra.discount !== undefined) {
          product.discount = parseFloat(extra.discount) || 0;
        }
        if (product.variants && extra.variants && Array.isArray(extra.variants)) {
          product.variants = product.variants.map((v, idx) => {
            const richV = extra.variants.find(rv => rv.sku === v.sku) || extra.variants[idx] || {};
            return { ...v, name: richV.name || v.name, variantImage: richV.variantImage || richV.imageUrl || '' };
          });
        }
      } catch (e) {
        console.error('Failed to parse dummyJsonData in _enrichProduct:', e.message);
      }
    } else if (hasNewCols) {
      // Parse stored JSON columns into objects
      if (typeof product.imagesJson === 'string') {
        try { product.images = JSON.parse(product.imagesJson); } catch (e) { product.images = []; }
      }
      if (typeof product.reviewsJson === 'string') {
        try { product.reviews = JSON.parse(product.reviewsJson); } catch (e) { product.reviews = []; }
      }
      if (typeof product.tagsJson === 'string') {
        try { product.tags = JSON.parse(product.tagsJson); } catch (e) { product.tags = []; }
      }
      if (typeof product.dimensionsJson === 'string') {
        try { product.dimensions = JSON.parse(product.dimensionsJson); } catch (e) { product.dimensions = null; }
      }
      if (product.barcode || product.qrCode) {
        product.meta = { barcode: product.barcode, qrCode: product.qrCode, createdAt: product.createdAt, updatedAt: product.updatedAt };
      }
      product.sku = product.barcode || null;
      product.imageUrl = product.thumbnail || product.imageUrl;
      product.featured_image = product.thumbnail;
      
      // Fallback to dummyJsonData when new columns are empty/null
      if (dummyJsonData) {
        try {
          const extra = JSON.parse(dummyJsonData);
          if (!product.images || product.images.length === 0) {
            if (extra.images && extra.images.length > 0) product.images = extra.images;
          }
          if (!product.reviews || product.reviews.length === 0) {
            if (extra.reviews && extra.reviews.length > 0) product.reviews = extra.reviews;
          }
          if (!product.availabilityStatus && extra.availabilityStatus) {
            product.availabilityStatus = extra.availabilityStatus;
          }
          if (!product.brand && extra.brand) {
            product.brand = extra.brand;
          }
          if (!product.rating && extra.rating) {
            product.rating = extra.rating;
          }
          if (!product.weight && extra.weight) {
            product.weight = extra.weight;
          }
          if ((!product.warrantyInformation || product.warrantyInformation === 'No warranty') && extra.warrantyInformation) {
            product.warrantyInformation = extra.warrantyInformation;
          }
          if ((!product.shippingInformation || product.shippingInformation === 'Ships in 1-2 business days') && extra.shippingInformation) {
            product.shippingInformation = extra.shippingInformation;
          }
          if ((!product.returnPolicy || product.returnPolicy === '7 days return policy') && extra.returnPolicy) {
            product.returnPolicy = extra.returnPolicy;
          }
          if (!product.stock && extra.stock) {
            product.stock = extra.stock;
          }
          if (!product.imageUrl) {
            product.imageUrl = extra.thumbnail || (extra.images && extra.images[0]) || null;
          }
          if (!product.thumbnail && extra.thumbnail) {
            product.thumbnail = extra.thumbnail;
          }
          if (!product.featured_image) {
            product.featured_image = extra.featured_image || extra.thumbnail || null;
          }
        } catch (e) {}
      }

      // Reconcile availabilityStatus with actual variant stock
      const totalStock = (product.variants || []).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
      if (totalStock > 0 && product.availabilityStatus === 'Out of Stock') {
        product.availabilityStatus = 'In Stock';
      } else if (totalStock <= 0 && product.availabilityStatus !== 'Out of Stock') {
        product.availabilityStatus = 'Out of Stock';
      }

      // Decode HTML entities in text fields
      ['name', 'description', 'category'].forEach(field => {
        if (product[field]) {
          product[field] = product[field].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        }
      });
    }
    
    if (!product.variants || product.variants.length === 0) {
      const parsedPrice = product.price || 0;
      const parsedStock = product.stock || 0;
      product.variants = [{
        id: `v-default-${product.id}`,
        name: 'Default Variant',
        weightGrams: 500,
        price: parsedPrice,
        stock: parsedStock,
        sku: product.sku || '',
        variantImage: product.image || product.imageUrl || ''
      }];
    }

    if (product.variants && product.variants.length > 0) {
      product.price = product.variants[0].price;
      product.stock = product.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
    }
    return product;
  },

  async getProducts(tenantId = 1) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('tenantId', db.sql.Int, tenantId || 1)
        .query(`
          SELECT p.ProductId as id, p.VendorId as vendorId, p.CategoryId as categoryId, p.StoreId as storeId, p.TenantId as tenantId, p.Name as name, p.Slug as slug, p.Description as description,
                 p.StorageInstructions as storageInstructions, p.Bullets as bullets, p.ImagePrompt as imagePrompt, p.ImageUrl as imageUrl,
                 c.Name as category, p.Status as status, p.Discount as discount,
                 p.SaleStartDate as saleStartDate, p.SaleEndDate as saleEndDate, p.DummyJsonData as dummyJsonData,
                 p.Brand as brand, p.Rating as rating, p.DiscountPercentage as discountPercentage,
                 p.Stock as stockLevel, p.AvailabilityStatus as availabilityStatus,
                 p.WeightGrams as weight, p.DimensionsJson as dimensionsJson,
                 p.WarrantyInformation as warrantyInformation, p.ShippingInformation as shippingInformation,
                 p.ReturnPolicy as returnPolicy, p.MinimumOrderQuantity as minimumOrderQuantity,
                 p.Barcode as barcode, p.QrCode as qrCode, p.Thumbnail as thumbnail,
                 p.ImagesJson as imagesJson, p.TagsJson as tagsJson, p.ReviewsJson as reviewsJson,
                 p.DummyProductId as dummyProductId, p.UpdatedAt as updatedAt,
                 p.CreatedAt as createdAt
          FROM Products p
          JOIN Categories c ON p.CategoryId = c.CategoryId
          WHERE p.TenantId = @tenantId
        `);
      
      const products = res.recordset;
      for (let p of products) {
        const vRes = await pool.request()
          .input('prodId', db.sql.Int, p.id)
          .query('SELECT VariantId as id, WeightGrams as weightGrams, Price as price, Stock as stock, Sku as sku, ExpiryDate as expiryDate FROM ProductVariants WHERE ProductId = @prodId');
        this._enrichProduct(p, vRes.recordset, p.dummyJsonData);
      }
      return products;
    } else {
      const targetTenantId = parseInt(tenantId || 1);
      return localDb.products
        .filter(p => (p.tenantId || 1) === targetTenantId)
        .map(p => {
          const cat = localDb.categories.find(c => c.id === p.categoryId);
          const mapped = {
            ...p,
            discount: p.discount || 0,
            category: cat ? cat.name : 'Unknown'
          };
          const rawVariants = localDb.productVariants.filter(v => v.productId === p.id);
          return this._enrichProduct(mapped, rawVariants, p.dummyJsonData);
        });
    }
  },

  async getProductById(id) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('id', db.sql.Int, id)
        .query(`
          SELECT p.ProductId as id, p.VendorId as vendorId, p.CategoryId as categoryId, p.StoreId as storeId, p.TenantId as tenantId, p.Name as name, p.Slug as slug, p.Description as description,
                 p.StorageInstructions as storageInstructions, p.Bullets as bullets, p.ImagePrompt as imagePrompt, p.ImageUrl as imageUrl,
                 c.Name as category, p.Status as status, p.Discount as discount,
                 p.SaleStartDate as saleStartDate, p.SaleEndDate as saleEndDate, p.DummyJsonData as dummyJsonData,
                 p.Brand as brand, p.Rating as rating, p.DiscountPercentage as discountPercentage,
                 p.Stock as stockLevel, p.AvailabilityStatus as availabilityStatus,
                 p.WeightGrams as weight, p.DimensionsJson as dimensionsJson,
                 p.WarrantyInformation as warrantyInformation, p.ShippingInformation as shippingInformation,
                 p.ReturnPolicy as returnPolicy, p.MinimumOrderQuantity as minimumOrderQuantity,
                 p.Barcode as barcode, p.QrCode as qrCode, p.Thumbnail as thumbnail,
                 p.ImagesJson as imagesJson, p.TagsJson as tagsJson, p.ReviewsJson as reviewsJson,
                 p.DummyProductId as dummyProductId, p.UpdatedAt as updatedAt,
                 p.CreatedAt as createdAt
          FROM Products p
          JOIN Categories c ON p.CategoryId = c.CategoryId
          WHERE p.ProductId = @id
        `);
      if (res.recordset.length === 0) return null;
      const product = res.recordset[0];

      const vRes = await pool.request()
        .input('prodId', db.sql.Int, product.id)
        .query('SELECT VariantId as id, WeightGrams as weightGrams, Price as price, Stock as stock, Sku as sku, ExpiryDate as expiryDate FROM ProductVariants WHERE ProductId = @prodId');
      return this._enrichProduct(product, vRes.recordset, product.dummyJsonData);
    } else {
      const p = localDb.products.find(prod => prod.id === parseInt(id));
      if (!p) return null;
      const cat = localDb.categories.find(c => c.id === p.categoryId);
      const mapped = {
        ...p,
        discount: p.discount || 0,
        category: cat ? cat.name : 'Unknown'
      };
      const rawVariants = localDb.productVariants.filter(v => v.productId === p.id);
      return this._enrichProduct(mapped, rawVariants, p.dummyJsonData);
    }
  },

  async createProduct(productData, variantsData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenantId = productData.tenantId || 1;
    const storeId = productData.storeId || 1;

    const extraJson = JSON.stringify({
      brand: productData.brand || 'Premium Brand',
      warrantyInformation: productData.warrantyInformation || 'No warranty',
      rating: parseFloat(productData.rating) || 4.41,
      discountPercentage: parseFloat(productData.discount) || 0,
      images: Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : [productData.imageUrl || 'https://placehold.co/400x533?text=No+Image'],
      featured_image: productData.featured_image || productData.imageUrl || '',
      reviews: [],
      availabilityStatus: productData.availabilityStatus || 'In Stock',
      returnPolicy: productData.returnPolicy || '7 days return policy',
      shippingInformation: productData.shippingInformation || 'Ships in 1-2 business days',
      minimumOrderQuantity: parseInt(productData.minimumOrderQuantity) || 1,
      variants: Array.isArray(productData.variants) ? productData.variants.map((v, idx) => ({
        name: v.name || `Variant ${idx + 1}`,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
        sku: v.sku || '',
        weightGrams: parseInt(v.weightGrams) || 500,
        variantImage: v.variantImage || v.imageUrl || ''
      })) : []
    });

    if (useSqlServer) {
      let finalSlug = slug;
      const slugRes = await pool.request()
        .input('slug', db.sql.NVarChar, slug)
        .query('SELECT COUNT(*) as cnt FROM Products WHERE Slug = @slug');
      if (slugRes.recordset[0].cnt > 0) {
        const suffix = Date.now().toString(36).slice(-4);
        finalSlug = `${slug}-${suffix}`;
      }

      // Decode HTML entities in category name before lookup
      const decodedCategory = productData.category.trim()
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
      const catRes = await pool.request()
        .input('name', db.sql.NVarChar, decodedCategory)
        .input('tenantId', db.sql.Int, tenantId)
        .query('SELECT CategoryId FROM Categories WHERE LOWER(LTRIM(RTRIM(Name))) = LOWER(LTRIM(RTRIM(@name))) AND TenantId = @tenantId');
      let catId = catRes.recordset.length > 0 ? catRes.recordset[0].CategoryId : null;
      if (!catId) {
        const firstCatRes = await pool.request()
          .input('tenantId', db.sql.Int, tenantId)
          .query('SELECT TOP 1 CategoryId FROM Categories WHERE TenantId = @tenantId');
        catId = firstCatRes.recordset.length > 0 ? firstCatRes.recordset[0].CategoryId : 1;
      }
      
      const prodRes = await pool.request()
        .input('catId', db.sql.Int, catId)
        .input('vendorId', db.sql.Int, productData.vendorId || 1)
        .input('name', db.sql.NVarChar, productData.name)
        .input('slug', db.sql.NVarChar, finalSlug)
        .input('desc', db.sql.NVarChar, productData.description || '')
        .input('storage', db.sql.NVarChar, productData.storageInstructions || 'Store in cool dry place')
        .input('bullets', db.sql.NVarChar, Array.isArray(productData.bullets) ? productData.bullets.join(';') : (productData.bullets || null))
        .input('imagePrompt', db.sql.NVarChar, productData.imagePrompt || null)
        .input('imageUrl', db.sql.NVarChar, productData.imageUrl || null)
        .input('status', db.sql.NVarChar, productData.status || 'Pending Approval')
        .input('discount', db.sql.Decimal(5,2), productData.discount || 0)
        .input('saleStart', db.sql.VarChar, productData.saleStartDate || null)
        .input('saleEnd', db.sql.VarChar, productData.saleEndDate || null)
        .input('tenantId', db.sql.Int, tenantId)
        .input('storeId', db.sql.Int, storeId)
        .input('dummyJsonData', db.sql.NVarChar, extraJson)
        .input('brand', db.sql.NVarChar, productData.brand || null)
        .input('rating', db.sql.Decimal(3,1), productData.rating != null ? productData.rating : null)
        .input('discountPercent', db.sql.Decimal(5,2), productData.discount != null ? productData.discount : null)
        .input('stock', db.sql.Int, productData.stock != null ? productData.stock : null)
        .input('availStatus', db.sql.NVarChar, productData.availabilityStatus || null)
        .input('weightG', db.sql.Int, productData.weight != null ? productData.weight : null)
        .input('dimJson', db.sql.NVarChar, productData.dimensions ? JSON.stringify(productData.dimensions) : null)
        .input('warrInfo', db.sql.NVarChar, productData.warrantyInformation || null)
        .input('shipInfo', db.sql.NVarChar, productData.shippingInformation || null)
        .input('retPolicy', db.sql.NVarChar, productData.returnPolicy || null)
        .input('minQty', db.sql.Int, productData.minimumOrderQuantity != null ? productData.minimumOrderQuantity : null)
        .input('barcode', db.sql.NVarChar, null)
        .input('qrCode', db.sql.NVarChar, null)
        .input('thumbnail', db.sql.NVarChar, productData.thumbnail || productData.imageUrl || null)
        .input('imgsJson', db.sql.NVarChar, productData.images ? JSON.stringify(productData.images) : null)
        .input('tagsJson', db.sql.NVarChar, productData.tags ? JSON.stringify(productData.tags) : null)
        .input('revsJson', db.sql.NVarChar, null)
        .input('dummyProdId', db.sql.Int, null)
        .input('updatedAt', db.sql.DateTime, null)
        .query(`
          INSERT INTO Products (CategoryId, VendorId, Name, Slug, Description, StorageInstructions, Bullets, ImagePrompt, ImageUrl, Status, Discount, SaleStartDate, SaleEndDate, TenantId, StoreId, DummyJsonData,
            Brand, Rating, DiscountPercentage, Stock, AvailabilityStatus, WeightGrams, DimensionsJson, WarrantyInformation, ShippingInformation, ReturnPolicy, MinimumOrderQuantity, Barcode, QrCode, Thumbnail, ImagesJson, TagsJson, ReviewsJson, DummyProductId, UpdatedAt)
          OUTPUT INSERTED.ProductId
          VALUES (@catId, @vendorId, @name, @slug, @desc, @storage, @bullets, @imagePrompt, @imageUrl, @status, @discount, @saleStart, @saleEnd, @tenantId, @storeId, @dummyJsonData,
            @brand, @rating, @discountPercent, @stock, @availStatus, @weightG, @dimJson, @warrInfo, @shipInfo, @retPolicy, @minQty, @barcode, @qrCode, @thumbnail, @imgsJson, @tagsJson, @revsJson, @dummyProdId, @updatedAt)
        `);
      const prodId = prodRes.recordset[0].ProductId;
      
      for (let v of variantsData) {
        await pool.request()
          .input('prodId', db.sql.Int, prodId)
          .input('weight', db.sql.Int, parseInt(v.weightGrams) || 500)
          .input('price', db.sql.Decimal(10,2), parseFloat(v.price) || 0)
          .input('stock', db.sql.Int, parseInt(v.stock) || 0)
          .input('sku', db.sql.NVarChar, v.sku || `FK-VAR-${prodId}-${v.weightGrams || 500}`)
          .query(`
            INSERT INTO ProductVariants (ProductId, WeightGrams, Price, Stock, Sku, ExpiryDate)
            VALUES (@prodId, @weight, @price, @stock, @sku, '2027-06-30')
          `);
      }
      return this.getProductById(prodId);
    } else {
      let finalSlug = slug;
      const existing = localDb.products.find(p => p.slug === slug);
      if (existing) {
        const suffix = Date.now().toString(36).slice(-4);
        finalSlug = `${slug}-${suffix}`;
      }

      const newId = localDb.products.length > 0 ? Math.max(...localDb.products.map(p => p.id)) + 1 : 1;
      const cat = localDb.categories.find(c => c.name.toLowerCase() === productData.category.toLowerCase() && (c.tenantId || 1) === tenantId) || localDb.categories.find(c => (c.tenantId || 1) === tenantId) || localDb.categories[0];
      
      const newProd = {
        id: newId,
        categoryId: cat.id,
        vendorId: parseInt(productData.vendorId || 1),
        tenantId: parseInt(tenantId),
        storeId: parseInt(storeId),
        name: productData.name,
        slug: finalSlug,
        description: productData.description,
        storageInstructions: productData.storageInstructions || 'Store in cool dry place',
        status: productData.status || 'Pending Approval',
        imageUrl: productData.imageUrl || null,
        imagePrompt: productData.imagePrompt || null,
        bullets: productData.bullets || [],
        discount: parseFloat(productData.discount) || 0,
        saleStartDate: productData.saleStartDate || null,
        saleEndDate: productData.saleEndDate || null,
        dummyJsonData: extraJson
      };
      localDb.products.push(newProd);
      
      let nextVId = localDb.productVariants.length > 0 ? Math.max(...localDb.productVariants.map(v => v.id)) + 1 : 1;
      variantsData.forEach(v => {
        localDb.productVariants.push({
          id: nextVId++,
          productId: newId,
          weightGrams: parseInt(v.weightGrams) || 500,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          sku: v.sku || `FK-VAR-${newId}-${v.weightGrams || 500}`,
          expiryDate: '2027-06-30'
        });
      });
      db.saveLocalDb();
      return this.getProductById(newId);
    }
  },

  async updateProduct(id, productData, variantsData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const currRes = await pool.request()
        .input('id', db.sql.Int, id)
        .query('SELECT DummyJsonData, TenantId FROM Products WHERE ProductId = @id');
      const prodTenantId = currRes.recordset.length > 0 ? currRes.recordset[0].TenantId : 1;
      // Decode HTML entities in category name before lookup
      const decodedCategory = productData.category.trim()
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
      const catRes = await pool.request()
        .input('name', db.sql.NVarChar, decodedCategory)
        .input('tenantId', db.sql.Int, prodTenantId)
        .query('SELECT CategoryId FROM Categories WHERE LOWER(LTRIM(RTRIM(Name))) = LOWER(LTRIM(RTRIM(@name))) AND TenantId = @tenantId');
      
      let catId = catRes.recordset.length > 0 ? catRes.recordset[0].CategoryId : null;
      if (!catId) {
        const firstCatRes = await pool.request()
          .input('tenantId', db.sql.Int, prodTenantId)
          .query('SELECT TOP 1 CategoryId FROM Categories WHERE TenantId = @tenantId');
        catId = firstCatRes.recordset.length > 0 ? firstCatRes.recordset[0].CategoryId : 1;
      }
      let dummyDataObj = {};
      if (currRes.recordset.length > 0 && currRes.recordset[0].DummyJsonData) {
        try {
          dummyDataObj = JSON.parse(currRes.recordset[0].DummyJsonData);
        } catch (e) {}
      }
      
      dummyDataObj.brand = productData.brand || dummyDataObj.brand || 'Premium Brand';
      dummyDataObj.warrantyInformation = productData.warrantyInformation || dummyDataObj.warrantyInformation || 'No warranty';
      if (productData.rating !== undefined) {
        dummyDataObj.rating = parseFloat(productData.rating);
      } else if (dummyDataObj.rating === undefined) {
        dummyDataObj.rating = 4.41;
      }
      if (Array.isArray(productData.images)) {
        dummyDataObj.images = productData.images;
      } else if (productData.imageUrl) {
        dummyDataObj.images = [productData.imageUrl];
      }
      dummyDataObj.featured_image = productData.featured_image || productData.imageUrl || dummyDataObj.featured_image || '';
      dummyDataObj.availabilityStatus = productData.availabilityStatus || dummyDataObj.availabilityStatus || 'In Stock';
      dummyDataObj.returnPolicy = productData.returnPolicy || dummyDataObj.returnPolicy || '7 days return policy';
      dummyDataObj.shippingInformation = productData.shippingInformation || dummyDataObj.shippingInformation || 'Ships in 1-2 business days';
      dummyDataObj.minimumOrderQuantity = parseInt(productData.minimumOrderQuantity) || dummyDataObj.minimumOrderQuantity || 1;
      dummyDataObj.discountPercentage = parseFloat(productData.discount) || 0;
      
      if (Array.isArray(productData.variants)) {
        dummyDataObj.variants = productData.variants.map((v, idx) => ({
          name: v.name || `Variant ${idx + 1}`,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          sku: v.sku || '',
          weightGrams: parseInt(v.weightGrams) || 500,
          variantImage: v.variantImage || v.imageUrl || ''
        }));
      }

      const updateReq = pool.request();
      if (productData.vendorId) {
        updateReq.input('vendorId', db.sql.Int, productData.vendorId);
      }
      const vendorSetClause = productData.vendorId ? ', VendorId = @vendorId' : '';

      console.log(`[DEBUG] Updating product ${id} with status: ${productData.status}`);
      await updateReq
        .input('id', db.sql.Int, id)
        .input('catId', db.sql.Int, catId)
        .input('name', db.sql.NVarChar, productData.name)
        .input('desc', db.sql.NVarChar, productData.description || '')
        .input('storage', db.sql.NVarChar, productData.storageInstructions || 'Store in cool dry place')
        .input('status', db.sql.NVarChar, productData.status || 'Active')
        .input('bullets', db.sql.NVarChar, Array.isArray(productData.bullets) ? productData.bullets.join(';') : (productData.bullets || null))
        .input('imagePrompt', db.sql.NVarChar, productData.imagePrompt || null)
        .input('imageUrl', db.sql.NVarChar, productData.imageUrl || null)
        .input('discount', db.sql.Decimal(5,2), productData.discount || 0)
        .input('saleStart', db.sql.VarChar, productData.saleStartDate || null)
        .input('saleEnd', db.sql.VarChar, productData.saleEndDate || null)
        .input('dummyJsonData', db.sql.NVarChar, JSON.stringify(dummyDataObj))
        .input('brand', db.sql.NVarChar, productData.brand || null)
        .input('rating', db.sql.Decimal(3,1), productData.rating != null ? productData.rating : null)
        .input('discountPercent', db.sql.Decimal(5,2), productData.discount != null ? productData.discount : null)
        .input('stock', db.sql.Int, productData.stock != null ? productData.stock : null)
        .input('availStatus', db.sql.NVarChar, productData.availabilityStatus || null)
        .input('weightG', db.sql.Int, productData.weight != null ? productData.weight : null)
        .input('dimJson', db.sql.NVarChar, productData.dimensions ? JSON.stringify(productData.dimensions) : null)
        .input('warrInfo', db.sql.NVarChar, productData.warrantyInformation || null)
        .input('shipInfo', db.sql.NVarChar, productData.shippingInformation || null)
        .input('retPolicy', db.sql.NVarChar, productData.returnPolicy || null)
        .input('minQty', db.sql.Int, productData.minimumOrderQuantity != null ? productData.minimumOrderQuantity : null)
        .input('barcode', db.sql.NVarChar, null)
        .input('qrCode', db.sql.NVarChar, null)
        .input('thumbnail', db.sql.NVarChar, productData.thumbnail || productData.imageUrl || null)
        .input('imgsJson', db.sql.NVarChar, Array.isArray(productData.images) && productData.images.length > 0 ? JSON.stringify(productData.images) : (dummyDataObj.images ? JSON.stringify(dummyDataObj.images) : null))
        .input('tagsJson', db.sql.NVarChar, productData.tags ? JSON.stringify(productData.tags) : null)
        .input('revsJson', db.sql.NVarChar, null)
        .input('dummyProdId', db.sql.Int, null)
        .input('updatedAt', db.sql.DateTime, new Date())
        .query(`
          UPDATE Products 
          SET CategoryId = @catId, Name = @name, Description = @desc, StorageInstructions = @storage, 
              Bullets = @bullets, ImagePrompt = @imagePrompt, ImageUrl = @imageUrl, Status = @status, 
              Discount = @discount, SaleStartDate = @saleStart, SaleEndDate = @saleEnd, DummyJsonData = @dummyJsonData,
              Brand = @brand, Rating = @rating, DiscountPercentage = @discountPercent, Stock = @stock,
              AvailabilityStatus = @availStatus, WeightGrams = @weightG, DimensionsJson = @dimJson,
              WarrantyInformation = @warrInfo, ShippingInformation = @shipInfo, ReturnPolicy = @retPolicy,
              MinimumOrderQuantity = @minQty, Barcode = @barcode, QrCode = @qrCode, Thumbnail = @thumbnail,
              ImagesJson = @imgsJson, TagsJson = @tagsJson, ReviewsJson = @revsJson, UpdatedAt = @updatedAt${vendorSetClause}
          WHERE ProductId = @id
        `);
        
      if (variantsData && variantsData.length > 0) {
        // Fetch existing variants to determine update vs insert
        const existVarsRes = await pool.request()
          .input('prodId', db.sql.Int, id)
          .query('SELECT VariantId, Sku, WeightGrams, Price, Stock FROM ProductVariants WHERE ProductId = @prodId');
        const existingVars = existVarsRes.recordset;

        const newVariantIds = variantsData.map(v => parseInt(v.id)).filter(vid => !isNaN(vid));
        
        // Gracefully delete variants no longer present, catching references errors
        const toDelete = existingVars.filter(ev => !newVariantIds.includes(ev.VariantId));
        for (const ev of toDelete) {
          try {
            await pool.request()
              .input('vid', db.sql.Int, ev.VariantId)
              .query('DELETE FROM ProductVariants WHERE VariantId = @vid');
          } catch (delErr) {
            console.warn(`[Sync] Could not delete obsolete variant ID ${ev.VariantId} due to references:`, delErr.message);
          }
        }

        // Upsert variants
        for (let v of variantsData) {
          const vId = parseInt(v.id);
          const hasExisting = !isNaN(vId) && existingVars.some(ev => ev.VariantId === vId);

          if (hasExisting) {
            await pool.request()
              .input('vid', db.sql.Int, vId)
              .input('weight', db.sql.Int, parseInt(v.weightGrams) || 500)
              .input('price', db.sql.Decimal(10,2), parseFloat(v.price) || 0)
              .input('stock', db.sql.Int, parseInt(v.stock) || 0)
              .input('sku', db.sql.NVarChar, v.sku || `FK-VAR-${id}-${v.weightGrams || 500}`)
              .query(`
                UPDATE ProductVariants 
                SET WeightGrams = @weight, Price = @price, Stock = @stock, Sku = @sku 
                WHERE VariantId = @vid
              `);
          } else {
            await pool.request()
              .input('prodId', db.sql.Int, id)
              .input('weight', db.sql.Int, parseInt(v.weightGrams) || 500)
              .input('price', db.sql.Decimal(10,2), parseFloat(v.price) || 0)
              .input('stock', db.sql.Int, parseInt(v.stock) || 0)
              .input('sku', db.sql.NVarChar, v.sku || `FK-VAR-${id}-${v.weightGrams || 500}`)
              .query(`
                INSERT INTO ProductVariants (ProductId, WeightGrams, Price, Stock, Sku, ExpiryDate)
                VALUES (@prodId, @weight, @price, @stock, @sku, '2027-06-30')
              `);
          }
        }
      }
      return this.getProductById(id);
    } else {
      const pIdx = localDb.products.findIndex(p => p.id === parseInt(id));
      if (pIdx === -1) return null;
      
      const existingProd = localDb.products[pIdx];
      const tenantId = existingProd.tenantId || 1;
      const cat = localDb.categories.find(c => c.name.toLowerCase() === productData.category.toLowerCase() && (c.tenantId || 1) === tenantId) || localDb.categories.find(c => (c.tenantId || 1) === tenantId) || localDb.categories[0];
      
      let dummyDataObj = {};
      if (existingProd.dummyJsonData) {
        try {
          dummyDataObj = JSON.parse(existingProd.dummyJsonData);
        } catch (e) {}
      }
      
      dummyDataObj.brand = productData.brand || dummyDataObj.brand || 'Premium Brand';
      dummyDataObj.warrantyInformation = productData.warrantyInformation || dummyDataObj.warrantyInformation || 'No warranty';
      if (productData.rating !== undefined) {
        dummyDataObj.rating = parseFloat(productData.rating);
      } else if (dummyDataObj.rating === undefined) {
        dummyDataObj.rating = 4.41;
      }
      if (Array.isArray(productData.images)) {
        dummyDataObj.images = productData.images;
      } else if (productData.imageUrl) {
        dummyDataObj.images = [productData.imageUrl];
      }
      dummyDataObj.featured_image = productData.featured_image || productData.imageUrl || dummyDataObj.featured_image || '';
      dummyDataObj.availabilityStatus = productData.availabilityStatus || dummyDataObj.availabilityStatus || 'In Stock';
      dummyDataObj.returnPolicy = productData.returnPolicy || dummyDataObj.returnPolicy || '7 days return policy';
      dummyDataObj.shippingInformation = productData.shippingInformation || dummyDataObj.shippingInformation || 'Ships in 1-2 business days';
      dummyDataObj.minimumOrderQuantity = parseInt(productData.minimumOrderQuantity) || dummyDataObj.minimumOrderQuantity || 1;
      dummyDataObj.discountPercentage = parseFloat(productData.discount) || 0;
      
      if (Array.isArray(productData.variants)) {
        dummyDataObj.variants = productData.variants.map((v, idx) => ({
          name: v.name || `Variant ${idx + 1}`,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          sku: v.sku || '',
          weightGrams: parseInt(v.weightGrams) || 500,
          variantImage: v.variantImage || v.imageUrl || ''
        }));
      }

      localDb.products[pIdx] = {
        ...localDb.products[pIdx],
        name: productData.name,
        categoryId: cat.id,
        description: productData.description,
        storageInstructions: productData.storageInstructions,
        status: productData.status || 'Active',
        vendorId: productData.vendorId !== undefined ? parseInt(productData.vendorId) : localDb.products[pIdx].vendorId,
        price: (productData.variants && productData.variants[0]) ? parseFloat(productData.variants[0].price) : localDb.products[pIdx].price,
        imageUrl: productData.imageUrl || localDb.products[pIdx].imageUrl || null,
        imagePrompt: productData.imagePrompt || localDb.products[pIdx].imagePrompt || null,
        bullets: productData.bullets || localDb.products[pIdx].bullets || [],
        discount: parseFloat(productData.discount) !== undefined ? parseFloat(productData.discount) : (localDb.products[pIdx].discount || 0),
        saleStartDate: productData.saleStartDate || localDb.products[pIdx].saleStartDate || null,
        saleEndDate: productData.saleEndDate || localDb.products[pIdx].saleEndDate || null,
        dummyJsonData: JSON.stringify(dummyDataObj)
      };
      
      if (variantsData) {
        localDb.productVariants = localDb.productVariants.filter(pv => pv.productId !== parseInt(id));
        let nextVId = localDb.productVariants.length > 0 ? Math.max(...localDb.productVariants.map(v => v.id)) + 1 : 1;
        variantsData.forEach(v => {
          localDb.productVariants.push({
            id: nextVId++,
            productId: parseInt(id),
            weightGrams: parseInt(v.weightGrams) || 500,
            price: parseFloat(v.price),
            stock: parseInt(v.stock),
            sku: v.sku || `FK-VAR-${id}-${v.weightGrams || 500}`,
            expiryDate: '2027-06-30'
          });
        });
      }
      db.saveLocalDb();
      return this.getProductById(id);
    }
  },

  async deleteProduct(id) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .query('DELETE FROM Products WHERE ProductId = @id');
      return true;
    } else {
      localDb.products = localDb.products.filter(p => p.id !== parseInt(id));
      localDb.productVariants = localDb.productVariants.filter(v => v.productId !== parseInt(id));
      localDb.productAttributes = localDb.productAttributes.filter(a => a.productId !== parseInt(id));
      db.saveLocalDb();
      return true;
    }
  },

  async getProductsByVendorId(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query(`
          SELECT p.ProductId as id, p.VendorId as vendorId, p.CategoryId as categoryId, p.Name as name, p.Slug as slug, p.Description as description,
                 p.StorageInstructions as storageInstructions, p.Bullets as bullets, p.ImagePrompt as imagePrompt, p.ImageUrl as imageUrl,
                 c.Name as category, p.Status as status, p.Discount as discount,
                 p.SaleStartDate as saleStartDate, p.SaleEndDate as saleEndDate, p.DummyJsonData as dummyJsonData,
                 p.Brand as brand, p.Rating as rating, p.DiscountPercentage as discountPercentage,
                 p.Stock as stockLevel, p.AvailabilityStatus as availabilityStatus,
                 p.WeightGrams as weight, p.DimensionsJson as dimensionsJson,
                 p.WarrantyInformation as warrantyInformation, p.ShippingInformation as shippingInformation,
                 p.ReturnPolicy as returnPolicy, p.MinimumOrderQuantity as minimumOrderQuantity,
                 p.Barcode as barcode, p.QrCode as qrCode, p.Thumbnail as thumbnail,
                 p.ImagesJson as imagesJson, p.TagsJson as tagsJson, p.ReviewsJson as reviewsJson,
                 p.DummyProductId as dummyProductId, p.UpdatedAt as updatedAt,
                 p.CreatedAt as createdAt
          FROM Products p
          JOIN Categories c ON p.CategoryId = c.CategoryId
          WHERE p.VendorId = @vendorId
        `);
      const products = res.recordset;
      for (let p of products) {
        const vRes = await pool.request()
          .input('prodId', db.sql.Int, p.id)
          .query('SELECT VariantId as id, WeightGrams as weightGrams, Price as price, Stock as stock, Sku as sku, ExpiryDate as expiryDate FROM ProductVariants WHERE ProductId = @prodId');
        this._enrichProduct(p, vRes.recordset, p.dummyJsonData);
      }
      return products;
    } else {
      return localDb.products.filter(p => parseInt(p.vendorId) === parseInt(vendorId)).map(p => {
        const cat = localDb.categories.find(c => c.id === p.categoryId);
        const mapped = {
          ...p,
          category: cat ? cat.name : 'Unknown'
        };
        const rawVariants = localDb.productVariants.filter(v => v.productId === p.id);
        return this._enrichProduct(mapped, rawVariants, p.dummyJsonData);
      });
    }
  },

  async getAllProducts() {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .query(`
          SELECT p.ProductId as id, p.VendorId as vendorId, p.CategoryId as categoryId, p.Name as name, p.Slug as slug, p.Description as description,
                 p.StorageInstructions as storageInstructions, p.Bullets as bullets, p.ImagePrompt as imagePrompt, p.ImageUrl as imageUrl,
                 c.Name as category, p.Status as status, p.Discount as discount,
                 p.SaleStartDate as saleStartDate, p.SaleEndDate as saleEndDate, p.DummyJsonData as dummyJsonData,
                 p.Brand as brand, p.Rating as rating, p.DiscountPercentage as discountPercentage,
                 p.Stock as stockLevel, p.AvailabilityStatus as availabilityStatus,
                 p.WeightGrams as weight, p.DimensionsJson as dimensionsJson,
                 p.WarrantyInformation as warrantyInformation, p.ShippingInformation as shippingInformation,
                 p.ReturnPolicy as returnPolicy, p.MinimumOrderQuantity as minimumOrderQuantity,
                 p.Barcode as barcode, p.QrCode as qrCode, p.Thumbnail as thumbnail,
                 p.ImagesJson as imagesJson, p.TagsJson as tagsJson, p.ReviewsJson as reviewsJson,
                 p.DummyProductId as dummyProductId, p.UpdatedAt as updatedAt,
                 p.CreatedAt as createdAt
          FROM Products p
          JOIN Categories c ON p.CategoryId = c.CategoryId
        `);
      const products = res.recordset;
      for (let p of products) {
        const vRes = await pool.request()
          .input('prodId', db.sql.Int, p.id)
          .query('SELECT VariantId as id, WeightGrams as weightGrams, Price as price, Stock as stock, Sku as sku, ExpiryDate as expiryDate FROM ProductVariants WHERE ProductId = @prodId');
        this._enrichProduct(p, vRes.recordset, p.dummyJsonData);
      }
      return products;
    } else {
      return localDb.products.map(p => {
        const cat = localDb.categories.find(c => c.id === p.categoryId);
        const mapped = {
          ...p,
          discount: p.discount || 0,
          category: cat ? cat.name : 'Unknown'
        };
        const rawVariants = localDb.productVariants.filter(v => v.productId === p.id);
        return this._enrichProduct(mapped, rawVariants, p.dummyJsonData);
      });
    }
  },

  async getProductsByTenant(tenantId) {
    const localDb = db.getLocalDb();
    const tenant = localDb.tenants.find(t => t.id === parseInt(tenantId));
    if (!tenant) return [];

    const ownerProducts = localDb.products.filter(p => parseInt(p.vendorId) === parseInt(tenant.ownerId));
    return ownerProducts.map(p => {
      const cat = localDb.categories.find(c => c.id === p.categoryId);
      const mapped = {
        ...p,
        discount: p.discount || 0,
        category: cat ? cat.name : 'Unknown'
      };
      const rawVariants = localDb.productVariants.filter(v => v.productId === p.id);
      return this._enrichProduct(mapped, rawVariants, p.dummyJsonData);
    });
  },

  async updateProductStatusByVendorId(vendorId, status) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .input('status', db.sql.NVarChar, status)
        .query('UPDATE Products SET Status = @status WHERE VendorId = @vendorId');
      return true;
    } else {
      let changed = false;
      localDb.products.forEach(p => {
        if (parseInt(p.vendorId) === parseInt(vendorId)) {
          p.status = status;
          changed = true;
        }
      });
      if (changed) db.saveLocalDb();
      return true;
    }
  },

  async deleteProductsByVendorId(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      // Delete variants first (CASCADE should handle, but being explicit)
      await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query(`DELETE pv FROM ProductVariants pv
                INNER JOIN Products p ON pv.ProductId = p.ProductId
                WHERE p.VendorId = @vendorId`);
      await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query('DELETE FROM Products WHERE VendorId = @vendorId');
      return { deletedCount: 0 };
    } else {
      const idsToDelete = localDb.products.filter(p => parseInt(p.vendorId) === parseInt(vendorId)).map(p => p.id);
      if (idsToDelete.length === 0) return { deletedCount: 0 };
      localDb.products = localDb.products.filter(p => parseInt(p.vendorId) !== parseInt(vendorId));
      localDb.productVariants = localDb.productVariants.filter(v => !idsToDelete.includes(v.productId));
      localDb.productAttributes = localDb.productAttributes.filter(a => !idsToDelete.includes(a.productId));
      db.saveLocalDb();
      return { deletedCount: idsToDelete.length };
    }
  },

  async updateProductStatus(id, status) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .input('status', db.sql.NVarChar, status)
        .query('UPDATE Products SET Status = @status WHERE ProductId = @id');
      return true;
    } else {
      const p = localDb.products.find(prod => prod.id === parseInt(id));
      if (p) {
        p.status = status;
        db.saveLocalDb();
      }
      return true;
    }
  },

  async updateVariantStock(variantId, stock) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, variantId)
        .input('stock', db.sql.Int, stock)
        .query('UPDATE ProductVariants SET Stock = @stock WHERE VariantId = @id');
      return true;
    } else {
      const v = localDb.productVariants.find(v => v.id === parseInt(variantId));
      if (v) {
        v.stock = parseInt(stock);
        db.saveLocalDb();
        return true;
      }
      return false;
    }
  },

  async adjustVariantStock(variantId, adjustment, reason, tenantId = 1) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const getRes = await pool.request()
        .input('id', db.sql.Int, variantId)
        .query('SELECT Stock FROM ProductVariants WHERE VariantId = @id');
      if (getRes.recordset.length === 0) return null;
      
      const currentStock = getRes.recordset[0].Stock;
      const newStock = currentStock + parseInt(adjustment);

      await pool.request()
        .input('id', db.sql.Int, variantId)
        .input('stock', db.sql.Int, newStock)
        .query('UPDATE ProductVariants SET Stock = @stock WHERE VariantId = @id');

      await pool.request()
        .input('id', db.sql.Int, variantId)
        .input('adj', db.sql.Int, adjustment)
        .input('reason', db.sql.NVarChar, reason)
        .query(`
          INSERT INTO InventoryLogs (VariantId, ChangeQuantity, Reason)
          VALUES (@id, @adj, @reason)
        `);
      return newStock;
    } else {
      const v = localDb.productVariants.find(pv => pv.id === parseInt(variantId));
      if (!v) return null;
      
      const currentStock = parseInt(v.stock || 0);
      const newStock = currentStock + parseInt(adjustment);
      v.stock = newStock;

      const newLogId = localDb.inventoryLogs.length > 0 ? Math.max(...localDb.inventoryLogs.map(l => l.id)) + 1 : 1;
      localDb.inventoryLogs.push({
        id: newLogId,
        variantId: parseInt(variantId),
        adjustment: parseInt(adjustment),
        stockAfter: newStock,
        reason,
        tenantId: parseInt(tenantId),
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return newStock;
    }
  },

  async getInventoryLogs(tenantId = 1) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('tenantId', db.sql.Int, tenantId)
        .query(`
          SELECT il.LogId as id, il.VariantId as variantId, il.ChangeQuantity as adjustment, pv.Stock as stockAfter,
                 il.Reason as reason, il.CreatedAt as createdAt, pv.WeightGrams as weightGrams, p.Name as productName, pv.Sku as sku
          FROM InventoryLogs il
          JOIN ProductVariants pv ON il.VariantId = pv.VariantId
          JOIN Products p ON pv.ProductId = p.ProductId
          WHERE p.TenantId = @tenantId
          ORDER BY il.CreatedAt DESC
        `);
      return res.recordset;
    } else {
      const logs = localDb.inventoryLogs.filter(l => (l.tenantId || 1) === parseInt(tenantId));
      return logs.map(l => {
        const pv = localDb.productVariants.find(v => v.id === l.variantId);
        const p = pv ? localDb.products.find(prod => prod.id === pv.productId) : null;
        return {
          id: l.id,
          variantId: l.variantId,
          adjustment: l.adjustment,
          stockAfter: l.stockAfter,
          reason: l.reason,
          createdAt: l.createdAt,
          weightGrams: pv ? pv.weightGrams : 0,
          sku: pv ? pv.sku : '',
          productName: p ? p.name : 'Unknown Product'
        };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
};

module.exports = productRepository;
