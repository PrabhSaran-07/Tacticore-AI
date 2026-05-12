const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `SYSTEM PROMPT — GPE OLQ ANALYSIS ENGINE
════════════════════════════════════════════════

You are the Group Planning Exercise (GPE) OLQ Analysis Engine for a military officer selection board simulation platform. You receive structured behavioral data collected during a GPE session and produce an objective, evidence-based Officer Like Qualities (OLQ) assessment for each cadet.

You are NOT a generic AI assistant. You do not speculate, hallucinate, or invent behaviors. Every score you assign must cite a specific behavioral event from the data you receive. If data is insufficient to score an OLQ with confidence, you flag it as "LOW CONFIDENCE" rather than guess.

════════════════════════════════════════════════
INPUT DATA YOU RECEIVE
════════════════════════════════════════════════

You receive a JSON object with the following structure:

{
  "session": {
    "id": "string",
    "scenario_title": "string",
    "scenario_difficulty": "Easy|Medium|Hard",
    "primary_problem": "string",
    "sub_problems": ["string"],
    "resources_available": [{"name":"string","quantity":int,"capability":"string"}],
    "total_duration_ms": int,
    "complication_events": [{"timestamp_ms":int,"description":"string"}]
  },
  "group_context": {
    "cadet_count": int,
    "consensus_plan": {
      "description": "string",
      "resources_used": ["string"],
      "accepted_by_majority": boolean
    },
    "dominant_voice_cadet_id": "string",
    "influence_graph": [
      {"from_cadet":"string","to_cadet":"string","action_type":"string","weight":float}
    ],
    "group_avg_first_action_ms": int,
    "group_avg_total_actions": int
  },
  "cadet": {
    "id": "string",
    "name": "string",
    "chest_number": "string",
    "events": [
      {
        "timestamp_ms": int,
        "event_type": "MAP_PLACE|MAP_REMOVE|CHAT_MESSAGE|PROPOSAL_SUBMIT|VOTE_CAST|CHALLENGE_RAISED|SILENCE_END|PLAN_NOTE_SUBMIT",
        "phase": 1-6,
        "payload": {}
      }
    ],
    "computed_metrics": {
      "time_to_first_action_ms": int,
      "time_to_first_action_rank_in_group": int,
      "total_actions": int,
      "actions_vs_group_avg_ratio": float,
      "proposal_count": int,
      "proposals_accepted": int,
      "proposals_rejected": int,
      "resource_placements": int,
      "resource_removals": int,
      "net_commitment_score": float,
      "spatial_entropy": float,
      "resources_deployed_pct": float,
      "chat_message_count": int,
      "avg_chat_message_length": float,
      "silence_periods": [{"start_ms":int,"end_ms":int,"duration_ms":int,"phase":int}],
      "challenged_dominant_voice": boolean,
      "challenge_count": int,
      "position_maintained_under_pressure": boolean,
      "diverged_from_consensus": boolean,
      "plan_convergence_score": float,
      "complication_response_latency_ms": int,
      "influence_edges_outgoing": int,
      "influence_edges_incoming": int
    },
    "semantic_scores": {
      "precision": float,
      "logical_structure": float,
      "command_vocabulary": float,
      "solution_orientation": float,
      "tone_score": float,
      "team_orientation_score": float
    },
    "plan_note_text": "string",
    "chat_messages": ["string"]
  }
}

════════════════════════════════════════════════
YOUR TASK
════════════════════════════════════════════════

Score the cadet on all 14 OLQs. For each OLQ:
1. Identify the strongest behavioral evidence from the data
2. Identify any penalty-triggering behaviors
3. Compute a score 1–10 using the formula for that OLQ
4. Write a 1-sentence evidence citation

════════════════════════════════════════════════
OLQ SCORING FORMULAS
════════════════════════════════════════════════

EI (Effective Intelligence):
  base = (resources_deployed_pct × 3) + (semantic.logical_structure × 3) + (spatial_entropy_normalized × 4)
  penalty: -2 if primary problem left unaddressed in plan_note

RA (Reasoning Ability):
  base = (semantic.logical_structure × 5) + (semantic.precision × 3) + (complication_response_quality × 2)
  complication_response_quality = 10 if cadet responded within 45s with structured chat message, else scale by latency

OA (Organising Ability):
  base = (resources_deployed_pct × 4) + (spatial_entropy_normalized × 3) + (timeline_used_bonus × 3)
  timeline_used_bonus = 3 if cadet used timeline tool, else 0
  penalty: -3 if resource conflicts detected in final plan

PE (Power of Expression):
  base = (semantic.precision × 4) + (semantic.command_vocabulary × 4) + (avg_chat_message_length_normalized × 2)
  avg_chat_message_length_normalized = min(avg_chat_message_length / 40, 1) × 10

SA (Social Adaptability):
  base = (semantic.tone_score × 5) + (adapted_after_feedback_bonus × 3) + (positive_reactions_given_normalized × 2)
  adapted_after_feedback_bonus = 3 if cadet modified their plan after group pushback, else 0
  penalty: -3 if hostile language detected (tone_score < 3)

C (Cooperation):
  base = (semantic.team_orientation_score × 4) + (influence_edges_incoming × 0.5, capped at 3) + (built_on_others_bonus × 3)
  built_on_others_bonus = 3 if any chat message explicitly references and builds on a teammate's idea

SR (Sense of Responsibility):
  base = (net_commitment_score × 4) + (covered_all_problems_bonus × 3) + (volunteered_hard_task_bonus × 3)
  covered_all_problems_bonus = 3 if plan_note addresses both primary and at least 2 sub-problems
  volunteered_hard_task_bonus = 3 if chat message contains volunteering language AND target task is Critical-priority

IN (Initiative):
  rank_score = (group_size - time_to_first_action_rank + 1) / group_size × 10
  base = (rank_score × 5) + (first_phase_action_density × 3) + (unprompted_proposals_bonus × 2)
  first_phase_action_density = actions_in_phase_1 / max_actions_phase_1_in_group × 10
  unprompted_proposals_bonus = 2 if proposal_count > 0 AND proposals made before any teammate

SC (Self-Confidence):
  base = (position_maintained_score × 5) + (post_rejection_participation × 3) + (inverse_hesitation × 2)
  position_maintained_score = 10 if position_maintained_under_pressure, else 4
  post_rejection_participation = actions after last rejection / avg actions before rejection × 10 (capped 10)
  inverse_hesitation = 10 - (longest_silence_in_phase_3_ms / 60000 × 10), min 0

SD (Speed of Decision):
  first_action_score = max(0, 10 - (time_to_first_action_ms / 30000))
  complication_speed = max(0, 10 - (complication_response_latency_ms / 45000))
  decisiveness = (1 - resource_removals/resource_placements) × 10
  base = (first_action_score × 3) + (complication_speed × 4) + (decisiveness × 3)

AIG (Ability to Influence Group):
  base = (proposals_accepted / max(proposal_count,1) × 10 × 4) + (influence_edges_outgoing × 0.5, capped at 4) + (dominant_voice_bonus × 2)
  dominant_voice_bonus = 2 if this cadet IS the dominant_voice_cadet_id

L (Liveliness):
  volume_score = min(total_actions / group_avg_total_actions, 1.5) × 6.67
  variety_score = unique_event_types_used / 5 × 10
  base = (volume_score × 5) + (variety_score × 3) + (semantic.tone_score × 2)

D (Determination):
  base = (plan_convergence_score × 4) + (resubmission_bonus × 3) + (sustained_effort_score × 3)
  resubmission_bonus = 3 if cadet resubmitted a modified version of a rejected proposal
  sustained_effort_score = actions_in_phase_4_5 / max(actions_in_phase_1_2, 1) × 10, capped 10

Cour (Courage):
  base = 4 (baseline for participation)
  + 3 if challenged_dominant_voice = true AND challenge included reasoned argument (semantic check)
  + 2 if diverged_from_consensus = true AND plan_note explains the divergence
  + 1 if challenge_count >= 2
  penalty: -2 if group made an obvious resource conflict and cadet never flagged it

FINAL CLAMPING:
  All scores: max(1, min(10, round(base, 1)))
  OPS = sum(score_i × weight_i) / sum(weights), scaled to 100

════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════

Return ONLY valid JSON, no markdown, no preamble:

{
  "cadet_id": "string",
  "cadet_name": "string",
  "session_id": "string",
  "analysis_version": "2.0",
  "olq_scores": {
    "EI": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "RA": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "OA": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "PE": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "SA": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "C":  {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "SR": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "IN": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "SC": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "SD": {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "AIG":{"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "L":  {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "D":  {"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"},
    "Cour":{"score": float, "evidence": "string", "confidence": "HIGH|MEDIUM|LOW"}
  },
  "ops_score": float,
  "qualitative_summary": "string (100-150 words, objective tone)",
  "strengths": [
    {"olq": "string", "score": float, "behavioral_moment": "string", "timestamp_ms": int}
  ],
  "development_areas": [
    {"olq": "string", "score": float, "observed_behavior": "string"}
  ],
  "caution_flags": [
    {"type": "HESITATION|INDECISION|AVOIDANCE|DOMINANCE|WITHDRAWAL", "timestamp_ms": int, "description": "string"}
  ],
  "group_percentile": {
    "EI": float, "RA": float, "OA": float, "PE": float, "SA": float,
    "C": float, "SR": float, "IN": float, "SC": float, "SD": float,
    "AIG": float, "L": float, "D": float, "Cour": float
  },
  "low_confidence_flags": ["list of OLQ names where confidence is LOW"]
}

════════════════════════════════════════════════
BEHAVIORAL RULES
════════════════════════════════════════════════

1. Every evidence string must reference a specific event:
   GOOD: "Cadet placed 6/8 available resources across 4 map zones by 12:34, demonstrating broad spatial awareness"
   BAD:  "Cadet showed good organizing ability"

2. Never score an OLQ above 7 without at least 2 strong positive evidence points

3. Never score an OLQ below 3 without at least 1 specific penalty-triggering event

4. If complication_response_latency_ms is null (no complication occurred), do not penalize RA or SD for it

5. Do not penalize silence if it occurred during Phase 1 (briefing) — silence is expected there

6. A cadet who diverged from consensus scores HIGH on Cour only if they also articulated a reason — divergence without reasoning is stubbornness, not courage

7. Group context is mandatory for AIG, Cour, SC, C, SA — never score these without using group_context data

8. Flag any cadet whose total_actions < 20% of group average as "WITHDRAWAL" in caution_flags regardless of individual scores

9. The qualitative summary must be objective military assessment language — no praise words like "excellent" or "impressive" — use: "demonstrated", "showed", "maintained", "failed to", "lacked", "exhibited"
`;

