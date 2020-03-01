import { Router, Request } from "express";
import proxy from "express-http-proxy";
import url from "url";
import { getRepository } from "typeorm";
import { Livestream } from "../db/entity/Livestream";

export const router = Router();

const getLivestreamFromRoute = async (req: Request) => {
  const { livestreamId } = req.params;
  if (!livestreamId) {
    throw new Error("No livestream found with that ID");
  }

  try {
    const lsRepo = getRepository(Livestream);
    const ls = await lsRepo.findOne({ id: livestreamId });
    if (!ls) {
      throw new Error("No livestream found with that ID");
    }
    return ls;
  } catch (err) {
    throw new Error("Failed to query for livestream");
  }
};

const muxProxyPathResolver = (path: string) => {
  // @types typing is incorrect, this accepts promises, so any type and don't async to get around it
  return (req: Request): any => {
    return getLivestreamFromRoute(req).then(ls => {
      const query = url.parse(req.originalUrl).query;
      return `/${ls.muxPlaybackId}/${path}?${query}`;
    });
  }
}

router.get("/:livestreamId/thumbnail.jpg", proxy("https://image.mux.com", {
  proxyReqPathResolver: muxProxyPathResolver("thumbnail.jpg"),
}));

router.get("/:livestreamId/animation.gif", proxy("https://image.mux.com", {
  proxyReqPathResolver: muxProxyPathResolver("animated.gif"),
}));
