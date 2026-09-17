const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'database_state.json');
const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'assets');
const DATA_DIR = path.join(__dirname, '..', 'data');

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

const errors = [];
const warnings = [];
const report = {
  totalCategories: db.categories.length,
  totalProducts: db.products.length,
  totalVariants: db.productVariants.length,
  totalUsers: db.users.length,
  sellers: { total: 0, pending: 0, approved: 0, suspended: 0 },
  categories: {},
  productsByStatus: {},
  imageIssues: 0,
  productErrors: 0,
  slugDuplicates: 0,
  idDuplicates: 0
};

// Analyze users
for (const u of db.users) {
  if (u.role === 'Seller') {
    report.sellers.total++;
    if (u.sellerStatus === 'Pending') report.sellers.pending++;
    else if (u.sellerStatus === 'Approved') report.sellers.approved++;
    else if (u.sellerStatus === 'Suspended') report.sellers.suspended++;
  }
}

// Analyze categories
for (const cat of db.categories) {
  const count = db.products.filter(p => p.categoryId === cat.id).length;
  report.categories[cat.name] = { id: cat.id, slug: cat.slug, productCount: count };
}

// Check for duplicate IDs
const idSet = new Set();
for (const p of db.products) {
  if (idSet.has(p.id)) { errors.push(`Duplicate product ID: ${p.id} (${p.name})`); report.idDuplicates++; }
  idSet.add(p.id);
}

// Check for duplicate slugs
const slugSet = new Set();
for (const p of db.products) {
  if (slugSet.has(p.slug)) { warnings.push(`Duplicate slug: ${p.slug} (${p.name})`); report.slugDuplicates++; }
  slugSet.add(p.slug);
}

// Analyze products
for (const p of db.products) {
  // Status
  report.productsByStatus[p.status] = (report.productsByStatus[p.status] || 0) + 1;

  // Check name
  if (!p.name || p.name.trim() === '') {
    errors.push(`Product ID ${p.id}: empty name`);
    report.productErrors++;
  }

  // Check category
  const cat = db.categories.find(c => c.id === p.categoryId);
  if (!cat) {
    errors.push(`Product ID ${p.id} (${p.name}): invalid categoryId ${p.categoryId}`);
    report.productErrors++;
  }

  // Check price via variant
  const variants = db.productVariants.filter(v => v.productId === p.id);
  if (variants.length === 0) {
    warnings.push(`Product ID ${p.id} (${p.name}): no variants`);
  } else {
    for (const v of variants) {
      if (isNaN(v.price) || v.price <= 0) {
        errors.push(`Product ID ${p.id} (${p.name}): invalid variant price ${v.price}`);
        report.productErrors++;
      }
      if (v.stock < 0) {
        warnings.push(`Product ID ${p.id} (${p.name}): negative stock ${v.stock}`);
      }
    }
  }

  // Check image URL
  if (p.imageUrl) {
    // Check if image file exists
    const imgMatch = p.imageUrl.match(/\/assets\/(.+?)\/(.+)$/);
    if (imgMatch) {
      const folder = imgMatch[1];
      const filename = imgMatch[2];
      const imgPath = path.join(ASSETS_DIR, folder, filename);
      if (!fs.existsSync(imgPath)) {
        // Try alternate extensions
        const basePath = path.join(ASSETS_DIR, folder);
        const nameParts = filename.split('.');
        const baseName = nameParts[0];
        let found = false;
        if (fs.existsSync(basePath)) {
          const files = fs.readdirSync(basePath);
          for (const f of files) {
            if (f.startsWith(baseName + '.')) { found = true; break; }
          }
        }
        if (!found) {
          warnings.push(`Product ID ${p.id} (${p.name}): image not found at ${p.imageUrl}`);
          report.imageIssues++;
        }
      }
    }
  } else {
    warnings.push(`Product ID ${p.id} (${p.name}): no imageUrl`);
    report.imageIssues++;
  }

  // Check vendor
  const vendor = db.users.find(u => u.id === p.vendorId);
  if (!vendor) {
    errors.push(`Product ID ${p.id} (${p.name}): vendorId ${p.vendorId} not found`);
    report.productErrors++;
  }
}

// Summary
console.log('=== Product Validation Report ===\n');
console.log(`Categories: ${report.totalCategories}`);
console.log(`Products: ${report.totalProducts}`);
console.log(`Variants: ${report.totalVariants}`);
console.log(`Users: ${report.totalUsers} (${report.sellers.total} sellers: ${report.sellers.pending} pending, ${report.sellers.approved} approved, ${report.sellers.suspended} suspended)`);
console.log(`\nProducts by status: ${JSON.stringify(report.productsByStatus)}`);
console.log(`\nImage issues: ${report.imageIssues}`);
console.log(`ID duplicates: ${report.idDuplicates}`);
console.log(`Slug duplicates: ${report.slugDuplicates}`);
console.log(`Product errors: ${report.productErrors}`);

console.log('\n--- Categories ---');
for (const [name, info] of Object.entries(report.categories)) {
  console.log(`  ${name} (id=${info.id}): ${info.productCount} products`);
}

if (errors.length > 0) {
  console.log(`\n--- ERRORS (${errors.length}) ---`);
  errors.forEach(e => console.log(`  ✗ ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n--- WARNINGS (${warnings.length}) ---`);
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

console.log('\n=== Validation Complete ===');
