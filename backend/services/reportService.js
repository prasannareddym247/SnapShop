const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');

const reportService = {
  async getSalesReport(startDate, endDate) {
    const orders = await orderRepository.getAllOrders();
    const start = startDate ? new Date(startDate) : new Date('2020-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    const filtered = orders.filter(o => {
      const d = new Date(o.createdAt || o.orderDate);
      return d >= start && d <= end;
    });
    const totalRevenue = filtered.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, averageOrderValue: avgOrderValue, period: { start, end } };
  },

  async getSellerReport() {
    const users = await userRepository.getAllUsers();
    const sellers = users.filter(u => u.role === 'Seller');
    const orders = await orderRepository.getAllOrders();
    return {
      totalSellers: sellers.length,
      approvedSellers: sellers.filter(s => s.sellerStatus === 'Approved').length,
      pendingSellers: sellers.filter(s => s.sellerStatus === 'Pending').length,
      suspendedSellers: sellers.filter(s => s.sellerStatus === 'Suspended').length,
      totalSellerOrders: orders.filter(o => o.vendorId).length
    };
  },

  async getProductReport() {
    const products = await productRepository.getAllProducts();
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'Active').length,
      inactiveProducts: products.filter(p => p.status === 'Inactive').length,
      pendingProducts: products.filter(p => p.status === 'Pending').length
    };
  },

  async getRevenueReport(startDate, endDate) {
    const sales = await this.getSalesReport(startDate, endDate);
    return {
      grossRevenue: sales.totalRevenue
    };
  }
};

module.exports = reportService;