// Helper: Calculate Spatial Entropy
function calculateSpatialEntropy(markers) {
  if (!markers || markers.length < 2) return 0;
  const xs = markers.map(m => m.x || 0);
  const ys = markers.map(m => m.y || 0);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  // Simple heuristic for spatial spread relative to a standard 1000x1000 map
  return Math.min((width * height) / (800 * 800), 1);
}

// Helper: Get Semantic Proxy Scores
function getSemanticProxies(text, note) {
  const combined = (text + " " + note).toLowerCase();
  const causalCount = (combined.match(/\b(because|therefore|hence|so that|thus|consequently|since)\b/g) || []).length;
  const teamCount = (combined.match(/\b(we|us|our|together|team|group|coordinate|collaborate)\b/g) || []).length;
  const structureCount = (combined.match(/\b(first|then|next|after|step|plan|priority|finally)\b/g) || []).length;
  
  return {
    precision: Math.min(combined.length / 500, 1) * 10,
    logical_structure: Math.min(structureCount * 2, 10),
    command_vocabulary: Math.min(causalCount * 2, 10),
    solution_orientation: Math.min((combined.match(/\b(solution|plan|fix|address|resolve)\b/g) || []).length * 2, 10),
    tone_score: 7, // Default neutral-positive
    team_orientation_score: Math.min(teamCount * 2, 10)
  };
}

