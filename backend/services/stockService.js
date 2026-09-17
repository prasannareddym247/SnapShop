const db = require('../config/db');

const stockService = {
  async verifyAndDeductStockSqlServer(transaction, items) {
    // 1. Lock and verify stock for all items
    for (let item of items) {
      const stockRes = await transaction.request()
        .input('variantId', db.sql.Int, item.variantId)
        .query(`
          SELECT pv.Stock, pv.Sku, p.Status 
          FROM ProductVariants pv WITH (UPDLOCK, ROWLOCK)
          JOIN Products p ON pv.ProductId = p.ProductId
          WHERE pv.VariantId = @variantId
        `);
      
      if (stockRes.recordset.length === 0) {
        throw new Error(`Variant ${item.variantId} not found.`);
      }
      
      if (stockRes.recordset[0].Status === 'Inactive') {
        throw new Error(`Product for SKU ${stockRes.recordset[0].Sku} is currently inactive and out of stock.`);
      }
      
      const currentStock = stockRes.recordset[0].Stock;
      if (currentStock < item.quantity) {
        throw new Error(`Insufficient stock for SKU ${stockRes.recordset[0].Sku}. Requested: ${item.quantity}, Available: ${currentStock}`);
      }
    }
    
    // 2. Deduct stock and write inventory logs
    for (let item of items) {
      await transaction.request()
        .input('variantId', db.sql.Int, item.variantId)
        .input('qty', db.sql.Int, item.quantity)
        .query('UPDATE ProductVariants SET Stock = Stock - @qty WHERE VariantId = @variantId');
        
      await transaction.request()
        .input('variantId', db.sql.Int, item.variantId)
        .input('qty', db.sql.Int, item.quantity)
        .query("INSERT INTO InventoryLogs (VariantId, ChangeQuantity, Reason) VALUES (@variantId, -@qty, 'Order sale deduction')");
    }
  },

  async verifyAndDeductStockLocal(items) {
    const localDb = db.getLocalDb();
    
    // Verify
    for (let item of items) {
      const v = localDb.productVariants.find(pv => pv.id === parseInt(item.variantId));
      if (!v) throw new Error(`Variant ${item.variantId} not found.`);
      
      const p = localDb.products.find(prod => prod.id === v.productId);
      if (p && p.status === 'Inactive') {
        throw new Error(`Product for SKU ${v.sku} is currently inactive and out of stock.`);
      }
      
      if (v.stock < item.quantity) {
        throw new Error(`Insufficient stock for SKU ${v.sku}. Available: ${v.stock}`);
      }
    }
    
    // Deduct
    items.forEach(item => {
      const v = localDb.productVariants.find(pv => pv.id === parseInt(item.variantId));
      v.stock -= item.quantity;
      localDb.inventoryLogs.push({
        id: localDb.inventoryLogs.length + 1,
        variantId: v.id,
        changeQuantity: -item.quantity,
        reason: 'Order sale deduction',
        createdAt: new Date().toISOString()
      });
    });
    db.saveLocalDb();
  }
};

module.exports = stockService;
