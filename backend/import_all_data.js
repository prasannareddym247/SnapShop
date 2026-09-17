const fs = require('fs');
const path = require('path');

const JSON_DB_PATH = path.join(__dirname, 'data', 'database_state.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

// Pre-computed password hashes for speed (from reset_data.js)
const SELLER_HASHES = {
  'computers@snapshop.com': '$2a$10$RqOEVXTFudrGgPqyc6Kek.qUYhTNaLFYF73OM2KqxneDgcZlIR2x.',
  'refrigerators@snapshop.com': '$2a$10$ffYeRqxoDfw.akHr2oFg6OhwWNBoGB4ri9sI16uFWeDOFSyCq9VxC',
  'furniture@snapshop.com': '$2a$10$IA04wfNHIVIT9PltTiyKH.rCrcKG0TZQN/7.omWrhWWKU5IZ21HEO',
  'kitchen@snapshop.com': '$2a$10$EjqiuwC58T8wSYF7LiRhbuucv5Y3Igjl99FG0fwLUGjoHiXZ72f1m',
  'speakers@snapshop.com': '$2a$10$gBhHfMh.eW6mqZ/4AZft0.xjjnF2H6OH/6176JGIqFqJf788ImjRy',
  'ac@snapshop.com': '$2a$10$etatY5gtBuZpmWK4BOCznuWUMbP9dNbJxY0Tp39xihqN8BSgDsEoe',
  'books@snapshop.com': '$2a$10$X1Mvg0UXbQGmiF2WYyYAcOcZZmVn05G1P7sZ9ozyEcU/q1WVW9wwS',
  'menfashion@snapshop.com': '$2a$10$E8O18pXvZKgKX1b.fGrGmO5eEhAbeDhMiut48b88VYAE8dwTZffQe',
  'womanfashion@snapshop.com': '$2a$10$6a.n6vdfIsL7Gn9Ech3oyO.PZO0xLfkTQ3mZsCSZUiXlNkkIjWTf.',
  'mobiles@snapshop.com': '$2a$10$kDvad5GrRs0478RlFoXQFOEmyAkeJOScH6mmUPjgAyrzREsEJAhE6',
  'television@snapshop.com': '$2a$10$9xjg.KphXsOf9CXtwwk5a.TmQraaHAdCp0SiFbpPaleADYfeqTZ0G',
  'watches@snapshop.com': '$2a$10$BAOAD7VKy1bDww2gUDf.Z.lkwIVZj0Yby0HPOPtMG5eijBcnSeX3W',
};

// Data file to category mapping
const DATA_FILE_MAP = {
  'ac.js':         { category: 'Air Conditioners', sellerEmail: 'ac@snapshop.com' },
  'books.js':      { category: 'Books',             sellerEmail: 'books@snapshop.com' },
  'computers.js':  { category: 'Computers',         sellerEmail: 'computers@snapshop.com' },
  'fridge.js':     { category: 'Refrigerators',     sellerEmail: 'refrigerators@snapshop.com' },
  'furniture.js':  { category: 'Furniture',         sellerEmail: 'furniture@snapshop.com' },
  'kitchen.js':    { category: 'Kitchen',           sellerEmail: 'kitchen@snapshop.com' },
  'men.js':        { category: 'Men Fashion',       sellerEmail: 'menfashion@snapshop.com' },
  'mobiles.js':    { category: 'Mobiles',           sellerEmail: 'mobiles@snapshop.com' },
  'speaker.js':    { category: 'Speakers',          sellerEmail: 'speakers@snapshop.com' },
  'tv.js':         { category: 'Television',        sellerEmail: 'television@snapshop.com' },
  'watch.js':      { category: 'Watches',           sellerEmail: 'watches@snapshop.com' },
  'woman.js':      { category: 'Woman Fashion',     sellerEmail: 'womanfashion@snapshop.com' },
};

function readDataFile(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`  FILE NOT FOUND: ${fileName}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const start = content.indexOf('[');
  const end = content.lastIndexOf(']');
  if (start === -1 || end === -1) {
    console.log(`  PARSE ERROR: ${fileName} - no array found`);
    return null;
  }
  try {
    return JSON.parse(content.substring(start, end + 1));
  } catch (e) {
    console.log(`  PARSE ERROR: ${fileName} - ${e.message}`);
    return null;
  }
}

function getProductName(item) {
  return item.product || item.title || (item.brand && item.model ? `${item.brand} ${item.model}` : item.name) || 'Unnamed Product';
}

function parseIdNumber(id) {
  const match = String(id).match(/(\d+)$/);
  return match ? parseInt(match[1]) : 1;
}

function main() {
  console.log('=== SnapShop Data Import ===\n');

  // Load existing DB
  let db = { users: [], categories: [], products: [], productVariants: [], productAttributes: [], addresses: [], orders: [], orderItems: [], payments: [], inventoryLogs: [], wishlists: [], reviews: [], coupons: [], returns: [], queries: [], notifications: [], discussions: [] };

  // Admin user
  db.users.push({
    id: 1,
    email: 'admin@snapshop.com',
    passwordHash: '$2a$10$5r0xM231Aw.pafmx1zoCFe3PRKcrP/G.OBIdnwldB1uMA3EL2GZEW',
    firstName: 'SnapShop',
    lastName: 'Admin',
    phone: '9876543210',
    role: 'Admin'
  });

  // Buyer user
  db.users.push({
    id: 52,
    email: 'buyer_auto@snapshop.com',
    passwordHash: '$2a$10$UwvqDS6i2uWonBB8qdggDuJelv04tbgiNSNK1I0ahC2MJOzEIGdG2',
    firstName: 'Auto',
    lastName: 'Buyer',
    phone: '9876543210',
    role: 'Customer'
  });

  let nextUserId = 53;
  let nextCatId = 1;
  let nextProdId = 1;
  let nextVarId = 1;

  const categoryIds = {};

  // Process each data file
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js'));

  for (const fileName of files) {
    const mapping = DATA_FILE_MAP[fileName];
    if (!mapping) {
      console.log(`SKIP ${fileName} (no mapping)`);
      continue;
    }

    const { category: catName, sellerEmail } = mapping;
    console.log(`\n--- ${fileName} -> ${catName} ---`);

    // Parse data file
    const items = readDataFile(fileName);
    if (!items || items.length === 0) {
      console.log(`  No items found`);
      continue;
    }
    console.log(`  ${items.length} products in file`);

    // Create category if needed
    if (!categoryIds[catName]) {
      const catId = nextCatId++;
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      db.categories.push({ id: catId, name: catName, slug: catSlug, description: `${catName} products` });
      categoryIds[catName] = catId;
      console.log(`  Created category: ${catName} (id: ${catId})`);
    }

    // Create seller if needed
    let seller = db.users.find(u => u.email === sellerEmail);
    if (!seller) {
      seller = {
        id: nextUserId++,
        email: sellerEmail,
        passwordHash: SELLER_HASHES[sellerEmail] || '$2a$10$dummy',
        firstName: catName,
        lastName: 'Seller',
        phone: '9876543210',
        role: 'Seller',
        gstin: '22AAAAA0000A1Z5',
        storeName: `${catName} Store`,
        storeDescription: `${catName} Seller Store`,
        sellerStatus: 'Pending',
        commissionRate: 10.0
      };
      db.users.push(seller);
      console.log(`  Created seller: ${sellerEmail} (id: ${seller.id}, status: Pending)`);
    } else {
      if (seller.sellerStatus !== 'Pending') {
        seller.sellerStatus = 'Pending';
        console.log(`  Updated seller ${sellerEmail} to Pending`);
      }
    }

    // Import products
    const catId = categoryIds[catName];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const productName = getProductName(item);
      const imageUrl = item.image || `/assets/${catName}/${i + 1}.jpg`;

      const newProd = {
        id: nextProdId++,
        categoryId: catId,
        vendorId: seller.id,
        name: productName,
        slug: item.slug || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: item.description || '',
        storageInstructions: item.storageInstructions || 'Store in cool dry place',
        status: 'Active',
        imageUrl: imageUrl,
        imagePrompt: item.imagePrompt || null,
        bullets: item.bullets || (item.specifications ? Object.values(item.specifications).join(', ') : [])
      };
      db.products.push(newProd);

      // Create default variant
      db.productVariants.push({
        id: nextVarId++,
        productId: newProd.id,
        weightGrams: 0,
        price: parseFloat(item.price) || 0,
        stock: 100,
        sku: `FK-${catId}-${newProd.id}`,
        expiryDate: '2027-06-30'
      });
    }
    console.log(`  Imported ${items.length} products`);
  }

  // Save DB
  const dir = path.dirname(JSON_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2), 'utf8');

  console.log('\n=== Import Complete ===');
  console.log(`  Categories: ${db.categories.length}`);
  console.log(`  Sellers: ${db.users.filter(u => u.role === 'Seller').length} (all Pending)`);
  console.log(`  Products: ${db.products.length}`);
  console.log(`  Variants: ${db.productVariants.length}`);
  console.log(`  Total users: ${db.users.length}`);
  console.log('\nAll sellers require admin approval before they can login and manage products.');
  console.log('Admin credentials: admin@snapshop.com / admin123');
}

main();
