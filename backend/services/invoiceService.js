const PDFDocument = require('pdfkit');

const invoiceService = {
  generateInvoicePdf(order, user, res, storeInfo = null) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    const storeName = storeInfo?.storeName || 'Fashion Store';
    const storeAddress = storeInfo?.businessAddress || '123 Fashion Street, New Delhi - 110001';
    const storeContact = storeInfo?.contactPhone || '+91 98765 43210';
    const storeEmail = storeInfo?.supportEmail || 'support@fashionstore.com';
    const storeWebsite = storeInfo?.website || 'www.fashionstore.com';
    const gstin = storeInfo?.gstin || null;

    // Brand Header
    doc.fillColor('#2c3e50').fontSize(28).font('Helvetica-Bold').text(storeName, 50, 50);
    doc.fillColor('#7f8c8d').fontSize(9).font('Helvetica')
      .text(storeAddress, 50, 80)
      .text(`Phone: ${storeContact}`, 50, 95)
      .text(`Email: ${storeEmail}`, 50, 110);

    // Invoice Title
    doc.fillColor('#2c3e50').fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 380, 50);
    doc.fillColor('#333333').fontSize(9).font('Helvetica')
      .text(`Invoice No: FK-INV-${order.id || order.OrderId}`, 380, 75)
      .text(`Date: ${new Date(order.createdAt || order.CreatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 380, 90)
      .text(`Order Status: ${order.orderStatus || order.OrderStatus || 'N/A'}`, 380, 105);

    // Separator line
    doc.moveTo(50, 130).lineTo(540, 130).strokeColor('#2c3e50').lineWidth(1).stroke();

    // Customer Details
    doc.fillColor('#2c3e50').fontSize(10).font('Helvetica-Bold').text('BILLED TO:', 50, 150);
    doc.fillColor('#333333').font('Helvetica').fontSize(9)
      .text(`${user.firstName || user.FirstName || ''} ${user.lastName || user.LastName || ''}`, 50, 165)
      .text(`Email: ${user.email || user.Email || ''}`, 50, 180)
      .text(`Phone: ${user.phone || user.Phone || 'N/A'}`, 50, 195);

    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      doc.text(`Shipping: ${addr.line1}, ${addr.city}, ${addr.state} - ${addr.postalCode}`, 50, 210, { width: 200 });
    }

    // Order Details
    doc.fillColor('#2c3e50').fontSize(10).font('Helvetica-Bold').text('ORDER DETAILS:', 380, 150);
    doc.fillColor('#333333').font('Helvetica').fontSize(9)
      .text(`Order ID: #FK-${order.id || order.OrderId}`, 380, 165)
      .text(`Transaction ID: ${order.transactionId || order.TransactionId || 'N/A'}`, 380, 180);

    // Table Headers
    const tableTop = 250;
    doc.fillColor('#ffffff').rect(50, tableTop, 490, 22).fill('#2c3e50');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    doc.text('PRODUCT', 60, tableTop + 6);
    doc.text('SKU', 190, tableTop + 6);
    doc.text('QTY', 280, tableTop + 6);
    doc.text('RATE', 340, tableTop + 6);
    doc.text('TAX', 410, tableTop + 6);
    doc.text('TOTAL', 480, tableTop + 6, { width: 60, align: 'right' });

    doc.moveTo(50, tableTop + 22).lineTo(540, tableTop + 22).strokeColor('#2c3e50').lineWidth(0.5).stroke();

    // Table Items
    let position = tableTop + 32;
    doc.font('Helvetica').fontSize(9);
    let itemCount = 0;
    let totalDiscount = 0;

    const items = order.items || [];
    items.forEach(item => {
      itemCount++;
      const productName = item.productName || item.ProductName || 'Product';
      const sku = item.sku || item.Sku || `SKU-${item.variantId || ''}`;
      const quantity = item.quantity || item.Quantity || 0;
      const unitPrice = item.unitPrice || item.UnitPrice || 0;
      const taxAmount = item.taxAmount || item.TaxAmount || 0;
      const itemTotal = (quantity * unitPrice).toFixed(2);

      if (position > 700) {
        doc.addPage();
        position = 50;
      }

      const bgColor = itemCount % 2 === 0 ? '#f8fafc' : '#ffffff';
      doc.fillColor(bgColor).rect(50, position - 4, 490, 20).fill();
      doc.fillColor('#333333');
      doc.text(productName.substring(0, 25), 60, position, { width: 120 });
      doc.text(sku, 190, position);
      doc.text(quantity.toString(), 280, position);
      doc.text(`₹${unitPrice.toFixed(2)}`, 340, position);
      doc.text(`₹${taxAmount.toFixed(2)}`, 410, position);
      doc.text(`₹${itemTotal}`, 480, position, { width: 60, align: 'right' });

      position += 22;
    });

    // Totals Section
    const totalStart = Math.max(position + 20, 500);
    const totalAmount = parseFloat(order.totalAmount || order.TotalAmount || 0);
    const taxAmountTotal = parseFloat(order.taxAmount || order.TaxAmount || 0);
    const shippingAmount = parseFloat(order.shippingAmount || order.ShippingAmount || 0);
    const discountAmount = parseFloat(order.discountAmount || order.DiscountAmount || 0);
    const subtotal = totalAmount - taxAmountTotal - shippingAmount + discountAmount;

    doc.fillColor('#f8fafc').rect(380, totalStart, 160, 115).fill();
    doc.moveTo(380, totalStart + 20).lineTo(540, totalStart + 20).strokeColor('#e2e8f0').stroke();
    doc.moveTo(380, totalStart + 40).lineTo(540, totalStart + 40).strokeColor('#e2e8f0').stroke();
    doc.moveTo(380, totalStart + 60).lineTo(540, totalStart + 60).strokeColor('#e2e8f0').stroke();
    doc.moveTo(380, totalStart + 80).lineTo(540, totalStart + 80).strokeColor('#e2e8f0').stroke();
    doc.moveTo(380, totalStart + 95).lineTo(540, totalStart + 95).strokeColor('#2c3e50').lineWidth(1).stroke();

    doc.fillColor('#333333').font('Helvetica').fontSize(9);
    doc.text('Subtotal:', 390, totalStart + 5);
    doc.text(`₹${subtotal.toFixed(2)}`, 520, totalStart + 5, { width: 60, align: 'right' });

    doc.text('Discount:', 390, totalStart + 25);
    doc.text(discountAmount > 0 ? `-₹${discountAmount.toFixed(2)}` : '₹0.00', 520, totalStart + 25, { width: 60, align: 'right' });

    doc.text('GST:', 390, totalStart + 45);
    doc.text(`₹${taxAmountTotal.toFixed(2)}`, 520, totalStart + 45, { width: 60, align: 'right' });

    doc.text('Shipping:', 390, totalStart + 65);
    doc.text(shippingAmount === 0 ? 'FREE' : `₹${shippingAmount.toFixed(2)}`, 520, totalStart + 65, { width: 60, align: 'right' });

    doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(11);
    doc.text('GRAND TOTAL:', 390, totalStart + 85);
    doc.text(`₹${totalAmount.toFixed(2)}`, 520, totalStart + 85, { width: 60, align: 'right' });

    // Payment Info
    const payStart = totalStart + 130;
    doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(10).text('PAYMENT INFORMATION', 50, payStart);
    doc.fillColor('#333333').font('Helvetica').fontSize(9);
    doc.text(`Payment Method: ${order.paymentMethod || order.PaymentMethod || 'Cash on Delivery'}`, 50, payStart + 18);
    doc.text(`Payment Status: ${order.paymentStatus || order.PaymentStatus || 'Unpaid'}`, 50, payStart + 33);
    doc.text(`Transaction ID: ${order.transactionId || order.TransactionId || 'N/A'}`, 50, payStart + 48);
    doc.text(`Order Status: ${order.orderStatus || order.OrderStatus || 'N/A'}`, 50, payStart + 63);

    // GSTIN
    doc.text(gstin ? `Seller GSTIN: ${gstin}` : 'GST: N/A', 50, payStart + 78);

    // Seller Details
    doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(10).text('SELLER DETAILS', 320, payStart);
    doc.fillColor('#333333').font('Helvetica').fontSize(9);
    doc.text(storeName, 320, payStart + 18);
    doc.text(storeAddress.substring(0, 35), 320, payStart + 33);
    doc.text(`Email: ${storeEmail}`, 320, payStart + 48);

    // Footer
    const footerY = Math.max(payStart + 120, 700);
    doc.moveTo(50, footerY - 10).lineTo(540, footerY - 10).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(11).text('Thank you for shopping with us!', 50, footerY, { align: 'center', width: 490 });
    doc.fillColor('#333333').font('Helvetica').fontSize(8)
      .text(`Return Policy: Items can be returned within 7 days of delivery.`, 50, footerY + 18, { align: 'center', width: 490 })
      .text(`Website: ${storeWebsite} | Support: ${storeEmail}`, 50, footerY + 32, { align: 'center', width: 490 })
      .text('This is a computer-generated invoice. No signature is required.', 50, footerY + 46, { align: 'center', width: 490, color: '#7f8c8d' });

    doc.end();
  }
};

module.exports = invoiceService;