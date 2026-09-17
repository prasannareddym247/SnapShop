import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import SellerOnboarding from './SellerOnboarding';

const AuthPage = () => {
  const { login, register, sendVerificationOtp, verifySignupOtp, forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', gstin: '',
    storeName: '', storeDescription: '',
    address: '', city: '', state: '', country: '', postalCode: '',
    panNumber: '', bankAccountHolder: '', bankName: '', bankAccountNumber: '', bankIfscCode: '',
    docGovId: '', docPan: '', docGst: '', docBizReg: '', docBank: '',
    profilePicture: ''
  });
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('start_seller_onboarding')) {
      sessionStorage.removeItem('start_seller_onboarding');
      setMode('seller-onboarding');
    }
  }, []);

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // --- REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required.'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setSubmitting(true);
    try {
      const data = await register({ ...formData, password, email, role: 'Seller' });
      setPendingUserId(data.userId);
      setMessage('Account created! Check your email for the OTP to verify your account.');
      setMode('otpVerification');
      startCooldown();
    } catch (err) {
      setError(err.error || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password) {
      setError('Email and password are required.'); return;
    }
    setSubmitting(true);
    try {
      const data = await login(email, password);
      setMessage('Login successful!');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        try {
          await sendVerificationOtp(email);
          setMessage('OTP sent to your email.');
          setMode('otpVerification');
          startCooldown();
        } catch (otpErr) {
          setError(otpErr.error || 'Failed to send verification OTP.');
        }
      } else if (err.code === 'SELLER_PENDING' || err.code === 'SELLER_REJECTED' || err.code === 'SELLER_SUSPENDED') {
        const sellerStatus = err.code === 'SELLER_PENDING' ? 'Pending' : err.code === 'SELLER_REJECTED' ? 'Rejected' : 'Suspended';
        sessionStorage.setItem('seller_status', sellerStatus);
        sessionStorage.setItem('seller_email', email);
        window.location.hash = 'waiting-approval';
        if (onSuccess) onSuccess('Seller', { sellerStatus, email });
      } else {
        setError(err.error || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- VERIFY OTP (signup) ---
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.'); return;
    }
    setSubmitting(true);
    try {
      const data = await verifySignupOtp(email, otp);
      setMessage('Email verified! Logging in...');
    } catch (err) {
      setError(err.error || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setMessage('');
    try {
      await sendVerificationOtp(email);
      setMessage('New OTP sent to your email.');
      startCooldown();
    } catch (err) {
      setError(err.error || 'Failed to resend OTP.');
    }
  };

  const handleResendResetOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage('New OTP sent to your email.');
      startCooldown();
    } catch (err) {
      setError(err.error || 'Failed to resend OTP.');
    }
  };

  // --- FORGOT PASSWORD STEP 1: send email ---
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) { setError('Please enter your email.'); return; }
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setMessage('OTP sent to your email for password reset.');
      setMode('forgotOtp');
      startCooldown();
    } catch (err) {
      setError(err.error || 'Failed to send reset OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- FORGOT PASSWORD STEP 2: verify OTP ---
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.'); return;
    }
    setSubmitting(true);
    try {
      await verifyResetOtp(email, otp);
      setMessage('OTP verified. Set your new password.');
      setMode('forgotReset');
    } catch (err) {
      setError(err.error || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- FORGOT PASSWORD STEP 3: reset ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.'); return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email, newPassword);
      setMessage('Password reset successfully. Please login.');
      setTimeout(() => {
        setMode('login');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1500);
    } catch (err) {
      setError(err.error || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  // --- RENDER LOGIN FORM ---
  const renderLogin = () => (
    <form onSubmit={handleLogin}>
      <div className="auth-header"><h2 className="auth-title">Admin & Seller Login</h2><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Customers: Please log in from the store URL</p></div>
      <div className="form-group"><label>Email</label><input className="form-input" type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="form-group"><label>Password</label><input className="form-input" type="password" required placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</button>
      <p className="auth-switch">Want to start your own store? <span className="auth-link" onClick={() => switchMode('seller-onboarding')}>Register here</span></p>
      <p className="auth-switch"><span className="auth-link" onClick={() => { setMode('forgotEmail'); setError(''); setMessage(''); }}>Forgot Password?</span></p>
    </form>
  );

  // --- RENDER REGISTER FORM ---
  const renderRegister = () => (
    <form onSubmit={handleRegister}>
      <div className="auth-header"><h2 className="auth-title">Create Account</h2></div>
      <div className="form-group"><label>Email</label><input className="form-input" type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label>First Name</label><input className="form-input" required placeholder="John" value={formData.firstName} onChange={e => updateForm('firstName', e.target.value)} /></div>
        <div className="form-group"><label>Last Name</label><input className="form-input" required placeholder="Doe" value={formData.lastName} onChange={e => updateForm('lastName', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Phone</label><input className="form-input" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={updateForm ? e => updateForm('phone', e.target.value) : undefined} /></div>
      <>
          <div className="form-row">
            <div className="form-group"><label>Store Name</label><input className="form-input" placeholder="My Store" value={formData.storeName} onChange={e => updateForm('storeName', e.target.value)} /></div>
            <div className="form-group"><label>GSTIN</label><input className="form-input" placeholder="22AAAAA0000A1Z5" value={formData.gstin} onChange={e => updateForm('gstin', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Store Description</label><textarea className="form-input" rows="2" placeholder="Describe your store..." value={formData.storeDescription} onChange={e => updateForm('storeDescription', e.target.value)} /></div>
          <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--text-secondary)' }}>Bank Details</h4>
          <div className="form-group"><label>Account Holder</label><input className="form-input" value={formData.bankAccountHolder} onChange={e => updateForm('bankAccountHolder', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>Bank Name</label><input className="form-input" value={formData.bankName} onChange={e => updateForm('bankName', e.target.value)} /></div>
            <div className="form-group"><label>Account Number</label><input className="form-input" value={formData.bankAccountNumber} onChange={e => updateForm('bankAccountNumber', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>IFSC Code</label><input className="form-input" placeholder="SBIN0001234" value={formData.bankIfscCode} onChange={e => updateForm('bankIfscCode', e.target.value)} /></div>
          <div className="form-group"><label>PAN Number</label><input className="form-input" placeholder="ABCDE1234F" value={formData.panNumber} onChange={e => updateForm('panNumber', e.target.value)} /></div>

          <h4 style={{ margin: '1.5rem 0 0.5rem', color: 'var(--text-secondary)' }}>📍 Store Address</h4>
          <div className="form-group"><label>Street Address</label><input className="form-input" placeholder="123 Market St" value={formData.address} onChange={e => updateForm('address', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>City</label><input className="form-input" placeholder="Mumbai" value={formData.city} onChange={e => updateForm('city', e.target.value)} /></div>
            <div className="form-group"><label>State</label><input className="form-input" placeholder="Maharashtra" value={formData.state} onChange={e => updateForm('state', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Country</label><input className="form-input" placeholder="India" value={formData.country} onChange={e => updateForm('country', e.target.value)} /></div>
            <div className="form-group"><label>Postal Code</label><input className="form-input" placeholder="400001" value={formData.postalCode} onChange={e => updateForm('postalCode', e.target.value)} /></div>
          </div>

          <h4 style={{ margin: '1.5rem 0 0.5rem', color: 'var(--text-secondary)' }}>📄 Verification Documents (KYC)</h4>
          <div className="form-row">
            <div className="form-group"><label>Government ID Document</label><input className="form-input" placeholder="Aadhaar / Passport Link" value={formData.docGovId} onChange={e => updateForm('docGovId', e.target.value)} /></div>
            <div className="form-group"><label>PAN Card Link</label><input className="form-input" placeholder="PAN Card Copy Link" value={formData.docPan} onChange={e => updateForm('docPan', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>GST Certificate Link</label><input className="form-input" placeholder="GST Copy Link" value={formData.docGst} onChange={e => updateForm('docGst', e.target.value)} /></div>
            <div className="form-group"><label>Biz Registration Link</label><input className="form-input" placeholder="Registration Copy Link" value={formData.docBizReg} onChange={e => updateForm('docBizReg', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Bank Statement Link</label><input className="form-input" placeholder="Statement / Passbook Copy Link" value={formData.docBank} onChange={e => updateForm('docBank', e.target.value)} /></div>
        </>
      <div className="form-row">
        <div className="form-group"><label>Password</label><input className="form-input" type="password" required minLength="6" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <div className="form-group"><label>Confirm Password</label><input className="form-input" type="password" required minLength="6" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
      </div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Creating Account...' : 'Register'}</button>
      <p className="auth-switch">Already have an account? <span className="auth-link" onClick={() => switchMode('login')}>Login here</span></p>
    </form>
  );

  // --- RENDER OTP VERIFICATION ---
  const renderOtpVerification = () => (
    <form onSubmit={handleVerifySignupOtp}>
      <div className="auth-header"><h2 className="auth-title">Verify Your Email</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter the 6-digit OTP sent to <strong>{email}</strong></p>
      <div className="form-group"><label>OTP</label><input className="form-input" type="text" inputMode="numeric" maxLength="6" required placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontFamily: 'monospace' }} /></div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Verifying...' : 'Verify OTP'}</button>
      <p className="auth-switch">
        {cooldown > 0 ? (
          <span style={{ color: 'var(--text-secondary)' }}>Resend OTP in {cooldown}s</span>
        ) : (
          <span className="auth-link" onClick={handleResendOtp}>Resend OTP</span>
        )}
      </p>
    </form>
  );

  // --- RENDER FORGOT PASSWORD STEPS ---
  const renderForgotEmail = () => (
    <form onSubmit={handleForgotEmail}>
      <div className="auth-header"><h2 className="auth-title">Forgot Password</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter your email to receive a password reset OTP.</p>
      <div className="form-group"><label>Email</label><input className="form-input" type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send OTP'}</button>
      <p className="auth-switch"><span className="auth-link" onClick={() => switchMode('login')}>Back to Login</span></p>
    </form>
  );

  const renderForgotOtp = () => (
    <form onSubmit={handleVerifyResetOtp}>
      <div className="auth-header"><h2 className="auth-title">Verify OTP</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Enter the OTP sent to <strong>{email}</strong></p>
      <div className="form-group"><label>OTP</label><input className="form-input" type="text" inputMode="numeric" maxLength="6" required placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontFamily: 'monospace' }} /></div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Verifying...' : 'Verify OTP'}</button>
      <p className="auth-switch">
        {cooldown > 0 ? (
          <span style={{ color: 'var(--text-secondary)' }}>Resend OTP in {cooldown}s</span>
        ) : (
          <span className="auth-link" onClick={handleResendResetOtp}>Resend OTP</span>
        )}
      </p>
    </form>
  );

  const renderForgotReset = () => (
    <form onSubmit={handleResetPassword}>
      <div className="auth-header"><h2 className="auth-title">Reset Password</h2></div>
      <div className="form-group"><label>New Password</label><input className="form-input" type="password" required minLength="6" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
      <div className="form-group"><label>Confirm New Password</label><input className="form-input" type="password" required minLength="6" placeholder="Repeat password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} /></div>
      <button type="submit" className="auth-btn" disabled={submitting}>{submitting ? 'Resetting...' : 'Reset Password'}</button>
      <p className="auth-switch"><span className="auth-link" onClick={() => switchMode('login')}>Back to Login</span></p>
    </form>
  );

  if (mode === 'seller-onboarding') {
    return (
      <SellerOnboarding onComplete={(user) => {
        if (user && user.sellerStatus === 'Pending') {
          window.location.hash = 'waiting-approval';
        }
      }} />
    );
  }

  return (
    <div className="auth-split-container animated-view">
      <style>{`
        .auth-split-container {
          display: flex;
          max-width: 1000px;
          width: 95%;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.8);
          margin: 4rem auto;
          font-family: 'Inter', sans-serif;
        }
        .auth-left-panel {
          flex: 1.1;
          background: linear-gradient(135deg, #1e293b 0%, #020617 100%);
          color: white;
          padding: 3.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
        }
        .auth-right-panel {
          flex: 0.9;
          padding: 3.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          background: #ffffff;
          max-height: 85vh;
          overflow-y: auto;
        }
        .auth-logo-pill {
          display: inline-block;
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(251, 191, 36, 0.35);
        }
        .auth-brand-heading {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 1rem 0;
          background: linear-gradient(to right, #ffffff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .auth-brand-sub {
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.85;
          margin: 0 0 3rem 0;
        }
        .auth-feature-list {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .auth-feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .auth-feature-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 10px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .auth-feature-text h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: white;
        }
        .auth-feature-text p {
          font-size: 0.85rem;
          opacity: 0.75;
          margin: 0;
          line-height: 1.4;
        }
        .auth-footer-tag {
          margin-top: 3rem;
          font-size: 0.8rem;
          opacity: 0.6;
        }
        @media (max-width: 900px) {
          .auth-left-panel {
            display: none;
          }
          .auth-split-container {
            max-width: 480px;
            margin: 2rem auto;
          }
          .auth-right-panel {
            flex: 1;
            padding: 2.5rem;
            max-height: none;
          }
        }
      `}</style>
      
      <div className="auth-left-panel">
        <div>
          <span className="auth-logo-pill">🚀 SnapShop Platform</span>
          <h1 className="auth-brand-heading">Build Your Store.</h1>
          <p className="auth-brand-sub">The next-generation SaaS engine powering premium storefronts, automated invoicing, secure OTP verification, and intelligent store personalization.</p>
          
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">🛍️</div>
              <div className="auth-feature-text">
                <h4>Instant Storefronts</h4>
                <p>Launch high-fidelity storefront layouts linked dynamically with real-time DummyJSON catalogs.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">⚡</div>
              <div className="auth-feature-text">
                <h4>Secure Verification</h4>
                <p>Ensure client trust with secure transaction emails and identity OTP verification at checkout.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <div className="auth-feature-icon">📊</div>
              <div className="auth-feature-text">
                <h4>SaaS Merchant Dashboard</h4>
                <p>Track performance, manage real-time inventory adjustments, and personalize themes.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-footer-tag">
          <p>© 2026 SnapShop SaaS. Empowering global digital commerce.</p>
        </div>
      </div>

      <div className="auth-right-panel">
        {message && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#15803d', fontSize: '0.95rem' }}>{message}</div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.95rem' }}>{error}</div>}
        {mode === 'login' && renderLogin()}
        {mode === 'register' && renderRegister()}
        {mode === 'otpVerification' && renderOtpVerification()}
        {mode === 'forgotEmail' && renderForgotEmail()}
        {mode === 'forgotOtp' && renderForgotOtp()}
        {mode === 'forgotReset' && renderForgotReset()}
      </div>
    </div>
  );
};

export default AuthPage;
