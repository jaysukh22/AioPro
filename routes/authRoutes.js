import express from "express";
import { validateSignup, validateSignin } from "./../middlewares/validator";
import User from "./../models/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendMail } from "./../middlewares/sendMail";
import jwt_decode from "jwt-decode";
dotenv.config();

const router = express.Router();

router.post("/signup", async (req, res) => {
  const reqUser = req.body;

  // Validation
  const { errors, isValid } = validateSignup(reqUser);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  //Create a new user in the db
  try {
    const user = await User.findOne({ email: reqUser.email });
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    }
    const newUser = await new User({ ...reqUser });
    newUser.password = newUser.encryptPassword(reqUser.password);
    await newUser.save();

    // Create and send the JWT token
    jwt.sign(
      { email: newUser.email },
      process.env.SECRET_KEY,
      {
        expiresIn: 31556926, // 1 year in seconds
      },
      (err, token) => {
        res.send({
          token: token,
          userData: {
            id: newUser._id,
            role: newUser.role,
            status: newUser.status,
          },
        });
        const link = `${process.env.BASE_URL}/email-verification/${token}`;
        sendMail("registration_Confirm_Email_Template", newUser.email);
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.post("/login", async (req, res) => {
  const reqUser = req.body;

  // Validation
  const { errors, isValid } = validateSignin(reqUser);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = reqUser.email;
  const password = reqUser.password;

  // Find user
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "Email not found" });
    if (!user.validPassword(password)) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    // if (user.status === "notVerify")
    //   return res
    //     .status(404)
    //     .json({ error: "please verify your email address" });

    // Create and send the JWT token
    jwt.sign(
      { email },
      process.env.SECRET_KEY,
      {
        expiresIn: 31556926, // 1 year in seconds
      },
      (err, token) => {
        res.send({
          token: token,
          userData: { id: user._id, role: user.role },
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.put("/verifyEmail", async (req, res) => {
  const { token, status } = req.body;
  const decoded = jwt_decode(token);
  const email = decoded.email;

  const findUser = await User.findOne({ email });
  if (!findUser) {
    res.status(404);
    return res.json({ message: "the email provided was not found" });
  } else if (findUser) {
    findUser.status = status;
    const userDetail = await User.findByIdAndUpdate(findUser._id, findUser);
    return res.json(userDetail);
  } else {
    res.status(500);
    return res.json({ message: "Internal Server Error" });
  }
});


router.get("/forgotPassword/sendMails", async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    res.status(404);
    return res.json({ message: "Email provided was not found" });
  } else if (findUser) {
    jwt.sign(
      { email },
      process.env.SECRET_KEY,
      {
        expiresIn: 1800, // 30 minute in seconds
      },
      (err, token) => {
        const link = `${process.env.BASE_URL}/forgot-password/${token}`;
        sendMail('forgot_Password_Template',{email:email,link:link});
        res.send("password reset link sent to your email account");
      }
    );
  } else {
    res.status(500);
    return res.json({ message: "Internal Server Error" });
  }
});


router.put("/forgotPassword", async (req, res) => {
  const { token, password } = req.body;
  const decoded = jwt_decode(token);
  const email = decoded.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    res.status(404);
    return res.json({ message: "the email provided was not found" });
  } else if (findUser) {
    findUser.password = findUser.encryptPassword(password);
    const userDetail = await User.findByIdAndUpdate(findUser._id, findUser);
    return res.json(userDetail);
  } else {
    res.status(500);
    return res.json({ message: "Internal Server Error" });
  }
});

export default router;
