/**
 * Calculates points earned for a prediction based on the actual match score.
 * 
 * Rules:
 * - Correct Score: +3 points
 * - Correct Result (W/D/L): +1 point
 * - Incorrect: -1 point
 */
export function calculatePoints(
  predictionHome: number,
  predictionAway: number,
  actualHome: number,
  actualAway: number
): number {
  // Correct Score
  if (predictionHome === actualHome && predictionAway === actualAway) {
    return 3;
  }

  // Correct Result
  const predictionResult = Math.sign(predictionHome - predictionAway);
  const actualResult = Math.sign(actualHome - actualAway);

  if (predictionResult === actualResult) {
    return 1;
  }

  // Incorrect
  return -1;
}
