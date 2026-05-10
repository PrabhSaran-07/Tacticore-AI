/**
 * OLQ (Officer Like Qualities) Analyzer — Full Behavioral Engine
 * Analyzes a cadet's entire session behavior across all phases.
 * Scores each of 14 OLQs on a 1–10 scale using weighted evidence.
 */

const OLQ_KEYS = ['EI','RA','OA','PE','SA','C','SR','IN','SC','SD','AIG','L','D','Cour'];
const OLQ_NAMES = {
  EI: 'Effective Intelligence', RA: 'Reasoning Ability', OA: 'Organising Ability',
  PE: 'Power of Expression', SA: 'Social Adaptability', C: 'Cooperation',
  SR: 'Sense of Responsibility', IN: 'Initiative', SC: 'Self-Confidence',
  SD: 'Speed of Decision', AIG: 'Ability to Influence Group', L: 'Liveliness',
  D: 'Determination', Cour: 'Courage'
};
const OLQ_CATEGORIES = {
  'Planning & Organising': ['EI','RA','OA','PE'],
  'Social Adjustment': ['SA','C','SR'],
  'Social Effectiveness': ['IN','SC','SD','AIG','L'],
  'Dynamic Qualities': ['D','Cour']
};

const clamp = (v, lo, hi) => Math.round(Math.max(lo, Math.min(hi, v)) * 10) / 10;

// ── Text analysis helpers ──
const CAUSAL_WORDS = /\b(because|therefore|hence|so that|which means|thus|consequently|since|as a result)\b/gi;
const TEAM_WORDS = /\b(we|us|our|together|team|group|coordinate|collaborate|help|assist|support)\b/gi;
const STRUCTURED_WORDS = /\b(first|then|next|after|step|plan|priority|finally|lastly|secondly)\b/gi;
const QUESTION_PATTERN = /\?/g;
const HOSTILE_WORDS = /\b(stupid|idiot|shut up|wrong|dumb|useless|terrible)\b/gi;

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function extractCadetEvents(behavioralLog, cadetId) {
  return (behavioralLog || []).filter(e => String(e.cadetId) === String(cadetId));
}

/**
 * Full session analysis for one cadet
 */
