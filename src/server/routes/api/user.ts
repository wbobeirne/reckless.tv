import { Router } from "express";
import { getRepository } from "typeorm";
import { User } from "../../db/entity/User";
import { isHex, isBase64 } from "../../../shared/util/validators";
import { validateNodeCredentials } from "../../lib/lnd";

export const router = Router();

router.get("/user/me", (req, res) => {
  if (req.user) {
    res.json(req.user.serializeSelf());
  } else {
    res.status(403).json({ error: "You are not logged in" });
  }
});

router.post("/user/me/node", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "You are not logged in" });
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
    const { user } = req;
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

router.get("/user/me/livestreams", async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ error: "You are not logged in" });
  }

  try {
    const livestreams = await req.user.livestreams;
    return res.status(200).json(livestreams.map(ls => ls.serialize()));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
