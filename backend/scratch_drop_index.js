require('dotenv').config();
const mongoose = require('mongoose');

async function drop() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    await mongoose.connection.collection('users').dropIndex('email_1');
    console.log('Index dropped successfully');
  } catch (err) {
    console.error('Error dropping index:', err);
  }
  process.exit(0);
}
drop();
