import mongoose from "mongoose";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema;

const userSchema = Schema({
  email: {
    type: String,
    require: false,
  },
  password: {
    type: String,
    require: false,
  },
  role: {
    type: String,
    require: false,
  },
  status: {
    type: String, //notVerify, verify
    default: "notVerify", 
    require: true,
  },
  modifiedAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
});

// encrypt the password before storing
userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5));
};

userSchema.methods.validPassword = function (candidatePassword) {
  if (this.password != null) {
    return bcrypt.compareSync(candidatePassword, this.password);
  } else {
    return false;
  }
};

export default mongoose.model("User", userSchema);
