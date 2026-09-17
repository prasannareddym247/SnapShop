const aiService = require('../services/aiService');

const aiController = {
  async generateImage(req, res) {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const result = await aiService.generateImage(prompt);
      return res.json(result);
    } catch (err) {
      console.error('AI image generation controller error:', err);
      res.status(500).json({ 
        error: 'Image generation failed', 
        message: err.message 
      });
    }
  },

  async generateContent(req, res) {
    try {
      const { name, category } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }

      const result = await aiService.generateContent(name, category);
      return res.json(result);
    } catch (err) {
      console.error('AI content generation controller error:', err);
      res.status(500).json({ 
        error: 'Content generation failed', 
        message: err.message 
      });
    }
  }
};

module.exports = aiController;
