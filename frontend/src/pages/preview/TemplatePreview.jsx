import React from 'react';
import AjioTemplate from '../../templates/fashion/ajio-inspired/Template';
import ZaraTemplate from '../../templates/fashion/zara-inspired/Template';
import NikeTemplate from '../../templates/fashion/nike-inspired/Template';
import BoutiqueTemplate from '../../templates/fashion/boutique-inspired/Template';
import StreetwearTemplate from '../../templates/fashion/streetwear-inspired/Template';
import NykaaTemplate from '../../templates/beauty/nykaa-inspired/Template';
import SephoraTemplate from '../../templates/beauty/sephora-inspired/Template';
import SkincareTemplate from '../../templates/beauty/skincare-inspired/Template';
import LuxuryBeautyTemplate from '../../templates/beauty/luxury-beauty-inspired/Template';
import MakeupTemplate from '../../templates/beauty/makeup-inspired/Template';
import AppleTemplate from '../../templates/electronics/apple-inspired/Template';
import SamsungTemplate from '../../templates/electronics/samsung-inspired/Template';
import AmazonTechTemplate from '../../templates/electronics/amazon-tech-inspired/Template';
import GamingTemplate from '../../templates/electronics/gaming-inspired/Template';
import GadgetsTemplate from '../../templates/electronics/gadgets-inspired/Template';
import BlinkitTemplate from '../../templates/grocery/blinkit-inspired/Template';
import BigbasketTemplate from '../../templates/grocery/bigbasket-inspired/Template';
import OrganicTemplate from '../../templates/grocery/organic-inspired/Template';
import SupermarketTemplate from '../../templates/grocery/supermarket-inspired/Template';
import DailyEssentialsTemplate from '../../templates/grocery/daily-essentials-inspired/Template';
import IkeaTemplate from '../../templates/home-living/ikea-inspired/Template';
import ModernTemplate from '../../templates/home-living/modern-inspired/Template';
import LuxuryTemplate from '../../templates/home-living/luxury-inspired/Template';
import WoodenTemplate from '../../templates/home-living/wooden-inspired/Template';
import DecorTemplate from '../../templates/home-living/decor-inspired/Template';
import NikePerformanceTemplate from '../../templates/sports/nike-performance-inspired/Template';
import AdidasTemplate from '../../templates/sports/adidas-inspired/Template';
import GymTemplate from '../../templates/sports/gym-inspired/Template';
import OutdoorTemplate from '../../templates/sports/outdoor-inspired/Template';
import EquipmentTemplate from '../../templates/sports/equipment-inspired/Template';
import SparePartsTemplate from '../../templates/automotive/spare-parts-inspired/Template';
import BikeTemplate from '../../templates/automotive/bike-inspired/Template';
import AccessoriesTemplate from '../../templates/automotive/accessories-inspired/Template';
import LuxuryAutoTemplate from '../../templates/automotive/luxury-auto-inspired/Template';
import GarageTemplate from '../../templates/automotive/garage-inspired/Template';

const TEMPLATE_COMPONENTS = {
  'ajio-inspired': AjioTemplate,
  'zara-inspired': ZaraTemplate,
  'nike-inspired': NikeTemplate,
  'boutique-inspired': BoutiqueTemplate,
  'streetwear-inspired': StreetwearTemplate,
  'nykaa-inspired': NykaaTemplate,
  'sephora-inspired': SephoraTemplate,
  'skincare-inspired': SkincareTemplate,
  'luxury-beauty-inspired': LuxuryBeautyTemplate,
  'makeup-inspired': MakeupTemplate,
  'apple-inspired': AppleTemplate,
  'samsung-inspired': SamsungTemplate,
  'amazon-tech-inspired': AmazonTechTemplate,
  'gaming-inspired': GamingTemplate,
  'gadgets-inspired': GadgetsTemplate,
  'blinkit-inspired': BlinkitTemplate,
  'bigbasket-inspired': BigbasketTemplate,
  'organic-inspired': OrganicTemplate,
  'supermarket-inspired': SupermarketTemplate,
  'daily-essentials-inspired': DailyEssentialsTemplate,
  'ikea-inspired': IkeaTemplate,
  'modern-inspired': ModernTemplate,
  'luxury-inspired': LuxuryTemplate,
  'wooden-inspired': WoodenTemplate,
  'decor-inspired': DecorTemplate,
  'nike-performance-inspired': NikePerformanceTemplate,
  'adidas-inspired': AdidasTemplate,
  'gym-inspired': GymTemplate,
  'outdoor-inspired': OutdoorTemplate,
  'equipment-inspired': EquipmentTemplate,
  'spare-parts-inspired': SparePartsTemplate,
  'bike-inspired': BikeTemplate,
  'accessories-inspired': AccessoriesTemplate,
  'luxury-auto-inspired': LuxuryAutoTemplate,
  'garage-inspired': GarageTemplate,
};

const TemplatePreview = ({ templateId, storeName, onBack }) => {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateId];
  if (!TemplateComponent) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>Template not found</h2>
        <p>The requested template "{templateId}" does not exist.</p>
        <button onClick={onBack} style={{ padding: '0.6rem 1.5rem', marginTop: '1rem', cursor: 'pointer' }}>Back to Templates</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#0f172a', color: '#fff', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <span>Template Preview — <strong>{storeName || templateId}</strong></span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>This is a demo preview. Sign up to use this template.</span>
          <button onClick={onBack} style={{ background: '#475569', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Close Preview</button>
        </div>
      </div>
      <div style={{ paddingTop: '40px' }}>
        <TemplateComponent />
      </div>
    </div>
  );
};

export default TemplatePreview;