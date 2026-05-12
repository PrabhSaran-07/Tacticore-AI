const { analyzeCadetSession } = require('../services/geminiAnalyzer');
const mongoose = require('mongoose');

// Mock Session Data
const mockSession = {
  _id: new mongoose.Types.ObjectId(),
  title: "Village Fire Emergency",
  difficulty: "medium",
  startedAt: new Date(Date.now() - 1800000), // 30 mins ago
  timeLimit: 30,
  problems: [
    { description: "Major fire at the grain store", isPrimary: true },
    { description: "Blocked road at the north entrance", isPrimary: false }
  ],
  assignedResources: {
    fireTrucks: 2,
    volunteers: 10,
    waterPumps: 3
  },
  participants: [
    { _id: new mongoose.Types.ObjectId(), name: "Cadet Alpha", chestNo: "101" },
    { _id: new mongoose.Types.ObjectId(), name: "Cadet Beta", chestNo: "102" }
  ],
  behavioralLog: [
    {
      cadetId: null, // system
      type: 'chat_message',
      timestamp: new Date(Date.now() - 1700000),
      data: { text: "Starting the session. Please analyze the map." }
    },
    {
      cadetId: "101",
      type: 'chat_message',
      timestamp: new Date(Date.now() - 1600000),
      data: { text: "I will take charge of the grain store fire because it's the highest priority. We need to deploy all water pumps there." }
    },
    {
      cadetId: "101",
      type: 'board_add',
      timestamp: new Date(Date.now() - 1550000),
      data: { type: 'water_pump', x: 500, y: 500 }
    },
    {
      cadetId: "101",
      type: 'proposal_submit',
      timestamp: new Date(Date.now() - 1500000),
      data: { title: "Deploy pumps to grain store", priority: 'critical' }
    }
  ],
  proposals: [],
  masterPlan: [
    { title: "Deploy pumps to grain store", resourcesUsed: ["water_pump"] }
  ],
  submissions: [
    {
      cadet: "101",
      mapState: { markers: [{ type: 'water_pump', x: 500, y: 500 }] },
      note: "Primary objective is to save the grain store using 3 water pumps and 5 volunteers. Secondary objective is clearing the north road."
    }
  ],
  complications: [
    { description: "Water pump failure at zone B", injectedAt: new Date(Date.now() - 1000000) }
  ]
};

// Mock participant
const mockParticipant = mockSession.participants[0];

async function runTest() {
  console.log("Starting Gemini Analysis Test...");
  try {
    const report = await analyzeCadetSession(mockSession, mockParticipant);
    console.log("Analysis Result:");
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error("Test Failed:", error);
    if (error.message.includes("API Key")) {
      console.log("\nTIP: Make sure you have set a valid GEMINI_API_KEY in your backend/.env file.");
    }
  }
}

runTest();
