import { Router, Request, Response } from "express";
import { getRepository } from "typeorm";
import { Livestream } from "../../db/entity/Livestream";
import { LivestreamStatus, LivestreamArgs } from "../../../shared/types/api";
import { MuxLivestreams } from "../../lib/mux";

export const router = Router();

const validateLivestreamArgs = (args: LivestreamArgs, required?: boolean) => {
  if (required && !args.title) {
    throw new Error("Title must be provided");
  }
  if (args.title && args.title.length > 40) {
    throw new Error("Title cannot be longer than 40 characters");
  }
  if (args.description && args.description.length > 80) {
    throw new Error("Description cannot be longer than 80 characters");
  }
  return true;
};

const getLivestreamFromRoute = async (req: Request, res: Response, isOwner?: boolean) => {
  if (isOwner && !req.user) {
    res.status(403).json({ error: "You must be logged in to do that" });
    return null;
  }

  const { livestreamId } = req.params;
  if (!livestreamId) {
    res.status(400).json({ error: "Must pass livestream ID as part of the route" });
    return null;
  }

  const lsRepo = getRepository(Livestream);
  const ls = await lsRepo.findOne({ id: livestreamId });
  if (!ls) {
    res.status(404).json({ error: "No livestream found with that ID" });
    return null;
  }

  if (isOwner && req.user && ls.user.id !== req.user.id) {
    res.status(403).json({ error: "You don't have access to that livestream" });
    return null;
  }

  return ls;
};

router.get("/livestream", async (req, res) => {
  try {
    // Only return live livestream
    const lsRepo = getRepository(Livestream);
    const livestreams = await lsRepo.find({ where: { status: LivestreamStatus.live } });
    return res.status(200).json(
      livestreams.map(ls => ({
        livestream: ls.serialize(),
        user: ls.user.serialize(),
      })),
    );
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch streams", verbose: err.message });
  }
});

router.post("/livestream", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "You must be logged in to do that" });
  }

  const { title, description } = req.body;
  try {
    validateLivestreamArgs({ title, description });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const lsRepo = getRepository(Livestream);
    const liveBroadcast = await req.user.getLiveLivestream();
    if (liveBroadcast) {
      return res
        .status(400)
        .json({ error: "Cannot create a new livestream while you currently have an active one" });
    }

    const muxLivestream = await MuxLivestreams.create({
      playback_policy: ["public"],
    });
    if (!muxLivestream.playback_ids.length) {
      throw new Error("Playback token was not generated");
    }

    const ls = new Livestream();
    ls.user = req.user;
    ls.title = title;
    ls.description = description || "";
    ls.status = LivestreamStatus.offline;
    ls.muxStreamId = muxLivestream.id;
    ls.muxStreamKey = muxLivestream.stream_key;
    ls.muxPlaybackId = muxLivestream.playback_ids[0].id;
    await lsRepo.insert(ls);

    return res.status(200).json(ls.serializeSelf());
  } catch (err) {
    return res.status(500).json({ error: "Failed to create livestream", verbose: err.message });
  }
});

router.put("/livestream/:livestreamId", async (req, res) => {
  const ls = await getLivestreamFromRoute(req, res, true);
  if (!ls) {
    return;
  }

  const { title, description } = req.body;
  try {
    validateLivestreamArgs({ title, description });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const lsRepo = getRepository(Livestream);
    if (title) {
      ls.title = title;
    }
    if (description) {
      ls.description = description;
    }
    await lsRepo.save(ls);
    return res.status(200).json(ls.serializeSelf());
  } catch (err) {
    return res.status(500).json({ error: "Failed to update livestream", verbose: err.message });
  }
});

router.put("/livestream/:livestreamId/status", async (req, res) => {
  const ls = await getLivestreamFromRoute(req, res, true);
  if (!ls) {
    return;
  }

  const { status } = req.body;
  if (status === null || status === undefined) {
    res.status(400).json({ error: "Status is required" });
  }
  if (status !== LivestreamStatus.live && status !== LivestreamStatus.offline) {
    res.status(400).json({ error: "Invalid status" });
  }

  // If they want to mark the stream as live, confirm with Mux that it in fact is
  if (status === "live") {
    try {
      const muxLivestream = await MuxLivestreams.get(ls.muxStreamId);
      if (muxLivestream.status !== "active") {
        return res
          .status(400)
          .json({ error: "Stream appears to be inactive, please make sure you're streaming" });
      }
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Failed to query stream for liveness", verbose: err.message });
    }
  }

  // Update in db
  try {
    const lsRepo = getRepository(Livestream);
    ls.status = status;
    await lsRepo.save(ls);
    return res.status(200).json(ls.serializeSelf());
  } catch (err) {
    return res.status(500).json({ error: "Failed to update livestream", verbose: err.message });
  }
});
