import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles, ShoppingBag, Package, CreditCard, Bot, BarChart3, ShieldCheck,
  ChevronRight, Check, Plus, ArrowUpRight, Store, Globe,
  Layout, Palette, Zap, ArrowRight,
  ExternalLink, Activity
} from 'lucide-react';
import '../../layouts/marketing.css';
import { TEMPLATES } from './TemplatesPage';
import SUBSCRIPTION_PLANS from '../../templates/_shared/data/subscriptionPlans';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  })
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  }
};

const SectionHeader = ({ tag, title, subtitle, align = 'center' }) => (
  <motion.div
    className={`section-header${align === 'left' ? '-left' : ''}`}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={staggerContainer}
  >
    {tag && (
      <motion.span className="section-tag" variants={fadeUp} custom={0}>
        <Sparkles size={14} /> {tag}
      </motion.span>
    )}
    {title && (
      <motion.h2 className="section-title" variants={fadeUp} custom={1}>
        {title}
      </motion.h2>
    )}
    {subtitle && (
      <motion.p className="section-subtitle" variants={fadeUp} custom={2}>
        {subtitle}
      </motion.p>
    )}
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="feature-icon-wrapper">
        <Icon />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </motion.div>
  );
};

const StatCounter = ({ value, label, icon: Icon, suffix = '+', withComma = false }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const target = parseInt(value.replace(/,/g, ''));
    const duration = 2000;
    const start = performance.now();
    const raf = () => {
      const now = performance.now();
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [inView, value]);
  return (
    <motion.div ref={ref} className="stat-item" variants={fadeUp}>
      {Icon && <Icon className="stat-icon" />}
      <div className="stat-value">
        {withComma ? count.toLocaleString() : count}
        <span className="stat-plus">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
};

const LandingPage = ({ setView }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [templateCategory, setTemplateCategory] = useState('All');
  const [email, setEmail] = useState('');
  const heroRef = useRef(null);

  const toggleFaq = (i) => setOpenFaqIndex(openFaqIndex === i ? null : i);

  const handleNav = (targetView) => {
    setView(targetView);
    window.location.hash = targetView === 'home' ? '' : targetView;
  };
  const handlePreview = (id) => {
    setView('template-preview');
    window.location.hash = `template-preview?template=${id}`;
  };
  const handleStartTrial = () => {
    sessionStorage.setItem('start_seller_onboarding', 'true');
    setView('auth');
    window.location.hash = 'auth';
  };

  const categories = ['All', 'Fashion', 'Beauty', 'Electronics', 'Grocery', 'Home & Living', 'Sports', 'Automotive'];
  const filtered = templateCategory === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === templateCategory);

  const faqs = [
    { q: "What is SnapShop?", a: "SnapShop is a next-generation store builder platform that allows anyone to create, launch, and manage their own professional online store. You don't need any coding or design experience to get started." },
    { q: "How does the 'Explore Templates' catalog preview work?", a: "Our Templates Showcase lets you browse curated store designs (Electronics, Fashion, Books, etc.). When you preview a template, you can see exactly how your public storefront will look, complete with interactive shopping features, a cart, and clean layouts." },
    { q: "Do I need a credit card to start my free trial?", a: "No! You can register and start building your online store immediately without entering any billing details. You only choose a plan when you are ready to point to a custom domain and go live." },
    { q: "Can I manage inventory and orders directly?", a: "Yes! Every store includes a dedicated Store Dashboard where you can update stock levels, handle product variants, track sales metrics, and update order dispatch statuses." }
  ];

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const orb1X = useTransform(springX, [0, 1], [-20, 20]);
  const orb1Y = useTransform(springY, [0, 1], [-20, 20]);
  const orb2X = useTransform(springX, [0, 1], [15, -15]);
  const orb2Y = useTransform(springY, [0, 1], [15, -15]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Hero Section ── */}
      <section ref={heroRef} className="marketing-hero" onMouseMove={handleMouseMove}>
        <div className="hero-grid-dots" />
        <motion.div className="hero-orb" style={{ x: orb1X, y: orb1Y }} />
        <motion.div className="hero-orb" style={{ x: orb2X, y: orb2Y }} />
        <div className="hero-orb" />

        <div className="marketing-container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="hero-tag">
              <Sparkles size={14} /> Launch Your Store Instantly
            </span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Build your dream online store.{' '}
            <span className="hero-gradient-text">No code required.</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            SnapShop gives you all the tools to design stunning storefronts, manage products, receive international payments, and scale your brand globally.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.button
              className="m-btn m-btn-gradient m-btn-lg"
              onClick={handleStartTrial}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Free Trial <ArrowRight size={18} />
            </motion.button>
            <motion.button
              className="m-btn m-btn-ghost m-btn-lg"
              onClick={() => handleNav('templates')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Explore Templates <ExternalLink size={16} />
            </motion.button>
          </motion.div>

          <motion.div
            className="hero-stats-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              { value: '10,000+', label: 'Merchants' },
              { value: '50,000+', label: 'Orders Processed' },
              { value: '98.9%', label: 'Uptime' },
            ].map((s, i) => (
              <motion.div key={s.label} className="hero-stat" whileHover={{ y: -2 }}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trusted By Section ── */}
      <section className="trusted-by">
        <div className="marketing-container">
          <h3 className="trusted-title">Trusted by 10,000+ merchants globally</h3>
          <div className="ticker-wrap">
            <div className="ticker-content">
              {[...Array(2)].map((_, outer) => (
                <React.Fragment key={outer}>
                  {['VELO APPAREL', 'ZENITH TECH', 'AURA ORGANICS', 'PULSE AUDIO', 'FLORA HOME'].map((name, i) => (
                    <span key={`${outer}-${i}`} className="ticker-item">
                      <ShoppingBag size={16} /> {name}
                    </span>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Everything You Need"
            title="Powerful features to grow your business"
            subtitle="From store setup to scaling — everything is built in."
          />
          <motion.div
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            <FeatureCard icon={Palette} title="No-Code Store Customizer" desc="Choose from premium responsive templates and customize layouts, colors, and items with our zero-friction store settings." index={0} />
            <FeatureCard icon={Package} title="Smart Inventory Control" desc="Track stock quantities, manage multiple variations (sizes, models, weights), and update stock logs in your Store Dashboard." index={1} />
            <FeatureCard icon={CreditCard} title="Seamless Global Checkout" desc="Offer customers secure checkout options, automated shipping calculations, and instant digital order confirmation." index={2} />
            <FeatureCard icon={Bot} title="AI Product Catalog Generator" desc="Need content fast? Use our built-in AI product description writer to populate your storefront item listings automatically." index={3} />
            <FeatureCard icon={BarChart3} title="Merchant Sales Analytics" desc="Monitor page views, customer order values, discount coupon performance, and top-selling variants in real-time." index={4} />
            <FeatureCard icon={ShieldCheck} title="Enterprise Security" desc="Rest easy with state-of-the-art JWT authentication, robust data validation, and automated PDF tax invoice billing." index={5} />
          </motion.div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section className="how-it-works-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Start Selling Today"
            title="How SnapShop empowers you"
            subtitle="Three simple steps to launch your online store."
          />
          <motion.div
            className="steps-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {[
              { icon: Layout, title: 'Select your design template', desc: 'Pick from our pre-designed templates matching your niche: Mobiles, Fashion, Books, and more.' },
              { icon: Zap, title: 'Seed your items', desc: 'Enter pricing, add high-definition visuals, write descriptions, or let our AI generator write them for you.' },
              { icon: Globe, title: 'Go live and scale', desc: 'Share your store web address, collect customer payments, and manage fulfillment inside the dashboard.' },
            ].map((step, i) => (
              <motion.div key={step.title} className="step-card" variants={fadeUp} custom={i} whileHover={{ y: -4 }}>
                <div className="step-number">
                  <step.icon size={20} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Templates Showcase ── */}
      <section className="templates-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Stunning Store Layouts"
            title="A template for every business type"
            subtitle="Browse 40+ professionally designed templates across 8 categories."
          />
          <motion.div
            className="category-tabs"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {categories.map(cat => (
              <motion.button
                key={cat}
                className={`category-tab ${templateCategory === cat ? 'active' : ''}`}
                onClick={() => setTemplateCategory(cat)}
                variants={fadeUp}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={templateCategory}
              className="templates-grid"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={staggerContainer}
            >
              {filtered.slice(0, 6).map((t, i) => (
                <motion.div
                  key={t.id}
                  className="template-card"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -6 }}
                >
                  <div className="template-image" style={{ backgroundImage: `url('${t.image}')` }}>
                    <div className="template-overlay">
                      <motion.button
                        className="m-btn m-btn-gradient m-btn-sm"
                        onClick={() => handlePreview(t.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Preview <ArrowUpRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="template-body">
                    <span className="template-cat">{t.category}</span>
                    <h3 className="template-name">{t.title}</h3>
                    <p className="template-desc">{t.desc}</p>
                    <motion.button
                      className="m-btn m-btn-ghost"
                      onClick={() => handlePreview(t.id)}
                      style={{ width: '100%', marginTop: '0.5rem' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Preview Demo <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.div
            style={{ textAlign: 'center', marginTop: '2.5rem' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="m-btn m-btn-ghost"
              onClick={() => handleNav('templates')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse All {TEMPLATES.length} Templates <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="stats-section">
        <div className="marketing-container">
          <motion.div
            className="stats-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            <StatCounter value="10000" label="Active Merchants" icon={Store} suffix="+" withComma />
            <StatCounter value="50000" label="Orders Processed" icon={ShoppingBag} suffix="+" withComma />
            <StatCounter value="150" label="Countries Served" icon={Globe} suffix="+" />
            <StatCounter value="99" label="Uptime SLA" icon={Activity} suffix=".9%" />
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="pricing-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Simple, Transparent Pricing"
            title="Choose a plan that fits your growth"
            subtitle="Start with a 14-day free trial. No credit card required."
          />
          <motion.div
            className="pricing-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {SUBSCRIPTION_PLANS.filter(p => p.isActive).slice(0, 2).map((plan, i) => (
              <motion.div
                key={plan.key}
                className={`pricing-card${plan.isRecommended ? ' premium' : ''}`}
                variants={scaleIn}
                whileHover={{ y: -4 }}
              >
                {plan.badge && <div className="popular-badge">{plan.badge}</div>}
                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                </div>
                <div className="pricing-price">
                  ₹{plan.priceINR}<span>/mo</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.slice(0, 4).map((f, idx) => (
                    <li key={idx}><Check size={18} /> {f.text}</li>
                  ))}
                </ul>
                <motion.button
                  className={`m-btn ${plan.isRecommended ? 'm-btn-gradient' : 'm-btn-ghost'}`}
                  onClick={handleStartTrial}
                  style={{ width: '100%' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.priceINR === 0 ? 'Get Started Free' : 'Start Free Trial'} <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="testimonials-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Customer Reviews"
            title="What store owners are saying"
            subtitle="Real feedback from real merchants using SnapShop."
          />
          <motion.div
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {[
              { quote: "Before SnapShop, setting up an online catalog was a nightmare. Within 15 minutes, I imported our electronics items and started collecting payments.", name: "Kabir Sharma", role: "Founder, Zenith Tech Store", emoji: "👨‍💻" },
              { quote: "The Store Dashboard is clean and extremely easy to navigate. We manage inventory for hundreds of apparel variants and sales logs without any hiccups.", name: "Sneha Mehta", role: "Owner, Aura Couture Shop", emoji: "👩‍🎨" },
              { quote: "The AI product generator saved us weeks of work. Our catalog went from empty to 200+ products in under an hour. Absolutely game-changing.", name: "Rahul Verma", role: "CEO, Pulse Audio", emoji: "🎧" },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card"
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -3 }}
              >
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">{t.emoji}</div>
                  <div>
                    <h4 className="testimonial-name">{t.name}</h4>
                    <span className="testimonial-role">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="faq-section">
        <div className="marketing-container">
          <SectionHeader
            tag="Frequently Asked Questions"
            title="Have questions? We have answers"
          />
          <motion.div
            className="faq-list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
                variants={fadeUp}
                custom={index}
              >
                <button
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaqIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{faq.q}</span>
                  <Plus className="faq-icon" size={20} />
                </button>
                <div
                  className="faq-answer"
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-hidden={openFaqIndex !== index}
                >
                  <p>{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter Section ── */}
      <section className="newsletter-section">
        <div className="marketing-container">
          <motion.div
            className="newsletter-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeUp}>
              Stay ahead of the curve
            </motion.h2>
            <motion.p variants={fadeUp}>
              Get weekly tips, new template releases, and platform updates delivered to your inbox.
            </motion.p>
            <motion.form
              className="newsletter-form"
              variants={fadeUp}
              onSubmit={e => { e.preventDefault(); if (email) alert('Thanks for subscribing!'); }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Email for newsletter"
              />
              <motion.button
                type="submit"
                className="m-btn m-btn-gradient"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Subscribe <ArrowRight size={16} />
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
