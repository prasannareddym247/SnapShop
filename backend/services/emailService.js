const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

let transporter = null;
let etherealUrl = null;

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'email');
const templateCache = {};

function loadTemplate(name) {
  if (templateCache[name]) return templateCache[name];
  const filePath = path.join(TEMPLATES_DIR, name);
  try {
    templateCache[name] = fs.readFileSync(filePath, 'utf-8');
    return templateCache[name];
  } catch {
    console.warn(`[EMAIL] Template not found: ${filePath}`);
    return '';
  }
}

function interpolate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

async function initTransporter() {
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('[EMAIL] Using configured SMTP transport.');
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    etherealUrl = 'https://ethereal.email/login';
    console.log(`[EMAIL] Using Ethereal test account: ${testAccount.user}`);
    console.log(`[EMAIL] Login at https://ethereal.email/login`);
    console.log(`[EMAIL] Username: ${testAccount.user}`);
    console.log(`[EMAIL] Password: ${testAccount.pass}`);
  }
}

async function sendMail({ to, subject, html }) {
  if (!transporter) {
    try {
      await initTransporter();
    } catch (initErr) {
      console.warn(`[EMAIL] Failed to init transporter: ${initErr.message}`);
      console.log(`[EMAIL] Would send "${subject}" to ${to}`);
      return;
    }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SnapShop" <noreply@snapshop.com>',
      to,
      subject,
      html
    });

    if (etherealUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[EMAIL] Preview URL: ${previewUrl}`);
      }
    }

    console.log(`[EMAIL] Sent "${subject}" to ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (sendErr) {
    console.warn(`[EMAIL] Failed to send "${subject}" to ${to}: ${sendErr.message}`);
    console.log(`[EMAIL] OTP would be: ${html.match(/\b\d{6}\b/)?.[0] || '(see template)'}`);
  }
}

const emailService = {
  async init() {
    await initTransporter();
  },

  async sendOtpVerification(to, otp, userName) {
    const template = loadTemplate('otpVerification.html');
    const html = interpolate(template, {
      userName,
      otp,
      expiryMinutes: '10'
    });
    return sendMail({ to, subject: 'Verify your email address', html });
  },

  async sendPasswordResetOtp(to, otp, userName) {
    const template = loadTemplate('passwordResetOtp.html');
    const html = interpolate(template, {
      userName,
      otp,
      expiryMinutes: '10'
    });
    return sendMail({ to, subject: 'Reset your password', html });
  },

  async sendOrderPlaced(to, data) {
    const template = loadTemplate('orderPlaced.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId,
      totalAmount: data.totalAmount,
      itemsCount: data.itemsCount
    });
    return sendMail({ to, subject: `Order #${data.orderId} placed successfully`, html });
  },

  async sendOrderConfirmed(to, data) {
    const template = loadTemplate('orderConfirmed.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId
    });
    return sendMail({ to, subject: `Order #${data.orderId} confirmed`, html });
  },

  async sendOrderShipped(to, data) {
    const template = loadTemplate('orderShipped.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId
    });
    return sendMail({ to, subject: `Order #${data.orderId} has been shipped`, html });
  },

  async sendOutForDelivery(to, data) {
    const template = loadTemplate('outForDelivery.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId
    });
    return sendMail({ to, subject: `Order #${data.orderId} is out for delivery`, html });
  },

  async sendDelivered(to, data) {
    const template = loadTemplate('delivered.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId
    });
    return sendMail({ to, subject: `Order #${data.orderId} delivered`, html });
  },

  async sendOrderCancelled(to, data) {
    const template = loadTemplate('orderCancelled.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId
    });
    return sendMail({ to, subject: `Order #${data.orderId} cancelled`, html });
  },

  async sendRefundInitiated(to, data) {
    const template = loadTemplate('refundInitiated.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId,
      refundAmount: data.refundAmount
    });
    return sendMail({ to, subject: `Refund initiated for order #${data.orderId}`, html });
  },

  async sendRefundCompleted(to, data) {
    const template = loadTemplate('refundCompleted.html');
    const html = interpolate(template, {
      userName: data.userName,
      orderId: data.orderId,
      refundAmount: data.refundAmount
    });
    return sendMail({ to, subject: `Refund completed for order #${data.orderId}`, html });
  }
};

module.exports = emailService;
