import { Router } from 'express';
import passport from 'passport';
import {
  getAllUsers,
  getOneUser,
  addUser,
  updateUser,
  deleteUser,
  updatePassword,
} from "../controllers/userController";
import { sendMail } from '../middlewares/sendMail';

const router = Router();

router.get("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await getAllUsers(req.query);
    res.send(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.get("/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await getOneUser(req.params.id);
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.post("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await addUser(req.body);
    sendMail('registration_Confirm_Template',result.email)
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.put("/", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await updateUser(req.body);
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});

router.delete("/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await deleteUser(req.params.id);
    res.send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});


router.delete("/updatePassword", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await updatePassword(req.body);
    if (result && result.status && result.status == 400) {
      res.status(400).json({ message: result.message });
    } else {
      res.send(result);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.toString() });
  }
});


export default router;
