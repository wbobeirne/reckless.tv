import { Router, Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../../db/entity/User";
import { isHex, isBase64 } from "../../../shared/util/validators";
import { validateNodeCredentials } from "../../lib/lnd";
import { MuxLivestreams } from "../../lib/mux";
import { Livestream } from "../../db/entity/Livestream";

export const router = Router();

const getUserFromRoute = async (req: Request, res: Response, isOwner?: boolean) => {
  const { username } = req.params;
  if (!username) {
    res.status(400).json({ error: "Must pass username as part of the route" });
    return null;
  }

  if ((isOwner || username === "me") && !req.user) {
    res.status(403).json({ error: "You must be logged in to do that" });
    return null;
  }

  if (req.user && username === "me") {
    return req.user;
  }

  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ where: { username } });
  if (!user) {
    res.status(404).json({ error: "No user found with that username" });
    return null;
  }

  if (isOwner && req.user && user.id !== req.user.id) {
    res.status(403).json({ error: "You don't have access that user" });
    return null;
  }

  return user;
};

router.get("/user/:username", async (req, res) => {
  const user = await getUserFromRoute(req, res);
  if (user) {
    res.json(req.user && req.user.id === user.id ? user.serializeSelf() : user.serialize());
  }
});

router.post("/user/:username/node", async (req, res) => {
  const user = await getUserFromRoute(req, res, true);
  if (!user) {
    return;
  }

  const { nodeType, grpcUrl, macaroon, cert } = req.body;
  try {
    if (!nodeType) {
      throw new Error("Node type must be provided");
    }
    if (!grpcUrl) {
      throw new Error("gRPC URL must be provided");
    }
    if (!macaroon) {
      throw new Error("Macaroon must be provided");
    }
    if (!cert) {
      throw new Error("TLS Cert must be provided");
    }
    if (!isHex(macaroon)) {
      throw new Error("Macaroon must be hex encoded");
    }
    if (!isBase64(cert)) {
      throw new Error("TLS Cert must be base64 encoded");
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    const node = await validateNodeCredentials({ grpcUrl, macaroon, cert });
    const userRepo = getRepository(User);
    user.grpcUrl = grpcUrl;
    user.macaroon = macaroon;
    user.cert = cert;
    user.pubkey = node.pubkey;
    await userRepo.save(user);
    return res.status(200).json(node);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/user/:username/livestream", async (req, res) => {
  const user = await getUserFromRoute(req, res);
  if (!user) {
    return;
  }

  try {
    const livestreams = await user.livestreams;
    const ls = livestreams.sort((ls1, ls2) => ls2.updatedAt.getTime() - ls1.updatedAt.getTime())[0];
    if (!ls) {
      return res.status(200).json({ user: user.serialize(), livestream: undefined });
    }

    if (req.user && req.user.id === user.id) {
      // Make sure it still exists in Mux, delete otherwise
      try {
        await MuxLivestreams.get(ls.muxStreamId);
      } catch(err) {
        if (err && err.type === "not_found") {
          const lsRepo = getRepository(Livestream);
          await lsRepo.delete(ls);
          return res.status(200).json({ user: user.serializeSelf(), livestream: undefined })
        }
      }

      return res.status(200).json({ user: user.serializeSelf(), livestream: ls.serializeSelf() });
    } else {
      return res.status(200).json({ user: user.serialize(), livestream: ls.serialize() });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});
