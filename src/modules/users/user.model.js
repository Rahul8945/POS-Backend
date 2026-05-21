const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { ROLES } = require('../../common/constants/roles.constant');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CASHIER,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false, // Do not return password by default
    },
    active: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

userSchema.pre('save', function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return;
  }

  // Hash the password with cost of 12 synchronously to avoid Mongoose async hook bugs
  this.password = bcrypt.hashSync(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = { User };
