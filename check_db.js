const mongoose = require('mongoose');

async function checkDb() {
  await mongoose.connect('mongodb://localhost:27017/grocery-billing');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

checkDb();
