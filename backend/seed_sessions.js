const mongoose = require('mongoose');
require('dotenv').config();
const Session = require('./models/Session');
const User = require('./models/User');

const seedSessions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const gto = await User.findOne({ email: 'gto@gov.in' });
    if (!gto) {
      console.log('GTO user not found. Run the server once to seed accessors.');
      process.exit(1);
    }

    const demoSessions = [
      {
        sessionCode: 'DEMO01',
        accessor: gto._id,
        title: 'SSB Demo Problem 1',
        scenarioId: 'village_fire',
        problemDescription: 'A group of 4 friends returning to their university after a trip discovers 4 different problems in a village. They must solve all the problems and reach back to the university within a given time limit. The problems include a village on fire and an approaching train heading towards a damaged track section.',
        difficulty: 'medium',
        timeLimit: 30,
        status: 'waiting',
        phase: 'waiting',
        assignedResources: { volunteers: 4, fireTrucks: 1, waterPumps: 1 }
      },
      {
        sessionCode: 'DEMO02',
        accessor: gto._id,
        title: 'SSB Demo Problem 2',
        scenarioId: 'flood_rescue',
        problemDescription: 'A team of 6 NSS volunteers traveling in a minibus finds a low-lying area completely flooded. A school with trapped children, a collapsed bridge, and rising water levels require immediate multi-team coordination. They need to evacuate the children and set up a medical camp while managing the resources efficiently before nightfall.',
        difficulty: 'hard',
        timeLimit: 45,
        status: 'waiting',
        phase: 'waiting',
        assignedResources: { volunteers: 6, fireTrucks: 0, waterPumps: 2 }
      },
      {
        sessionCode: 'DEMO03',
        accessor: gto._id,
        title: 'SSB Demo Problem 3',
        scenarioId: 'border_security',
        problemDescription: 'A patrol unit of 5 soldiers at a border outpost detects suspicious movement near the fence. A civilian convoy is simultaneously approaching the checkpoint, and communication lines are down. They must intercept the unidentified group, process the convoy securely, and re-establish contact with the command base within 20 minutes.',
        difficulty: 'hard',
        timeLimit: 40,
        status: 'waiting',
        phase: 'waiting',
        assignedResources: { volunteers: 5, fireTrucks: 0, waterPumps: 0 }
      }
    ];

    // Remove old demo sessions if they exist
    await Session.deleteMany({ sessionCode: { $in: ['DEMO01', 'DEMO02', 'DEMO03'] } });

    for (const session of demoSessions) {
      await Session.create(session);
      console.log(`✅ Created ${session.title} with code ${session.sessionCode}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sessions:', error);
    process.exit(1);
  }
};

seedSessions();
