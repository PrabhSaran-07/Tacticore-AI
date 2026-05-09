const mongoose = require('mongoose');

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
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },

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

  // ── Optimum Solution (Instructor reference) ──
  optimumSolution: Object,

  // ── Submissions ──
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
    type: {
      type: String,
      enum: [
        'chat_message', 'board_add', 'board_modify', 'board_delete',
        'proposal_submit', 'proposal_vote', 'reaction',
        'raise_hand', 'phase_first_action', 'complication_response',
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

  // ── Legacy ──
  timeline: Array,
  results: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }

}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
