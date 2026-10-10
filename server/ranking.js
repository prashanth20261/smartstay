// Ranks stays by a weighted score combining rating, price, and distance.
// Weights: rating 50%, price fit 30%, distance fit 20%.
function rankStays(stays) {
  if (stays.length === 0) return [];

  const prices = stays.map((s) => s.price);
  const distances = stays.map((s) => s.distance);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDist = Math.min(...distances);
  const maxDist = Math.max(...distances);

  const priceRange = maxPrice - minPrice || 1; // avoid divide by zero
  const distRange = maxDist - minDist || 1;

  const scored = stays.map((stay) => {
    const ratingNorm = stay.rating / 5;
    const priceFit = 1 - (stay.price - minPrice) / priceRange; // cheaper = closer to 1
    const distanceFit = 1 - (stay.distance - minDist) / distRange; // closer = closer to 1

    const score = 0.5 * ratingNorm + 0.3 * priceFit + 0.2 * distanceFit;

    return { ...stay, score: Math.round(score * 1000) / 1000 };
  });

  return scored.sort((a, b) => b.score - a.score);
}

module.exports = { rankStays };
