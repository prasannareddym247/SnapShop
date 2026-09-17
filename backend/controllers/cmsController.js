const cmsRepository = require('../repositories/cmsRepository');

const cmsController = {
  // CMS Pages
  async getPages(req, res) {
    try {
      const storeId = req.storeId;
      const pages = await cmsRepository.getPages(storeId);
      res.json(pages);
    } catch (err) {
      console.error('Failed to get pages:', err);
      res.status(500).json({ error: 'Failed to fetch pages list' });
    }
  },

  async createPage(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const pageId = await cmsRepository.createPage(storeId, tenantId, req.body);
      res.json({ message: 'CMS Page created successfully', pageId });
    } catch (err) {
      console.error('Failed to create page:', err);
      res.status(500).json({ error: 'Failed to create page' });
    }
  },

  async updatePage(req, res) {
    try {
      const storeId = req.storeId;
      const { id } = req.params;
      await cmsRepository.updatePage(id, storeId, req.body);
      res.json({ message: 'CMS Page updated successfully' });
    } catch (err) {
      console.error('Failed to update page:', err);
      res.status(500).json({ error: 'Failed to update page details' });
    }
  },

  async deletePage(req, res) {
    try {
      const storeId = req.storeId;
      const { id } = req.params;
      await cmsRepository.deletePage(id, storeId);
      res.json({ message: 'CMS Page deleted successfully' });
    } catch (err) {
      console.error('Failed to delete page:', err);
      res.status(500).json({ error: 'Failed to delete page' });
    }
  },

  // Menus
  async getMenus(req, res) {
    try {
      const storeId = req.storeId;
      const menus = await cmsRepository.getMenus(storeId);
      res.json(menus);
    } catch (err) {
      console.error('Failed to get menus:', err);
      res.status(500).json({ error: 'Failed to fetch menus' });
    }
  },

  async updateMenu(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const { menuKey, name, menuItems } = req.body;
      await cmsRepository.updateMenu(storeId, tenantId, menuKey, name, menuItems);
      res.json({ message: 'Navigation menu items updated successfully' });
    } catch (err) {
      console.error('Failed to update menu:', err);
      res.status(500).json({ error: 'Failed to save menu configuration' });
    }
  },

  // Media Library
  async getMedia(req, res) {
    try {
      const storeId = req.storeId;
      const media = await cmsRepository.getMedia(storeId);
      res.json(media);
    } catch (err) {
      console.error('Failed to fetch media assets:', err);
      res.status(500).json({ error: 'Failed to get media list' });
    }
  },

  async addMedia(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      
      const fileData = {
        fileName: req.body.fileName || 'media_asset.png',
        fileUrl: req.body.fileUrl || `/assets/groceesary/${Math.floor(Math.random() * 8) + 1}.png`,
        fileSize: req.body.fileSize || 102400
      };

      const mediaId = await cmsRepository.addMedia(storeId, tenantId, fileData);
      res.json({ message: 'Asset added to catalog library', mediaId, ...fileData });
    } catch (err) {
      console.error('Failed to add media file:', err);
      res.status(500).json({ error: 'Upload simulation failed' });
    }
  },

  async deleteMedia(req, res) {
    try {
      const storeId = req.storeId;
      const { id } = req.params;
      await cmsRepository.deleteMedia(id, storeId);
      res.json({ message: 'Media file asset deleted successfully' });
    } catch (err) {
      console.error('Failed to delete media asset:', err);
      res.status(500).json({ error: 'Delete asset failed' });
    }
  },

  // Blog Posts
  async getBlogPosts(req, res) {
    try {
      const storeId = req.storeId;
      const posts = await cmsRepository.getBlogPosts(storeId);
      res.json(posts);
    } catch (err) {
      console.error('Failed to get blog posts list:', err);
      res.status(500).json({ error: 'Failed to get posts' });
    }
  },

  async createBlogPost(req, res) {
    try {
      const storeId = req.storeId;
      const tenantId = req.tenantId;
      const postId = await cmsRepository.createBlogPost(storeId, tenantId, req.body);
      res.json({ message: 'Blog post published successfully', postId });
    } catch (err) {
      console.error('Failed to create blog post:', err);
      res.status(500).json({ error: 'Failed to create blog article' });
    }
  },

  async updateBlogPost(req, res) {
    try {
      const storeId = req.storeId;
      const { id } = req.params;
      await cmsRepository.updateBlogPost(id, storeId, req.body);
      res.json({ message: 'Blog post details updated' });
    } catch (err) {
      console.error('Failed to update blog post:', err);
      res.status(500).json({ error: 'Failed to update article details' });
    }
  },

  async deleteBlogPost(req, res) {
    try {
      const storeId = req.storeId;
      const { id } = req.params;
      await cmsRepository.deleteBlogPost(id, storeId);
      res.json({ message: 'Blog post article deleted successfully' });
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  }
};

module.exports = cmsController;
