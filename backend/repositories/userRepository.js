const db = require('../config/db');

const userRepository = {
  async getUserByEmail(email) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('email', db.sql.NVarChar, email)
        .query(`SELECT UserId as id, Email as email, PasswordHash as passwordHash,
          FirstName as firstName, LastName as lastName, Phone as phone, Role as role,
          Gstin as gstin, StoreName as storeName, StoreDescription as storeDescription,
          SellerStatus as sellerStatus, SellerStatusChangedAt as sellerStatusChangedAt,
          AlternatePhone as alternatePhone,
          ProfilePicture as profilePicture, Address as address, City as city,
          State as state, Country as country, PostalCode as postalCode,
          PanNumber as panNumber, BankAccountHolder as bankAccountHolder,
          BankName as bankName, BankAccountNumber as bankAccountNumber,
          BankIfscCode as bankIfscCode, DocGovId as docGovId, DocPan as docPan,
          DocGst as docGst, DocBizReg as docBizReg, DocBank as docBank,
          OtpCode as otpCode, OtpExpiry as otpExpiry,
          EmailVerified as emailVerified, OtpHash as otpHash,
          OtpAttempts as otpAttempts, LastOtpSentAt as lastOtpSentAt,
          OtpVerified as otpVerified, TenantId as tenantId, StoreId as storeId,
          BusinessType as businessType, SelectedTemplate as selectedTemplate,
          SelectedPlan as selectedPlan
          FROM Users WHERE Email = @email`);
      if (res.recordset.length === 0) return null;
      return res.recordset[0];
    } else {
      const u = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return null;
      return {
        ...u,
        tenantId: u.tenantId || 1,
        storeId: u.storeId || 1,
        storeName: u.storeName || null,
        storeDescription: u.storeDescription || null,
        sellerStatus: u.sellerStatus || (u.role === 'Seller' ? 'Pending' : 'Approved'),
        alternatePhone: u.alternatePhone || null,
        profilePicture: u.profilePicture || null,
        address: u.address || null,
        city: u.city || null,
        state: u.state || null,
        country: u.country || null,
        postalCode: u.postalCode || null,
        panNumber: u.panNumber || null,
        bankAccountHolder: u.bankAccountHolder || null,
        bankName: u.bankName || null,
        bankAccountNumber: u.bankAccountNumber || null,
        bankIfscCode: u.bankIfscCode || null,
        docGovId: u.docGovId || null,
        docPan: u.docPan || null,
        docGst: u.docGst || null,
        docBizReg: u.docBizReg || null,
        docBank: u.docBank || null,
        otpCode: u.otpCode || null,
        otpExpiry: u.otpExpiry || null,
        emailVerified: u.emailVerified || false,
        otpHash: u.otpHash || null,
        otpAttempts: u.otpAttempts || 0,
        lastOtpSentAt: u.lastOtpSentAt || null,
        otpVerified: u.otpVerified || false,
        sellerStatusChangedAt: u.sellerStatusChangedAt || null,
        businessType: u.businessType || null,
        selectedTemplate: u.selectedTemplate || null,
        selectedPlan: u.selectedPlan || null
      };
    }
  },

  async getUserById(id) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('id', db.sql.Int, id)
        .query(`SELECT UserId as id, Email as email, FirstName as firstName,
          LastName as lastName, Phone as phone, Role as role, Gstin as gstin,
          StoreName as storeName, StoreDescription as storeDescription,
          SellerStatus as sellerStatus, SellerStatusChangedAt as sellerStatusChangedAt,
          DiscountRate as discountRate,
          DiscountScope as discountScope, DiscountProductIds as discountProductIds,
          AlternatePhone as alternatePhone, ProfilePicture as profilePicture,
          Address as address, City as city, State as state, Country as country,
          PostalCode as postalCode, PanNumber as panNumber,
          BankAccountHolder as bankAccountHolder, BankName as bankName,
          BankAccountNumber as bankAccountNumber, BankIfscCode as bankIfscCode,
          DocGovId as docGovId, DocPan as docPan, DocGst as docGst,
          DocBizReg as docBizReg, DocBank as docBank,
          OtpCode as otpCode, OtpExpiry as otpExpiry,
          EmailVerified as emailVerified, OtpHash as otpHash,
          OtpAttempts as otpAttempts, LastOtpSentAt as lastOtpSentAt,
          OtpVerified as otpVerified, TenantId as tenantId, StoreId as storeId,
          BusinessType as businessType, SelectedTemplate as selectedTemplate,
          SelectedPlan as selectedPlan
          FROM Users WHERE UserId = @id`);
      if (res.recordset.length === 0) return null;
      return res.recordset[0];
    } else {
      const u = localDb.users.find(u => u.id === parseInt(id));
      if (!u) return null;
      return {
        ...u,
        tenantId: u.tenantId || 1,
        storeId: u.storeId || 1,
        storeName: u.storeName || null,
        storeDescription: u.storeDescription || null,
        sellerStatus: u.sellerStatus || (u.role === 'Seller' ? 'Pending' : 'Approved'),
        discountRate: u.discountRate || 0,
        discountScope: u.discountScope || 'all',
        discountProductIds: u.discountProductIds || [],
        alternatePhone: u.alternatePhone || null,
        profilePicture: u.profilePicture || null,
        address: u.address || null,
        city: u.city || null,
        state: u.state || null,
        country: u.country || null,
        postalCode: u.postalCode || null,
        panNumber: u.panNumber || null,
        bankAccountHolder: u.bankAccountHolder || null,
        bankName: u.bankName || null,
        bankAccountNumber: u.bankAccountNumber || null,
        bankIfscCode: u.bankIfscCode || null,
        docGovId: u.docGovId || null,
        docPan: u.docPan || null,
        docGst: u.docGst || null,
        docBizReg: u.docBizReg || null,
        docBank: u.docBank || null,
        otpCode: u.otpCode || null,
        otpExpiry: u.otpExpiry || null,
        emailVerified: u.emailVerified || false,
        otpHash: u.otpHash || null,
        otpAttempts: u.otpAttempts || 0,
        lastOtpSentAt: u.lastOtpSentAt || null,
        otpVerified: u.otpVerified || false,
        sellerStatusChangedAt: u.sellerStatusChangedAt || null,
        businessType: u.businessType || null,
        selectedTemplate: u.selectedTemplate || null,
        selectedPlan: u.selectedPlan || null
      };
    }
  },

  async createUser(userData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    const now = new Date().toISOString();
    const role = userData.role || 'Customer';
    const status = (role === 'Seller') ? 'Pending' : 'Approved';

    if (useSqlServer) {
      const res = await pool.request()
        .input('email', db.sql.NVarChar, userData.email)
        .input('hash', db.sql.NVarChar, userData.passwordHash)
        .input('first', db.sql.NVarChar, userData.firstName)
        .input('last', db.sql.NVarChar, userData.lastName)
        .input('phone', db.sql.NVarChar, userData.phone || '')
        .input('role', db.sql.NVarChar, role)
        .input('gstin', db.sql.NVarChar, userData.gstin || null)
        .input('storeName', db.sql.NVarChar, userData.storeName || null)
        .input('storeDesc', db.sql.NVarChar, userData.storeDescription || null)
        .input('status', db.sql.NVarChar, status)
        .input('altPhone', db.sql.NVarChar, userData.alternatePhone || null)
        .input('profilePic', db.sql.NVarChar, userData.profilePicture || null)
        .input('address', db.sql.NVarChar, userData.address || null)
        .input('city', db.sql.NVarChar, userData.city || null)
        .input('state', db.sql.NVarChar, userData.state || null)
        .input('country', db.sql.NVarChar, userData.country || null)
        .input('postalCode', db.sql.NVarChar, userData.postalCode || null)
        .input('panNum', db.sql.NVarChar, userData.panNumber || null)
        .input('holder', db.sql.NVarChar, userData.bankAccountHolder || null)
        .input('bName', db.sql.NVarChar, userData.bankName || null)
        .input('bNum', db.sql.NVarChar, userData.bankAccountNumber || null)
        .input('ifsc', db.sql.NVarChar, userData.bankIfscCode || null)
        .input('govId', db.sql.NVarChar, userData.docGovId || null)
        .input('dPan', db.sql.NVarChar, userData.docPan || null)
        .input('dGst', db.sql.NVarChar, userData.docGst || null)
        .input('dBiz', db.sql.NVarChar, userData.docBizReg || null)
        .input('dBank', db.sql.NVarChar, userData.docBank || null)
        .input('bizType', db.sql.NVarChar, userData.businessType || null)
        .input('selTemplate', db.sql.NVarChar, userData.selectedTemplate || null)
        .input('selPlan', db.sql.NVarChar, userData.selectedPlan || null)
        .input('tenantId', db.sql.Int, userData.tenantId || null)
        .input('storeId', db.sql.Int, userData.storeId || null)
        .input('changedAt', db.sql.DateTime, new Date())
        .query(`
          INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Phone, Role, Gstin,
            StoreName, StoreDescription, SellerStatus, SellerStatusChangedAt,
            AlternatePhone, ProfilePicture, Address, City, State, Country, PostalCode,
            PanNumber, BankAccountHolder, BankName, BankAccountNumber, BankIfscCode,
            DocGovId, DocPan, DocGst, DocBizReg, DocBank,
            BusinessType, SelectedTemplate, SelectedPlan, TenantId, StoreId)
          OUTPUT INSERTED.UserId as id
          VALUES (@email, @hash, @first, @last, @phone, @role, @gstin,
            @storeName, @storeDesc, @status, @changedAt,
            @altPhone, @profilePic, @address, @city, @state, @country, @postalCode,
            @panNum, @holder, @bName, @bNum, @ifsc, @govId, @dPan, @dGst, @dBiz, @dBank,
            @bizType, @selTemplate, @selPlan, @tenantId, @storeId)
        `);
      const userId = res.recordset[0].id;

      // Create corresponding profile table entry
      if (role === 'Seller') {
        await this.createSellerProfile(userId, userData);
      } else if (role === 'Admin') {
        await pool.request()
          .input('userId', db.sql.Int, userId)
          .query("IF NOT EXISTS (SELECT 1 FROM AdminProfiles WHERE UserId = @userId) INSERT INTO AdminProfiles (UserId) VALUES (@userId)");
      } else {
        await this.createCustomerProfile(userId, userData);
      }

      return { 
        id: userId, 
        ...userData, 
        role, 
        sellerStatus: status, 
        emailVerified: false
      };
    } else {
      const newId = localDb.users.length > 0 ? Math.max(...localDb.users.map(u => u.id)) + 1 : 1;
      const newUser = { 
        id: newId, 
        ...userData, 
        role, 
        sellerStatus: status, 
        sellerStatusChangedAt: now,
        emailVerified: false,
        otpHash: null,
        otpAttempts: 0,
        lastOtpSentAt: null,
        otpVerified: false
      };
      localDb.users.push(newUser);
      db.saveLocalDb();

      // Create corresponding profile table entry
      if (role === 'Seller') {
        await this.createSellerProfile(newId, userData);
      } else if (role === 'Admin') {
        localDb.adminProfiles.push({ userId: newId, permissions: '["all"]', createdAt: now });
        db.saveLocalDb();
      } else {
        await this.createCustomerProfile(newId, userData);
      }

      return newUser;
    }
  },

  async updateUnverifiedUser(userId, userData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const role = userData.role || 'Customer';
    const status = role === 'Seller' ? 'Pending' : 'Approved';

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, userId)
        .input('email', db.sql.NVarChar, userData.email)
        .input('hash', db.sql.NVarChar, userData.passwordHash)
        .input('first', db.sql.NVarChar, userData.firstName)
        .input('last', db.sql.NVarChar, userData.lastName)
        .input('phone', db.sql.NVarChar, userData.phone || null)
        .input('role', db.sql.NVarChar, role)
        .input('gstin', db.sql.NVarChar, userData.gstin || null)
        .input('storeName', db.sql.NVarChar, userData.storeName || null)
        .input('storeDesc', db.sql.NVarChar, userData.storeDescription || null)
        .input('status', db.sql.NVarChar, status)
        .input('altPhone', db.sql.NVarChar, userData.alternatePhone || null)
        .input('profilePic', db.sql.NVarChar, userData.profilePicture || null)
        .input('address', db.sql.NVarChar, userData.address || null)
        .input('city', db.sql.NVarChar, userData.city || null)
        .input('state', db.sql.NVarChar, userData.state || null)
        .input('country', db.sql.NVarChar, userData.country || null)
        .input('postalCode', db.sql.NVarChar, userData.postalCode || null)
        .input('panNum', db.sql.NVarChar, userData.panNumber || null)
        .input('holder', db.sql.NVarChar, userData.bankAccountHolder || null)
        .input('bName', db.sql.NVarChar, userData.bankName || null)
        .input('bNum', db.sql.NVarChar, userData.bankAccountNumber || null)
        .input('ifsc', db.sql.NVarChar, userData.bankIfscCode || null)
        .input('govId', db.sql.NVarChar, userData.docGovId || null)
        .input('dPan', db.sql.NVarChar, userData.docPan || null)
        .input('dGst', db.sql.NVarChar, userData.docGst || null)
        .input('dBiz', db.sql.NVarChar, userData.docBizReg || null)
        .input('dBank', db.sql.NVarChar, userData.docBank || null)
        .input('bizType', db.sql.NVarChar, userData.businessType || null)
        .input('selTemplate', db.sql.NVarChar, userData.selectedTemplate || null)
        .input('selPlan', db.sql.NVarChar, userData.selectedPlan || null)
        .input('tenantId', db.sql.Int, userData.tenantId || null)
        .input('storeId', db.sql.Int, userData.storeId || null)
        .input('changedAt', db.sql.DateTime, new Date())
        .query(`
          UPDATE Users SET
            Email = @email, PasswordHash = @hash, FirstName = @first, LastName = @last, Phone = @phone, Role = @role, Gstin = @gstin,
            StoreName = @storeName, StoreDescription = @storeDesc, SellerStatus = @status, SellerStatusChangedAt = @changedAt,
            AlternatePhone = @altPhone, ProfilePicture = @profilePic, Address = @address, City = @city, State = @state, Country = @country, PostalCode = @postalCode,
            PanNumber = @panNum, BankAccountHolder = @holder, BankName = @bName, BankAccountNumber = @bNum, BankIfscCode = @ifsc,
            DocGovId = @govId, DocPan = @dPan, DocGst = @dGst, DocBizReg = @dBiz, DocBank = @dBank,
            BusinessType = @bizType, SelectedTemplate = @selTemplate, SelectedPlan = @selPlan, TenantId = @tenantId, StoreId = @storeId
          WHERE UserId = @id
        `);
      return { id: userId, ...userData, role, sellerStatus: status, emailVerified: false };
    } else {
      const idx = localDb.users.findIndex(u => u.id === parseInt(userId));
      if (idx !== -1) {
        localDb.users[idx] = { ...localDb.users[idx], ...userData, role, sellerStatus: status };
        db.saveLocalDb();
        return localDb.users[idx];
      }
      return null;
    }
  },

  async getAllUsers() {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .query('SELECT UserId as id, Email as email, FirstName as firstName, LastName as lastName, Phone as phone, Role as role, SellerStatus as sellerStatus, SellerStatusChangedAt as sellerStatusChangedAt, StoreName as storeName, Gstin as gstin, StoreDescription as storeDescription, DiscountRate as discountRate, DiscountScope as discountScope, DiscountProductIds as discountProductIds, AlternatePhone as alternatePhone, ProfilePicture as profilePicture, Address as address, City as city, State as state, Country as country, PostalCode as postalCode, PanNumber as panNumber, BankAccountHolder as bankAccountHolder, BankName as bankName, BankAccountNumber as bankAccountNumber, BankIfscCode as bankIfscCode, DocGovId as docGovId, DocPan as docPan, DocGst as docGst, DocBizReg as docBizReg, DocBank as docBank, BusinessType as businessType, SelectedTemplate as selectedTemplate, SelectedPlan as selectedPlan, TenantId as tenantId, StoreId as storeId FROM Users ORDER BY CreatedAt DESC');
      return res.recordset;
    } else {
      return localDb.users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role,
        sellerStatus: u.sellerStatus || (u.role === 'Seller' ? 'Pending' : 'Approved'),
        storeName: u.storeName || null,
        gstin: u.gstin || null,
        storeDescription: u.storeDescription || null,
        discountRate: u.discountRate || 0,
        discountScope: u.discountScope || 'all',
        discountProductIds: u.discountProductIds || [],
        alternatePhone: u.alternatePhone || null,
        profilePicture: u.profilePicture || null,
        address: u.address || null,
        city: u.city || null,
        state: u.state || null,
        country: u.country || null,
        postalCode: u.postalCode || null,
        panNumber: u.panNumber || null,
        bankAccountHolder: u.bankAccountHolder || null,
        bankName: u.bankName || null,
        bankAccountNumber: u.bankAccountNumber || null,
        bankIfscCode: u.bankIfscCode || null,
        docGovId: u.docGovId || null,
        docPan: u.docPan || null,
        docGst: u.docGst || null,
        docBizReg: u.docBizReg || null,
        docBank: u.docBank || null,
        sellerStatusChangedAt: u.sellerStatusChangedAt || null,
        businessType: u.businessType || null,
        selectedTemplate: u.selectedTemplate || null,
        selectedPlan: u.selectedPlan || null,
        tenantId: u.tenantId || null,
        storeId: u.storeId || null
      }));
    }
  },

  async updateUserRole(id, role) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .input('role', db.sql.NVarChar, role)
        .query('UPDATE Users SET Role = @role WHERE UserId = @id');
      return true;
    } else {
      const u = localDb.users.find(u => u.id === parseInt(id));
      if (!u) return false;
      u.role = role;
      db.saveLocalDb();
      return true;
    }
  },

  async updateVendorStatus(id, status) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

      if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .input('status', db.sql.NVarChar, status)
        .input('changedAt', db.sql.DateTime, new Date())
        .query('UPDATE Users SET SellerStatus = @status, SellerStatusChangedAt = @changedAt WHERE UserId = @id');
      // Also update SellerProfiles
      await pool.request()
        .input('id', db.sql.Int, id)
        .input('status', db.sql.NVarChar, status)
        .input('changedAt', db.sql.DateTime, new Date())
        .query("UPDATE SellerProfiles SET SellerStatus = @status, SellerStatusChangedAt = @changedAt WHERE UserId = @id");
      return true;
    } else {
      const u = localDb.users.find(u => u.id === parseInt(id));
      if (!u) return false;
      u.sellerStatus = status;
      u.sellerStatusChangedAt = new Date().toISOString();
      // Sync SellerProfiles
      let sp = localDb.sellerProfiles.find(p => p.userId === parseInt(id));
      if (sp) {
        sp.sellerStatus = status;
        sp.sellerStatusChangedAt = new Date().toISOString();
      }
      db.saveLocalDb();
      return true;
    }
  },

  async updateSellerProfile(id, profileData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .input('storeName', db.sql.NVarChar, profileData.storeName)
        .input('storeDesc', db.sql.NVarChar, profileData.storeDescription)
        .input('discount', db.sql.Decimal(5, 2), profileData.discountRate || 0)
        .input('discountScope', db.sql.NVarChar(10), profileData.discountScope || 'all')
        .input('discountProductIds', db.sql.NVarChar(500), (profileData.discountProductIds || []).join(','))
        .query('UPDATE Users SET StoreName = @storeName, StoreDescription = @storeDesc, DiscountRate = @discount, DiscountScope = @discountScope, DiscountProductIds = @discountProductIds WHERE UserId = @id');
      // Also update SellerProfiles
      const existingSp = await pool.request()
        .input('userId', db.sql.Int, id)
        .query('SELECT ProfileId FROM SellerProfiles WHERE UserId = @userId');
      if (existingSp.recordset.length > 0) {
        await pool.request()
          .input('id', db.sql.Int, id)
          .input('storeName', db.sql.NVarChar, profileData.storeName)
          .input('storeDesc', db.sql.NVarChar, profileData.storeDescription)
          .input('discount', db.sql.Decimal(5, 2), profileData.discountRate || 0)
          .input('discountScope', db.sql.NVarChar(10), profileData.discountScope || 'all')
          .input('discountProductIds', db.sql.NVarChar(500), (profileData.discountProductIds || []).join(','))
          .query('UPDATE SellerProfiles SET StoreName = @storeName, StoreDescription = @storeDesc, DiscountRate = @discount, DiscountScope = @discountScope, DiscountProductIds = @discountProductIds WHERE UserId = @id');
      } else {
        await pool.request()
          .input('id', db.sql.Int, id)
          .input('storeName', db.sql.NVarChar, profileData.storeName)
          .input('storeDesc', db.sql.NVarChar, profileData.storeDescription)
          .input('discount', db.sql.Decimal(5, 2), profileData.discountRate || 0)
          .query("INSERT INTO SellerProfiles (UserId, StoreName, StoreDescription, DiscountRate) VALUES (@id, @storeName, @storeDesc, @discount)");
      }
      return true;
    } else {
      const u = localDb.users.find(u => u.id === parseInt(id));
      if (!u) return false;
      u.storeName = profileData.storeName;
      u.storeDescription = profileData.storeDescription;
      u.discountRate = profileData.discountRate || 0;
      u.discountScope = profileData.discountScope || 'all';
      u.discountProductIds = profileData.discountProductIds || [];
      // Sync SellerProfiles
      let sp = localDb.sellerProfiles.find(p => p.userId === parseInt(id));
      if (sp) {
        sp.storeName = profileData.storeName;
        sp.storeDescription = profileData.storeDescription;
        sp.discountRate = profileData.discountRate || 0;
        sp.discountScope = profileData.discountScope || 'all';
      } else {
        localDb.sellerProfiles.push({ userId: parseInt(id), storeName: profileData.storeName, storeDescription: profileData.storeDescription, discountRate: profileData.discountRate || 0, discountScope: profileData.discountScope || 'all', createdAt: new Date().toISOString() });
      }
      db.saveLocalDb();
      return true;
    }
  },

  async updateUserProfile(userId, profileData) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, userId)
        .input('first', db.sql.NVarChar, profileData.firstName)
        .input('last', db.sql.NVarChar, profileData.lastName)
        .input('pic', db.sql.NVarChar, profileData.profilePicture || null)
        .input('addr', db.sql.NVarChar, profileData.address || null)
        .input('city', db.sql.NVarChar, profileData.city || null)
        .input('state', db.sql.NVarChar, profileData.state || null)
        .input('country', db.sql.NVarChar, profileData.country || null)
        .input('zip', db.sql.NVarChar, profileData.postalCode || null)
        .input('altPhone', db.sql.NVarChar, profileData.alternatePhone || null)
        .query(`
          UPDATE Users 
          SET FirstName = @first, LastName = @last, ProfilePicture = @pic, Address = @addr, 
              City = @city, State = @state, Country = @country, PostalCode = @zip, AlternatePhone = @altPhone
          WHERE UserId = @id
        `);
      // Also update CustomerProfiles
      const existingCp = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query('SELECT ProfileId FROM CustomerProfiles WHERE UserId = @userId');
      if (existingCp.recordset.length > 0) {
        await pool.request()
          .input('id', db.sql.Int, userId)
          .input('pic', db.sql.NVarChar, profileData.profilePicture || null)
          .input('addr', db.sql.NVarChar, profileData.address || null)
          .input('city', db.sql.NVarChar, profileData.city || null)
          .input('state', db.sql.NVarChar, profileData.state || null)
          .input('country', db.sql.NVarChar, profileData.country || null)
          .input('zip', db.sql.NVarChar, profileData.postalCode || null)
          .input('altPhone', db.sql.NVarChar, profileData.alternatePhone || null)
          .query("UPDATE CustomerProfiles SET ProfilePicture = @pic, Address = @addr, City = @city, State = @state, Country = @country, PostalCode = @zip, AlternatePhone = @altPhone WHERE UserId = @id");
      } else {
        await this.createCustomerProfile(userId, profileData);
      }
      return true;
    } else {
      const u = localDb.users.find(u => u.id === parseInt(userId));
      if (!u) return false;
      u.firstName = profileData.firstName;
      u.lastName = profileData.lastName;
      u.profilePicture = profileData.profilePicture || null;
      u.address = profileData.address || null;
      u.city = profileData.city || null;
      u.state = profileData.state || null;
      u.country = profileData.country || null;
      u.postalCode = profileData.postalCode || null;
      u.alternatePhone = profileData.alternatePhone || null;
      // Sync CustomerProfiles
      let cp = localDb.customerProfiles.find(p => p.userId === parseInt(userId));
      if (cp) {
        cp.profilePicture = profileData.profilePicture || null;
        cp.address = profileData.address || null;
        cp.city = profileData.city || null;
        cp.state = profileData.state || null;
        cp.country = profileData.country || null;
        cp.postalCode = profileData.postalCode || null;
        cp.alternatePhone = profileData.alternatePhone || null;
      } else {
        localDb.customerProfiles.push({ userId: parseInt(userId), alternatePhone: profileData.alternatePhone || null, profilePicture: profileData.profilePicture || null, address: profileData.address || null, city: profileData.city || null, state: profileData.state || null, country: profileData.country || 'India', postalCode: profileData.postalCode || null, createdAt: new Date().toISOString() });
      }
      db.saveLocalDb();
      return true;
    }
  },

  async updateOtp(email, otpHash, expiry) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const now = new Date();

    if (useSqlServer) {
      await pool.request()
        .input('email', db.sql.NVarChar, email)
        .input('hash', db.sql.NVarChar, otpHash)
        .input('expiry', db.sql.DateTime, expiry)
        .input('lastSentAt', db.sql.DateTime, now)
        .query('UPDATE Users SET OtpHash = @hash, OtpExpiry = @expiry, LastOtpSentAt = @lastSentAt, OtpAttempts = 0 WHERE Email = @email');
      return true;
    } else {
      const u = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return false;
      u.otpHash = otpHash;
      u.otpExpiry = expiry;
      u.lastOtpSentAt = now.toISOString();
      u.otpAttempts = 0;
      db.saveLocalDb();
      return true;
    }
  },

  async incrementOtpAttempts(email) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('email', db.sql.NVarChar, email)
        .query('UPDATE Users SET OtpAttempts = COALESCE(OtpAttempts, 0) + 1 WHERE Email = @email');
      return true;
    } else {
      const u = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return false;
      u.otpAttempts = (u.otpAttempts || 0) + 1;
      db.saveLocalDb();
      return true;
    }
  },

  async verifyEmail(email) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('email', db.sql.NVarChar, email)
        .query('UPDATE Users SET EmailVerified = 1, OtpHash = NULL, OtpExpiry = NULL, OtpAttempts = 0, OtpVerified = 0 WHERE Email = @email');
      return true;
    } else {
      const u = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return false;
      u.emailVerified = true;
      u.otpHash = null;
      u.otpExpiry = null;
      u.otpAttempts = 0;
      u.otpVerified = false;
      db.saveLocalDb();
      return true;
    }
  },

  async markOtpVerified(email) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('email', db.sql.NVarChar, email)
        .query('UPDATE Users SET OtpVerified = 1 WHERE Email = @email');
      return true;
    } else {
      const u = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!u) return false;
      u.otpVerified = true;
      db.saveLocalDb();
      return true;
    }
  },

  async updateUserCredentials(userId, newPasswordHash) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, userId)
        .input('hash', db.sql.NVarChar, newPasswordHash)
        .query('UPDATE Users SET PasswordHash = @hash, OtpHash = NULL, OtpExpiry = NULL, OtpAttempts = 0, OtpVerified = 0 WHERE UserId = @id');
      return true;
    } else {
      const u = localDb.users.find(u => u.id === parseInt(userId));
      if (!u) return false;
      u.passwordHash = newPasswordHash;
      u.otpHash = null;
      u.otpExpiry = null;
      u.otpAttempts = 0;
      u.otpVerified = false;
      db.saveLocalDb();
      return true;
    }
  },

  async getUserByIdWithEmail(id) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('id', db.sql.Int, id)
        .query('SELECT UserId as id, Email as email, FirstName as firstName, LastName as lastName FROM Users WHERE UserId = @id');
      if (res.recordset.length === 0) return null;
      return res.recordset[0];
    } else {
      const u = localDb.users.find(u => u.id === parseInt(id));
      if (!u) return null;
      return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName };
    }
  },

  async deleteUser(id) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('id', db.sql.Int, id)
        .query('DELETE FROM Users WHERE UserId = @id');
      return true;
    } else {
      localDb.users = localDb.users.filter(u => u.id !== parseInt(id));
      localDb.sellerProfiles = (localDb.sellerProfiles || []).filter(p => p.userId !== parseInt(id));
      localDb.customerProfiles = (localDb.customerProfiles || []).filter(p => p.userId !== parseInt(id));
      localDb.adminProfiles = (localDb.adminProfiles || []).filter(p => p.userId !== parseInt(id));
      localDb.storeCustomers = (localDb.storeCustomers || []).filter(sc => sc.customerId !== parseInt(id));
      localDb.coupons = (localDb.coupons || []).filter(c => parseInt(c.vendorId) !== parseInt(id));
      localDb.queries = (localDb.queries || []).filter(q => parseInt(q.vendorId) !== parseInt(id));
      db.saveLocalDb();
      return true;
    }
  },

  async findOrCreateCategorySeller(categoryName) {
    const emailPrefix = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${emailPrefix}@snapshop.com`;
    const password = `${emailPrefix}@247`;
    
    let seller = await this.getUserByEmail(email);
    if (!seller) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      
      const userData = {
        email: email,
        passwordHash: hash,
        firstName: categoryName,
        lastName: 'Seller',
        phone: '9876543210',
        role: 'Seller',
        gstin: '22AAAAA0000A1Z5',
        storeName: `${categoryName} Store`,
        storeDescription: `${categoryName} Seller Store`
      };
      
      seller = await this.createUser(userData);
      await this.updateVendorStatus(seller.id || seller.UserId, 'Pending');
      seller.sellerStatus = 'Pending';
    }
    return seller;
  },

  async getUsersByTenant(tenantId) {
    const localDb = db.getLocalDb();
    const tenant = localDb.tenants.find(t => t.id === parseInt(tenantId));
    if (!tenant) return [];
    return localDb.users.filter(u => u.id === tenant.ownerId || u.tenantId === parseInt(tenantId));
  },

  // ─── Profile table methods ──────────────────────────────────────────

  async getSellerProfile(userId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query('SELECT * FROM SellerProfiles WHERE UserId = @userId');
      return res.recordset[0] || null;
    }
    return localDb.sellerProfiles.find(p => p.userId === parseInt(userId)) || null;
  },

  async getCustomerProfile(userId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query('SELECT * FROM CustomerProfiles WHERE UserId = @userId');
      return res.recordset[0] || null;
    }
    return localDb.customerProfiles.find(p => p.userId === parseInt(userId)) || null;
  },

  async getAdminProfile(userId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('userId', db.sql.Int, userId)
        .query('SELECT * FROM AdminProfiles WHERE UserId = @userId');
      return res.recordset[0] || null;
    }
    return localDb.adminProfiles.find(p => p.userId === parseInt(userId)) || null;
  },

  async getCustomersByStore(storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      const res = await pool.request()
        .input('storeId', db.sql.Int, storeId)
        .query(`
          SELECT u.UserId as id, u.Email as email, u.FirstName as firstName, u.LastName as lastName,
                 CONCAT(u.FirstName, ' ', u.LastName) as name,
                 u.Phone as phone, COALESCE(sc.TotalOrders, 0) as totalOrders, COALESCE(sc.TotalSpent, 0) as totalSpent,
                 sc.FirstPurchaseAt as firstPurchaseAt, sc.LastPurchaseAt as lastPurchaseAt,
                 sc.CreatedAt as mappedAt
          FROM Users u
          LEFT JOIN StoreCustomers sc ON u.UserId = sc.CustomerId AND sc.StoreId = @storeId
          WHERE u.Role = 'Customer' AND u.StoreId = @storeId
          ORDER BY COALESCE(sc.LastPurchaseAt, '1970-01-01') DESC, u.UserId DESC
        `);
      return res.recordset;
    }
    const storeCustomers = localDb.users.filter(u => u.role === 'Customer' && parseInt(u.storeId) === parseInt(storeId));
    return storeCustomers.map(u => {
      const sc = (localDb.storeCustomers || []).find(sc => sc.customerId === u.id && sc.storeId === parseInt(storeId)) || {};
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`,
        phone: u.phone || null,
        totalOrders: sc.totalOrders || 0,
        totalSpent: sc.totalSpent || 0,
        firstPurchaseAt: sc.firstPurchaseAt || null,
        lastPurchaseAt: sc.lastPurchaseAt || null,
        mappedAt: sc.createdAt || null
      };
    });
  },

  async addStoreCustomer(customerId, storeId) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const now = new Date();

    if (useSqlServer) {
      const existing = await pool.request()
        .input('custId', db.sql.Int, customerId)
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT StoreCustomerId FROM StoreCustomers WHERE CustomerId = @custId AND StoreId = @storeId');
      if (existing.recordset.length > 0) return existing.recordset[0];

      const res = await pool.request()
        .input('customerId', db.sql.Int, customerId)
        .input('storeId', db.sql.Int, storeId)
        .input('now', db.sql.DateTime, now)
        .query("INSERT INTO StoreCustomers (CustomerId, StoreId, CreatedAt) VALUES (@customerId, @storeId, @now); SELECT SCOPE_IDENTITY() as id");
      return { id: res.recordset[0].id };
    }
    const existing = localDb.storeCustomers.find(sc => sc.customerId === parseInt(customerId) && sc.storeId === parseInt(storeId));
    if (existing) return existing;
    const newId = localDb.storeCustomers.length > 0 ? Math.max(...localDb.storeCustomers.map(x => x.storeCustomerId || x.id || 0)) + 1 : 1;
    const entry = { storeCustomerId: newId, customerId: parseInt(customerId), storeId: parseInt(storeId), totalOrders: 0, totalSpent: 0, firstPurchaseAt: null, lastPurchaseAt: null, createdAt: now.toISOString() };
    localDb.storeCustomers.push(entry);
    db.saveLocalDb();
    return entry;
  },

  async createSellerProfile(userId, data) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('storeName', db.sql.NVarChar, data.storeName || null)
        .input('storeDesc', db.sql.NVarChar, data.storeDescription || null)
        .input('gstin', db.sql.NVarChar, data.gstin || null)
        .input('status', db.sql.NVarChar, data.sellerStatus || 'Pending')
        .input('discount', db.sql.Decimal(5, 2), data.discountRate || 0)
        .query("INSERT INTO SellerProfiles (UserId, StoreName, StoreDescription, Gstin, SellerStatus, DiscountRate) VALUES (@userId, @storeName, @storeDesc, @gstin, @status, @discount)");
      return true;
    }
    const entry = { userId: parseInt(userId), storeName: data.storeName || null, storeDescription: data.storeDescription || null, gstin: data.gstin || null, sellerStatus: data.sellerStatus || 'Pending', discountRate: data.discountRate || 0, discountScope: 'all', discountProductIds: null, createdAt: new Date().toISOString() };
    localDb.sellerProfiles.push(entry);
    db.saveLocalDb();
    return entry;
  },

  async createCustomerProfile(userId, data) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();

    if (useSqlServer) {
      await pool.request()
        .input('userId', db.sql.Int, userId)
        .input('altPhone', db.sql.NVarChar, data.alternatePhone || null)
        .input('addr', db.sql.NVarChar, data.address || null)
        .input('city', db.sql.NVarChar, data.city || null)
        .input('state', db.sql.NVarChar, data.state || null)
        .input('country', db.sql.NVarChar, data.country || 'India')
        .input('zip', db.sql.NVarChar, data.postalCode || null)
        .query("INSERT INTO CustomerProfiles (UserId, AlternatePhone, Address, City, State, Country, PostalCode) VALUES (@userId, @altPhone, @addr, @city, @state, @country, @zip)");
      return true;
    }
    const entry = { userId: parseInt(userId), alternatePhone: data.alternatePhone || null, address: data.address || null, city: data.city || null, state: data.state || null, country: data.country || 'India', postalCode: data.postalCode || null, createdAt: new Date().toISOString() };
    localDb.customerProfiles.push(entry);
    db.saveLocalDb();
    return entry;
  },

  async updateStoreCustomerTotals(customerId, storeId, orderTotal) {
    const useSqlServer = db.getUseSqlServer();
    const pool = db.getPool();
    const localDb = db.getLocalDb();
    const now = new Date();

    if (useSqlServer) {
      const existing = await pool.request()
        .input('custId', db.sql.Int, customerId)
        .input('storeId', db.sql.Int, storeId)
        .query('SELECT StoreCustomerId, TotalOrders, TotalSpent FROM StoreCustomers WHERE CustomerId = @custId AND StoreId = @storeId');

      if (existing.recordset.length > 0) {
        const rec = existing.recordset[0];
        const newOrders = (rec.TotalOrders || 0) + 1;
        const newSpent = parseFloat(rec.TotalSpent || 0) + parseFloat(orderTotal || 0);
        await pool.request()
          .input('custId', db.sql.Int, customerId)
          .input('storeId', db.sql.Int, storeId)
          .input('orders', db.sql.Int, newOrders)
          .input('spent', db.sql.Decimal(10, 2), newSpent)
          .input('now', db.sql.DateTime, now)
          .query("UPDATE StoreCustomers SET TotalOrders = @orders, TotalSpent = @spent, LastPurchaseAt = @now WHERE CustomerId = @custId AND StoreId = @storeId");
      } else {
        await pool.request()
          .input('customerId', db.sql.Int, customerId)
          .input('storeId', db.sql.Int, storeId)
          .input('spent', db.sql.Decimal(10, 2), orderTotal || 0)
          .input('now', db.sql.DateTime, now)
          .query("INSERT INTO StoreCustomers (CustomerId, StoreId, TotalOrders, TotalSpent, FirstPurchaseAt, LastPurchaseAt) VALUES (@customerId, @storeId, 1, @spent, @now, @now)");
      }
      return true;
    }
    const existing = localDb.storeCustomers.find(sc => sc.customerId === parseInt(customerId) && sc.storeId === parseInt(storeId));
    if (existing) {
      existing.totalOrders = (existing.totalOrders || 0) + 1;
      existing.totalSpent = (existing.totalSpent || 0) + parseFloat(orderTotal || 0);
      existing.lastPurchaseAt = now.toISOString();
    } else {
      localDb.storeCustomers.push({
        storeCustomerId: localDb.storeCustomers.length + 1,
        customerId: parseInt(customerId),
        storeId: parseInt(storeId),
        totalOrders: 1,
        totalSpent: parseFloat(orderTotal || 0),
        firstPurchaseAt: now.toISOString(),
        lastPurchaseAt: now.toISOString(),
        createdAt: now.toISOString()
      });
    }
    db.saveLocalDb();
    return true;
  }
};

module.exports = userRepository;
