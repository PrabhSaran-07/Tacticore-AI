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
      title: 'Village Defense',
      description: 'Defend a strategic village from enemy assault',
      map: 'village-map.json',
      objectives: ['secure bridge', 'protect convoy'],
      createdBy: '1',
      createdAt: new Date()
    },
    {
      _id: '2',
      title: 'Mountain Siege',
      description: 'Capture and hold mountain ridge position',
      map: 'mountain-terrain.json',
      objectives: ['capture ridge', 'hold valley pass'],
      createdBy: '1',
      createdAt: new Date()
    }
  ],
  sessions: [],
  results: []
};

module.exports = mockDb;
