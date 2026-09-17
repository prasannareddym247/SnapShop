const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');

const integrationRepository = {
  async getPaymentSettings(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const methodsRes = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT MethodName, IsEnabled, IsDefault FROM StorePaymentMethods WHERE StoreId = @storeId');
      
      const credsRes = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT GatewayName, ApiKey, ApiSecret, WebhookSecret, IsTestMode FROM StoreGatewayCredentials WHERE StoreId = @storeId');

      const methods = methodsRes.recordset;
      const credentials = credsRes.recordset.map(c => ({
        GatewayName: c.GatewayName,
        ApiKey: decrypt(c.ApiKey),
        ApiSecret: decrypt(c.ApiSecret),
        WebhookSecret: decrypt(c.WebhookSecret),
        IsTestMode: c.IsTestMode
      }));

      return { methods, credentials };
    } else {
      const methods = localDb.storePaymentMethods
        .filter(m => m.storeId === parseInt(storeId))
        .map(m => ({ MethodName: m.methodName, IsEnabled: m.isEnabled, IsDefault: m.isDefault }));

      const credentials = localDb.storeGatewayCredentials
        .filter(c => c.storeId === parseInt(storeId))
        .map(c => ({
          GatewayName: c.gatewayName,
          ApiKey: decrypt(c.apiKey),
          ApiSecret: decrypt(c.apiSecret),
          WebhookSecret: decrypt(c.webhookSecret),
          IsTestMode: c.isTestMode
        }));

      return { methods, credentials };
    }
  },

  async updatePaymentMethod(storeId, tenantId, methodName, isEnabled, isDefault) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const bitEnabled = isEnabled ? 1 : 0;
    const bitDefault = isDefault ? 1 : 0;

    if (useSqlServer) {
      if (isDefault) {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .query('UPDATE StorePaymentMethods SET IsDefault = 0 WHERE StoreId = @storeId');
      }

      const check = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('method', db.sql.NVarChar, methodName)
        .query('SELECT StorePaymentMethodId FROM StorePaymentMethods WHERE StoreId = @storeId AND MethodName = @method');

      if (check.recordset.length > 0) {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('method', db.sql.NVarChar, methodName)
          .input('enabled', db.sql.Bit, bitEnabled)
          .input('def', db.sql.Bit, bitDefault)
          .query('UPDATE StorePaymentMethods SET IsEnabled = @enabled, IsDefault = @def WHERE StoreId = @storeId AND MethodName = @method');
      } else {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('method', db.sql.NVarChar, methodName)
          .input('enabled', db.sql.Bit, bitEnabled)
          .input('def', db.sql.Bit, bitDefault)
          .query('INSERT INTO StorePaymentMethods (StoreId, TenantId, MethodName, IsEnabled, IsDefault) VALUES (@storeId, @tenantId, @method, @enabled, @def)');
      }
    } else {
      if (isDefault) {
        localDb.storePaymentMethods
          .filter(m => m.storeId === parseInt(storeId))
          .forEach(m => m.isDefault = false);
      }

      const idx = localDb.storePaymentMethods.findIndex(m => m.storeId === parseInt(storeId) && m.methodName === methodName);
      if (idx !== -1) {
        localDb.storePaymentMethods[idx].isEnabled = !!isEnabled;
        localDb.storePaymentMethods[idx].isDefault = !!isDefault;
      } else {
        localDb.storePaymentMethods.push({
          id: localDb.storePaymentMethods.length + 1,
          storeId: parseInt(storeId),
          tenantId: parseInt(tenantId),
          methodName,
          isEnabled: !!isEnabled,
          isDefault: !!isDefault
        });
      }
      db.saveLocalDb();
    }
  },

  async updateGatewayCredentials(storeId, tenantId, gatewayName, apiKey, apiSecret, webhookSecret, isTestMode) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);
    const encryptedWebhook = encrypt(webhookSecret);
    const bitTest = isTestMode ? 1 : 0;

    if (useSqlServer) {
      const check = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('gateway', db.sql.NVarChar, gatewayName)
        .query('SELECT StoreGatewayCredentialId FROM StoreGatewayCredentials WHERE StoreId = @storeId AND GatewayName = @gateway');

      if (check.recordset.length > 0) {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('gateway', db.sql.NVarChar, gatewayName)
          .input('key', db.sql.NVarChar, encryptedKey)
          .input('secret', db.sql.NVarChar, encryptedSecret)
          .input('webSec', db.sql.NVarChar, encryptedWebhook)
          .input('test', db.sql.Bit, bitTest)
          .query('UPDATE StoreGatewayCredentials SET ApiKey = @key, ApiSecret = @secret, WebhookSecret = @webSec, IsTestMode = @test WHERE StoreId = @storeId AND GatewayName = @gateway');
      } else {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('gateway', db.sql.NVarChar, gatewayName)
          .input('key', db.sql.NVarChar, encryptedKey)
          .input('secret', db.sql.NVarChar, encryptedSecret)
          .input('webSec', db.sql.NVarChar, encryptedWebhook)
          .input('test', db.sql.Bit, bitTest)
          .query('INSERT INTO StoreGatewayCredentials (StoreId, TenantId, GatewayName, ApiKey, ApiSecret, WebhookSecret, IsTestMode) VALUES (@storeId, @tenantId, @gateway, @key, @secret, @webSec, @test)');
      }
    } else {
      const idx = localDb.storeGatewayCredentials.findIndex(c => c.storeId === parseInt(storeId) && c.gatewayName === gatewayName);
      if (idx !== -1) {
        localDb.storeGatewayCredentials[idx].apiKey = encryptedKey;
        localDb.storeGatewayCredentials[idx].apiSecret = encryptedSecret;
        localDb.storeGatewayCredentials[idx].webhookSecret = encryptedWebhook;
        localDb.storeGatewayCredentials[idx].isTestMode = !!isTestMode;
      } else {
        localDb.storeGatewayCredentials.push({
          id: localDb.storeGatewayCredentials.length + 1,
          storeId: parseInt(storeId),
          tenantId: parseInt(tenantId),
          gatewayName,
          apiKey: encryptedKey,
          apiSecret: encryptedSecret,
          webhookSecret: encryptedWebhook,
          isTestMode: !!isTestMode
        });
      }
      db.saveLocalDb();
    }
  },

  async getShippingSettings(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT ProviderName, IsEnabled, ApiKey, ApiSecret, WarehouseAddress, PackagingPreferences, ShippingRates FROM StoreShippingProviders WHERE StoreId = @storeId');
      return res.recordset.map(s => ({
        ProviderName: s.ProviderName,
        IsEnabled: s.IsEnabled,
        ApiKey: decrypt(s.ApiKey),
        ApiSecret: decrypt(s.ApiSecret),
        WarehouseAddress: s.WarehouseAddress,
        PackagingPreferences: s.PackagingPreferences,
        ShippingRates: s.ShippingRates
      }));
    } else {
      return localDb.storeShippingProviders
        .filter(s => s.storeId === parseInt(storeId))
        .map(s => ({
          ProviderName: s.providerName,
          IsEnabled: s.isEnabled,
          ApiKey: decrypt(s.apiKey),
          ApiSecret: decrypt(s.apiSecret),
          WarehouseAddress: s.warehouseAddress,
          PackagingPreferences: s.packagingPreferences,
          ShippingRates: s.shippingRates
        }));
    }
  },

  async updateShippingProvider(storeId, tenantId, data) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const bitEnabled = data.isEnabled ? 1 : 0;
    const encryptedKey = encrypt(data.apiKey);
    const encryptedSecret = encrypt(data.apiSecret);

    if (useSqlServer) {
      const check = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .input('provider', db.sql.NVarChar, data.providerName)
        .query('SELECT StoreShippingProviderId FROM StoreShippingProviders WHERE StoreId = @storeId AND ProviderName = @provider');

      if (check.recordset.length > 0) {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('provider', db.sql.NVarChar, data.providerName)
          .input('enabled', db.sql.Bit, bitEnabled)
          .input('key', db.sql.NVarChar, encryptedKey)
          .input('secret', db.sql.NVarChar, encryptedSecret)
          .input('warehouse', db.sql.NVarChar, data.warehouseAddress || null)
          .input('pkg', db.sql.NVarChar, data.packagingPreferences || null)
          .input('rates', db.sql.NVarChar, data.shippingRates || null)
          .query('UPDATE StoreShippingProviders SET IsEnabled = @enabled, ApiKey = @key, ApiSecret = @secret, WarehouseAddress = @warehouse, PackagingPreferences = @pkg, ShippingRates = @rates WHERE StoreId = @storeId AND ProviderName = @provider');
      } else {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('provider', db.sql.NVarChar, data.providerName)
          .input('enabled', db.sql.Bit, bitEnabled)
          .input('key', db.sql.NVarChar, encryptedKey)
          .input('secret', db.sql.NVarChar, encryptedSecret)
          .input('warehouse', db.sql.NVarChar, data.warehouseAddress || null)
          .input('pkg', db.sql.NVarChar, data.packagingPreferences || null)
          .input('rates', db.sql.NVarChar, data.shippingRates || null)
          .query('INSERT INTO StoreShippingProviders (StoreId, TenantId, ProviderName, IsEnabled, ApiKey, ApiSecret, WarehouseAddress, PackagingPreferences, ShippingRates) VALUES (@storeId, @tenantId, @provider, @enabled, @key, @secret, @warehouse, @pkg, @rates)');
      }
    } else {
      const idx = localDb.storeShippingProviders.findIndex(s => s.storeId === parseInt(storeId) && s.providerName === data.providerName);
      if (idx !== -1) {
        localDb.storeShippingProviders[idx].isEnabled = !!data.isEnabled;
        localDb.storeShippingProviders[idx].apiKey = encryptedKey;
        localDb.storeShippingProviders[idx].apiSecret = encryptedSecret;
        localDb.storeShippingProviders[idx].warehouseAddress = data.warehouseAddress || null;
        localDb.storeShippingProviders[idx].packagingPreferences = data.packagingPreferences || null;
        localDb.storeShippingProviders[idx].shippingRates = data.shippingRates || null;
      } else {
        localDb.storeShippingProviders.push({
          id: localDb.storeShippingProviders.length + 1,
          storeId: parseInt(storeId),
          tenantId: parseInt(tenantId),
          providerName: data.providerName,
          isEnabled: !!data.isEnabled,
          apiKey: encryptedKey,
          apiSecret: encryptedSecret,
          warehouseAddress: data.warehouseAddress || null,
          packagingPreferences: data.packagingPreferences || null,
          shippingRates: data.shippingRates || null
        });
      }
      db.saveLocalDb();
    }
  },

  async logWebhookEvent(storeId, tenantId, gatewayName, eventId, eventType, payload, status, error = null) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      try {
        await pool.request()
          .input('storeId', db.sql.Int, storeId)
          .input('tenantId', db.sql.Int, tenantId)
          .input('gateway', db.sql.NVarChar, gatewayName)
          .input('evtId', db.sql.NVarChar, eventId)
          .input('evtType', db.sql.NVarChar, eventType)
          .input('payload', db.sql.NVarChar, JSON.stringify(payload))
          .input('status', db.sql.NVarChar, status)
          .input('err', db.sql.NVarChar, error)
          .query('INSERT INTO WebhookLogs (StoreId, TenantId, GatewayName, EventId, EventType, Payload, ProcessingStatus, ErrorMessage) VALUES (@storeId, @tenantId, @gateway, @evtId, @evtType, @payload, @status, @err)');
        return true;
      } catch (err) {
        console.error('[WebhookLogs] SQL log error:', err.message);
        return false;
      }
    } else {
      const exists = localDb.webhookLogs.some(l => l.eventId === eventId);
      if (exists) return false;
      
      localDb.webhookLogs.push({
        id: localDb.webhookLogs.length + 1,
        storeId,
        tenantId,
        gatewayName,
        eventId,
        eventType,
        payload,
        processingStatus: status,
        errorMessage: error,
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
      return true;
    }
  },

  async getWebhookLogs(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT GatewayName as gatewayName, EventId as eventId, EventType as eventType, Payload as payload, ProcessingStatus as processingStatus, ErrorMessage as errorMessage, CreatedAt as createdAt FROM WebhookLogs WHERE StoreId = @storeId ORDER BY CreatedAt DESC');
      return res.recordset;
    } else {
      return localDb.webhookLogs
        .filter(l => l.storeId === parseInt(storeId))
        .map(l => ({ ...l }))
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async updateOrderStatus(orderId, status) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .input('status', db.sql.NVarChar, status)
        .query("UPDATE Orders SET OrderStatus = @status, PaymentStatus = 'Paid' WHERE OrderId = @orderId");
    } else {
      const idx = localDb.orders.findIndex(o => o.id === parseInt(orderId));
      if (idx !== -1) {
        localDb.orders[idx].orderStatus = status;
        localDb.orders[idx].paymentStatus = 'Paid';
        db.saveLocalDb();
      }
    }
  },

  async createShipmentTracking(orderId, storeId, tenantId, details) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .input('storeId', db.sql.Int, storeId)
        .input('tenantId', db.sql.Int, tenantId)
        .input('tracking', db.sql.NVarChar, details.trackingNumber)
        .input('courier', db.sql.NVarChar, details.courierName)
        .input('est', db.sql.DateTime, details.estimatedDelivery ? new Date(details.estimatedDelivery) : null)
        .input('status', db.sql.NVarChar, details.status)
        .input('updates', db.sql.NVarChar, JSON.stringify([{ status: details.status, message: 'Shipment created and labels printed.', time: new Date() }]))
        .query('INSERT INTO ShipmentTracking (OrderId, StoreId, TenantId, TrackingNumber, CourierName, EstimatedDelivery, ShipmentStatus, DeliveryUpdates) VALUES (@orderId, @storeId, @tenantId, @tracking, @courier, @est, @status, @updates)');
    } else {
      localDb.shipmentTracking.push({
        id: localDb.shipmentTracking.length + 1,
        orderId,
        storeId,
        tenantId,
        trackingNumber: details.trackingNumber,
        courierName: details.courierName,
        estimatedDelivery: details.estimatedDelivery,
        shipmentStatus: details.status,
        deliveryUpdates: [{ status: details.status, message: 'Shipment created and labels printed.', time: new Date().toISOString() }],
        createdAt: new Date().toISOString()
      });
      db.saveLocalDb();
    }
  },

  async getShipmentTracking(orderId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('orderId', db.sql.Int, orderId)
        .query('SELECT TrackingNumber as trackingNumber, CourierName as courierName, EstimatedDelivery as estimatedDelivery, ShipmentStatus as shipmentStatus, DeliveryUpdates as deliveryUpdates FROM ShipmentTracking WHERE OrderId = @orderId');
      if (res.recordset.length === 0) return null;
      const row = res.recordset[0];
      return {
        trackingNumber: row.trackingNumber,
        courierName: row.courierName,
        estimatedDelivery: row.estimatedDelivery,
        shipmentStatus: row.shipmentStatus,
        deliveryUpdates: JSON.parse(row.deliveryUpdates || '[]')
      };
    } else {
      const s = localDb.shipmentTracking.find(st => st.orderId === parseInt(orderId));
      return s ? { ...s } : null;
    }
  }
};

module.exports = integrationRepository;
