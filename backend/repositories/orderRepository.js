const db = require('../config/db');

const orderRepository = {
  async createOrder(userId, orderData, items, tenantId = 1, storeId = 1, paymentMethod = 'COD') {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const isOnlinePayment = paymentMethod && paymentMethod !== 'COD';
    const initialStatus = isOnlinePayment ? 'Pending' : 'Paid';
    const initialPayStatus = isOnlinePayment ? 'Unpaid' : 'Paid';
    const initialPaymentStatus = isOnlinePayment ? 'Pending' : 'Captured';

    const txnId = 'pay_' + Math.random().toString(36).substring(2, 11);

    if (useSqlServer) {
      const transaction = new db.sql.Transaction(pool);
      try {
        await transaction.begin();
        
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
          
          if (stockRes.recordset[0].Status !== 'Active') {
            throw new Error(`Product for SKU ${stockRes.recordset[0].Sku} is not active or available.`);
          }
          
          const currentStock = stockRes.recordset[0].Stock;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for SKU ${stockRes.recordset[0].Sku}. Requested: ${item.quantity}, Available: ${currentStock}`);
          }
        }
        
        // 2. Deduct stock and write order records
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
        
        // 3. Create main Order record
        const orderRes = await transaction.request()
          .input('userId', db.sql.Int, userId)
          .input('status', db.sql.NVarChar, initialStatus)
          .input('payStatus', db.sql.NVarChar, initialPayStatus)
          .input('total', db.sql.Decimal(10,2), orderData.totalAmount)
          .input('tax', db.sql.Decimal(10,2), orderData.taxAmount)
          .input('shipping', db.sql.Decimal(10,2), orderData.shippingAmount)
          .input('tenantId', db.sql.Int, tenantId)
          .input('storeId', db.sql.Int, storeId)
          .input('note', db.sql.NVarChar, orderData.shippingAddress ? JSON.stringify(orderData.shippingAddress) : null)
          .query(`
            INSERT INTO Orders (UserId, OrderStatus, TotalAmount, TaxAmount, ShippingAmount, PaymentStatus, TenantId, StoreId, Notes)
            OUTPUT INSERTED.OrderId
            VALUES (@userId, @status, @total, @tax, @shipping, @payStatus, @tenantId, @storeId, @note)
          `);
        const orderId = orderRes.recordset[0].OrderId;
        
        // 4. Create OrderItems
        for (let item of items) {
          await transaction.request()
            .input('orderId', db.sql.Int, orderId)
            .input('variantId', db.sql.Int, item.variantId)
            .input('qty', db.sql.Int, item.quantity)
            .input('price', db.sql.Decimal(10,2), item.unitPrice)
            .input('tax', db.sql.Decimal(10,2), item.taxAmount)
            .query(`
              INSERT INTO OrderItems (OrderId, VariantId, Quantity, UnitPrice, TaxAmount)
              VALUES (@orderId, @variantId, @qty, @price, @tax)
            `);
        }
        
        // 5. Create Payment record
        await transaction.request()
          .input('orderId', db.sql.Int, orderId)
          .input('gateway', db.sql.NVarChar, paymentMethod || 'COD')
          .input('amount', db.sql.Decimal(10,2), orderData.totalAmount)
          .input('payStatus', db.sql.NVarChar, initialPaymentStatus)
          .input('txnId', db.sql.NVarChar, txnId)
          .query(`
            INSERT INTO Payments (OrderId, GatewayName, TransactionId, Amount, PaymentStatus)
            VALUES (@orderId, @gateway, @txnId, @amount, @payStatus)
          `);
          
        await transaction.commit();
        return orderId;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } else {
      // JSON locking check (simplified)
      for (let item of items) {
        const v = localDb.productVariants.find(pv => pv.id === parseInt(item.variantId));
        if (!v) throw new Error('Variant not found.');
        
        const p = localDb.products.find(prod => prod.id === v.productId);
        if (p && p.status !== 'Active') {
          throw new Error(`Product for SKU ${v.sku} is not active or available.`);
        }
        
        if (v.stock < item.quantity) {
          throw new Error(`Insufficient stock for SKU ${v.sku}. Available: ${v.stock}`);
        }
      }
      
      // Deduct stock
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
      
      const newOrderId = localDb.orders.length > 0 ? Math.max(...localDb.orders.map(o => o.id)) + 1 : 1;
      const newOrder = {
        id: newOrderId,
        userId: parseInt(userId),
        tenantId: parseInt(tenantId),
        storeId: parseInt(storeId),
        orderStatus: initialStatus,
        totalAmount: parseFloat(orderData.totalAmount),
        taxAmount: parseFloat(orderData.taxAmount),
        shippingAmount: parseFloat(orderData.shippingAmount),
        paymentStatus: initialPayStatus,
        shippingAddress: orderData.shippingAddress || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localDb.orders.push(newOrder);
      
      let nextItemId = localDb.orderItems.length > 0 ? Math.max(...localDb.orderItems.map(oi => oi.id)) + 1 : 1;
      items.forEach(item => {
        localDb.orderItems.push({
          id: nextItemId++,
          orderId: newOrderId,
          variantId: parseInt(item.variantId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          taxAmount: parseFloat(item.taxAmount)
        });
      });
      
      // Payment record
      localDb.payments.push({
        id: localDb.payments.length + 1,
        orderId: newOrderId,
        gatewayName: paymentMethod || 'COD',
        transactionId: txnId,
        amount: parseFloat(orderData.totalAmount),
        paymentStatus: initialPaymentStatus,
        createdAt: new Date().toISOString()
      });
      
      db.saveLocalDb();
      return newOrderId;
    }
  },

  async getOrders(userId, storeId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      let queryStr = 'SELECT OrderId as id, OrderStatus as orderStatus, TotalAmount as totalAmount, TaxAmount as taxAmount, ShippingAmount as shippingAmount, PaymentStatus as paymentStatus, CreatedAt as createdAt, StoreId as storeId FROM Orders WHERE UserId = @userId';
      if (storeId) {
        queryStr += ' AND StoreId = @storeId';
      }
      queryStr += ' ORDER BY CreatedAt DESC';

      const request = pool.request().input('userId', db.sql.Int, userId);
      if (storeId) {
        request.input('storeId', db.sql.Int, storeId);
      }
      const res = await request.query(queryStr);
      
      const orders = res.recordset;
      for (let o of orders) {
        const itemRes = await pool.request()
          .input('orderId', db.sql.Int, o.id)
          .query(`
            SELECT oi.OrderItemId as id, oi.Quantity as quantity, oi.UnitPrice as unitPrice, oi.TaxAmount as taxAmount, 
                   v.WeightGrams as weightGrams, p.Name as productName
            FROM OrderItems oi
            JOIN ProductVariants v ON oi.VariantId = v.VariantId
            JOIN Products p ON v.ProductId = p.ProductId
            WHERE oi.OrderId = @orderId
          `);
        o.items = itemRes.recordset;
      }
      return orders;
    } else {
      let uOrders = localDb.orders.filter(o => o.userId === parseInt(userId));
      if (storeId) {
        uOrders = uOrders.filter(o => o.storeId === parseInt(storeId));
      }
      return uOrders.map(o => {
        const items = localDb.orderItems.filter(oi => oi.orderId === o.id).map(oi => {
          const v = localDb.productVariants.find(pv => pv.id === oi.variantId);
          const p = v ? localDb.products.find(prod => prod.id === v.productId) : null;
          return {
            id: oi.id,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            taxAmount: oi.taxAmount,
            weightGrams: v ? v.weightGrams : 0,
            productName: p ? p.name : 'Unknown Product'
          };
        });
        return { ...o, items };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getAllOrders(tenantId = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      let query = `
        SELECT o.OrderId as id, o.OrderStatus as orderStatus, o.TotalAmount as totalAmount, o.TaxAmount as taxAmount, 
               o.ShippingAmount as shippingAmount, o.PaymentStatus as paymentStatus, o.CreatedAt as createdAt,
               u.FirstName + ' ' + u.LastName as customerName, u.Email as customerEmail
        FROM Orders o
        JOIN Users u ON o.UserId = u.UserId
      `;
      const req = pool.request();
      if (tenantId) {
        req.input('tenantId', db.sql.Int, tenantId);
        query += ` WHERE o.TenantId = @tenantId `;
      }
      query += ` ORDER BY o.CreatedAt DESC `;
      
      const res = await req.query(query);
      return res.recordset;
    } else {
      let list = localDb.orders;
      if (tenantId) {
        const targetTenantId = parseInt(tenantId);
        list = list.filter(o => (o.tenantId || 1) === targetTenantId);
      }
      return list.map(o => {
        const u = localDb.users.find(user => user.id === o.userId);
        return {
          ...o,
          customerName: u ? `${u.firstName} ${u.lastName}` : 'Guest',
          customerEmail: u ? u.email : 'guest@snapshop.com'
        };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async updateOrderStatus(orderId, status, notes = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      let query = 'UPDATE Orders SET OrderStatus = @status, UpdatedAt = GETDATE()';
      const req = pool.request()
        .input('id', db.sql.Int, orderId)
        .input('status', db.sql.NVarChar, status);
      
      if (notes !== null) {
        query += ', Notes = @notes';
        req.input('notes', db.sql.NVarChar, notes);
      }
      
      query += ' WHERE OrderId = @id';
      await req.query(query);
      return true;
    } else {
      const o = localDb.orders.find(ord => ord.id === parseInt(orderId));
      if (!o) return false;
      o.orderStatus = status;
      o.updatedAt = new Date().toISOString();
      if (notes !== null) {
        o.notes = notes;
      }
      db.saveLocalDb();
      return true;
    }
  },

  async getSellerOrders(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query(`
          SELECT o.OrderId as id, o.OrderStatus as orderStatus, o.TotalAmount as totalAmount, o.TaxAmount as taxAmount,
                 o.ShippingAmount as shippingAmount, o.PaymentStatus as paymentStatus, o.CreatedAt as createdAt,
                 oi.Quantity as quantity, oi.UnitPrice as unitPrice, oi.VariantId as variantId,
                 v.WeightGrams as weightGrams, p.Name as productName, p.ProductId as productId,
                 u.FirstName + ' ' + u.LastName as customerName,
                 u.Email as customerEmail
          FROM OrderItems oi
          JOIN Orders o ON oi.OrderId = o.OrderId
          JOIN ProductVariants v ON oi.VariantId = v.VariantId
          JOIN Products p ON v.ProductId = p.ProductId
          JOIN Users u ON o.UserId = u.UserId
          WHERE p.VendorId = @vendorId
          ORDER BY o.CreatedAt DESC
        `);
      return res.recordset;
    } else {
      const allOrderItems = localDb.orderItems;
      const sellerOrderItems = [];
      
      for (let oi of allOrderItems) {
        const v = localDb.productVariants.find(pv => pv.id === oi.variantId);
        if (v) {
          const p = localDb.products.find(prod => prod.id === v.productId);
          if (p && p.vendorId === parseInt(vendorId)) {
            const o = localDb.orders.find(ord => ord.id === oi.orderId);
            if (o) {
              const u = localDb.users.find(user => user.id === o.userId);
              const cat = localDb.categories.find(c => c.id === p.categoryId);
              sellerOrderItems.push({
                id: o.id,
                orderStatus: o.orderStatus,
                totalAmount: o.totalAmount,
                taxAmount: o.taxAmount,
                shippingAmount: o.shippingAmount,
                paymentStatus: o.paymentStatus,
                createdAt: o.createdAt,
                quantity: oi.quantity,
                unitPrice: oi.unitPrice,
                variantId: oi.variantId,
                weightGrams: v.weightGrams,
                productName: p.name,
                productId: p.id,
                customerName: u ? `${u.firstName} ${u.lastName}` : 'Guest',
                category: cat ? cat.name : 'Unknown'
              });
            }
          }
        }
      }
      return sellerOrderItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getSellerCustomers(vendorId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('vendorId', db.sql.Int, vendorId)
        .query(`
          SELECT DISTINCT u.UserId as id, u.FirstName + ' ' + u.LastName as name, u.Email as email, u.Phone as phone,
                 COUNT(DISTINCT o.OrderId) as totalOrders,
                 SUM(oi.Quantity * oi.UnitPrice) as totalSpent,
                 MAX(o.CreatedAt) as lastOrderDate
          FROM OrderItems oi
          JOIN Orders o ON oi.OrderId = o.OrderId
          JOIN ProductVariants pv ON oi.VariantId = pv.VariantId
          JOIN Products p ON pv.ProductId = p.ProductId
          JOIN Users u ON o.UserId = u.UserId
          WHERE p.VendorId = @vendorId
          GROUP BY u.UserId, u.FirstName, u.LastName, u.Email, u.Phone
          ORDER BY totalSpent DESC
        `);
      return res.recordset.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        totalOrders: row.totalOrders,
        totalSpent: parseFloat(row.totalSpent || 0),
        lastOrderDate: row.lastOrderDate
      }));
    } else {
      const customerMap = {};

      for (let oi of localDb.orderItems) {
        const v = localDb.productVariants.find(pv => pv.id === oi.variantId);
        if (v) {
          const p = localDb.products.find(prod => prod.id === v.productId);
          if (p && p.vendorId === parseInt(vendorId)) {
            const o = localDb.orders.find(ord => ord.id === oi.orderId);
            if (o) {
              const u = localDb.users.find(user => user.id === o.userId);
              if (u && !customerMap[u.id]) {
                customerMap[u.id] = {
                  id: u.id,
                  name: `${u.firstName} ${u.lastName}`,
                  email: u.email,
                  phone: u.phone || '',
                  totalOrders: 0,
                  totalSpent: 0,
                  lastOrderDate: null
                };
              }
              if (u && customerMap[u.id]) {
                customerMap[u.id].totalOrders++;
                customerMap[u.id].totalSpent += parseFloat(o.totalAmount || 0);
                const d = new Date(o.createdAt);
                if (!customerMap[u.id].lastOrderDate || d > new Date(customerMap[u.id].lastOrderDate)) {
                  customerMap[u.id].lastOrderDate = o.createdAt;
                }
              }
            }
          }
        }
      }

      return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
    }
  },

  async getCustomerOrdersForTenant(customerId, tenantId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, customerId)
        .input('tenantId', db.sql.Int, tenantId)
        .query(`
          SELECT OrderId as id, OrderStatus as orderStatus, TotalAmount as totalAmount, TaxAmount as taxAmount, ShippingAmount as shippingAmount, PaymentStatus as paymentStatus, CreatedAt as createdAt, Notes as notes
          FROM Orders 
          WHERE UserId = @userId AND TenantId = @tenantId
          ORDER BY CreatedAt DESC
        `);
      
      const orders = res.recordset;
      for (let o of orders) {
        const itemRes = await pool.request()
          .input('orderId', db.sql.Int, o.id)
          .query(`
            SELECT oi.OrderItemId as id, oi.Quantity as quantity, oi.UnitPrice as unitPrice, oi.TaxAmount as taxAmount, 
                   v.WeightGrams as weightGrams, p.Name as productName
            FROM OrderItems oi
            JOIN ProductVariants v ON oi.VariantId = v.VariantId
            JOIN Products p ON v.ProductId = p.ProductId
            WHERE oi.OrderId = @orderId
          `);
        o.items = itemRes.recordset;
      }
      return orders;
    } else {
      const uOrders = localDb.orders.filter(o => o.userId === parseInt(customerId) && (o.tenantId || 1) === parseInt(tenantId));
      return uOrders.map(o => {
        const items = localDb.orderItems.filter(oi => oi.orderId === o.id).map(oi => {
          const v = localDb.productVariants.find(pv => pv.id === oi.variantId);
          const p = v ? localDb.products.find(prod => prod.id === v.productId) : null;
          return {
            id: oi.id,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            taxAmount: oi.taxAmount,
            weightGrams: v ? v.weightGrams : 0,
            productName: p ? p.name : 'Unknown Product'
          };
        });
        return { ...o, items };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createReturn(orderId, reason) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .input('reason', db.sql.NVarChar, reason)
        .query(`
          INSERT INTO Returns (OrderId, Reason, Status)
          OUTPUT INSERTED.ReturnId as id
          VALUES (@orderId, @reason, 'Pending')
        `);
      return res.recordset[0].id;
    } else {
      const newId = localDb.returns.length > 0 ? Math.max(...localDb.returns.map(r => r.id)) + 1 : 1;
      const newReturn = {
        id: newId,
        orderId: parseInt(orderId),
        reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      localDb.returns.push(newReturn);
      db.saveLocalDb();
      return newId;
    }
  },

  async getReturns() {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .query(`
          SELECT r.ReturnId as id, r.OrderId as orderId, r.Reason as reason, r.Status as status, r.CreatedAt as createdAt,
                 o.TotalAmount as totalAmount, u.Email as customerEmail
          FROM Returns r
          JOIN Orders o ON r.OrderId = o.OrderId
          JOIN Users u ON o.UserId = u.UserId
          ORDER BY r.CreatedAt DESC
        `);
      return res.recordset;
    } else {
      return localDb.returns.map(r => {
        const o = localDb.orders.find(ord => ord.id === r.orderId);
        const u = o ? localDb.users.find(user => user.id === o.userId) : null;
        return {
          id: r.id,
          orderId: r.orderId,
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt,
          totalAmount: o ? o.totalAmount : 0,
          customerEmail: u ? u.email : 'guest@snapshop.com'
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async updateReturnStatus(returnId, status) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, returnId)
        .input('status', db.sql.NVarChar, status)
        .query('UPDATE Returns SET Status = @status WHERE ReturnId = @id');

      if (status === 'Approved') {
        await pool.request()
          .input('id', db.sql.Int, returnId)
          .query(`
            UPDATE Orders 
            SET PaymentStatus = 'Refunded', OrderStatus = 'Cancelled', UpdatedAt = GETDATE()
            WHERE OrderId = (SELECT OrderId FROM Returns WHERE ReturnId = @id)
          `);
      }
      return true;
    } else {
      const ret = localDb.returns.find(r => r.id === parseInt(returnId));
      if (!ret) return false;
      ret.status = status;
      if (status === 'Approved') {
        const o = localDb.orders.find(ord => ord.id === ret.orderId);
        if (o) {
          o.paymentStatus = 'Refunded';
          o.orderStatus = 'Cancelled';
          o.updatedAt = new Date().toISOString();
        }
      }
      db.saveLocalDb();
      return true;
    }
  },

  async getOrderById(orderId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const orderRes = await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .query('SELECT OrderId as id, UserId as userId, OrderStatus as orderStatus, TotalAmount as totalAmount, TaxAmount as taxAmount, ShippingAmount as shippingAmount, PaymentStatus as paymentStatus, CreatedAt as createdAt, StoreId as storeId FROM Orders WHERE OrderId = @orderId');
      
      if (orderRes.recordset.length === 0) return null;
      const order = orderRes.recordset[0];

      const itemsRes = await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .query('SELECT oi.OrderItemId as id, oi.VariantId as variantId, oi.Quantity as quantity, oi.UnitPrice as unitPrice, oi.TaxAmount as taxAmount, p.Name as productName, pv.WeightGrams as weightGrams FROM OrderItems oi JOIN ProductVariants pv ON oi.VariantId = pv.VariantId JOIN Products p ON pv.ProductId = p.ProductId WHERE oi.OrderId = @orderId');
      
      order.items = itemsRes.recordset;
      return order;
    } else {
      const order = localDb.orders.find(o => o.id === parseInt(orderId));
      if (!order) return null;

      const items = localDb.orderItems
        .filter(oi => oi.orderId === parseInt(orderId))
        .map(oi => {
          const pv = localDb.productVariants.find(v => v.id === oi.variantId);
          const p = pv ? localDb.products.find(prod => prod.id === pv.productId) : null;
          return {
            id: oi.id,
            variantId: oi.variantId,
            quantity: oi.quantity,
            unitPrice: oi.unitPrice,
            taxAmount: oi.taxAmount,
            productName: p ? p.name : 'Unknown Product',
            weightGrams: pv ? pv.weightGrams : 0
          };
        });

      return {
        ...order,
        items
      };
    }
  }
};

module.exports = orderRepository;

