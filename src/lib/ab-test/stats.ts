/**
 * A/B test statistics helpers.
 * CTR calculation, winner detection, and confidence scoring.
 */

interface VariantStats {
  impressions: number;
  clicks: number;
}

interface ABTestResult {
  ctrA: number;
  ctrB: number;
  winner: 'a' | 'b' | null;
  confidence: 'low' | 'medium' | 'high';
  significantData: boolean;
}

const MIN_IMPRESSIONS_FOR_WINNER = 100;

/**
 * Calculate CTR as a percentage with 2 decimal places.
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.round((clicks / impressions) * 10000) / 100;
}

/**
 * Determine the winner and confidence level of an A/B test.
 *
 * Uses a simplified z-test for proportions.
 * Full statistical rigor would use chi-squared or exact binomial,
 * but this is practical for a content creator tool.
 */
export function analyzeTest(a: VariantStats, b: VariantStats): ABTestResult {
  const ctrA = calculateCTR(a.clicks, a.impressions);
  const ctrB = calculateCTR(b.clicks, b.impressions);

  // Not enough data
  if (
    a.impressions < MIN_IMPRESSIONS_FOR_WINNER ||
    b.impressions < MIN_IMPRESSIONS_FOR_WINNER
  ) {
    return {
      ctrA,
      ctrB,
      winner: null,
      confidence: 'low',
      significantData: false,
    };
  }

  // Proportions
  const pA = a.clicks / a.impressions;
  const pB = b.clicks / b.impressions;
  const pPooled = (a.clicks + b.clicks) / (a.impressions + b.impressions);
  const se = Math.sqrt(
    pPooled * (1 - pPooled) * (1 / a.impressions + 1 / b.impressions)
  );

  // Z-score
  const z = se > 0 ? Math.abs(pA - pB) / se : 0;

  // Confidence thresholds (standard: 1.65 = 90%, 1.96 = 95%, 2.58 = 99%)
  let confidence: 'low' | 'medium' | 'high';
  if (z >= 2.58) {
    confidence = 'high';
  } else if (z >= 1.96) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  const winner: 'a' | 'b' | null =
    z >= 1.65 ? (pA > pB ? 'a' : 'b') : null;

  return {
    ctrA,
    ctrB,
    winner,
    confidence,
    significantData: true,
  };
}
