import { getRepository } from "typeorm";
import { Livestream } from "../db/entity/Livestream";
import { LivestreamStatus } from "../../shared/types/api";
import { makeRepeatedTask } from "./util";
import { MuxLivestreams } from "../lib/mux";
import { logger } from "../logger";

export async function checkLivestreamLiveness() {
  logger.verbose("Checking livestream liveness");
  const lsRepo = getRepository(Livestream);
  const livestreams = await lsRepo.find({ where: { status: LivestreamStatus.live } });
  const muxStreams = await Promise.all(
    livestreams.map(ls =>
      MuxLivestreams.get(ls.muxStreamId).catch(err => {
        console.log(err)
        console.log(typeof err);
        if (err && err.type === "not_found") {
          return { id: ls.muxStreamId, status: "deleted" as "deleted" };
        }
        logger.warn("Unexpected Mux error", err);
        return null;
      }),
    ),
  );
  await Promise.all(
    livestreams.map((ls): any => {
      const muxStream = muxStreams.find(ms => ms && ms.id === ls.muxStreamId);
      // If no mux stream is here, the request must have failed, bail out.
      if (!muxStream) {
        return;
      }
      // If the mux stream was deleted the livestream should be too.
      if (muxStream.status === "deleted") {
        logger.warn(`Mux stream ${muxStream.id} deleted, deleting livestream ${ls.id}`)
        return lsRepo.delete(ls);
      }
      // If the mux stream reports as being inactive, mark the stream offline.
      if (muxStream.status !== "active") {
        logger.info(`Mux stream ${muxStream.id} is idle, setting livestream ${ls.id} status to offline`)
        ls.status = LivestreamStatus.offline;
        return lsRepo.save(ls);
      }
      return null;
    }),
  );
}

export const startLivestreamLivenessCheck = makeRepeatedTask(
  "checkLivestreamLiveness",
  checkLivestreamLiveness,
  20000,
);
