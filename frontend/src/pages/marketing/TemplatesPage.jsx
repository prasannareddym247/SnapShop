import React, { useState } from 'react';
import '../../layouts/marketing.css';

const TEMPLATES = [
  // Fashion
  { id: 'ajio-inspired', title: 'Ajio Style (StyleBazaar)', category: 'Fashion', desc: 'Bold fashion layouts for the modern Indian wardrobe.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80' },
  { id: 'zara-inspired', title: 'Zara Mode', category: 'Fashion', desc: 'High fashion minimalism with clean designer grids.', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80' },
  { id: 'nike-inspired', title: 'Sports Performance', category: 'Sports', desc: 'Bold, energetic sportswear storefront with premium athletic aesthetics.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { id: 'boutique-inspired', title: 'Maison de Beaute', category: 'Fashion', desc: 'Luxury beauty storefront with editorial elegance, gold accents, circular categories, brand strip, limited edition badges, and sophisticated product showcases.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80' },
  { id: 'streetwear-inspired', title: 'UrbanHype Streetwear', category: 'Fashion', desc: 'Bold streetwear storefront with dark aesthetics, vibrant accents, and limited-edition drop culture.', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80' },

  // Beauty
  { id: 'nykaa-inspired', title: 'Glamour Nykaa', category: 'Beauty', desc: 'Premium beauty storefront with modern elegant design, soft rose palette, and seamless shopping experience.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80' },
  { id: 'sephora-inspired', title: 'Beauty Luxe', category: 'Beauty', desc: 'Premium beauty & cosmetics storefront with editorial elegance and luxurious shopping experience.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80' },
  { id: 'skincare-inspired', title: 'Pure SkinGlow', category: 'Beauty', desc: 'Clean natural skincare template with sage green palette, circular category grid, ingredient spotlight, shop by concern, routine builder, before & after gallery, and full cart system.', image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=80' },
  { id: 'luxury-beauty-inspired', title: 'Maison de Beaute', category: 'Beauty', desc: 'Gold-infused rejuvenators and premium custom cosmetics.', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80' },
  { id: 'makeup-inspired', title: 'ColorStudio Pro', category: 'Beauty', desc: 'High-pigmented professional palettes and makeup tools.', image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=600&auto=format&fit=crop&q=80' },

  // Electronics
  { id: 'apple-inspired', title: 'iTech Minimal', category: 'Electronics', desc: 'Sleek tech hardware presentation and clean specs tables.', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80' },
  { id: 'samsung-inspired', title: 'Galaxy Universe', category: 'Electronics', desc: 'Folding screen mobiles and smart home utilities.', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80' },
  { id: 'amazon-tech-inspired', title: 'MegaTech Shop', category: 'Electronics', desc: 'Heavy inventory cables, routers, and accessories grids.', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80' },
  { id: 'gaming-inspired', title: 'Nexus Gaming Center', category: 'Electronics', desc: 'Ultimate RGB gear and PC building components catalogs.', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80' },
  { id: 'gadgets-inspired', title: 'GizmoHub Gadgets', category: 'Electronics', desc: 'Smart self-watering pots and futuristic digital devices.', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80' },

  // Grocery
  { id: 'blinkit-inspired', title: 'BlinkCart Quick', category: 'Grocery', desc: 'Instant 10-minute breakfast and pantry delivery.', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
  { id: 'bigbasket-inspired', title: 'BasketFresh Value', category: 'Grocery', desc: 'Bulk monthly pantry supply and fresh saving grids.', image: 'https://images.unsplash.com/photo-1506617424412-38b3c993d66a?w=600&auto=format&fit=crop&q=80' },
  { id: 'organic-inspired', title: 'NatureOrganics', category: 'Grocery', desc: '100% certified pesticide-free farm organic food.', image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80' },
  { id: 'supermarket-inspired', title: 'MegaSupermarket', category: 'Grocery', desc: 'Family soft drinks and bulk household detergents.', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80' },
  { id: 'daily-essentials-inspired', title: 'DailyPantry Staples', category: 'Grocery', desc: 'Subscription milk, eggs, paneer, and breakfast bread.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80' },

  // Home & Living
  { id: 'ikea-inspired', title: 'Flatpack IKEA Style', category: 'Home & Living', desc: 'Affordable modular work desks and flatpack beds.', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80' },
  { id: 'modern-inspired', title: 'ModFurniture Design', category: 'Home & Living', desc: 'Contemporary fabric sofas and marble coffee tables.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80' },
  { id: 'luxury-inspired', title: 'LuxeInterior Casa', category: 'Home & Living', desc: 'Italian velvet couches and crystal chandelier highlights.', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80' },
  { id: 'wooden-inspired', title: 'TimberCraft Rustic', category: 'Home & Living', desc: 'Teak wood dining tables and oak bookshelves.', image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80' },
  { id: 'decor-inspired', title: 'DecoSphere Accents', category: 'Home & Living', desc: 'Wall macrame tapestries and geometric vases.', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80' },

  // Sports
  { id: 'nike-performance-inspired', title: 'Swoosh Pro Athletes', category: 'Sports', desc: 'Marathon shoes and lightweight running singlet vests.', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80' },
  { id: 'adidas-inspired', title: 'ThreeStripes Club', category: 'Sports', desc: 'Vintage suede sneakers and striped gym duffels.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { id: 'gym-inspired', title: 'IronGrip Gym Gear', category: 'Sports', desc: 'Cast iron weights, power racks, and barbell shafts.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { id: 'outdoor-inspired', title: 'PeakExplorer Outdoors', category: 'Sports', desc: 'Waterproof hiking boots and 4-person camping tents.', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80' },
  { id: 'equipment-inspired', title: 'SportSphere Equipment', category: 'Sports', desc: 'Match footballs, cricket bats, and volleyball nets.', image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80' },

  // Automotive
  { id: 'spare-parts-inspired', title: 'AutoEngine Parts', category: 'Automotive', desc: 'OEM engine spark plugs and carbon disc brake rotors.', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80' },
  { id: 'bike-inspired', title: 'MotoGear Rider', category: 'Automotive', desc: 'DOT riding helmets and carbon knuckle leather gloves.', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80' },
  { id: 'accessories-inspired', title: 'CarDecor Interiors', category: 'Automotive', desc: 'Premium dashboard seat covers and ambient lights.', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80' },
  { id: 'luxury-auto-inspired', title: 'EliteDetail Auto', category: 'Automotive', desc: 'Ceramic car shampoo and vinyl wrap wax solutions.', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80' },
  { id: 'garage-inspired', title: 'GarageTool Pro', category: 'Automotive', desc: 'Hydraulic jacks and vanadium socket wrench sets.', image: 'https://images.unsplash.com/photo-1530047139112-25e9c7d7e738?w=600&auto=format&fit=crop&q=80' }
];

const CATEGORIES = ['All', 'Fashion', 'Beauty', 'Electronics', 'Grocery', 'Home & Living', 'Sports', 'Automotive'];

const TemplatesPage = ({ setView }) => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredTemplates = activeTab === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeTab);

  const handlePreview = (templateId) => {
    setView('template-preview');
    window.location.hash = `template-preview?template=${templateId}`;
  };

  return (
    <div className="marketing-container" style={{ padding: '6rem 1.5rem', animation: 'fadeInUp 0.6s ease-out' }}>
      <p className="section-tagline">STUNNING READY-TO-USE THEMES</p>
      <h1 className="section-main-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Templates optimized for every business</h1>
      <p style={{ textAlign: 'center', color: 'var(--saas-text-muted)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
        Select a premium design matching your industry. Our previews are fully interactive and integrated with our multi-tenant catalog.
      </p>

      {/* Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '2rem',
              border: activeTab === cat ? 'none' : '1px solid var(--saas-border)',
              background: activeTab === cat ? 'var(--saas-primary)' : 'transparent',
              color: activeTab === cat ? '#ffffff' : 'var(--saas-text)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="templates-grid">
        {filteredTemplates.map((tmpl) => (
          <div key={tmpl.id} className="template-card" style={{ transition: 'all 0.3s' }}>
            <div className="template-image" style={{ backgroundImage: `url('${tmpl.image}')`, height: '240px' }}>
              <div className="template-overlay">
                <button className="m-btn m-btn-primary" onClick={() => handlePreview(tmpl.id)}>
                  Preview
                </button>
              </div>
            </div>
            <div className="template-body">
              <span className="template-category">{tmpl.category}</span>
              <h3 className="template-title" style={{ margin: '0.25rem 0 0.5rem' }}>{tmpl.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)', marginBottom: '1.25rem', minHeight: '40px' }}>{tmpl.desc}</p>
              <button 
                className="m-btn m-btn-outline" 
                onClick={() => handlePreview(tmpl.id)}
                style={{ width: '100%' }}
              >
                Preview Demo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;
export { TEMPLATES };
