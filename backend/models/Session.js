const mongoose = require('mongoose');

// ── Vote Sub-Schema ──
const VoteSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cadetName: String,
  chestNo: String,
  vote: { type: String, enum: ['accept', 'modify', 'reject'] },
  reason: { type: String, default: '' },
  votedAt: { type: Date, default: Date.now }
}, { _id: false });

// ── Discussion Comment Sub-Schema ──
const CommentSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  chestNo: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

// ── Annotation Sub-Schema ──
const AnnotationSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  chestNo: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// ── Proposal Block Sub-Schema ──
const ProposalSchema = new mongoose.Schema({
  proposerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proposerName: String,
  chestNo: String,
  color: { type: String, default: '#3b82f6' },

  // Structured content
  title: { type: String, required: true },
  resourcesUsed: [String],
  personnelAssigned: [String],
  estimatedTime: String,
  expectedOutcome: String,
  priority: { type: String, enum: ['critical', 'important', 'secondary'], default: 'important' },

  // State
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'modified', 'challenged', 'withdrawn'],
    default: 'pending'
  },
  votes: [VoteSchema],
  voteDeadline: Date,
  voteResult: {
    accepts: { type: Number, default: 0 },
    modifies: { type: Number, default: 0 },
    rejects: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Discussion thread (for modify requests)
  discussionThread: [CommentSchema],

  // Annotations from other cadets
  annotations: [AnnotationSchema],

  // Versioning (for resubmissions)
  version: { type: Number, default: 1 },
  previousVersionId: { type: mongoose.Schema.Types.ObjectId },

  // Position on board (optional)
  boardX: Number,
  boardY: Number,

  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

// ── Challenge Sub-Schema ──
const ChallengeSchema = new mongoose.Schema({
  targetProposalId: { type: mongoose.Schema.Types.ObjectId },
  challengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  challengerName: String,
  chestNo: String,
  reason: { type: String, required: true },
  alternativeProposed: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  votes: [VoteSchema],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
});

// ── Chat Reaction Sub-Schema ──
const ChatReactionSchema = new mongoose.Schema({
  messageId: String,
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chestNo: String,
  reaction: { type: String, enum: ['agree', 'question', 'hold', 'disagree'] },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// ── Individual Plan Sub-Schema ──
const IndividualPlanSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cadetName: String,
  chestNo: String,
  stickyNotes: [{ text: String, x: Number, y: Number, color: String }],
  arrows: [{ points: [{ x: Number, y: Number }] }],
  resourceSelections: [String],
  planSummary: String,
  markers: Array,
  paths: Array,
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

// ── Final Vote Sub-Schema ──
const FinalVoteSchema = new mongoose.Schema({
  cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chestNo: String,
  vote: { type: String, enum: ['approve', 'request_change'] },
  votedAt: { type: Date, default: Date.now }
}, { _id: false });


// ═══════════════════════════════════════════════════
// MAIN SESSION SCHEMA
// ═══════════════════════════════════════════════════
const SessionSchema = new mongoose.Schema({
  // ── Core Identity ──
  sessionCode: { type: String, unique: true, required: true },
  title: { type: String, default: '' },
  accessor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario' },

  // ── Phase State Machine ──
  // WAITING → BRIEFING → INDIVIDUAL_PLANNING → GROUP_DISCUSSION → CONSOLIDATION → PRESENTATION → QA → DEBRIEF → COMPLETED
  phase: {
    type: String,
    enum: ['waiting', 'briefing', 'individual_planning', 'group_discussion', 'consolidation', 'presentation', 'qa', 'debrief', 'completed'],
    default: 'waiting'
  },
  status: { type: String, enum: ['waiting', 'active', 'paused', 'completed'], default: 'waiting' },

  // ── Phase Timestamps ──
  phaseTimestamps: {
    briefingStart: Date,
    briefingEnd: Date,
    individualStart: Date,
    individualEnd: Date,
    groupStart: Date,
    groupEnd: Date,
    consolidationStart: Date,
    consolidationEnd: Date,
    presentationStart: Date,
    presentationEnd: Date,
    qaStart: Date,
    qaEnd: Date
  },

  // ── Section A: Scenario Setup ──
  scenarioId: { type: String, default: 'village_fire' },
  problemDescription: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'custom'], default: 'medium' },

  // ── Section B: Resources & Constraints ──
  assignedResources: {
    volunteers: { type: Number, default: 0 },
    fireTrucks: { type: Number, default: 0 },
    waterPumps: { type: Number, default: 0 },
    customItems: [{
      name: String,
      quantity: { type: Number, default: 1 },
      capability: String
    }]
  },
  constraints: {
    terrain: String,
    weather: String,
    budget: Number,
    custom: [String]
  },

  // ── Section C: Problem Statements ──
  problems: [{
    description: String,
    priority: { type: String, enum: ['critical', 'important', 'secondary'], default: 'important' },
    isPrimary: { type: Boolean, default: false },
    imageUrl: String
  }],

  // ── Section D: Timing ──
  timeLimit: { type: Number, default: 30 },       // total in minutes
  phaseDurations: {
    briefing: { type: Number, default: 5 },         // minutes
    individualPlanning: { type: Number, default: 5 },
    groupDiscussion: { type: Number, default: 15 },
    consolidation: { type: Number, default: 5 },
    presentation: { type: Number, default: 5 },
    qa: { type: Number, default: 5 }
  },

  // ── Section E: Group Configuration ──
  groupConfig: {
    minSize: { type: Number, default: 4 },
    maxSize: { type: Number, default: 10 },
    accessMode: { type: String, enum: ['open', 'locked'], default: 'open' },
    commander: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },

  // ── Section F: Evaluation Parameters ──
  evalWeights: {
    // OLQ abbreviation → weight multiplier (default 1.0)
    EI: { type: Number, default: 1 },
    RA: { type: Number, default: 1 },
    OA: { type: Number, default: 1 },
    PE: { type: Number, default: 1 },
    SA: { type: Number, default: 1 },
    C:  { type: Number, default: 1 },
    SR: { type: Number, default: 1 },
    IN: { type: Number, default: 1 },
    SC: { type: Number, default: 1 },
    SD: { type: Number, default: 1 },
    AIG: { type: Number, default: 1 },
    L:  { type: Number, default: 1 },
    D:  { type: Number, default: 1 },
    Cour: { type: Number, default: 1 }
  },
  customRubric: String,

  // ── Participants ──
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ── Group Commander ──
  groupCommander: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // ── Individual Plans (Phase 2) ──
  individualPlans: [IndividualPlanSchema],

  // ── Proposals (Phase 3) ──
  proposals: [ProposalSchema],

  // ── Challenges (Phase 3) ──
  challenges: [ChallengeSchema],

  // ── Master Plan (auto-built from accepted proposals) ──
  masterPlan: [{
    proposalId: { type: mongoose.Schema.Types.ObjectId },
    title: String,
    proposerName: String,
    resourcesUsed: [String],
    estimatedTime: String,
    priority: String,
    order: Number,
    commanderPriority: { type: Boolean, default: false }
  }],

  // ── Final Plan Vote (Phase 4) ──
  finalPlanVotes: [FinalVoteSchema],

  // ── Chat Reactions ──
  chatReactions: [ChatReactionSchema],

  // ── Optimum Solution (Instructor reference) ──
  optimumSolution: Object,

  // ── Submissions (legacy + new) ──
  submissions: [
    {
      cadet: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      cadetName: String,
      submittedAt: { type: Date, default: Date.now },
      mapState: {
        markers: Array,
        paths: Array
      },
      note: String,
      olqAnalysis: Object
    }
  ],

  // ── AI Behavioral Event Log ──
  behavioralLog: [{
    cadetId: String,
    cadetName: String,
    chestNo: String,
    type: {
      type: String,
      enum: [
        'chat_message', 'board_add', 'board_modify', 'board_delete',
        'proposal_submit', 'proposal_vote', 'proposal_resubmit',
        'challenge_submit', 'challenge_vote',
        'reaction', 'raise_hand', 'pin_message',
        'phase_first_action', 'complication_response',
        'individual_plan_submit', 'master_plan_reorder',
        'final_vote', 'presentation_segment',
        'silence_flag', 'rapid_change_flag',
        'annotation_add', 'resource_conflict_flag',
        'join', 'disconnect'
      ]
    },
    timestamp: { type: Date, default: Date.now },
    phase: String,
    data: mongoose.Schema.Types.Mixed
  }],

  // ── Instructor Private Notes ──
  instructorNotes: {
    type: Map,
    of: String,
    default: {}
  },

  // ── Complications ──
  complications: [{
    type: {
      type: String,
      enum: ['resource_withdrawal', 'new_priority', 'time_crunch', 'new_info', 'conflicting_order']
    },
    description: String,
    injectedAt: { type: Date, default: Date.now },
    phase: String,
    data: mongoose.Schema.Types.Mixed
  }],

  // ── AI Reports (generated after session) ──
  aiReports: [{
    cadetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cadetName: String,
    chestNo: String,
    olqRadar: {
      EI: Number, RA: Number, OA: Number, PE: Number,
      SA: Number, C: Number, SR: Number, IN: Number,
      SC: Number, SD: Number, AIG: Number, L: Number,
      D: Number, Cour: Number
    },
    overallOPS: Number,
    qualitativeSummary: String,
    behavioralHighlights: [{
      timestamp: Date,
      description: String,
      olqSignal: String
    }],
    cautionFlags: [{
      description: String,
      timestamp: Date,
      severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    groupComparison: Object, // percentile ranks
    generatedAt: { type: Date, default: Date.now }
  }],

  // ── Timestamps ──
  startedAt: Date,
  endedAt: Date,

  // ── Legacy ──
  timeline: Array,
  results: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }

}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