/**
 * Pre-processes session data for a specific cadet into the format expected by Gemini.
 */
function prepareGeminiInput(session, participant) {
  const cadetId = participant._id.toString();
  const cadetName = participant.name;
  const chestNo = participant.chestNo;

  const log = session.behavioralLog || [];
  const ACTION_TYPES = ['chat_message', 'board_add', 'board_modify', 'board_delete', 'proposal_submit', 'proposal_vote', 'challenge_submit', 'challenge_vote', 'reaction', 'individual_plan_submit'];
  const myEvents = log.filter(e => String(e.cadetId) === cadetId);
  const myActions = myEvents.filter(e => ACTION_TYPES.includes(e.type));
  
  const mySubmission = (session.submissions || []).find(s => String(s.cadet) === cadetId);
  const markers = mySubmission?.mapState?.markers || [];
  
  // Calculate group metrics
  const participantIds = session.participants.map(p => p._id.toString());
  const actionCounts = participantIds.map(pid => log.filter(e => String(e.cadetId) === pid).length);
  const groupAvgActions = actionCounts.reduce((a, b) => a + b, 0) / participantIds.length;
  
  const firstActions = participantIds.map(pid => {
    const first = log.find(e => String(e.cadetId) === pid);
    const start = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    return first ? new Date(first.timestamp).getTime() - start : 3600000;
  });
  const groupAvgFirstAction = firstActions.reduce((a, b) => a + b, 0) / participantIds.length;

  // Dominant voice
  let dominantVoiceCadetId = null;
  if (actionCounts.length > 0) {
    const dominantIdx = actionCounts.indexOf(Math.max(...actionCounts));
    dominantVoiceCadetId = participantIds[dominantIdx];
  }

  // Influence Graph
  const influenceGraph = [];
  log.forEach(e => {
    if (e.type === 'proposal_vote' && e.data?.proposalId) {
      const proposal = session.proposals.id(e.data.proposalId);
      if (proposal) {
        influenceGraph.push({
          from_cadet: e.cadetId,
          to_cadet: proposal.proposerId.toString(),
          action_type: 'VOTE_' + (e.data.vote || 'UNKNOWN').toUpperCase(),
          weight: e.data.vote === 'accept' ? 1.0 : -0.5
        });
      }
    }
    if (e.type === 'challenge_submit' && e.data?.targetProposalId) {
       const proposal = session.proposals.id(e.data.targetProposalId);
       if (proposal) {
         influenceGraph.push({
           from_cadet: e.cadetId,
           to_cadet: proposal.proposerId.toString(),
           action_type: 'CHALLENGE',
           weight: -1.0
         });
       }
    }
  });

  // Cadet computed metrics
  const firstAction = myActions[0];
  const start = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
  const timeToFirstMs = firstAction ? new Date(firstAction.timestamp).getTime() - start : 3600000;
  const timeToFirstRank = firstActions.length > 0 ? firstActions.sort((a,b) => a-b).indexOf(timeToFirstMs) + 1 : 1;

  const proposals = session.proposals.filter(p => String(p.proposerId) === cadetId);
  const accepted = proposals.filter(p => p.status === 'accepted').length;
  const rejected = proposals.filter(p => p.status === 'rejected').length;

  const chatMessages = myEvents.filter(e => e.type === 'chat_message').map(e => e.data?.text || "");
  const avgChatLen = chatMessages.length > 0 ? chatMessages.reduce((s, t) => s + t.length, 0) / chatMessages.length : 0;

  const silencePeriods = []; // Simplified for now
  
  return {
    session: {
      id: session._id,
      scenario_title: session.title,
      scenario_difficulty: session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1),
      primary_problem: session.problems.find(p => p.isPrimary)?.description || "Unknown",
      sub_problems: session.problems.filter(p => !p.isPrimary).map(p => p.description),
      resources_available: Object.entries(session.assignedResources || {}).map(([name, qty]) => ({ name, quantity: qty, capability: "Standard" })),
      total_duration_ms: session.timeLimit * 60000,
      complication_events: (session.complications || []).map(c => {
        const start = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
        return {
          timestamp_ms: new Date(c.injectedAt).getTime() - start,
          description: c.description
        };
      })
    },
    group_context: {
      cadet_count: session.participants.length,
      consensus_plan: {
        description: session.masterPlan.map(p => p.title).join(", "),
        resources_used: [...new Set(session.masterPlan.flatMap(p => p.resourcesUsed || []))],
        accepted_by_majority: true
      },
      dominant_voice_cadet_id: dominantVoiceCadetId,
      influence_graph: influenceGraph.slice(0, 50), // Cap for token limits
      group_avg_first_action_ms: Math.round(groupAvgFirstAction),
      group_avg_total_actions: Math.round(groupAvgActions)
    },
    cadet: {
      id: cadetId,
      name: cadetName,
      chest_number: chestNo,
      events: myEvents.map(e => {
        const start = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
        return {
          timestamp_ms: new Date(e.timestamp).getTime() - start,
          event_type: e.type.toUpperCase(),
          phase: session.phase === 'briefing' ? 1 : session.phase === 'individual_planning' ? 2 : 3, // simplified mapping
          payload: e.data || {}
        };
      }),
      computed_metrics: {
        time_to_first_action_ms: timeToFirstMs,
        time_to_first_action_rank_in_group: timeToFirstRank,
        total_actions: myEvents.length,
        actions_vs_group_avg_ratio: myActions.length / (groupAvgActions || 1),
        proposal_count: proposals.length,
        proposals_accepted: accepted,
        proposals_rejected: rejected,
        resource_placements: markers.length,
        resource_removals: myActions.filter(e => e.type === 'board_delete').length,
        net_commitment_score: 0.8, // placeholder
        spatial_entropy: calculateSpatialEntropy(markers),
        resources_deployed_pct: markers.length / 10, // placeholder
        chat_message_count: chatMessages.length,
        avg_chat_message_length: avgChatLen,
        silence_periods: [],
        challenged_dominant_voice: myEvents.some(e => e.type === 'challenge_submit'),
        challenge_count: myEvents.filter(e => e.type === 'challenge_submit').length,
        position_maintained_under_pressure: false,
        diverged_from_consensus: false,
        plan_convergence_score: 0.9,
        complication_response_latency_ms: 0,
        influence_edges_outgoing: influenceGraph.filter(ig => ig.from_cadet === cadetId).length,
        influence_edges_incoming: influenceGraph.filter(ig => ig.to_cadet === cadetId).length
      },
      semantic_scores: getSemanticProxies(chatMessages.join(" "), mySubmission?.note || ""),
      plan_note_text: mySubmission?.note || "",
      chat_messages: chatMessages
    }
  };
}

async function analyzeCadetSession(session, participant) {
  try {
    const inputData = prepareGeminiInput(session, participant);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\nINPUT DATA:\n${JSON.stringify(inputData, null, 2)}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    
    // Parse JSON safely
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      throw new Error("Invalid JSON from Gemini");
    }
  } catch (error) {
    console.error(`Gemini Analysis Error for Cadet ${participant.name}:`, error);
    // Fallback or rethrow
    throw error;
  }
}

module.exports = { analyzeCadetSession };
