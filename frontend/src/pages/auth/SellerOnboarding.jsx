import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/context/AuthContext';
import SUBSCRIPTION_PLANS from '../../templates/_shared/data/subscriptionPlans';
import { TEMPLATES } from '../marketing/TemplatesPage';
import {
  X, ArrowLeft, ArrowRight, Save, CheckCircle2, Circle,
  ChevronRight, Shield, Store, Palette, CreditCard, FileText, Eye,
  EyeOff, HelpCircle, BookOpen, Video, MessageCircle, AlertCircle,
  Smartphone, Globe, Clock, Star, Zap, Info, User
} from 'lucide-react';

const BUSINESS_TYPES = [
  { id: 'fashion', label: 'Fashion & Apparel', icon: '\u{1F455}', desc: 'Clothing, accessories, footwear' },
  { id: 'beauty', label: 'Beauty & Cosmetics', icon: '\u{1F484}', desc: 'Skincare, makeup, fragrances' },
  { id: 'electronics', label: 'Electronics & Gadgets', icon: '\u{1F4F1}', desc: 'Phones, laptops, accessories' },
  { id: 'grocery', label: 'Grocery & Food', icon: '\u{1F6D2}', desc: 'Fresh produce, pantry, beverages' },
  { id: 'home-living', label: 'Home & Living', icon: '\u{1F3E0}', desc: 'Furniture, decor, kitchen' },
  { id: 'sports', label: 'Sports & Fitness', icon: '\u26BD', desc: 'Activewear, equipment, gear' },
  { id: 'automotive', label: 'Automotive', icon: '\u{1F697}', desc: 'Parts, accessories, tools' }
];

const CATEGORY_MAP = {
  fashion: 'Fashion',
  beauty: 'Beauty',
  electronics: 'Electronics',
  grocery: 'Grocery',
  'home-living': 'Home & Living',
  sports: 'Sports',
  automotive: 'Automotive'
};

const STEPS = [
  { id: 'account', label: 'Account Setup', icon: '\u{1F464}' },
  { id: 'business', label: 'Business Type', icon: '\u{1F3EA}' },
  { id: 'template', label: 'Template', icon: '\u{1F3A8}' },
  { id: 'plan', label: 'Plan', icon: '\u{1F4CA}' },
  { id: 'kyc', label: 'KYC & Address', icon: '\u{1F4C4}' },
  { id: 'review', label: 'Review', icon: '\u2705' }
];

const NEXT_LABELS = [
  'Next: Business Type \u2192',
  'Next: Template \u2192',
  'Next: Plan \u2192',
  'Next: KYC & Address \u2192',
  'Next: Review \u2192',
];

const getPwdStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '#E2E8F0', width: '0%' };
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { level: 1, label: 'Weak', color: '#DC2626', width: '20%' };
  if (s <= 3) return { level: 2, label: 'Fair', color: '#F59E0B', width: '50%' };
  return { level: 3, label: 'Strong', color: '#16A34A', width: '80%' };
};

