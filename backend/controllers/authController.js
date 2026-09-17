const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const authService = require('../services/authService');
const notificationRepository = require('../repositories/notificationRepository');
const adminNotificationRepository = require('../repositories/adminNotificationRepository');
const auditRepository = require('../repositories/auditRepository');
const emailService = require('../services/emailService');
const otpUtils = require('../utils/otpUtils');

const authController = {
  async register(req, res) {
    try {
      let { email, password, firstName, lastName, phone, role, gstin, storeName, storeDescription, profilePicture, address, city, state, country, postalCode, panNumber, bankAccountHolder, bankName, bankAccountNumber, bankIfscCode, docGovId, docPan, docGst, docBizReg, docBank, businessType, selectedTemplate, selectedPlan } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Email, password, first name, and last name are required.' });
      }

      const targetRole = role || 'Customer';

      // Enforce Store-Level Customer Isolation during registration
      let tenantId = req.tenantId;
      let storeId = req.storeId;

      if (targetRole === 'Customer') {
        if (!tenantId || tenantId === 1 || !storeId || storeId === 1) {
          return res.status(400).json({ error: 'Registration is not available on this page. Please register through the storefront.' });
        }
      } else if (targetRole === 'Admin') {
        return res.status(403).json({ error: 'Admin registration is not allowed.' });
      } else {
        // Sellers start with null tenant and store which gets populated upon store setup below
        tenantId = null;
        storeId = null;
      }

      const existingUser = await userRepository.getUserByEmail(email);
      let isUnverifiedReRegistration = false;
      if (existingUser) {
        if (existingUser.emailVerified) {
          return res.status(400).json({ error: 'A user with this email already exists.' });
        }
        isUnverifiedReRegistration = true;
      }

      const passwordHash = await authService.hashPassword(password);

      const userData = {
        email, passwordHash, firstName, lastName, phone, role: targetRole, gstin,
        storeName, storeDescription, profilePicture, address, city, state, country, postalCode,
        panNumber, bankAccountHolder, bankName, bankAccountNumber, bankIfscCode,
        docGovId, docPan, docGst, docBizReg, docBank,
        businessType, selectedTemplate, selectedPlan,
        tenantId, storeId
      };

      let newUser;
      if (isUnverifiedReRegistration) {
        newUser = await userRepository.updateUnverifiedUser(existingUser.id || existingUser.UserId, userData);
      } else {
        newUser = await userRepository.createUser(userData);
      }

      // Send verification OTP
      try {
        const otp = otpUtils.generateOtp();
        const otpHash = otpUtils.hashOtp(otp);
        const expiry = otpUtils.getOtpExpiry();
        await userRepository.updateOtp(email, otpHash, expiry);
        await emailService.sendOtpVerification(email, otp, firstName);
      } catch (emailErr) {
        console.error('[AUTH] Failed to send verification email:', emailErr);
      }

      console.log(`[AUTH] New user registered: "${firstName} ${lastName}" (${email}) as ${role || 'Customer'} — email verification required`);
      
      if (role === 'Seller') {
        try {
          const storeRepository = require('../repositories/storeRepository');
          const slug = (storeName || firstName).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const tenantId = await storeRepository.createTenant((storeName || firstName) + ' Tenant');
          const storeId = await storeRepository.createStore(tenantId, newUser.id || newUser.UserId, storeName || (firstName + ' Store'), slug);
          await storeRepository.createDefaultSettings(storeId, tenantId);
          await storeRepository.createDefaultCategories(tenantId);
          console.log(`[AUTH-SaaS] Auto-created Tenant #${tenantId} and Store #${storeId} (slug: ${slug}) for new Store Owner: ${email}`);

          // Create a 14-day trial subscription for the selected plan
          const planKey = selectedPlan || 'starter';
          const subscriptionService = require('../services/subscriptionService');
          await subscriptionService.startTrial(storeId, tenantId, planKey);
          console.log(`[AUTH-SaaS] Started ${planKey} trial for Store #${storeId}`);

          // Auto-create a support ticket for seller verification
          try {
            const supportTicketRepository = require('../repositories/supportTicketRepository');
            await supportTicketRepository.create({
              storeId, storeName: storeName || (firstName + ' Store'),
              userId: newUser.id || newUser.UserId, userEmail: email,
              subject: `Seller Verification - ${storeName || firstName}`,
              description: `New seller ${firstName} ${lastName} (${email}) has registered as a seller with store "${storeName || firstName + ' Store'}".${businessType ? ` Business Type: ${businessType}.` : ''} Plan: ${planKey}`,
              category: 'Seller Verification',
              priority: 'high',
              status: 'open',
              businessType: businessType || null,
              planKey
            });
            console.log(`[AUTH-SaaS] Auto-created Seller Verification ticket for ${email}`);
          } catch (ticketErr) {
            console.error('[AUTH-SaaS] Failed to create support ticket:', ticketErr);
          }
        } catch (saasErr) {
          console.error('[AUTH-SaaS] Failed to auto-create tenant/store:', saasErr);
        }

        await adminNotificationRepository.create({
          type: 'SellerApproval',
          title: 'New Seller Registration',
          message: `New seller registration: ${storeName || firstName} (${email}) is pending approval.`,
          priority: 'normal'
        });
      }

      res.status(201).json({ 
        message: 'Registration successful. Please check your email for the OTP to verify your account.',
        userId: newUser.id || newUser.UserId,
        email
      });
    } catch (err) {
      console.error('[AUTH] Register error:', err);
      res.status(400).json({ error: err.message || 'Error registering user.' });
    }
  },

  async sendVerificationOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });

      const user = await userRepository.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email is already verified.' });
      }

      if (otpUtils.isWithinCooldown(user.lastOtpSentAt)) {
        const remaining = otpUtils.getCooldownRemaining(user.lastOtpSentAt);
        return res.status(429).json({ error: `Please wait ${remaining} seconds before requesting a new OTP.` });
      }

      const otp = otpUtils.generateOtp();
      const otpHash = otpUtils.hashOtp(otp);
      const expiry = otpUtils.getOtpExpiry();

      await userRepository.updateOtp(email, otpHash, expiry);
      await emailService.sendOtpVerification(email, otp, user.firstName);

      console.log(`[AUTH] Verification OTP sent to ${email}`);
      res.json({ message: 'OTP sent to your email.' });
    } catch (err) {
      console.error('[AUTH] Send verification OTP error:', err);
      res.status(500).json({ error: 'Failed to send OTP.' });
    }
  },

  async verifySignupOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

      const user = await userRepository.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      if (user.emailVerified) {
        return res.status(400).json({ error: 'Email is already verified.' });
      }

      const attempts = user.otpAttempts || 0;
      if (attempts >= otpUtils.MAX_OTP_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      }

      if (otpUtils.isOtpExpired(user.otpExpiry)) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (!user.otpHash || !otpUtils.verifyOtp(otp, user.otpHash)) {
        await userRepository.incrementOtpAttempts(email);
        const remaining = otpUtils.MAX_OTP_ATTEMPTS - (attempts + 1);
        if (remaining <= 0) {
          return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
        }
        return res.status(400).json({ error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      }

      await userRepository.verifyEmail(email);

      // Auto-login: generate JWT
      const updatedUser = await userRepository.getUserByEmail(email);
      const token = authService.generateToken(updatedUser);

      console.log(`[AUTH] Email verified for ${email} — user logged in`);
      res.json({
        message: 'Email verified successfully.',
        token,
          user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          storeName: updatedUser.storeName,
          sellerStatus: updatedUser.sellerStatus,
          businessType: updatedUser.businessType
        }
      });
    } catch (err) {
      console.error('[AUTH] Verify signup OTP error:', err);
      res.status(500).json({ error: 'Failed to verify OTP.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const valid = await authService.comparePassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      // Enforce Store-Level Customer Isolation during login
      const requestTenantId = req.tenantId;
      const requestStoreId = req.storeId;

      if (user.role === 'Customer') {
        if (!requestTenantId || requestTenantId === 1 || !requestStoreId || requestStoreId === 1) {
          return res.status(401).json({ error: 'Customers can only log in through the storefront. Please visit the store URL to sign in.' });
        }
        if (user.tenantId !== requestTenantId || user.storeId !== requestStoreId) {
          return res.status(401).json({ error: 'Invalid email or password for this store.' });
        }
      }

      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: 'Email not verified. Please verify your email before logging in.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        });
      }

      const token = authService.generateToken(user);
      console.log(`[AUTH] ${user.role} "${user.firstName} ${user.lastName}" (${user.email}) logged in ✓`);

      auditRepository.create({
        userId: user.id, userEmail: user.email,
        action: 'UserLogin', resourceType: 'Session', resourceId: String(user.id),
        details: { role: user.role }
      }).catch(err => console.error('[AUDIT] Failed to log login:', err.message));

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          storeName: user.storeName,
          sellerStatus: user.sellerStatus,
          businessType: user.businessType,
          tenantId: user.tenantId,
          storeId: user.storeId
        }
      });
    } catch (err) {
      console.error('[AUTH] Login error:', err);
      res.status(500).json({ error: 'Server error during login.' });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userRepository.getUserByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const { passwordHash, otpHash, otpCode, ...profile } = user;
      res.json(profile);
    } catch (err) {
      console.error('[AUTH] Profile fetch error:', err);
      res.status(500).json({ error: 'Server error fetching profile.' });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });

      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found with this email address.' });
      }

      if (otpUtils.isWithinCooldown(user.lastOtpSentAt)) {
        const remaining = otpUtils.getCooldownRemaining(user.lastOtpSentAt);
        return res.status(429).json({ error: `Please wait ${remaining} seconds before requesting a new OTP.` });
      }

      const otp = otpUtils.generateOtp();
      const otpHash = otpUtils.hashOtp(otp);
      const expiry = otpUtils.getOtpExpiry();

      await userRepository.updateOtp(email, otpHash, expiry);
      await emailService.sendPasswordResetOtp(email, otp, user.firstName);

      console.log(`[AUTH] Password reset OTP sent to ${email}`);
      res.json({ message: 'OTP sent to your email for password reset.' });
    } catch (err) {
      console.error('[AUTH] Forgot password error:', err);
      res.status(500).json({ error: 'Failed to send reset OTP.' });
    }
  },

  async verifyResetOtp(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

      const user = await userRepository.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const attempts = user.otpAttempts || 0;
      if (attempts >= otpUtils.MAX_OTP_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      }

      if (otpUtils.isOtpExpired(user.otpExpiry)) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (!user.otpHash || !otpUtils.verifyOtp(otp, user.otpHash)) {
        await userRepository.incrementOtpAttempts(email);
        const remaining = otpUtils.MAX_OTP_ATTEMPTS - (attempts + 1);
        if (remaining <= 0) {
          return res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
        }
        return res.status(400).json({ error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      }

      await userRepository.markOtpVerified(email);
      console.log(`[AUTH] Reset OTP verified for ${email}`);
      res.json({ message: 'OTP verified. You can now reset your password.' });
    } catch (err) {
      console.error('[AUTH] Verify reset OTP error:', err);
      res.status(500).json({ error: 'Failed to verify OTP.' });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const user = await userRepository.getUserById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      const isValid = await authService.comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }

      const passwordHash = await authService.hashPassword(newPassword);
      await userRepository.updateUserCredentials(user.id || user.UserId, passwordHash);

      console.log(`[AUTH] Password changed successfully for user ${req.user.userId}`);
      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      console.error('[AUTH] Change password error:', err);
      res.status(500).json({ error: 'Failed to change password.' });
    }
  },

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: 'Email and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const user = await userRepository.getUserByEmail(email);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      if (!user.otpVerified) {
        return res.status(400).json({ error: 'OTP not verified. Please verify your OTP first.' });
      }

      const passwordHash = await authService.hashPassword(newPassword);
      await userRepository.updateUserCredentials(user.id || user.UserId, passwordHash);

      console.log(`[AUTH] Password reset successful for ${email}`);
      res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      console.error('[AUTH] Reset password error:', err);
      res.status(500).json({ error: 'Failed to reset password.' });
    }
  }
};

module.exports = authController;
