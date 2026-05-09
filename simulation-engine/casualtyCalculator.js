exports.calculateCasualties = (forceA, forceB, terrainFactor = 1) => {
  return Math.round((forceA + forceB) * 0.1 * terrainFactor);
};
