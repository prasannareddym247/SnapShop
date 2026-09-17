import React, { useState } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import api from '../../services/api';
import { buildProductMockupDataUrl, getCategoryFallbackImage } from '../../features/catalog/productHelpers';
import useToast from '../../hooks/useToast';

const GeneratorPage = ({ onApplyToForm, onProductAdded }) => {
  const { token } = useAuth();
  const showToast = useToast();

  const [generatorForm, setGeneratorForm] = useState({ name: '', category: 'Grains' });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const generateGeminiImage = async (prompt) => {
    setGeneratingImage(true);
    try {
      const data = await api.post('/ai/generate-image', { prompt });
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
      showToast('No image returned from AI. Using preview.', 'error');
      return buildProductMockupDataUrl(generatorForm.name || 'Product', generatorForm.category);
    } catch (err) {
      console.error('AI image generation error:', err);
      showToast('AI image generation failed. Using preview.', 'error');
      return buildProductMockupDataUrl(generatorForm.name || 'Product', generatorForm.category);
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateProductContent = async () => {
    if (!generatorForm.name) {
      alert('Please enter a product name first.');
      return;
    }
    
    setGeneratingContent(true);
    setGeneratedImageUrl(null);
    try {
      const data = await api.post('/ai/generate-content', {
        name: generatorForm.name,
        category: generatorForm.category
      });
      
      if (data.success && data.content) {
        setGeneratedContent(data.content);
        showToast('Product content generated successfully!', 'success');
        
        // Auto-generate image if imagePrompt is available
        if (data.content.imagePrompt) {
          showToast('Generating product image...', 'info');
          const imageUrl = await generateGeminiImage(data.content.imagePrompt);
          if (imageUrl) {
            setGeneratedImageUrl(imageUrl);
            showToast('Product image generated!', 'success');
          }
        }
      } else {
        showToast('Failed to generate content', 'error');
      }
    } catch (err) {
      console.error('Content generation error:', err);
      showToast('Error generating content. Please try again.', 'error');
    } finally {
      setGeneratingContent(false);
    }
  };

  const useGeneratedContent = () => {
    if (!generatedContent) return;
    if (onApplyToForm) {
      onApplyToForm({
        name: generatedContent.name || generatorForm.name,
        category: generatorForm.category,
        description: generatedContent.description,
        storageInstructions: generatedContent.storageInstructions,
        imagePrompt: generatedContent.imagePrompt,
        bullets: generatedContent.bullets || [],
        imageUrl: generatedImageUrl
      });
    }
    showToast('Content applied to product form!', 'success');
  };

  const addProductWithGeneratedContent = () => {
    useGeneratedContent();
  };

  return (
    <div className="animated-view" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>✨ AI Content Generator</h2>
        <p style={{ color: 'var(--text-muted)' }}>Generate product descriptions, key features, and storage guidelines using AI</p>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
        <div className="form-group">
          <label style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Product Name</label>
          <input 
            className="form-input" 
            type="text" 
            placeholder="e.g., Organic Basmati Rice, Premium Cashews..."
            value={generatorForm.name}
            onChange={e => setGeneratorForm({ ...generatorForm, name: e.target.value })}
            style={{ fontSize: '1rem', padding: '0.75rem' }}
          />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Category</label>
          <select 
            className="form-input"
            value={generatorForm.category}
            onChange={e => setGeneratorForm({ ...generatorForm, category: e.target.value })}
            style={{ fontSize: '1rem', padding: '0.75rem' }}
          >
            <option value="Grains">Grains</option>
            <option value="Dry Fruits">Dry Fruits</option>
            <option value="Spices">Spices</option>
          </select>
        </div>

        <button 
          className="auth-btn" 
          onClick={generateProductContent}
          disabled={generatingContent || !generatorForm.name}
          style={{ 
            width: '100%', 
            marginTop: '1rem',
            opacity: (generatingContent || !generatorForm.name) ? 0.6 : 1,
            cursor: (generatingContent || !generatorForm.name) ? 'not-allowed' : 'pointer'
          }}
        >
          {generatingContent ? '⏳ Generating Content...' : '✨ Generate Product Content'}
        </button>
      </div>

      {generatedContent && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: '2px solid var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Generated Content</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="auth-btn" onClick={useGeneratedContent} style={{ width: 'auto', padding: '0.75rem 1.5rem', background: 'var(--primary)' }}>
                ✓ Use in Form
              </button>
              <button 
                className="auth-btn" 
                onClick={addProductWithGeneratedContent}
                disabled={generatingImage}
                style={{ 
                  width: 'auto', 
                  padding: '0.75rem 1.5rem', 
                  background: generatingImage ? 'var(--border)' : '#059669',
                  cursor: generatingImage ? 'not-allowed' : 'pointer',
                  opacity: generatingImage ? 0.6 : 1
                }}
              >
                {generatingImage ? '⏳ Generating Image...' : '+ Add Product'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Product Name:</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              {generatedContent.name}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Description:</h4>
            <p style={{ lineHeight: 1.6, color: 'var(--text-dark)', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
              {generatedContent.description}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Key Features:</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {generatedContent.bullets && generatedContent.bullets.map((bullet, idx) => (
                <li key={idx} style={{ 
                  padding: '0.75rem', 
                  background: '#f8fafc', 
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.5rem',
                  borderLeft: '4px solid var(--primary-light)'
                }}>
                  ✓ {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Storage Instructions:</h4>
            <p style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontStyle: 'italic' }}>
              {generatedContent.storageInstructions}
            </p>
          </div>

          {generatedContent.imagePrompt && (
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>AI Image Prompt:</h4>
              <p style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {generatedContent.imagePrompt}
              </p>
            </div>
          )}
          
          {generatedImageUrl && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Generated Product Image:</h4>
              <div style={{ 
                width: '200px', 
                height: '200px', 
                borderRadius: 'var(--radius-sm)', 
                overflow: 'hidden',
                border: '2px solid var(--primary-light)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <img 
                  src={generatedImageUrl} 
                  alt="AI Generated Product" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!generatedContent && !generatingContent && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'white', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ fontSize: '1.1rem' }}>Enter a product name and click "Generate Product Content" to get started</p>
        </div>
      )}
    </div>
  );
};

export default GeneratorPage;
