const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstname: { 
    type: String, 
    required: true, 
  },
  lastname: { 
    type: String, 
    required: true, 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  phonenumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(value) {
        const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
        return phoneRegex.test(value);
      },
      message: props => `${props.value} is not a valid phone number! Try: +1234567890 or 1234567890`
    }
  },   
  carrier: { 
    type: String,
    required: false,
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('Entered Password:', enteredPassword);  // Debug log
  console.log('Stored Password Hash:', this.password); 
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
