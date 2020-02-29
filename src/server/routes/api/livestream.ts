import { Router } from "express";
import { getRepository } from "typeorm";
import { Livestream, LivestreamStatus } from "../../db/entity/Livestream";

export const router = Router();

router.post("/livestream", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "You are not logged in" });
  }

  const { title, description } = req.body;
  try {
    if (!title) {
      throw new Error("Title must be provided");
    }
    if (title.length > 40) {
      throw new Error("Title cannot be longer than 40 characters")
    }
    if (description && description.length > 80) {
      throw new Error("Description cannot be longer than 80 characters")
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const lsRepo = getRepository(Livestream);
    const liveBroadcast = await req.user.getLiveLivestream();
    if (liveBroadcast) {
      throw new Error("Cannot create a new livestream while you currently have an active on");
    }

    const ls = new Livestream();
    ls.user = req.user;
    ls.title = title;
    ls.description = description || "";
    ls.status = LivestreamStatus.offline;
    await lsRepo.insert(ls)
    return res.status(200).json(ls.serialize());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
