import User from "./../models/user";
import { fileUploader } from "./../middlewares/uploader";
import { sendMail } from "./../middlewares/sendMail";

export const getAllUsers = async (query) => {
  return await User.find(query);
};

export const getOneUser = async (id) => {
  // sendMail().catch(console.error);
  let user = await User.findById(id);
  let res = user.toObject();
  delete res.password;
  return res;
};

export const addUser = async (user) => {
  return await User.create(user);
};

export const updateUser = async (user) => {
  let res;
  //check if the user is updating the profile or the password
  if (user.password) {
    const foundUser = await User.findById(user._id);
    //check if the old password matches the one in the db
    if (!foundUser.validPassword(user.oldPassword)) {
      throw new Error("Incorrect old password");
    }
    //encrypt the password
    foundUser.password = foundUser.encryptPassword(user.password);
    res = await User.findByIdAndUpdate(user._id, foundUser);
  } else if (user.imgFile) {
    const foundUser = await User.findById(user._id);
    const profile = foundUser.profile
    const imgURL = await fileUploader(user.imgFile.path);
    profile.profileImg = imgURL
    res = await User.findByIdAndUpdate(user._id, foundUser);
  } else {
    res = await User.findByIdAndUpdate(user._id, user);
  }
  return res;
};

export const deleteUser = async (id) => {
  return await User.findOneAndRemove({ _id: id });
};

export const updatePassword = async (user) => {
  let res;
  const { email, oldPassword, password, confirmPassword } = user;
  // check old password and updating the profile or the password
  let foundUser = await User.findOne({ email });

  if (oldPassword) {
    // check if the old password matches the one in the db
    if (!foundUser.validPassword(oldPassword)) {
      return { status: 400, message: "Incorrect password" };
    }
    // check old password matches new password the one in the db
    if (oldPassword === password) {
      return { status: 400, message: "Old password and New password is same" };
    }
    if (password === confirmPassword) {
      foundUser.password = foundUser.encryptPassword(password);
      const userDetail = await User.findByIdAndUpdate(foundUser._id, foundUser);
      return res.json(userDetail);
    }
  }
  return res;
};