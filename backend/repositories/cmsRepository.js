const db = require('../config/db');
const sql = require('mssql/msnodesqlv8');

const cmsRepository = {
  // Theme Management
  async selectTheme(storeId, tenantId, themeKey) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      // Deactivate all themes
      await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('UPDATE StoreThemes SET IsActive = 0 WHERE StoreId = @storeId');

      // Check if this theme exists
      const checkRes = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('themeKey', sql.NVarChar, themeKey)
        .query('SELECT StoreThemeId FROM StoreThemes WHERE StoreId = @storeId AND ThemeKey = @themeKey');

      if (checkRes.recordset.length > 0) {
        await pool.request()
          .input('storeThemeId', sql.Int, checkRes.recordset[0].StoreThemeId)
          .query('UPDATE StoreThemes SET IsActive = 1 WHERE StoreThemeId = @storeThemeId');
      } else {
        // Fetch starter config from Themes table
        const starterRes = await pool.request()
          .input('themeKey', sql.NVarChar, themeKey)
          .query('SELECT Name, ConfigData FROM Themes WHERE ThemeKey = @themeKey');

        const name = starterRes.recordset.length > 0 ? starterRes.recordset[0].Name : 'Modern';
        const config = starterRes.recordset.length > 0 ? starterRes.recordset[0].ConfigData : '{}';

        // Default homepage sections list
        const defaultSections = JSON.stringify([
          { id: 'sec-hero', type: 'Hero Banner', title: 'Fresh & Organic Harvest', subtitle: 'Order daily organic veggies directly to your doorstep.', buttonText: 'Shop Harvest Now', isVisible: true },
          { id: 'sec-cats', type: 'Categories', title: 'Shop by Category', isVisible: true },
          { id: 'sec-feats', type: 'Featured Products', title: 'Top Discount Organic Bestsellers', limit: 4, isVisible: true },
          { id: 'sec-faq', type: 'FAQ', title: 'Frequently Asked Questions', items: [{ q: 'Do you deliver daily?', a: 'Yes, between 9 AM to 7 PM everyday.' }], isVisible: true },
          { id: 'sec-news', type: 'Newsletter', title: 'Stay Updated', subtitle: 'Join our mailing list to receive coupons.', isVisible: true }
        ]);

        await pool.request()
          .input('storeId', sql.Int, storeId)
          .input('tenantId', sql.Int, tenantId)
          .input('themeKey', sql.NVarChar, themeKey)
          .input('settings', sql.NVarChar, config)
          .input('sections', sql.NVarChar, defaultSections)
          .query(`
            INSERT INTO StoreThemes (StoreId, TenantId, ThemeKey, IsActive, ThemeSettingsJson, HomepageSectionsJson)
            VALUES (@storeId, @tenantId, @themeKey, 1, @settings, @sections)
          `);
      }
    } else {
      const localDb = db.getLocalDb();
      localDb.storeThemes.forEach(t => {
        if (t.storeId === storeId) t.isActive = false;
      });

      const matched = localDb.storeThemes.find(t => t.storeId === storeId && t.themeKey === themeKey);
      if (matched) {
        matched.isActive = true;
      } else {
        const starter = localDb.themes.find(t => t.themeKey === themeKey) || { name: 'Modern', configData: '{}' };
        localDb.storeThemes.push({
          id: localDb.storeThemes.length + 1,
          storeId,
          tenantId,
          themeKey,
          isActive: true,
          themeSettingsJson: starter.configData,
          homepageSectionsJson: JSON.stringify([
            { id: 'sec-hero', type: 'Hero Banner', title: 'Fresh & Organic Harvest', subtitle: 'Order daily organic veggies directly to your doorstep.', buttonText: 'Shop Harvest Now', isVisible: true },
            { id: 'sec-cats', type: 'Categories', title: 'Shop by Category', isVisible: true },
            { id: 'sec-feats', type: 'Featured Products', title: 'Top Discount Organic Bestsellers', limit: 4, isVisible: true },
            { id: 'sec-faq', type: 'FAQ', title: 'Frequently Asked Questions', items: [{ q: 'Do you deliver daily?', a: 'Yes, between 9 AM to 7 PM everyday.' }], isVisible: true },
            { id: 'sec-news', type: 'Newsletter', title: 'Stay Updated', subtitle: 'Join our mailing list to receive coupons.', isVisible: true }
          ])
        });
      }
      db.saveLocalDb();
    }
  },

  async getStoreTheme(storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('SELECT ThemeKey, ThemeSettingsJson, HomepageSectionsJson FROM StoreThemes WHERE StoreId = @storeId AND IsActive = 1');

      if (res.recordset.length > 0) {
        return {
          name: res.recordset[0].ThemeKey.charAt(0).toUpperCase() + res.recordset[0].ThemeKey.slice(1),
          themeKey: res.recordset[0].ThemeKey,
          settings: JSON.parse(res.recordset[0].ThemeSettingsJson),
          sections: JSON.parse(res.recordset[0].HomepageSectionsJson)
        };
      }
    } else {
      const localDb = db.getLocalDb();
      const matched = localDb.storeThemes.find(t => t.storeId === storeId && t.isActive);
      if (matched) {
        return {
          name: matched.themeKey.charAt(0).toUpperCase() + matched.themeKey.slice(1),
          themeKey: matched.themeKey,
          settings: JSON.parse(matched.themeSettingsJson),
          sections: JSON.parse(matched.homepageSectionsJson)
        };
      }
    }

    // Default fallback
    return {
      name: 'Modern',
      themeKey: 'modern',
      settings: { primaryColor: '#10b981', secondaryColor: '#1e293b', accentColor: '#f59e0b', typography: 'Inter', borderRadius: '8px', announcementText: '✨ Premium organic products delivered to your door!' },
      sections: [
        { id: 'sec-hero', type: 'Hero Banner', title: 'Fresh & Organic Harvest', subtitle: 'Order daily organic veggies directly to your doorstep.', buttonText: 'Shop Harvest Now', isVisible: true },
        { id: 'sec-cats', type: 'Categories', title: 'Shop by Category', isVisible: true },
        { id: 'sec-feats', type: 'Featured Products', title: 'Top Discount Organic Bestsellers', limit: 4, isVisible: true },
        { id: 'sec-faq', type: 'FAQ', title: 'Frequently Asked Questions', items: [{ q: 'Do you deliver daily?', a: 'Yes, between 9 AM to 7 PM everyday.' }], isVisible: true },
        { id: 'sec-news', type: 'Newsletter', title: 'Stay Updated', subtitle: 'Join our mailing list to receive coupons.', isVisible: true }
      ]
    };
  },

  async updateStoreTheme(storeId, tenantId, themeKey, settings, sections) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('themeKey', sql.NVarChar, themeKey)
        .input('settings', sql.NVarChar, JSON.stringify(settings))
        .input('sections', sql.NVarChar, JSON.stringify(sections))
        .query(`
          UPDATE StoreThemes
          SET ThemeSettingsJson = @settings, HomepageSectionsJson = @sections
          WHERE StoreId = @storeId AND ThemeKey = @themeKey
        `);
    } else {
      const localDb = db.getLocalDb();
      const matched = localDb.storeThemes.find(t => t.storeId === storeId && t.themeKey === themeKey);
      if (matched) {
        matched.themeSettingsJson = JSON.stringify(settings);
        matched.homepageSectionsJson = JSON.stringify(sections);
        db.saveLocalDb();
      }
    }
  },

  // Banners (Phase 3 compatibility)
  async getBanners() {
    const localDb = db.getLocalDb();
    if (!localDb.banners) localDb.banners = [];
    return localDb.banners;
  },

  async addBanner(bannerData) {
    const localDb = db.getLocalDb();
    if (!localDb.banners) localDb.banners = [];
    const newId = localDb.banners.length > 0 ? Math.max(...localDb.banners.map(b => b.id)) + 1 : 1;
    const newBanner = { id: newId, title: bannerData.title, imageUrl: bannerData.imageUrl, link: bannerData.link, active: true };
    localDb.banners.push(newBanner);
    db.saveLocalDb();
    return newBanner;
  },

  async deleteBanner(id) {
    const localDb = db.getLocalDb();
    localDb.banners = (localDb.banners || []).filter(b => b.id !== parseInt(id));
    db.saveLocalDb();
    return true;
  },

  // CMS Pages
  async getPages(storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('SELECT PageId as id, Title as title, Slug as slug, Content as content, IsPublished as isPublished, SeoTitle as seoTitle, SeoDescription as seoDescription, CreatedAt as createdAt FROM StorePages WHERE StoreId = @storeId');
      return res.recordset;
    } else {
      const localDb = db.getLocalDb();
      return (localDb.storePages || []).filter(p => p.storeId === storeId);
    }
  },

  async createPage(storeId, tenantId, data) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('tenantId', sql.Int, tenantId)
        .input('title', sql.NVarChar, data.title)
        .input('slug', sql.NVarChar, data.slug)
        .input('content', sql.NVarChar, data.content)
        .input('isPublished', sql.Bit, data.isPublished ? 1 : 0)
        .input('seoTitle', sql.NVarChar, data.seoTitle || null)
        .input('seoDescription', sql.NVarChar, data.seoDescription || null)
        .query(`
          INSERT INTO StorePages (StoreId, TenantId, Title, Slug, Content, IsPublished, SeoTitle, SeoDescription)
          OUTPUT INSERTED.PageId
          VALUES (@storeId, @tenantId, @title, @slug, @content, @isPublished, @seoTitle, @seoDescription)
        `);
      return res.recordset[0].PageId;
    } else {
      const localDb = db.getLocalDb();
      const newId = localDb.storePages.length > 0 ? Math.max(...localDb.storePages.map(p => p.id)) + 1 : 1;
      localDb.storePages.push({
        id: newId,
        storeId,
        tenantId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return newId;
    }
  },

  async updatePage(pageId, storeId, data) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('pageId', sql.Int, pageId)
        .input('storeId', sql.Int, storeId)
        .input('title', sql.NVarChar, data.title)
        .input('slug', sql.NVarChar, data.slug)
        .input('content', sql.NVarChar, data.content)
        .input('isPublished', sql.Bit, data.isPublished ? 1 : 0)
        .input('seoTitle', sql.NVarChar, data.seoTitle || null)
        .input('seoDescription', sql.NVarChar, data.seoDescription || null)
        .query(`
          UPDATE StorePages
          SET Title = @title, Slug = @slug, Content = @content, IsPublished = @isPublished, SeoTitle = @seoTitle, SeoDescription = @seoDescription
          WHERE PageId = @pageId AND StoreId = @storeId
        `);
    } else {
      const localDb = db.getLocalDb();
      const matched = localDb.storePages.find(p => p.id === parseInt(pageId) && p.storeId === storeId);
      if (matched) {
        matched.title = data.title;
        matched.slug = data.slug;
        matched.content = data.content;
        matched.isPublished = data.isPublished;
        matched.seoTitle = data.seoTitle;
        matched.seoDescription = data.seoDescription;
        db.saveLocalDb();
      }
    }
  },

  async deletePage(pageId, storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('pageId', sql.Int, pageId)
        .input('storeId', sql.Int, storeId)
        .query('DELETE FROM StorePages WHERE PageId = @pageId AND StoreId = @storeId');
    } else {
      const localDb = db.getLocalDb();
      localDb.storePages = localDb.storePages.filter(p => !(p.id === parseInt(pageId) && p.storeId === storeId));
      db.saveLocalDb();
    }
  },

  // Menus
  async getMenus(storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('SELECT MenuId as id, MenuKey as menuKey, Name as name, MenuItemsJson as menuItemsJson FROM NavigationMenus WHERE StoreId = @storeId');

      return res.recordset.map(r => ({
        id: r.id,
        menuKey: r.menuKey,
        name: r.name,
        menuItems: JSON.parse(r.menuItemsJson)
      }));
    } else {
      const localDb = db.getLocalDb();
      return (localDb.navigationMenus || [])
        .filter(m => m.storeId === storeId)
        .map(r => ({
          id: r.id,
          menuKey: r.menuKey,
          name: r.name,
          menuItems: JSON.parse(r.menuItemsJson)
        }));
    }
  },

  async updateMenu(storeId, tenantId, menuKey, name, menuItems) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const checkRes = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('menuKey', sql.NVarChar, menuKey)
        .query('SELECT MenuId FROM NavigationMenus WHERE StoreId = @storeId AND MenuKey = @menuKey');

      if (checkRes.recordset.length > 0) {
        await pool.request()
          .input('menuId', sql.Int, checkRes.recordset[0].MenuId)
          .input('name', sql.NVarChar, name)
          .input('items', sql.NVarChar, JSON.stringify(menuItems))
          .query('UPDATE NavigationMenus SET Name = @name, MenuItemsJson = @items WHERE MenuId = @menuId');
      } else {
        await pool.request()
          .input('storeId', sql.Int, storeId)
          .input('tenantId', sql.Int, tenantId)
          .input('menuKey', sql.NVarChar, menuKey)
          .input('name', sql.NVarChar, name)
          .input('items', sql.NVarChar, JSON.stringify(menuItems))
          .query('INSERT INTO NavigationMenus (StoreId, TenantId, MenuKey, Name, MenuItemsJson) VALUES (@storeId, @tenantId, @menuKey, @name, @items)');
      }
    } else {
      const localDb = db.getLocalDb();
      const matched = localDb.navigationMenus.find(m => m.storeId === storeId && m.menuKey === menuKey);
      if (matched) {
        matched.name = name;
        matched.menuItemsJson = JSON.stringify(menuItems);
      } else {
        localDb.navigationMenus.push({
          id: localDb.navigationMenus.length + 1,
          storeId,
          tenantId,
          menuKey,
          name,
          menuItemsJson: JSON.stringify(menuItems)
        });
      }
      db.saveLocalDb();
    }
  },

  // Media
  async getMedia(storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('SELECT MediaId as id, FileName as fileName, FileUrl as fileUrl, FileSize as fileSize, CreatedAt as createdAt FROM MediaLibrary WHERE StoreId = @storeId');
      return res.recordset;
    } else {
      const localDb = db.getLocalDb();
      return (localDb.mediaLibrary || []).filter(m => m.storeId === storeId);
    }
  },

  async addMedia(storeId, tenantId, fileData) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('tenantId', sql.Int, tenantId)
        .input('fileName', sql.NVarChar, fileData.fileName)
        .input('fileUrl', sql.NVarChar, fileData.fileUrl)
        .input('fileSize', sql.Int, fileData.fileSize)
        .query(`
          INSERT INTO MediaLibrary (StoreId, TenantId, FileName, FileUrl, FileSize)
          OUTPUT INSERTED.MediaId
          VALUES (@storeId, @tenantId, @fileName, @fileUrl, @fileSize)
        `);
      return res.recordset[0].MediaId;
    } else {
      const localDb = db.getLocalDb();
      const newId = localDb.mediaLibrary.length > 0 ? Math.max(...localDb.mediaLibrary.map(m => m.id)) + 1 : 1;
      localDb.mediaLibrary.push({
        id: newId,
        storeId,
        tenantId,
        fileName: fileData.fileName,
        fileUrl: fileData.fileUrl,
        fileSize: fileData.fileSize,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return newId;
    }
  },

  async deleteMedia(mediaId, storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('mediaId', sql.Int, mediaId)
        .input('storeId', sql.Int, storeId)
        .query('DELETE FROM MediaLibrary WHERE MediaId = @mediaId AND StoreId = @storeId');
    } else {
      const localDb = db.getLocalDb();
      localDb.mediaLibrary = localDb.mediaLibrary.filter(m => !(m.id === parseInt(mediaId) && m.storeId === storeId));
      db.saveLocalDb();
    }
  },

  // Blogs
  async getBlogPosts(storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .query('SELECT BlogPostId as id, Title as title, Slug as slug, Content as content, Category as category, FeaturedImageUrl as featuredImageUrl, IsPublished as isPublished, SeoTitle as seoTitle, SeoDescription as seoDescription, CreatedAt as createdAt FROM BlogPosts WHERE StoreId = @storeId');
      return res.recordset;
    } else {
      const localDb = db.getLocalDb();
      return (localDb.blogPosts || []).filter(b => b.storeId === storeId);
    }
  },

  async createBlogPost(storeId, tenantId, data) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      const res = await pool.request()
        .input('storeId', sql.Int, storeId)
        .input('tenantId', sql.Int, tenantId)
        .input('title', sql.NVarChar, data.title)
        .input('slug', sql.NVarChar, data.slug)
        .input('content', sql.NVarChar, data.content)
        .input('category', sql.NVarChar, data.category || 'News')
        .input('featuredImageUrl', sql.NVarChar, data.featuredImageUrl || null)
        .input('isPublished', sql.Bit, data.isPublished ? 1 : 0)
        .input('seoTitle', sql.NVarChar, data.seoTitle || null)
        .input('seoDescription', sql.NVarChar, data.seoDescription || null)
        .query(`
          INSERT INTO BlogPosts (StoreId, TenantId, Title, Slug, Content, Category, FeaturedImageUrl, IsPublished, SeoTitle, SeoDescription)
          OUTPUT INSERTED.BlogPostId
          VALUES (@storeId, @tenantId, @title, @slug, @content, @category, @featuredImageUrl, @isPublished, @seoTitle, @seoDescription)
        `);
      return res.recordset[0].BlogPostId;
    } else {
      const localDb = db.getLocalDb();
      const newId = localDb.blogPosts.length > 0 ? Math.max(...localDb.blogPosts.map(b => b.id)) + 1 : 1;
      localDb.blogPosts.push({
        id: newId,
        storeId,
        tenantId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        category: data.category || 'News',
        featuredImageUrl: data.featuredImageUrl,
        isPublished: data.isPublished,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return newId;
    }
  },

  async updateBlogPost(postId, storeId, data) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('postId', sql.Int, postId)
        .input('storeId', sql.Int, storeId)
        .input('title', sql.NVarChar, data.title)
        .input('slug', sql.NVarChar, data.slug)
        .input('content', sql.NVarChar, data.content)
        .input('category', sql.NVarChar, data.category || 'News')
        .input('featuredImageUrl', sql.NVarChar, data.featuredImageUrl || null)
        .input('isPublished', sql.Bit, data.isPublished ? 1 : 0)
        .input('seoTitle', sql.NVarChar, data.seoTitle || null)
        .input('seoDescription', sql.NVarChar, data.seoDescription || null)
        .query(`
          UPDATE BlogPosts
          SET Title = @title, Slug = @slug, Content = @content, Category = @category, FeaturedImageUrl = @featuredImageUrl, IsPublished = @isPublished, SeoTitle = @seoTitle, SeoDescription = @seoDescription
          WHERE BlogPostId = @postId AND StoreId = @storeId
        `);
    } else {
      const localDb = db.getLocalDb();
      const matched = localDb.blogPosts.find(b => b.id === parseInt(postId) && b.storeId === storeId);
      if (matched) {
        matched.title = data.title;
        matched.slug = data.slug;
        matched.content = data.content;
        matched.category = data.category || 'News';
        matched.featuredImageUrl = data.featuredImageUrl;
        matched.isPublished = data.isPublished;
        matched.seoTitle = data.seoTitle;
        matched.seoDescription = data.seoDescription;
        db.saveLocalDb();
      }
    }
  },

  async deleteBlogPost(postId, storeId) {
    const isSql = db.getUseSqlServer();
    if (isSql) {
      const pool = db.getPool();
      await pool.request()
        .input('postId', sql.Int, postId)
        .input('storeId', sql.Int, storeId)
        .query('DELETE FROM BlogPosts WHERE BlogPostId = @postId AND StoreId = @storeId');
    } else {
      const localDb = db.getLocalDb();
      localDb.blogPosts = localDb.blogPosts.filter(b => !(b.id === parseInt(postId) && b.storeId === storeId));
      db.saveLocalDb();
    }
  }
};

module.exports = cmsRepository;
