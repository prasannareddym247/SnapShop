const USD_TO_INR = 86;

export const getPricingDetails = (priceUSD, discountPercentage) => {
  const originalPriceINR = Math.round(priceUSD * USD_TO_INR);
  const discount = discountPercentage || 0;
  const discountedPriceUSD = priceUSD - (priceUSD * discount / 100);
  const discountedPriceINR = Math.round(discountedPriceUSD * USD_TO_INR);
  
  return {
    originalPriceINR: originalPriceINR,
    discountedPriceINR: discountedPriceINR,
    hasDiscount: discount > 0,
    formattedOriginal: `₹${originalPriceINR.toLocaleString('en-IN')}`,
    formattedDiscounted: `₹${discountedPriceINR.toLocaleString('en-IN')}`
  };
};