function analyzeFullSession(cadetId, cadetName, session) {
  const log = session.behavioralLog || [];
  const myEvents = extractCadetEvents(log, cadetId);
  const allCadetIds = [...new Set(log.map(e => e.cadetId).filter(Boolean))];
  const totalCadets = Math.max(allCadetIds.length, 1);

  // ── Gather signals ──
  const chatMessages = myEvents.filter(e => e.type === 'chat_message');
  const boardAdds = myEvents.filter(e => e.type === 'board_add');
  const boardModifies = myEvents.filter(e => e.type === 'board_modify');
  const proposalSubmits = myEvents.filter(e => e.type === 'proposal_submit');
  const proposalVotes = myEvents.filter(e => e.type === 'proposal_vote');
  const challengeSubmits = myEvents.filter(e => e.type === 'challenge_submit');
  const reactions = myEvents.filter(e => e.type === 'reaction');
  const raiseHands = myEvents.filter(e => e.type === 'raise_hand');
  const silenceFlags = myEvents.filter(e => e.type === 'silence_flag');
  const rapidChangeFlags = myEvents.filter(e => e.type === 'rapid_change_flag');
  const phaseFirstActions = myEvents.filter(e => e.type === 'phase_first_action');
  const complicationResponses = myEvents.filter(e => e.type === 'complication_response');
  const individualPlanSubmit = myEvents.filter(e => e.type === 'individual_plan_submit');

  // Aggregate chat text
  const allChatText = chatMessages.map(m => m.data?.text || '').join(' ');
  const totalWords = allChatText.split(/\s+/).filter(Boolean).length;
  const uniqueWords = new Set(allChatText.toLowerCase().split(/\s+/).filter(Boolean)).size;

  // Proposal outcomes
  const proposals = session.proposals || [];
  const myProposals = proposals.filter(p => String(p.proposerId) === String(cadetId));
  const acceptedProposals = myProposals.filter(p => p.status === 'accepted');
  const rejectedProposals = myProposals.filter(p => p.status === 'rejected');
  const resubmittedProposals = myEvents.filter(e => e.type === 'proposal_resubmit');

  // Challenges
  const myChallenges = (session.challenges || []).filter(c => String(c.challengerId) === String(cadetId));

  // Submission (map state)
  const mySubmission = (session.submissions || []).find(s => String(s.cadet) === String(cadetId));
  const markers = mySubmission?.mapState?.markers || [];
  const paths = mySubmission?.mapState?.paths || [];
  const note = mySubmission?.note || '';

  // Resource utilization
  const res = session.assignedResources || {};
  const totalAvailable = (res.fireTrucks || 0) + (res.volunteers || 0) + (res.waterPumps || 0);
  const utilization = totalAvailable > 0 ? Math.min(markers.length / totalAvailable, 1.5) : 0;

  // Time to first contribution
  const sessionStart = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
  const firstEventTime = myEvents.length > 0 ? new Date(myEvents[0].timestamp).getTime() : sessionStart + 999999;
  const timeToFirst = (firstEventTime - sessionStart) / 1000; // seconds

  // Total activity count
  const totalActions = myEvents.length;

  // ════════════════════════════════════════════
  //  SCORE EACH OLQ
  // ════════════════════════════════════════════
  const scores = {};

  // ── Effective Intelligence (EI) ──
  // Problem decomposition, resource accuracy, logical consistency
  const problemAddressed = markers.length > 0 ? 2 : 0;
  const resourceDiversity = new Set(markers.map(m => m.type)).size;
  const hasStructuredNote = countMatches(note, STRUCTURED_WORDS) > 0 ? 2 : 0;
  scores.EI = clamp(2 + problemAddressed + resourceDiversity * 1.2 + hasStructuredNote + (utilization * 2), 1, 10);

  // ── Reasoning Ability (RA) ──
  const causalLanguage = countMatches(allChatText + ' ' + note, CAUSAL_WORDS);
  const complicationResponseQuality = complicationResponses.length * 2;
  scores.RA = clamp(2 + Math.min(causalLanguage * 1.5, 4) + complicationResponseQuality + (paths.length > 0 ? 1.5 : 0), 1, 10);

  // ── Organising Ability (OA) ──
  const hasIndividualPlan = individualPlanSubmit.length > 0 ? 2 : 0;
  scores.OA = clamp(2 + hasIndividualPlan + (utilization * 2.5) + (paths.length * 0.8) + Math.min(proposalSubmits.length * 1.5, 3), 1, 10);

  // ── Power of Expression (PE) ──
  const vocabRange = uniqueWords > 50 ? 3 : uniqueWords > 20 ? 2 : uniqueWords > 10 ? 1 : 0;
  const avgSentenceLen = totalWords / Math.max(chatMessages.length, 1);
  const clarity = avgSentenceLen > 5 && avgSentenceLen < 30 ? 2 : 0;
  const noteQuality = note.length > 100 ? 2 : note.length > 30 ? 1 : 0;
  scores.PE = clamp(2 + vocabRange + clarity + noteQuality + Math.min(proposalSubmits.length, 2), 1, 10);

  // ── Social Adaptability (SA) ──
  const agreeReactions = reactions.filter(r => r.data?.reaction === 'agree').length;
  const adaptsAfterFeedback = resubmittedProposals.length > 0 ? 3 : 0;
  const hostileCount = countMatches(allChatText, HOSTILE_WORDS);
  scores.SA = clamp(3 + Math.min(agreeReactions * 1.5, 3) + adaptsAfterFeedback - (hostileCount * 2), 1, 10);

  // ── Cooperation (C) ──
  const teamLanguage = countMatches(allChatText + ' ' + note, TEAM_WORDS);
  const collabEdits = boardModifies.length;
  const positiveVotes = proposalVotes.filter(v => v.data?.vote === 'accept').length;
  scores.C = clamp(2 + Math.min(teamLanguage * 0.8, 3) + Math.min(collabEdits * 1.5, 3) + Math.min(positiveVotes, 2), 1, 10);

  // ── Sense of Responsibility (SR) ──
  const followsThrough = acceptedProposals.length > 0 ? 2 : 0;
  const volunteeredDifficult = proposalSubmits.filter(e => e.data?.priority === 'critical').length > 0 ? 2 : 0;
  scores.SR = clamp(2 + followsThrough + volunteeredDifficult + (utilization > 0.8 ? 2 : 0) + (note.length > 0 ? 1.5 : 0), 1, 10);

  // ── Initiative (IN) ──
  const phaseFirstCount = phaseFirstActions.length;
  scores.IN = clamp(1 + phaseFirstCount * 2 + Math.min(proposalSubmits.length * 1.5, 4) + (timeToFirst < 30 ? 2 : timeToFirst < 60 ? 1 : 0), 1, 10);

  // ── Self-Confidence (SC) ──
  const silenceCount = silenceFlags.length;
  const rapidChangeCount = rapidChangeFlags.length;
  const maintainsPosition = rejectedProposals.length > 0 && resubmittedProposals.length > 0 ? 2 : 0;
  scores.SC = clamp(5 + maintainsPosition - (silenceCount * 1.5) - (rapidChangeCount * 1) + (totalActions > 10 ? 1.5 : 0), 1, 10);

  // ── Speed of Decision (SD) ──
  const responseLatency = timeToFirst < 20 ? 3 : timeToFirst < 45 ? 2 : timeToFirst < 90 ? 1 : 0;
  const decisiveness = proposalSubmits.length > 0 ? 2 : 0;
  scores.SD = clamp(2 + responseLatency + decisiveness + (complicationResponses.length > 0 ? 2 : 0) - (rapidChangeCount * 1), 1, 10);

  // ── Ability to Influence Group (AIG) ──
  const acceptRate = myProposals.length > 0 ? acceptedProposals.length / myProposals.length : 0;
  scores.AIG = clamp(1 + (acceptRate * 5) + Math.min(acceptedProposals.length * 2, 4) + (raiseHands.length > 0 ? 1 : 0), 1, 10);

  // ── Liveliness (L) ──
  const contributionTypes = new Set(myEvents.map(e => e.type)).size;
  const participationFreq = totalActions / Math.max(totalCadets, 1);
  scores.L = clamp(1 + Math.min(contributionTypes * 1.2, 4) + Math.min(participationFreq * 0.3, 3) + Math.min(chatMessages.length * 0.4, 2), 1, 10);

  // ── Determination (D) ──
  const returnsAfterRejection = rejectedProposals.length > 0 && resubmittedProposals.length > 0 ? 3 : 0;
  // Check if contribution declines over time
  const firstHalf = myEvents.filter(e => new Date(e.timestamp).getTime() < sessionStart + (session.timeLimit * 30000));
  const secondHalf = myEvents.filter(e => new Date(e.timestamp).getTime() >= sessionStart + (session.timeLimit * 30000));
  const sustainsEffort = secondHalf.length >= firstHalf.length * 0.5 ? 2 : 0;
  scores.D = clamp(2 + returnsAfterRejection + sustainsEffort + (totalActions > 5 ? 1.5 : 0), 1, 10);

  // ── Courage (Cour) ──
  const challengeCount = myChallenges.length;
  const challengesWithReasoning = myChallenges.filter(c => c.reason && c.reason.length > 20).length;
  const disagreeVotes = proposalVotes.filter(v => v.data?.vote === 'reject').length;
  scores.Cour = clamp(2 + Math.min(challengeCount * 2, 4) + Math.min(challengesWithReasoning * 1.5, 3) + Math.min(disagreeVotes * 0.5, 1.5), 1, 10);

  // ════════════════════════════════════════════
  //  BUILD REPORT
  // ════════════════════════════════════════════
  const weights = session.evalWeights || {};
  let weightedSum = 0, weightTotal = 0;
  OLQ_KEYS.forEach(k => {
    const w = weights[k] || 1;
    weightedSum += scores[k] * w;
    weightTotal += w;
  });
  const overallOPS = Math.round((weightedSum / weightTotal) * 10);

  // Strengths & improvements
  const sorted = OLQ_KEYS.map(k => ({ key: k, name: OLQ_NAMES[k], score: scores[k] })).sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3);
  const improvements = sorted.slice(-3).reverse();

  // Behavioral highlights
  const highlights = [];
  if (phaseFirstActions.length > 0) {
    highlights.push({ timestamp: phaseFirstActions[0].timestamp, description: `First to contribute in ${phaseFirstActions[0].phase || 'session'}`, olqSignal: 'Initiative' });
  }
  if (acceptedProposals.length > 0) {
    highlights.push({ timestamp: acceptedProposals[0].createdAt, description: `Proposal "${acceptedProposals[0].title}" accepted by group`, olqSignal: 'Ability to Influence' });
  }
  if (complicationResponses.length > 0) {
    highlights.push({ timestamp: complicationResponses[0].timestamp, description: 'Responded to complication promptly', olqSignal: 'Speed of Decision' });
  }
  if (myChallenges.length > 0) {
    highlights.push({ timestamp: myChallenges[0].createdAt, description: `Challenged proposal with reasoning: "${myChallenges[0].reason?.substring(0, 60)}..."`, olqSignal: 'Courage' });
  }

  // Caution flags
  const cautionFlags = [];
  silenceFlags.forEach(sf => {
    cautionFlags.push({ description: `Extended silence (${sf.data?.durationSec || '?'}s) in ${sf.phase || 'session'}`, timestamp: sf.timestamp, severity: 'medium' });
  });
  rapidChangeFlags.forEach(rf => {
    cautionFlags.push({ description: `Rapid revisions detected — possible indecision pattern`, timestamp: rf.timestamp, severity: 'medium' });
  });
  if (totalActions < 3) {
    cautionFlags.push({ description: 'Very low participation — fewer than 3 total actions', timestamp: new Date(), severity: 'high' });
  }

  // Qualitative summary
  const topStr = strengths.map(s => s.name.toLowerCase()).join(' and ');
  const lowStr = improvements.map(s => s.name.toLowerCase()).join(' and ');
  const qualitativeSummary = `Cadet ${cadetName} demonstrated strong ${topStr}, `
    + `scoring ${strengths[0].score}/10 in ${strengths[0].name}. `
    + (acceptedProposals.length > 0 ? `Their proposal "${acceptedProposals[0].title}" was accepted by the group, showing influence. ` : '')
    + (complicationResponses.length > 0 ? `They responded promptly to mid-session complications. ` : '')
    + `Areas for development include ${lowStr}. `
    + (cautionFlags.length > 0 ? `Caution: ${cautionFlags[0].description}.` : '');

  return {
    cadetId, cadetName,
    chestNo: myEvents[0]?.chestNo || '',
    olqRadar: scores,
    overallOPS,
    qualitativeSummary,
    behavioralHighlights: highlights.slice(0, 3),
    cautionFlags,
    strengths, improvements,
    categories: buildCategories(scores),
    metrics: { totalActions, chatMessages: chatMessages.length, proposalsSubmitted: myProposals.length, proposalsAccepted: acceptedProposals.length, challengesMade: myChallenges.length, timeToFirstSec: Math.round(timeToFirst) },
    generatedAt: new Date()
  };
}

