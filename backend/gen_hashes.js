const bcrypt = require('bcryptjs');
const passwords = [
  ['computers@snapshop.com', 'computers@247'],
  ['refrigerators@snapshop.com', 'refrigerators@247'],
  ['furniture@snapshop.com', 'furniture@247'],
  ['kitchen@snapshop.com', 'kitchen@247'],
  ['speakers@snapshop.com', 'speakers@247'],
  ['ac@snapshop.com', 'ac@247'],
  ['books@snapshop.com', 'books@247'],
  ['menfashion@snapshop.com', 'menfashion@247'],
  ['womanfashion@snapshop.com', 'womanfashion@247'],
  ['groceries@snapshop.com', 'groceries@247'],
  ['mobiles@snapshop.com', 'mobiles@247'],
  ['television@snapshop.com', 'television@247'],
  ['watches@snapshop.com', 'watches@247'],
];
(async () => {
  for (const [email, pw] of passwords) {
    const hash = await bcrypt.hash(pw, 10);
    console.log(`  '${email}': '${hash}',`);
  }
})();
