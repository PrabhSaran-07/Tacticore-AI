/**
 * OLQ (Officer Like Qualities) Analyzer for SSB GPE
 * 
 * Analyzes a cadet's map submission (markers, paths, note) against the
 * 15 OLQs grouped into 4 categories. Scores each OLQ on a 1-10 scale.
 * 
 * This is a heuristic/rule-based AI analyzer. In production, this could
 * be replaced with an LLM or ML model.
 */

const OLQ_CATEGORIES = {
  'Planning & Organising': [
    'Effective Intelligence',
    'Reasoning Ability',
    'Organising Ability',
    'Power of Expression'
  ],
  'Social Adjustment': [
    'Social Adaptability',
    'Cooperation',
    'Sense of Responsibility'
  ],
  'Social Effectiveness': [
    'Initiative',
    'Self-Confidence',
    'Speed of Decision',
    'Ability to Influence the Group',
    'Liveliness'
  ],
  'Dynamic Qualities': [
    'Determination',
    'Courage'
  ]
};

/**
 * Analyze a cadet's submission and return OLQ scores
 * @param {Object} submission - { markers, paths, note, timeTaken }
 * @param {Object} sessionData - { assignedResources, timeLimit, problemDescription }
 * @returns {Object} OLQ analysis result
 */
function analyzeSubmission(submission, sessionData) {
  const { markers = [], paths = [], note = '' } = submission.mapState || submission;
  const { assignedResources = {}, timeLimit = 30, problemDescription = '' } = sessionData;

  // ---- Derived metrics from submission ----
  const totalMarkers = markers.length;
  const totalPaths = paths.length;
  const hasNote = note.trim().length > 0;
  const noteLength = note.trim().length;
  const uniqueTypes = new Set(markers.map(m => m.type || m.label)).size;

  // Resource utilization: how many of available resources were placed
  const totalAvailable = (assignedResources.fireTrucks || 0) + (assignedResources.volunteers || 0) + (assignedResources.waterPumps || 0);
  const utilizationRatio = totalAvailable > 0 ? Math.min(totalMarkers / totalAvailable, 1.5) : 0;

  // Path complexity: total path points
  const totalPathPoints = paths.reduce((sum, p) => sum + (p.points?.length || 0), 0);

  // Spatial distribution: check if resources are spread across the map
  let spatialSpread = 0;
  if (totalMarkers >= 2) {
    const xs = markers.map(m => m.x || 0);
    const ys = markers.map(m => m.y || 0);
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    spatialSpread = Math.min((xRange + yRange) / 800, 1); // normalize
  }

  // Fire zone coverage: markers placed near fire zones
  const fireZones = [[120, 95], [180, 95], [120, 165]]; // approx fire positions
  let fireProximityScore = 0;
  markers.forEach(m => {
    fireZones.forEach(([fx, fy]) => {
      const dist = Math.sqrt((m.x - fx) ** 2 + (m.y - fy) ** 2);
      if (dist < 100) fireProximityScore += 1;
    });
  });

  // Train track coverage: markers near damaged section
  const trainDangerZone = [350, 440];
  let trainCoverage = 0;
  markers.forEach(m => {
    const dist = Math.sqrt((m.x - trainDangerZone[0]) ** 2 + (m.y - trainDangerZone[1]) ** 2);
    if (dist < 120) trainCoverage += 1;
  });

  // ---- Score each OLQ (1-10 scale) ----
  const scores = {};

  // === Planning & Organising ===
  // Effective Intelligence: Did they understand the problem? Use diverse resources?
  scores['Effective Intelligence'] = clamp(
    3 + (uniqueTypes * 1.5) + (hasNote ? 1.5 : 0) + (utilizationRatio * 2), 1, 10
  );

  // Reasoning Ability: Did they place resources logically (near fire, near train)?
  scores['Reasoning Ability'] = clamp(
    2 + (fireProximityScore * 1.2) + (trainCoverage * 1.5) + (totalPaths > 0 ? 1.5 : 0), 1, 10
  );

  // Organising Ability: Spatial distribution, utilization of all resources
  scores['Organising Ability'] = clamp(
    2 + (spatialSpread * 3) + (utilizationRatio * 3) + (totalPaths * 0.5), 1, 10
  );

  // Power of Expression: Quality of note/reasoning explanation
  scores['Power of Expression'] = clamp(
    hasNote ? 3 + Math.min(noteLength / 30, 4) + (noteLength > 100 ? 2 : 0) : 2, 1, 10
  );

  // === Social Adjustment ===
  // Social Adaptability: Diverse resource usage, covering multiple problem areas
  scores['Social Adaptability'] = clamp(
    3 + (uniqueTypes * 1.5) + (fireProximityScore > 0 && trainCoverage > 0 ? 3 : 0), 1, 10
  );

  // Cooperation: Evidence of team thinking (paths connecting resources, note mentions team)
  const mentionsTeam = /team|group|together|coordinate|help|assist|we /i.test(note);
  scores['Cooperation'] = clamp(
    3 + (totalPaths * 1) + (mentionsTeam ? 3 : 0) + (hasNote ? 1 : 0), 1, 10
  );

  // Sense of Responsibility: Addressing all aspects of the problem
  const addressesFire = fireProximityScore > 0;
  const addressesTrain = trainCoverage > 0;
  scores['Sense of Responsibility'] = clamp(
    2 + (addressesFire ? 3 : 0) + (addressesTrain ? 3 : 0) + (utilizationRatio > 0.8 ? 2 : 0), 1, 10
  );

  // === Social Effectiveness ===
  // Initiative: Did they go beyond the minimum? Extra routes, detailed note
  scores['Initiative'] = clamp(
    2 + (totalMarkers > totalAvailable ? 1.5 : 0) + (totalPaths * 1.2) + (noteLength > 50 ? 2 : 0) + (uniqueTypes >= 3 ? 1.5 : 0), 1, 10
  );

  // Self-Confidence: Decisive placement (not clustered in one spot)
  scores['Self-Confidence'] = clamp(
    3 + (spatialSpread * 3) + (totalMarkers >= 3 ? 2 : 0) + (totalPaths > 0 ? 1.5 : 0), 1, 10
  );

  // Speed of Decision: Based on whether they submitted at all (they did)
  scores['Speed of Decision'] = clamp(
    4 + (totalMarkers > 0 ? 2 : 0) + (totalPaths > 0 ? 1.5 : 0) + (hasNote ? 1 : 0), 1, 10
  );

  // Ability to Influence the Group: Note quality, clear strategy
  const hasClearStrategy = /first|then|after|step|plan|priority|because/i.test(note);
  scores['Ability to Influence the Group'] = clamp(
    2 + (hasClearStrategy ? 3 : 0) + (hasNote ? 2 : 0) + (totalPaths >= 2 ? 1.5 : 0), 1, 10
  );

  // Liveliness: Engagement level - more placements, routes, longer note
  scores['Liveliness'] = clamp(
    2 + (totalMarkers * 0.5) + (totalPaths * 0.8) + (noteLength > 20 ? 1.5 : 0) + (uniqueTypes >= 2 ? 1.5 : 0), 1, 10
  );

  // === Dynamic Qualities ===
  // Determination: Completeness - did they address both fire AND train?
  scores['Determination'] = clamp(
    2 + (addressesFire && addressesTrain ? 4 : (addressesFire || addressesTrain ? 2 : 0)) + (utilizationRatio * 2) + (totalPaths > 0 ? 1 : 0), 1, 10
  );

  // Courage: Bold decisions - placing resources in danger zones
  scores['Courage'] = clamp(
    3 + (fireProximityScore * 1) + (trainCoverage * 1.5) + (spatialSpread > 0.5 ? 2 : 0), 1, 10
  );


  // Round all scores
  Object.keys(scores).forEach(k => { scores[k] = Math.round(scores[k] * 10) / 10; });

  // Build category summaries
  const categories = {};
  let overallTotal = 0;
  let overallCount = 0;

  for (const [category, qualities] of Object.entries(OLQ_CATEGORIES)) {
    const catScores = qualities.map(q => scores[q]);
    const avg = catScores.reduce((a, b) => a + b, 0) / catScores.length;
    categories[category] = {
      qualities: qualities.map(q => ({ name: q, score: scores[q] })),
      average: Math.round(avg * 10) / 10
    };
    overallTotal += catScores.reduce((a, b) => a + b, 0);
    overallCount += catScores.length;
  }

  const overallScore = Math.round((overallTotal / overallCount) * 10) / 10;

  // Generate strengths and areas for improvement
  const sortedOLQs = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strengths = sortedOLQs.slice(0, 3).map(([name, score]) => ({ name, score }));
  const improvements = sortedOLQs.slice(-3).reverse().map(([name, score]) => ({ name, score }));

  // Generate recommendation
  let recommendation = '';
  if (overallScore >= 8) recommendation = 'Excellent performance. Demonstrates strong Officer Like Qualities across all dimensions.';
  else if (overallScore >= 6) recommendation = 'Good performance with room for growth. Focus on weaker areas for well-rounded development.';
  else if (overallScore >= 4) recommendation = 'Average performance. Needs improvement in strategic planning and decision-making.';
  else recommendation = 'Below average. Requires focused training in planning, initiative, and responsibility.';

  return {
    overallScore,
    categories,
    scores,
    strengths,
    improvements,
    recommendation,
    metrics: {
      totalMarkers,
      totalPaths,
      totalPathPoints,
      uniqueResourceTypes: uniqueTypes,
      resourceUtilization: Math.round(utilizationRatio * 100),
      spatialDistribution: Math.round(spatialSpread * 100),
      fireZoneCoverage: fireProximityScore > 0,
      trainTrackCoverage: trainCoverage > 0,
      noteProvided: hasNote,
      noteLength
    },
    analyzedAt: new Date()
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = { analyzeSubmission, OLQ_CATEGORIES };
