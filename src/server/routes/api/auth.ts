import { Router } from "express";
import passport from "passport";
import { getRepository } from "typeorm";
import { User } from "../../db/entity/User";

export const router = Router();

router.get("/auth/me", (req, res) => {
  if (req.user) {
    res.json(req.user.serializeSelf());
  } else {
    res.status(403).json({ error: "You are not logged in" });
  }
});

router.delete("/auth/me", (req, res) => {
  req.logout();
  res.json({ message: "You've been logged out" });
});

router.post("/auth/login", passport.authenticate("local"), (req, res) => {
  if (req.user) {
    res.status(200).json(req.user.serializeSelf());
  } else {
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  if (username.length < 3 || username.length > 24) {
    return res.status(400).json({ error: "Username must be between 3 and 24 characters" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const u = getRepository(User);
    const existingUser = await u.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username has been taken" });
    }
    const newUser = new User();
    newUser.username = username;
    newUser.password = password;
    await u.save(newUser);
    res.status(200).json(newUser.serializeSelf());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
