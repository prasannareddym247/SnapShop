const usageService = require('../services/usageService');

async function enforcePlanLimit(feature) {
  return async (req, res, next) => {
    try {
      const storeId = req.storeId;
      if (!storeId) return next();
      const result = await usageService.checkFeatureAccess(storeId, feature);
      if (!result.allowed) {
        return res.status(403).json({
          error: result.reason || 'Your current plan does not include this feature.',
          code: 'PLAN_LIMIT_EXCEEDED',
          feature
        });
      }
      next();
    } catch (err) {
      console.error('[FeatureEnforcer] error:', err);
      next();
    }
  };
}

async function enforceResourceLimit(resource, getCurrentCount) {
  return async (req, res, next) => {
    try {
      const storeId = req.storeId;
      if (!storeId) return next();
      const currentCount = getCurrentCount ? await getCurrentCount(req) : 0;
      const subscriptionRepository = require('../repositories/subscriptionRepository');
      const subData = await subscriptionRepository.getStoreSubscription(storeId);
      if (!subData) return next();
      const plan = await subscriptionRepository.getPlanByKey(subData.planKey);
      if (!plan || !plan.features) return next();
      const limit = plan.features[resource];
      if (limit === undefined || limit === -1) return next();
      if (currentCount >= limit) {
        return res.status(403).json({
          error: `You have reached the ${resource} limit (${limit}) for your plan. Upgrade to add more.`,
          code: 'RESOURCE_LIMIT_EXCEEDED',
          resource, limit, current: currentCount
        });
      }
      next();
    } catch (err) {
      console.error('[ResourceEnforcer] error:', err);
      next();
    }
  };
}

module.exports = { enforcePlanLimit, enforceResourceLimit };