function buildCategories(scores) {
  const cats = {};
  for (const [cat, keys] of Object.entries(OLQ_CATEGORIES)) {
    const items = keys.map(k => ({ key: k, name: OLQ_NAMES[k], score: scores[k] }));
    const avg = items.reduce((s, i) => s + i.score, 0) / items.length;
    cats[cat] = { qualities: items, average: Math.round(avg * 10) / 10 };
  }
  return cats;
}

/**
 * Legacy: analyze a single submission (backward compatible)
 */
function analyzeSubmission(submission, sessionData) {
  const { markers = [], paths = [], note = '' } = submission.mapState || submission;
  const { assignedResources = {}, timeLimit = 30 } = sessionData;
  const totalMarkers = markers.length;
  const totalPaths = paths.length;
  const hasNote = note.trim().length > 0;
  const noteLength = note.trim().length;
  const uniqueTypes = new Set(markers.map(m => m.type || m.label)).size;
  const totalAvailable = (assignedResources.fireTrucks || 0) + (assignedResources.volunteers || 0) + (assignedResources.waterPumps || 0);
  const utilizationRatio = totalAvailable > 0 ? Math.min(totalMarkers / totalAvailable, 1.5) : 0;
  const totalPathPoints = paths.reduce((sum, p) => sum + (p.points?.length || 0), 0);
  let spatialSpread = 0;
  if (totalMarkers >= 2) {
    const xs = markers.map(m => m.x || 0), ys = markers.map(m => m.y || 0);
    spatialSpread = Math.min((Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys)) / 800, 1);
  }
  const hasCausal = countMatches(note, CAUSAL_WORDS) > 0;
  const hasTeam = countMatches(note, TEAM_WORDS) > 0;
  const hasStructured = countMatches(note, STRUCTURED_WORDS) > 0;

  const scores = {
    EI: clamp(3 + uniqueTypes * 1.5 + (hasNote ? 1.5 : 0) + utilizationRatio * 2, 1, 10),
    RA: clamp(2 + (hasCausal ? 3 : 0) + (totalPaths > 0 ? 1.5 : 0) + (hasStructured ? 2 : 0), 1, 10),
    OA: clamp(2 + spatialSpread * 3 + utilizationRatio * 3 + totalPaths * 0.5, 1, 10),
    PE: clamp(hasNote ? 3 + Math.min(noteLength / 30, 4) + (noteLength > 100 ? 2 : 0) : 2, 1, 10),
    SA: clamp(3 + uniqueTypes * 1.5 + (totalPaths > 0 ? 1 : 0), 1, 10),
    C: clamp(3 + totalPaths + (hasTeam ? 3 : 0) + (hasNote ? 1 : 0), 1, 10),
    SR: clamp(2 + (totalMarkers > 0 ? 3 : 0) + (utilizationRatio > 0.8 ? 2 : 0) + (hasNote ? 1.5 : 0), 1, 10),
    IN: clamp(2 + totalPaths * 1.2 + (noteLength > 50 ? 2 : 0) + (uniqueTypes >= 3 ? 1.5 : 0), 1, 10),
    SC: clamp(3 + spatialSpread * 3 + (totalMarkers >= 3 ? 2 : 0) + (totalPaths > 0 ? 1.5 : 0), 1, 10),
    SD: clamp(4 + (totalMarkers > 0 ? 2 : 0) + (totalPaths > 0 ? 1.5 : 0) + (hasNote ? 1 : 0), 1, 10),
    AIG: clamp(2 + (hasStructured ? 3 : 0) + (hasNote ? 2 : 0) + (totalPaths >= 2 ? 1.5 : 0), 1, 10),
    L: clamp(2 + totalMarkers * 0.5 + totalPaths * 0.8 + (noteLength > 20 ? 1.5 : 0) + (uniqueTypes >= 2 ? 1.5 : 0), 1, 10),
    D: clamp(2 + (utilizationRatio * 2) + (totalPaths > 0 ? 1 : 0) + (totalMarkers > 2 ? 2 : 0), 1, 10),
    Cour: clamp(3 + spatialSpread * 2 + (totalMarkers > 3 ? 2 : 0), 1, 10)
  };

  const cats = buildCategories(scores);
  let overallTotal = 0, overallCount = 0;
  for (const c of Object.values(cats)) { c.qualities.forEach(q => { overallTotal += q.score; overallCount++; }); }
  const overallScore = Math.round((overallTotal / overallCount) * 10) / 10;

  const sorted = OLQ_KEYS.map(k => ({ name: OLQ_NAMES[k], score: scores[k] })).sort((a, b) => b.score - a.score);
  const details = OLQ_KEYS.map(k => ({ name: OLQ_NAMES[k], score: scores[k], evidence: `Based on map placement, resource usage, and reasoning.` }));

  return {
    overallScore, categories: cats, scores,
    strengths: sorted.slice(0, 3), improvements: sorted.slice(-3).reverse(), details,
    recommendation: overallScore >= 8 ? 'Excellent performance.' : overallScore >= 6 ? 'Good performance with room for growth.' : overallScore >= 4 ? 'Average performance.' : 'Below average.',
    metrics: { totalMarkers, totalPaths, totalPathPoints, uniqueResourceTypes: uniqueTypes, resourceUtilization: Math.round(utilizationRatio * 100), spatialDistribution: Math.round(spatialSpread * 100), noteProvided: hasNote, noteLength },
    analyzedAt: new Date()
  };
}

module.exports = { analyzeSubmission, analyzeFullSession, OLQ_CATEGORIES, OLQ_NAMES, OLQ_KEYS };
