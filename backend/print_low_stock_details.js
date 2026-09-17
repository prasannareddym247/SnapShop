const db = require('./config/db');
const productRepository = require('./repositories/productRepository');

async function run() {
  try {
    await db.initDatabase();
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // We assume tenantId = 1 or whatever is active
    const products = await productRepository.getProducts(1);
    console.log('Total products retrieved for tenant 1:', products.length);
    
    const lowStockAlerts = [];
    products.forEach(p => {
      console.log(`Product: "${p.name}", VendorId: ${p.vendorId}, Status: "${p.status}"`);
      if (p.variants) {
        p.variants.forEach(v => {
          console.log(`  - Variant SKU: "${v.sku}", Stock: ${v.stock} (type: ${typeof v.stock})`);
          if (v.stock <= 10) {
            lowStockAlerts.push({
              productName: p.name,
              sku: v.sku,
              stock: v.stock
            });
          }
        });
      }
    });

    console.log('Low Stock Alerts output:', lowStockAlerts);

  } catch (err) {
    console.error(err);
  }
}

run();
