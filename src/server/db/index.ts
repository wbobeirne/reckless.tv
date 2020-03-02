import { createConnection, getManager } from "typeorm";
import { env } from "../env";
import { User } from "./entity/User";
import { Livestream } from "./entity/Livestream";
import { Session } from "./entity/Session";
import { StreamToken } from "./entity/StreamToken";
import { LightningPayment } from "./entity/LightningPayment";

export function initDb() {
  return createConnection({
    type: "postgres",
    url: env.DATABASE_URL,
    entities: [User, Livestream, Session, StreamToken, LightningPayment],
    synchronize: true,
  });
}

export function getDb() {
  return getManager();
}
