// Mock data store for development without MongoDB
// Replace with real MongoDB calls when database is available

const mockDb = {
  users: [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@tacticore.com',
      role: 'instructor',
      createdAt: new Date()
    },
    {
      _id: '2',
      name: 'Test Candidate',
      email: 'candidate@tacticore.com',
      role: 'candidate',
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
  sessions: [],
  results: []
};

module.exports = mockDb;
