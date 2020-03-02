import { Router, Request, Response } from "express";
import { getRepository } from "typeorm";
import { LnRpc, Invoice, Readable, AddInvoiceResponse } from "@radar/lnrpc";
import { Livestream } from "../../db/entity/Livestream";
import { StreamToken } from "../../db/entity/StreamToken";
import { LightningPayment } from "../../db/entity/LightningPayment";
import { LivestreamStatus, LivestreamArgs } from "../../../shared/types/api";
import { MuxLivestreams } from "../../lib/mux";
import { makeLndClient, rHashBufferToStr } from "../../lib/lnd";
import { logger } from "../../logger";

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

  try {
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
  } catch (err) {
    res.status(500).json({ error: "Failed to query for livestream" });
  }
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
  if (status === LivestreamStatus.live) {
    try {
      const muxLivestream = await MuxLivestreams.get(ls.muxStreamId);
      if (muxLivestream.status !== "active") {
        return res.status(400).json({
          error:
            "Your stream appears to be inactive, please make sure you're streaming and try again",
        });
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

router.ws("/livestream/:livestreamId/payment", async (ws, req) => {
  const send = (obj: object) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  };

  const { user } = req;
  if (!user) {
    send({ error: "Must be logged in to make payments" });
    ws.close();
    return;
  }

  try {
    // Can't use getLivestreamFromRoute since it requires res and I'm too lazy to refactor
    const { livestreamId } = req.params;
    const lsRepo = getRepository(Livestream);
    const ls = await lsRepo.findOne({ id: livestreamId });
    if (!ls) {
      send({ error: "No livestream found with that ID" });
      ws.close();
      return;
    }

    // Hook up to their node
    let lnClient: LnRpc;
    let invoiceStream: Readable<Invoice>;
    try {
      lnClient = await makeLndClient({
        grpcUrl: ls.user.grpcUrl,
        macaroon: ls.user.macaroon,
        cert: ls.user.cert,
      });
      invoiceStream = await lnClient.subscribeInvoices({});
    } catch (err) {
      logger.warn(
        `Payment stream - Failed to connect to ${ls.user.username}'s lightning node:`,
        err,
      );
      send({ error: "Failed to connect to lightning node", verbose: err.message });
      ws.close();
      return;
    }

    const tokenRepo = getRepository(StreamToken);
    const payRepo = getRepository(LightningPayment);

    // Listen for incoming requests
    ws.on("message", async data => {
      let json: any;
      try {
        json = JSON.parse(data.toString());
        if (!json || !json.type) {
          throw new Error();
        }
      } catch (err) {
        console.log(data)
        console.log(typeof data)
        console.log(data.toString());
        logger.debug("Payment stream - WebSocket got unexpected data", data);
        return;
      }

      // Request for a new lightning invoice
      if (json.type === "request-payment") {
        const amount = parseInt(json.data.amount, 10);
        if (!amount || amount < 50 || amount > 10000) {
          send({ error: "Invalid amount, must be between 50 and 10,000" });
          return;
        }

        const expiry = 300;
        let res: AddInvoiceResponse;
        try {
          res = await lnClient.addInvoice({
            value: amount.toString(),
            memo: "Access to my stream on Reckless.tv",
            expiry: expiry.toString(),
          });
        } catch (err) {
          send({ error: "Failed to generate a lightning invoice", verbose: err.message });
          return;
        }

        try {
          const lp = new LightningPayment();
          lp.amount = amount;
          lp.paymentRequest = res.paymentRequest;
          lp.rHash = rHashBufferToStr(res.rHash);
          lp.expiresAt = new Date(Date.now() + (expiry * 1000))
          lp.user = Promise.resolve(user);
          lp.livestream = Promise.resolve(ls);
          await payRepo.save(lp);
          send({
            type: "payment",
            data: res.paymentRequest,
          });
        } catch (err) {
          logger.error("Payment stream - Failed to save lightning payment to db", err);
          send({ error: "Failed to save lightning payment to the database", verbose: err.message });
        }
      }

      // Request for their latest stream token
      if (json.type === "request-token") {
        try {
          const token = await tokenRepo.findOne({ where: { user, livestream: ls } });
          send({ type: "token", data: token ? token.serialize() : null });
        } catch (err) {
          logger.error("Payment stream - failed to fetch stream token", err);
          send({ error: "Failed to retrieve stream token from database", verbose: err.message });
        }
      }
    });

    // Listen for paid invoices
    invoiceStream.addListener("data", async chunk => {
      // Ignore non-settlement / no amount paid events
      const amount = parseInt(chunk.amtPaidSat as string, 10);
      if (!amount || !chunk.settled) {
        return;
      }

      // Check if it matches on of the user's payments
      const payment = await payRepo.findOne({
        where: {
          rHash: rHashBufferToStr(chunk.rHash),
          user,
        },
      });
      if (!payment) {
        return;
      }

      // Mark it as paid if it is in fact paid
      if (amount < payment.amount) {
        logger.warn(
          `Payment stream - Received a payment for ${amount} which was below expected amount of ${payment.amount}`,
        );
        return;
      }
      try {
        payment.settled = true;
        await payRepo.save(payment);
      } catch (err) {
        send({
          error:
            "Failed to save your payment to the database, please contact support for more info",
        });
      }

      // Create / extend a stream token and send it to them
      try {
        // Duration based on amount paid, 50 sats per minute with a buyout / cap of 24hrs for 10k.
        // TODO: Consolidate these numbers somewhere
        const ONE_MIN = 1000 * 60;
        const ONE_DAY = ONE_MIN * 60 * 24;
        const duration = amount >= 10000 ? ONE_DAY : Math.floor((ONE_MIN * amount) / 50);
        const token = await StreamToken.createOrExtendToken(user, ls, duration);
        send({ type: "token", data: token.serialize() });
      } catch (err) {
        send({
          error: "Failed to generate stream token, please contact support for more info",
        });
      }
    });
    invoiceStream.on("error", err => {
      logger.warn(`Payment stream - Got error from ${ls.user.username}'s invoice stream:`, err);
    });
    invoiceStream.on("close", () => {
      send({ error: "Lost connection to lightning node" });
    });

    // Ping to keep connection alive
    const ping = () => {
      if (ws.readyState !== ws.OPEN) {
        return;
      }
      ws.ping();
      setTimeout(ping, 10000);
    };
    setTimeout(ping, 10000);

    // Clean up on close
    ws.on("close", () => {
      invoiceStream.removeAllListeners();
    });
  } catch (err) {
    logger.error(`Payment stream - unexpected server error`, err);
    send({ error: "Unexpected server error", verbose: err.message });
    ws.close();
  }
});
