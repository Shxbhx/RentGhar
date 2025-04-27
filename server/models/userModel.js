import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  number: {  // Add phone number field
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    type: String,
    required: true,
  },
  savedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'property'
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
    console.log(this.password);
    next();
});

const UserModel = mongoose.model('users', userSchema);
export default UserModel;