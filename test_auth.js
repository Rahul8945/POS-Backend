const mongoose = require('mongoose');
const { User } = require('./src/modules/users/user.model');
const bcrypt = require('bcrypt');

async function testAuth() {
  await mongoose.connect('mongodb://localhost:27017/grocery-billing');
  console.log('Connected to DB');

  const testEmail = 'testbug@example.com';
  
  // 1. Delete if exists
  await User.deleteOne({ email: testEmail });

  // 2. Create user
  const user = await User.create({
    name: 'Test Bug',
    email: testEmail,
    password: 'password123',
    role: 'Admin'
  });

  console.log('User created. Hash in DB is:', user.password);

  // 3. Find user
  const foundUser = await User.findOne({ email: testEmail }).select('+password');
  console.log('Found user hash:', foundUser.password);

  // 4. Compare password
  const isMatch = await foundUser.correctPassword('password123', foundUser.password);
  console.log('Password match:', isMatch);

  process.exit(0);
}

testAuth().catch(console.error);