const PwdInput = ({ label, field, placeholder, showState, toggleShow, form, update }) => (
  <div className="ob-field">
    <label className="ob-label">{label}<span className="ob-req">*</span></label>
    <div className="ob-input-wrap">
      <input className="ob-input" type={showState ? 'text' : 'password'} minLength="6"
        placeholder={placeholder} value={form[field]}
        onChange={e => update(field, e.target.value)} />
      <button type="button" className="ob-pwd-toggle" onClick={toggleShow}
        aria-label={showState ? 'Hide password' : 'Show password'}>
        {showState ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const InputField = ({ label, required, ...props }) => (
  <div className="ob-field">
    <label className="ob-label">{label}{required && <span className="ob-req">*</span>}</label>
    <div className="ob-input-wrap">
      <input className="ob-input" {...props} />
    </div>
  </div>
);

const TextAreaField = ({ label, required, ...props }) => (
  <div className="ob-field">
    <label className="ob-label">{label}{required && <span className="ob-req">*</span>}</label>
    <div className="ob-input-wrap">
      <textarea className="ob-input ob-textarea" {...props} />
    </div>
  </div>
);

const SectionTitle = ({ icon, children }) => (
  <div className="ob-section-title">
    <span className="ob-section-icon">{icon}</span>
    <span>{children}</span>
  </div>
);

const ProgressStepper = ({ currentStep }) => {
  const pct = Math.round(((currentStep + 1) / STEPS.length) * 100);
  return (
    <div className="ob-stepper">
      <div className="ob-stepper-dots">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="ob-st-dot-wrap">
              <div className={`ob-st-dot ${idx < currentStep ? 'ob-st-done' : ''} ${idx === currentStep ? 'ob-st-curr' : ''} ${idx > currentStep ? 'ob-st-pend' : ''}`}>
                {idx < currentStep ? <CheckCircle2 size={14} /> : step.icon}
              </div>
              <span className={`ob-st-lbl ${idx === currentStep ? 'ob-st-lbl-a' : ''}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`ob-st-line ${idx < currentStep ? 'ob-st-line-done' : ''} ${idx === currentStep ? 'ob-st-line-prog' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="ob-stepper-meta">
        <span className="ob-s-count">Step {currentStep + 1} of {STEPS.length} <span className="ob-s-name">{STEPS[currentStep].label}</span></span>
        <span className="ob-s-pct">{pct}% complete</span>
        <span className="ob-s-time"><Clock size={12} /> About 2{'\u2013'}3 min</span>
      </div>
      <div className="ob-progress-track">
        <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const SellerOnboarding = ({ onComplete }) => {
  const { register, sendVerificationOtp, verifySignupOtp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phone: '',
    storeName: '', storeDescription: '',
    businessType: '',
    selectedTemplate: '',
    selectedPlan: '',
    gstin: '',
    address: '', city: '', state: '', country: 'India', postalCode: '',
    panNumber: '',
    bankAccountHolder: '', bankName: '', bankAccountNumber: '', bankIfscCode: '',
    docGovId: '', docPan: '', docGst: '', docBizReg: '', docBank: ''
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const startCooldown = () => {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const currentTemplates = form.businessType ? TEMPLATES.filter(t => t.category === CATEGORY_MAP[form.businessType]) : [];
  const currentPlans = SUBSCRIPTION_PLANS;
  const pwdStrength = getPwdStrength(form.password);

  const validateStep = (step) => {
    setError('');
    if (step === 0) {
      if (!form.firstName || !form.lastName) { setError('First and last name required.'); return false; }
      if (!form.email) { setError('Email is required.'); return false; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false; }
      if (!form.phone) { setError('Phone number is required.'); return false; }
      if (!form.storeName) { setError('Store name is required.'); return false; }
      return true;
    }
    if (step === 1) {
      if (!form.businessType) { setError('Please select a business type.'); return false; }
      return true;
    }
    if (step === 2) {
      if (!form.selectedTemplate) { setError('Please select a template.'); return false; }
      return true;
    }
    if (step === 3) {
      if (!form.selectedPlan) { setError('Please select a subscription plan.'); return false; }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        setTransitioning(false);
      }, 200);
    }
  };

  const prevStep = () => {
    setError('');
    setTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 0));
      setTransitioning(false);
    }, 200);
  };

  const handleRegister = async () => {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const data = await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        role: 'Seller',
        storeName: form.storeName,
        storeDescription: form.storeDescription || form.businessType + ' store',
        gstin: form.gstin,
        businessType: form.businessType,
        selectedTemplate: form.selectedTemplate,
        selectedPlan: form.selectedPlan,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        panNumber: form.panNumber,
        bankAccountHolder: form.bankAccountHolder,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankIfscCode: form.bankIfscCode,
        docGovId: form.docGovId,
        docPan: form.docPan,
        docGst: form.docGst,
        docBizReg: form.docBizReg,
        docBank: form.docBank
      });
      setPendingUserId(data.userId);
      setMessage('Account created! Check your email for the OTP.');
      setOtpMode(true);
      startCooldown();
    } catch (err) {
      setError(err.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await verifySignupOtp(form.email, otp);
      setMessage('Email verified!');
      if (onComplete) {
        setTimeout(() => onComplete(data.user), 1500);
      }
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
      await sendVerificationOtp(form.email);
      setMessage('New OTP sent to your email.');
      startCooldown();
    } catch (err) {
      setError(err.error || 'Failed to resend OTP.');
    }
  };

  const handleCancel = () => {
    window.location.hash = 'auth';
  };

  const handleSaveDraft = () => {
    setMessage('Progress saved locally.');
    setTimeout(() => setMessage(''), 2000);
  };

  const renderAccountStep = () => (
    <div className="ob-step">
      <h3 className="ob-step-title">Create Your Account</h3>
      <p className="ob-step-desc">Enter your details to set up your seller profile.</p>

      <div className="ob-section">
        <SectionTitle icon={<User size={14} />}>Personal Information</SectionTitle>
        <div className="ob-row">
          <InputField label="First Name" required placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
          <InputField label="Last Name" required placeholder="Doe" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
        </div>
        <div className="ob-row">
          <InputField label="Email" required type="email" placeholder="your@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
          <InputField label="Phone" required type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
      </div>

      <div className="ob-section">
        <SectionTitle icon={<Store size={14} />}>Business Information</SectionTitle>
        <InputField label="Store Name" required placeholder="My Awesome Store" value={form.storeName} onChange={e => update('storeName', e.target.value)} />
        <TextAreaField label="Store Description" rows="2" placeholder="What do you sell?" value={form.storeDescription} onChange={e => update('storeDescription', e.target.value)} />
      </div>

      <div className="ob-section">
        <SectionTitle icon={<Shield size={14} />}>Security</SectionTitle>
        <div className="ob-row">
          <PwdInput label="Password" field="password" placeholder="At least 6 characters" showState={showPwd} toggleShow={() => setShowPwd(p => !p)} form={form} update={update} />
          <PwdInput label="Confirm Password" field="confirmPassword" placeholder="Repeat password" showState={showConfirm} toggleShow={() => setShowConfirm(p => !p)} form={form} update={update} />
        </div>
        {form.password && (
          <div className="ob-pwd-strength">
            <div className="ob-pwd-bar"><div className="ob-pwd-fill" style={{ width: pwdStrength.width, background: pwdStrength.color }} /></div>
            <span className="ob-pwd-lbl" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderBusinessStep = () => (
    <div className="ob-step">
      <h3 className="ob-step-title">What type of business?</h3>
      <p className="ob-step-desc">Select your industry so we can recommend the best template and plan.</p>
      <div className="ob-grid ob-grid-3">
        {BUSINESS_TYPES.map(bt => (
          <div key={bt.id} onClick={() => { update('businessType', bt.id); update('selectedTemplate', ''); }}
            className={`ob-card ${form.businessType === bt.id ? 'ob-card-sel' : ''}`}>
            <div className="ob-card-icon">{bt.icon}</div>
            <h4 className="ob-card-title">{bt.label}</h4>
            <p className="ob-card-desc">{bt.desc}</p>
            {form.businessType === bt.id && <div className="ob-check-ring"><CheckCircle2 size={10} color="#fff" /></div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplateStep = () => (
    <div className="ob-step">
      <h3 className="ob-step-title">Choose Your Template</h3>
      <p className="ob-step-desc">
        {form.businessType ? `Templates for ${BUSINESS_TYPES.find(b => b.id === form.businessType)?.label || form.businessType}` : 'Please select a business type first.'}
      </p>
      {currentTemplates.length === 0 ? (
        <div className="ob-empty"><AlertCircle size={20} /> No templates available for this category.</div>
      ) : (
        <div className="ob-tmpl-grid">
          {currentTemplates.map(tmpl => (
            <div key={tmpl.id} onClick={() => update('selectedTemplate', tmpl.id)}
              className={`ob-tmpl-card ${form.selectedTemplate === tmpl.id ? 'ob-tmpl-sel' : ''}`}>
              <div className="ob-tmpl-img" style={{ backgroundImage: `url(${tmpl.image})` }}>
                <div className="ob-tmpl-overlay" />
              </div>
              <div className="ob-tmpl-body">
                <span className="ob-tmpl-cat">{tmpl.category}</span>
                <h4 className="ob-tmpl-name">{tmpl.title}</h4>
                <p className="ob-tmpl-desc">{tmpl.desc}</p>
                <div className="ob-tmpl-actions">
                  <span className="ob-tmpl-select-badge">{form.selectedTemplate === tmpl.id ? 'Selected' : 'Click to select'}</span>
                  <span className="ob-tmpl-preview-link" onClick={e => { e.stopPropagation(); window.open(window.location.origin + window.location.pathname + '#template-preview?template=' + tmpl.id + '&storeName=' + encodeURIComponent(form.storeName || tmpl.title), '_blank'); }}>Preview &nearr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPlanStep = () => (
    <div className="ob-step">
      <h3 className="ob-step-title">Choose Your Plan</h3>
      <p className="ob-step-desc">Pick a plan that fits your scale. All plans include a 14-day free trial.</p>
      <div className="ob-plan-grid">
        {currentPlans.map(plan => (
          <div key={plan.key} onClick={() => update('selectedPlan', plan.key)}
            className={`ob-plan-card2 ${form.selectedPlan === plan.key ? 'ob-plan-sel' : ''}`}>
            {plan.badge && <span className="ob-plan-badge">{plan.badge}</span>}
            <div className="ob-plan-head">
              <div>
                <h4 className="ob-plan-name">{plan.name}</h4>
                <p className="ob-plan-desc">{plan.description}</p>
              </div>
              <div className="ob-plan-price-wrap">
                <span className="ob-plan-amount">{'\u20B9'}{plan.priceINR}</span>
                <span className="ob-plan-period">/month</span>
              </div>
            </div>
            <ul className="ob-plan-features">
              {plan.features.map((f, i) => (
                <li key={i} className={f.included ? 'ob-plan-feat-yes' : 'ob-plan-feat-no'}>
                  {f.included ? <CheckCircle2 size={14} className="ob-plan-feat-icon ob-plan-feat-icon-yes" /> : <Circle size={14} className="ob-plan-feat-icon ob-plan-feat-icon-no" />}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKycStep = () => (
    <div className="ob-step">
      <h3 className="ob-step-title">KYC & Address Details</h3>
      <p className="ob-step-desc">Provide your business address and verification documents.</p>

      <div className="ob-section">
        <SectionTitle icon={<Globe size={14} />}>Store Address</SectionTitle>
        <InputField label="Street Address" placeholder="123 Market St" value={form.address} onChange={e => update('address', e.target.value)} />
        <div className="ob-row ob-row-3">
          <InputField label="City" placeholder="Mumbai" value={form.city} onChange={e => update('city', e.target.value)} />
          <InputField label="State" placeholder="Maharashtra" value={form.state} onChange={e => update('state', e.target.value)} />
          <InputField label="Postal Code" placeholder="400001" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} />
        </div>
        <div className="ob-row">
          <InputField label="Country" value={form.country} onChange={e => update('country', e.target.value)} />
          <InputField label="GSTIN" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => update('gstin', e.target.value)} />
        </div>
      </div>

      <div className="ob-section">
        <SectionTitle icon={<CreditCard size={14} />}>Bank Details</SectionTitle>
        <div className="ob-row">
          <InputField label="Account Holder" value={form.bankAccountHolder} onChange={e => update('bankAccountHolder', e.target.value)} />
          <InputField label="Bank Name" value={form.bankName} onChange={e => update('bankName', e.target.value)} />
        </div>
        <div className="ob-row">
          <InputField label="Account Number" value={form.bankAccountNumber} onChange={e => update('bankAccountNumber', e.target.value)} />
          <InputField label="IFSC Code" placeholder="SBIN0001234" value={form.bankIfscCode} onChange={e => update('bankIfscCode', e.target.value)} />
        </div>
        <InputField label="PAN Number" placeholder="ABCDE1234F" value={form.panNumber} onChange={e => update('panNumber', e.target.value)} />
      </div>

      <div className="ob-section">
        <SectionTitle icon={<FileText size={14} />}>Verification Documents</SectionTitle>
        <div className="ob-row">
          <InputField label="Government ID Link" placeholder="Aadhaar / Passport Link" value={form.docGovId} onChange={e => update('docGovId', e.target.value)} />
          <InputField label="PAN Card Link" placeholder="PAN Card Copy Link" value={form.docPan} onChange={e => update('docPan', e.target.value)} />
        </div>
        <div className="ob-row">
          <InputField label="GST Certificate Link" placeholder="GST Copy Link" value={form.docGst} onChange={e => update('docGst', e.target.value)} />
          <InputField label="Business Registration" placeholder="Registration Copy Link" value={form.docBizReg} onChange={e => update('docBizReg', e.target.value)} />
        </div>
        <InputField label="Bank Statement Link" placeholder="Statement / Passbook Copy Link" value={form.docBank} onChange={e => update('docBank', e.target.value)} />
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selTemplate = currentTemplates.find(t => t.id === form.selectedTemplate);
    const selPlan = currentPlans.find(p => p.key === form.selectedPlan);
    const selBiz = BUSINESS_TYPES.find(b => b.id === form.businessType);
    return (
      <div className="ob-step">
        <h3 className="ob-step-title">Review Your Application</h3>
        <p className="ob-step-desc">Please verify all information before submitting.</p>
        <div className="ob-review-card">
          <div className="ob-review-heading"><User size={14} /> Account</div>
          <div className="ob-review-grid">
            <div><span className="ob-rlbl">Name:</span> {form.firstName} {form.lastName}</div>
            <div><span className="ob-rlbl">Email:</span> {form.email}</div>
            <div><span className="ob-rlbl">Phone:</span> {form.phone}</div>
            <div><span className="ob-rlbl">Store:</span> {form.storeName}</div>
          </div>
        </div>
        <div className="ob-review-card">
          <div className="ob-review-heading"><Store size={14} /> Business</div>
          <div className="ob-review-single">
            <div><span className="ob-rlbl">Type:</span> {selBiz ? selBiz.label : form.businessType}</div>
            <div><span className="ob-rlbl">Template:</span> {selTemplate ? selTemplate.title : form.selectedTemplate}</div>
            <div><span className="ob-rlbl">Plan:</span> {selPlan ? `${selPlan.name} (\u20B9${selPlan.priceINR}/mo)` : form.selectedPlan}</div>
          </div>
        </div>
        <div className="ob-review-card">
          <div className="ob-review-heading"><Globe size={14} /> Address & KYC</div>
          <div className="ob-review-single">
            <div><span className="ob-rlbl">Address:</span> {form.address || '\u2014'}, {form.city || '\u2014'}, {form.state || '\u2014'}</div>
            <div><span className="ob-rlbl">GSTIN:</span> {form.gstin || '\u2014'}</div>
            <div><span className="ob-rlbl">PAN:</span> {form.panNumber || '\u2014'}</div>
            <div><span className="ob-rlbl">Bank:</span> {form.bankName || '\u2014'} ****{form.bankAccountNumber ? form.bankAccountNumber.slice(-4) : '\u2014'}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderOtpStep = () => (
    <div className="ob-step ob-step-center">
      <div className="ob-otp-icon"><Smartphone size={32} /></div>
      <h3 className="ob-step-title">Verify Your Email</h3>
      <p className="ob-step-desc">Enter the 6-digit OTP sent to <strong>{form.email}</strong></p>
      <form onSubmit={handleVerifyOtp}>
        <div className="ob-otp-input-wrap">
          <input className="ob-input ob-otp-input" type="text" inputMode="numeric" maxLength="6" placeholder="000000"
            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        </div>
        <button type="submit" className="ob-btn ob-btn-primary ob-otp-submit" disabled={submitting}>
          {submitting ? 'Verifying...' : 'Verify OTP'}
        </button>
        <p className="ob-otp-resend">
          {cooldown > 0 ? (
            <span className="ob-muted-text">Resend OTP in {cooldown}s</span>
          ) : (
            <span className="ob-link" onClick={handleResendOtp}>Resend OTP</span>
          )}
        </p>
      </form>
      {error && <div className="ob-msg ob-msg-error ob-otp-error">{error}</div>}
    </div>
  );

  const selBiz = BUSINESS_TYPES.find(b => b.id === form.businessType);
  const selTemplate = currentTemplates.find(t => t.id === form.selectedTemplate);
  const selPlan = currentPlans.find(p => p.key === form.selectedPlan);

  const sidebar = (
    <div className="ob-sidebar">
      <div className="ob-sb-card">
        <div className="ob-sb-card-title"><Zap size={14} /> Setup Progress</div>
        <div className="ob-sb-checklist">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`ob-sb-check-item ${i < currentStep ? 'ob-sb-done' : ''} ${i === currentStep ? 'ob-sb-curr' : ''}`}>
              {i < currentStep ? <CheckCircle2 size={14} color="#16A34A" /> : i === currentStep ? <ChevronRight size={14} color="#4F46E5" /> : <Circle size={14} color="#CBD5E1" />}
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-sb-card">
        <div className="ob-sb-card-title"><Info size={14} /> Selected Options</div>
        {form.businessType && (
          <div className="ob-sb-info-row">
            <Store size={12} />
            <div><span className="ob-sb-lbl">Business Type</span><span className="ob-sb-val">{selBiz?.label}</span></div>
          </div>
        )}
        {form.selectedTemplate && (
          <div className="ob-sb-info-row">
            <Palette size={12} />
            <div><span className="ob-sb-lbl">Template</span><span className="ob-sb-val">{selTemplate?.title}</span></div>
          </div>
        )}
        {form.selectedPlan && (
          <div className="ob-sb-info-row">
            <CreditCard size={12} />
            <div><span className="ob-sb-lbl">Plan</span><span className="ob-sb-val">{selPlan?.name} ({'\u20B9'}{selPlan?.priceINR}/mo)</span></div>
          </div>
        )}
        {!form.businessType && !form.selectedTemplate && !form.selectedPlan && (
          <p className="ob-sb-empty">Select options as you go through each step.</p>
        )}
      </div>

      <div className="ob-sb-card ob-sb-tips">
        <div className="ob-sb-card-title"><Star size={14} /> Tips</div>
        <ul className="ob-sb-tip-list">
          <li>Use a valid email for OTP verification</li>
          <li>Keep your PAN and GSTIN handy</li>
          <li>Choose a plan that fits your scale</li>
          <li>You can customize your store later</li>
        </ul>
      </div>

      <div className="ob-sb-card">
        <div className="ob-sb-card-title"><HelpCircle size={14} /> Help & Support</div>
        <div className="ob-sb-help-links">
          <div className="ob-sb-help-item" onClick={() => setShowDocs(true)}><BookOpen size={12} /> Documentation</div>
          <div className="ob-sb-help-item"><Video size={12} /> Video Tutorial</div>
          <div className="ob-sb-help-item ob-sb-chat"><MessageCircle size={12} /> Live Chat</div>
        </div>
      </div>
    </div>
  );

  if (otpMode) {
    return (
      <div className="ob-overlay">
        <style>{css}</style>
        <div className="ob-layout">
          <div className="ob-topbar">
            <div className="ob-topbar-inner">
              <div className="ob-brand">
                <span className="ob-pill"><Zap size={10} /> SnapShop Platform</span>
              </div>
              <button onClick={handleCancel} className="ob-topbar-close" aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="ob-body">
            <div className="ob-main">
              <div className="ob-main-inner">
                <div className="ob-content">
                  {message && <div className="ob-msg ob-msg-success">{message}</div>}
                  {renderOtpStep()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ob-overlay">
      <style>{css}</style>
      <div className="ob-layout">
        <div className="ob-topbar">
          <div className="ob-topbar-inner">
            <div className="ob-brand">
              <span className="ob-pill"><Zap size={10} /> SnapShop Platform</span>
              <div className="ob-brand-text">
                <span className="ob-brand-title">Build Your Store</span>
                <span className="ob-brand-sub">SaaS Onboarding</span>
              </div>
            </div>
            <button onClick={handleCancel} className="ob-topbar-close" aria-label="Cancel setup">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="ob-body">
          <div className="ob-main">
            <div className="ob-main-inner">
              <ProgressStepper currentStep={currentStep} />
              <div className={`ob-content ${transitioning ? 'ob-fade-out' : 'ob-fade-in'}`}>
                {message && <div className="ob-msg ob-msg-success"><CheckCircle2 size={14} /> {message}</div>}
                {!message && error && <div className="ob-msg ob-msg-error"><AlertCircle size={14} /> {error}</div>}
                {currentStep === 0 && renderAccountStep()}
                {currentStep === 1 && renderBusinessStep()}
                {currentStep === 2 && renderTemplateStep()}
                {currentStep === 3 && renderPlanStep()}
                {currentStep === 4 && renderKycStep()}
                {currentStep === 5 && renderReviewStep()}
              </div>
            </div>
          </div>
          <div className="ob-sidebar-wrap">
            {sidebar}
          </div>
        </div>

        <div className="ob-bottombar">
          <div className="ob-bottombar-inner">
            <div className="ob-bottombar-left">
              <button onClick={handleCancel} className="ob-btn ob-btn-ghost" disabled={submitting}>
                <X size={14} /> Cancel Setup
              </button>
              <button onClick={handleSaveDraft} className="ob-btn ob-btn-ghost" disabled={submitting}>
                <Save size={14} /> Save Draft
              </button>
            </div>
            <div className="ob-bottombar-right">
              <button onClick={prevStep} className="ob-btn ob-btn-secondary" disabled={currentStep === 0 || submitting || transitioning}>
                <ArrowLeft size={14} /> Back
              </button>
              {currentStep < STEPS.length - 1 ? (
                <button onClick={nextStep} className="ob-btn ob-btn-primary" disabled={transitioning}>
                  {transitioning ? 'Loading...' : NEXT_LABELS[currentStep]} <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={handleRegister} className="ob-btn ob-btn-primary ob-btn-submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDocs && (
        <div className="ob-docs-overlay" onClick={() => setShowDocs(false)}>
          <div className="ob-docs-modal" onClick={e => e.stopPropagation()}>
            <div className="ob-docs-header">
              <BookOpen size={18} />
              <span>Setup Documentation</span>
              <button className="ob-docs-close" onClick={() => setShowDocs(false)}><X size={16} /></button>
            </div>
            <div className="ob-docs-body">
              <div className="ob-docs-section">
                <h4>1. Create Your Account</h4>
                <p>Enter your personal details (First Name, Last Name, Email, Phone) and set up your store identity (Store Name, Description). Choose a strong password to secure your account.</p>
              </div>
              <div className="ob-docs-section">
                <h4>2. Select Business Type</h4>
                <p>Choose the industry that best describes your business — Fashion, Beauty, Electronics, Grocery, Home &amp; Living, Sports, or Automotive. This helps us recommend the right template and plan.</p>
              </div>
              <div className="ob-docs-section">
                <h4>3. Choose a Template</h4>
                <p>Browse templates tailored to your business type. Click <strong>Preview</strong> to see a live demo in a new tab. Click anywhere on the card to select your preferred design. You can customise it later.</p>
              </div>
              <div className="ob-docs-section">
                <h4>4. Select a Plan</h4>
                <p>Compare plans side by side — from Free to Enterprise. Each plan lists all included features. Higher tiers unlock unlimited products, staff accounts, API access, and priority support. All paid plans include a 14-day free trial.</p>
              </div>
              <div className="ob-docs-section">
                <h4>5. KYC &amp; Address</h4>
                <p>Provide your store address and verification documents (PAN, GSTIN, Bank details). This information is required to activate your seller account and process payouts.</p>
              </div>
              <div className="ob-docs-section">
                <h4>6. Review &amp; Submit</h4>
                <p>Double-check all the information you entered. Once submitted, our team will review your application. You'll receive an email confirmation and can track your approval status.</p>
              </div>
              <div className="ob-docs-section ob-docs-tips">
                <h4>Tips for a smooth setup</h4>
                <ul>
                  <li>Use a valid email address — you'll need to verify it via OTP</li>
                  <li>Keep your PAN card and GSTIN handy before starting the KYC step</li>
                  <li>Store Name is how customers see your store — choose something memorable</li>
                  <li>You can change your template and plan later from your seller dashboard</li>
                  <li>All paid plans come with a 14-day free trial — no commitment required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const css = `

.ob-overlay {
  position: fixed; inset: 0; z-index: 9999;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden; background: #F8FAFC;
}

.ob-layout {
  display: flex; flex-direction: column;
  height: 100vh; width: 100%;
}

.ob-topbar {
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid #E2E8F0;
  padding: 0 1.5rem;
}
.ob-topbar-inner {
  display: flex; align-items: center; justify-content: space-between;
  max-width: 1440px; width: 100%; margin: 0 auto;
  height: 48px;
}
.ob-brand {
  display: flex; align-items: center; gap: 0.5rem;
}
.ob-pill {
  display: inline-flex; align-items: center; gap: 3px;
  background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
  color: #4F46E5; padding: 0.2rem 0.55rem;
  border-radius: 9999px; font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.03em;
}
.ob-brand-text {
  display: flex; flex-direction: column; gap: 0;
  line-height: 1.2;
}
.ob-brand-title {
  font-size: 0.8rem; font-weight: 700; color: #0F172A;
}
.ob-brand-sub {
  font-size: 0.6rem; font-weight: 500; color: #94A3B8;
}
.ob-topbar-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: none; border: none; cursor: pointer;
  color: #94A3B8; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.ob-topbar-close:hover { background: #F1F5F9; color: #475569; }

.ob-body {
  flex: 1; min-height: 0; display: flex;
  max-width: 1440px; width: 100%; margin: 0 auto;
  overflow: hidden; padding-bottom: 56px;
}

.ob-main {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  overflow: hidden;
}
.ob-main-inner {
  display: flex; flex-direction: column; flex: 1; min-height: 0;
  padding: 1.25rem 2rem 0;
  overflow: hidden;
}
.ob-content {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 0 0.25rem 1.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}
.ob-content::-webkit-scrollbar { width: 4px; }
.ob-content::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

.ob-sidebar-wrap {
  width: 30%; min-width: 280px; max-width: 360px;
  overflow-y: auto; padding: 1.25rem 1.5rem 1.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: #CBD5E1 transparent;
}

.ob-sidebar {
  display: flex; flex-direction: column; gap: 0.75rem;
}

.ob-sb-card {
  background: #fff; border-radius: 12px;
  border: 1px solid #E2E8F0;
  padding: 0.9rem 1rem;
  transition: box-shadow 0.2s;
}
.ob-sb-card-title {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; font-weight: 700; color: #0F172A;
  margin-bottom: 0.6rem;
}

.ob-sb-checklist { display: flex; flex-direction: column; gap: 0.35rem; }
.ob-sb-check-item {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.75rem; color: #94A3B8;
}
.ob-sb-done { color: #16A34A; }
.ob-sb-curr { color: #4F46E5; font-weight: 600; }

.ob-sb-info-row {
  display: flex; align-items: flex-start; gap: 0.5rem;
  padding: 0.4rem 0; border-bottom: 1px solid #F8FAFC;
  font-size: 0.72rem;
}
.ob-sb-info-row:last-child { border-bottom: none; }
.ob-sb-info-row > div { display: flex; flex-direction: column; gap: 0.05rem; }
.ob-sb-lbl { color: #94A3B8; font-size: 0.62rem; }
.ob-sb-val { color: #0F172A; font-weight: 600; font-size: 0.75rem; }
.ob-sb-empty { font-size: 0.7rem; color: #CBD5E1; margin: 0; }

.ob-sb-tips { background: linear-gradient(135deg, #FFFBEB, #FFF7ED); border-color: #FDE68A; }
.ob-sb-tip-list { margin: 0; padding: 0 0 0 1rem; font-size: 0.7rem; color: #92400E; display: flex; flex-direction: column; gap: 0.3rem; }
.ob-sb-tip-list li { margin: 0; }

.ob-sb-help-links { display: flex; flex-direction: column; gap: 0.3rem; }
.ob-sb-help-item {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; color: #475569; cursor: pointer;
  padding: 0.3rem 0.5rem; border-radius: 6px;
  transition: background 0.15s;
}
.ob-sb-help-item:hover { background: #F1F5F9; }
.ob-sb-chat { color: #4F46E5; font-weight: 600; }

.ob-docs-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(15,23,42,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.ob-docs-modal {
  background: #fff; border-radius: 16px;
  max-width: 640px; width: 100%; max-height: 85vh;
  overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.2);
}
.ob-docs-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E2E8F0;
  font-weight: 700; font-size: 0.95rem; color: #0F172A;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.ob-docs-close {
  margin-left: auto; background: none; border: none;
  cursor: pointer; color: #94A3B8; padding: 4px;
  display: flex; align-items: center; border-radius: 6px;
}
.ob-docs-close:hover { background: #F1F5F9; color: #475569; }
.ob-docs-body { padding: 1rem 1.25rem 1.25rem; }
.ob-docs-section { margin-bottom: 1rem; }
.ob-docs-section h4 { margin: 0 0 0.25rem; font-size: 0.82rem; font-weight: 700; color: #0F172A; }
.ob-docs-section p { margin: 0; font-size: 0.75rem; color: #475569; line-height: 1.55; }
.ob-docs-tips { background: #FFFBEB; border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 0; }
.ob-docs-tips h4 { color: #92400E; }
.ob-docs-tips ul { margin: 0.3rem 0 0; padding: 0 0 0 1rem; }
.ob-docs-tips li { font-size: 0.72rem; color: #92400E; margin-bottom: 0.25rem; line-height: 1.4; }

.ob-bottombar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid #E2E8F0;
  padding: 0 1.5rem;
}
.ob-bottombar-inner {
  display: flex; align-items: center; justify-content: space-between;
  max-width: 1440px; width: 100%; margin: 0 auto;
  height: 56px;
}
.ob-bottombar-left { display: flex; gap: 0.4rem; }
.ob-bottombar-right { display: flex; gap: 0.5rem; }

.ob-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.5rem 1rem; border: none; border-radius: 8px;
  font-weight: 600; font-size: 0.8rem; cursor: pointer;
  transition: all 0.2s; font-family: inherit; line-height: 1.3;
}
.ob-btn-primary {
  background: linear-gradient(135deg, #4F46E5, #4338CA);
  color: #fff;
}
.ob-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.35); }
.ob-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.ob-btn-secondary {
  background: #F1F5F9; color: #0F172A; border: 1px solid #E2E8F0;
}
.ob-btn-secondary:hover { background: #E2E8F0; }
.ob-btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }
.ob-btn-ghost {
  background: transparent; color: #64748B; font-size: 0.72rem;
}
.ob-btn-ghost:hover { background: #F1F5F9; color: #475569; }
.ob-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
.ob-btn-submit { background: linear-gradient(135deg, #16A34A, #059669); }
.ob-btn-submit:hover { box-shadow: 0 4px 12px rgba(22,163,74,0.35); }

.ob-stepper { margin-bottom: 0.75rem; flex-shrink: 0; }
.ob-stepper-dots {
  display: flex; align-items: center; justify-content: center;
  gap: 0; padding: 0.15rem 0;
}
.ob-st-dot-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
}
.ob-st-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700;
  transition: all 0.35s ease; border: 2px solid transparent;
  line-height: 1;
}
.ob-st-done { background: #16A34A !important; color: #fff !important; border-color: #16A34A !important; }
.ob-st-curr {
  background: #4F46E5 !important; color: #fff !important;
  border-color: #4F46E5 !important;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.2);
}
.ob-st-pend { background: #F1F5F9; color: #94A3B8; border-color: #E2E8F0; }
.ob-st-lbl { font-size: 0.55rem; color: #94A3B8; white-space: nowrap; font-weight: 500; }
.ob-st-lbl-a { color: #4F46E5; font-weight: 700; }
.ob-st-line {
  height: 2px; width: 28px; background: #E2E8F0;
  margin: 0 2px 0.95rem; transition: background 0.35s; flex-shrink: 0;
}
.ob-st-line-done { background: #16A34A; }
.ob-st-line-prog { background: #4F46E5; }

.ob-stepper-meta {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0.15rem 0 0.3rem; font-size: 0.68rem; color: #64748B;
  flex-wrap: wrap; gap: 0.25rem;
}
.ob-s-count { font-weight: 500; }
.ob-s-name { color: #0F172A; font-weight: 600; }
.ob-s-pct { font-weight: 600; color: #4F46E5; background: #EEF2FF; padding: 0.1rem 0.5rem; border-radius: 9999px; }
.ob-s-time { display: inline-flex; align-items: center; gap: 0.25rem; color: #94A3B8; }

.ob-progress-track {
  height: 3px; background: #F1F5F9; border-radius: 99px; overflow: hidden;
}
.ob-progress-fill {
  height: 100%; background: linear-gradient(to right, #4F46E5, #6366F1);
  border-radius: 99px; transition: width 0.6s ease;
}

.ob-step { }
.ob-step-center { text-align: center; max-width: 400px; margin: 2rem auto; }
.ob-step-title {
  margin: 0 0 0.15rem; font-size: 1.35rem; font-weight: 700; color: #0F172A;
  line-height: 1.25;
}
.ob-step-desc {
  color: #64748B; margin: 0 0 0.75rem; font-size: 0.85rem; line-height: 1.45;
}

.ob-section { margin-bottom: 0.85rem; }
.ob-section-title {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.65rem; font-weight: 700; color: #64748B;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin: 0 0 0.5rem; padding-bottom: 0.3rem;
  border-bottom: 1px solid #F1F5F9;
}
.ob-section-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 6px;
  background: #F1F5F9; color: #64748B;
}

.ob-field { margin-bottom: 0.55rem; flex: 1; min-width: 0; }
.ob-label {
  display: block; font-size: 0.78rem; font-weight: 600; color: #374151;
  margin-bottom: 0.25rem;
}
.ob-req { color: #DC2626; margin-left: 2px; }
.ob-input-wrap { position: relative; display: flex; align-items: center; }
.ob-input {
  width: 100%; height: 42px; padding: 0 14px;
  border: 1.5px solid #E2E8F0; border-radius: 10px;
  font-size: 0.88rem; font-family: inherit; color: #0F172A;
  background: #fff; transition: all 0.2s;
  box-sizing: border-box; outline: none;
}
.ob-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1), 0 1px 2px rgba(0,0,0,0.05); }
.ob-input:hover { border-color: #A5B4FC; }
.ob-input::placeholder { color: #94A3B8; }
.ob-textarea { height: auto; min-height: 60px; padding: 10px 14px; resize: none; line-height: 1.4; }

.ob-pwd-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 4px; color: #94A3B8; transition: color 0.2s;
}
.ob-pwd-toggle:hover { color: #475569; }

.ob-pwd-strength {
  display: flex; align-items: center; gap: 0.4rem;
  margin-top: -0.15rem; margin-bottom: 0.2rem;
}
.ob-pwd-bar { flex: 1; height: 3px; background: #F1F5F9; border-radius: 99px; overflow: hidden; }
.ob-pwd-fill { height: 100%; border-radius: 99px; transition: width 0.3s, background 0.3s; }
.ob-pwd-lbl { font-size: 0.65rem; font-weight: 600; min-width: 36px; }

.ob-row { display: flex; gap: 0.65rem; }
.ob-row-3 { display: flex; gap: 0.65rem; }
.ob-row-3 .ob-field { flex: 1; }

.ob-card {
  padding: 0.75rem 0.6rem; border-radius: 12px; cursor: pointer;
  border: 1.5px solid #E2E8F0; background: #fff;
  transition: all 0.2s; text-align: center; position: relative;
}
.ob-card:hover { border-color: #A5B4FC; background: #FAFAFF; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.ob-card-sel {
  border-color: #4F46E5 !important; background: #F5F3FF !important;
  box-shadow: 0 0 0 1px rgba(79,70,229,0.15);
}
.ob-card-icon { font-size: 1.5rem; margin-bottom: 0.3rem; line-height: 1; }
.ob-card-title {
  margin: 0 0 0.1rem; font-size: 0.8rem; font-weight: 600; color: #0F172A;
}
.ob-card-desc { margin: 0; font-size: 0.65rem; color: #64748B; line-height: 1.3; }
.ob-check-ring {
  position: absolute; top: 4px; right: 4px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #4F46E5; display: flex; align-items: center; justify-content: center;
}
.ob-sel-badge {
  display: inline-block; margin-top: 0.25rem;
  font-size: 0.55rem; font-weight: 700; color: #4F46E5;
  background: #EEF2FF; padding: 0.05rem 0.4rem; border-radius: 4px;
}
.ob-empty {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  color: #94A3B8; text-align: center; padding: 1.5rem; font-size: 0.82rem;
}

.ob-grid { display: grid; gap: 0.55rem; }
.ob-grid-2 { grid-template-columns: 1fr 1fr; }
.ob-grid-3 { grid-template-columns: repeat(3, 1fr); }

.ob-tmpl-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
}
.ob-tmpl-card {
  border-radius: 12px; cursor: pointer; overflow: hidden;
  border: 1.5px solid #E2E8F0; background: #fff;
  transition: all 0.2s;
}
.ob-tmpl-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: #A5B4FC; }
.ob-tmpl-sel { border-color: #4F46E5 !important; box-shadow: 0 0 0 1px rgba(79,70,229,0.2); }
.ob-tmpl-img {
  height: 130px; background-size: cover; background-position: center;
  position: relative;
}
.ob-tmpl-overlay {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.3);
  opacity: 0; transition: opacity 0.2s;
}
.ob-tmpl-card:hover .ob-tmpl-overlay { opacity: 1; }
.ob-tmpl-body { padding: 0.5rem 0.65rem 0.6rem; }
.ob-tmpl-cat {
  font-size: 0.6rem; text-transform: uppercase; font-weight: 700;
  color: #4F46E5; letter-spacing: 0.04em;
}
.ob-tmpl-name { margin: 0.15rem 0 0.15rem; font-size: 0.82rem; font-weight: 700; color: #0F172A; }
.ob-tmpl-desc { margin: 0; font-size: 0.65rem; color: #64748B; line-height: 1.35; }
.ob-tmpl-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 0.35rem;
}
.ob-tmpl-select-badge {
  font-size: 0.6rem; font-weight: 600; color: #4F46E5;
}
.ob-tmpl-preview-link {
  font-size: 0.6rem; color: #94A3B8; font-weight: 500;
  cursor: pointer; transition: color 0.15s;
}
.ob-tmpl-preview-link:hover { color: #4F46E5; }

.ob-plan-grid {
  display: flex; flex-direction: column; gap: 0.7rem;
}
.ob-plan-card2 {
  border-radius: 12px; cursor: pointer; padding: 1rem 1.1rem;
  border: 1.5px solid #E2E8F0; background: #fff;
  transition: all 0.2s; position: relative;
}
.ob-plan-card2:hover { border-color: #A5B4FC; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
.ob-plan-sel { border-color: #4F46E5 !important; background: #F5F3FF !important; box-shadow: 0 0 0 1px rgba(79,70,229,0.15); }
.ob-plan-badge {
  position: absolute; top: -7px; right: 10px;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: #fff; padding: 0.15rem 0.6rem; border-radius: 9999px;
  font-size: 0.58rem; font-weight: 700; letter-spacing: 0.03em;
}
.ob-plan-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; margin-bottom: 0.7rem;
}
.ob-plan-name { margin: 0 0 0.15rem; font-size: 1rem; font-weight: 700; color: #0F172A; }
.ob-plan-desc { margin: 0; font-size: 0.72rem; color: #64748B; }
.ob-plan-price-wrap { text-align: right; flex-shrink: 0; }
.ob-plan-amount { font-size: 1.35rem; font-weight: 800; color: #4F46E5; line-height: 1; }
.ob-plan-period { font-size: 0.65rem; color: #94A3B8; font-weight: 400; display: block; margin-top: 1px; }
.ob-plan-features { list-style: none; padding: 0; margin: 0; }
.ob-plan-feat-yes, .ob-plan-feat-no {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.2rem 0; font-size: 0.72rem;
}
.ob-plan-feat-yes { color: #0F172A; }
.ob-plan-feat-no { color: #CBD5E1; }
.ob-plan-feat-icon { flex-shrink: 0; }
.ob-plan-feat-icon-yes { color: #16A34A; }
.ob-plan-feat-icon-no { color: #CBD5E1; }

.ob-review-card {
  background: #fff; border-radius: 12px; padding: 0.75rem 1rem;
  margin-bottom: 0.55rem; border: 1px solid #E2E8F0;
}
.ob-review-heading {
  display: flex; align-items: center; gap: 0.35rem;
  margin: 0 0 0.4rem; font-size: 0.8rem; color: #0F172A; font-weight: 600;
}
.ob-review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem; font-size: 0.8rem; }
.ob-review-single { font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.2rem; }
.ob-rlbl { color: #94A3B8; font-weight: 500; }

.ob-msg {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.75rem; border-radius: 8px;
  margin-bottom: 0.55rem; font-size: 0.78rem; line-height: 1.35;
}
.ob-msg-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }
.ob-msg-error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }

.ob-otp-icon { margin-bottom: 0.75rem; color: #4F46E5; }
.ob-otp-input-wrap { max-width: 280px; margin: 0 auto; }
.ob-otp-input { text-align: center; font-size: 1.3rem; letter-spacing: 8px; font-family: monospace; height: 48px; }
.ob-otp-submit { width: 100%; margin-top: 0.65rem; justify-content: center; padding: 0.65rem; }
.ob-otp-resend { text-align: center; margin-top: 0.65rem; font-size: 0.78rem; }
.ob-otp-error { max-width: 280px; margin: 0.5rem auto 0; }
.ob-muted-text { color: #94A3B8; }
.ob-link { color: #4F46E5; cursor: pointer; font-weight: 600; }
.ob-link:hover { text-decoration: underline; }

.ob-fade-in { animation: obFadeIn 0.25s ease-out; }
.ob-fade-out { animation: obFadeOut 0.15s ease-in; }

@keyframes obFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes obFadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-4px); }
}

@media (max-width: 1024px) {
  .ob-sidebar-wrap { width: 35%; min-width: 240px; }
}
@media (max-width: 900px) {
  .ob-body { flex-direction: column; padding-bottom: 100px; }
  .ob-sidebar-wrap {
    width: 100%; min-width: 0; max-width: none;
    padding: 0 1rem 1rem; overflow-y: visible;
    order: 2;
  }
  .ob-main { order: 1; }
  .ob-main-inner { padding: 0.75rem 1rem 0; }
  .ob-grid-3 { grid-template-columns: repeat(2, 1fr); }
  .ob-bottombar-inner { height: auto; padding: 0.5rem 0; flex-wrap: wrap; gap: 0.5rem; }
  .ob-bottombar-left { order: 2; width: 100%; justify-content: center; }
  .ob-bottombar-right { order: 1; width: 100%; justify-content: center; }
}
@media (max-width: 600px) {
  .ob-main-inner { padding: 0.5rem 0.75rem 0; }
  .ob-stepper-meta { font-size: 0.6rem; }
  .ob-st-line { width: 16px; margin: 0 1px 0.8rem; }
  .ob-st-dot { width: 22px; height: 22px; font-size: 0.65rem; }
  .ob-st-lbl { font-size: 0.48rem; }
  .ob-step-title { font-size: 1.15rem; }
  .ob-step-desc { font-size: 0.78rem; margin-bottom: 0.55rem; }
  .ob-row { flex-direction: column; gap: 0; }
  .ob-row-3 { flex-direction: column; gap: 0; }
  .ob-grid-2 { grid-template-columns: 1fr; }
  .ob-grid-3 { grid-template-columns: 1fr; }
  .ob-card { padding: 0.55rem; }
  .ob-review-grid { grid-template-columns: 1fr; }
  .ob-content { overflow-y: visible; }
  .ob-sidebar-wrap { padding: 0 0.75rem 0.75rem; }
  .ob-bottombar { padding: 0 0.75rem; }
}
`;

export default SellerOnboarding;
