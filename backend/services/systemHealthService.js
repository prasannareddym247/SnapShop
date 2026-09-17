const systemEventRepository = require('../repositories/systemEventRepository');
const db = require('../config/db');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

const systemHealthService = {
  async getHealth() {
    const checks = {
      database: await this.checkDatabase(),
      memory: await this.checkMemory(),
      orders: await this.checkOrders(),
      products: await this.checkProducts()
    };
    const allOk = Object.values(checks).every(c => c.status === 'ok');
    return { status: allOk ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() };
  },

  async checkDatabase() {
    try {
      if (db.getUseSqlServer()) {
        await db.getPool().request().query('SELECT 1');
      }
      return { status: 'ok', message: 'Database connection is healthy' };
    } catch (err) {
      return { status: 'error', message: `Database error: ${err.message}` };
    }
  },

  async checkMemory() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const status = heapUsedMB / heapTotalMB > 0.9 ? 'warning' : 'ok';
    return { status, message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`, heapUsedMB, heapTotalMB };
  },

  async checkOrders() {
    try {
      const orders = await orderRepository.getAllOrders();
      const pending = orders.filter(o => o.orderStatus === 'Pending').length;
      return { status: 'ok', message: `${orders.length} total orders, ${pending} pending`, total: orders.length, pending };
    } catch (err) {
      return { status: 'error', message: `Order check failed: ${err.message}` };
    }
  },

  async checkProducts() {
    try {
      const products = await productRepository.getAllProducts();
      return { status: 'ok', message: `${products.length} products loaded`, total: products.length };
    } catch (err) {
      return { status: 'error', message: `Product check failed: ${err.message}` };
    }
  },

  async getEvents(filters = {}) {
    return systemEventRepository.getAll(filters);
  },

  async createEvent(data) {
    return systemEventRepository.create(data);
  },

  async resolveEvent(id) {
    return systemEventRepository.resolve(id);
  },

  async getPerformanceMetrics() {
    const orders = await orderRepository.getAllOrders();
    const products = await productRepository.getAllProducts();
    const processedOrders = orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped');
    const totalRevenue = processedOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      processedOrders: processedOrders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  }
};

module.exports = systemHealthService;
