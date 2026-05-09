// Mock data store for development without MongoDB
// Replace with real MongoDB calls when database is available

const mockDb = {
  users: [
    {
      _id: '1',
      name: 'Senior Coordinator',
      email: 'admin@tacticore.com',
      role: 'accessor',
      createdAt: new Date()
    },
    {
      _id: '2',
      name: 'Test Cadet',
      email: 'cadet@tacticore.com',
      role: 'cadet',
      createdAt: new Date()
    }
  ],
  scenarios: [
    {
      _id: '1',
      title: 'Village Fire Emergency',
      description: 'Coordinate fire containment and rescue operations in the village',
      map: 'village-map.json',
      objectives: ['extinguish fire', 'save approaching train'],
      createdBy: '1',
      createdAt: new Date()
    },
    {
      _id: '2',
      title: 'Flood Rescue Exercise',
      description: 'Organize evacuation and relief for flood-affected mountain area',
      map: 'mountain-terrain.json',
      objectives: ['evacuate stranded residents', 'establish supply line'],
      createdBy: '1',
      createdAt: new Date()
    }
  ],
  sessions: [
    {
      _id: 'default-session',
      sessionCode: 'DEMO12',
      accessor: { _id: '1', name: 'Senior Coordinator' },
      problemDescription: 'Default village fire scenario. Please coordinate the response.',
      assignedResources: {
        volunteers: 4,
        fireTrucks: 1,
        waterPumps: 1
      },
      timeLimit: 30,
      status: 'waiting',
      participants: [],
      createdAt: new Date()
    }
  ],
  results: []
};

module.exports = mockDb;
