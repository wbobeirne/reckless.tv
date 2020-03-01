import express from "express";
import bodyParser from "body-parser";
import path from "path";
import enforce from "express-sslify";
import session from "express-session";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { TypeormStore } from "typeorm-store";
import { env } from "./env";
import { initDb } from "./db";
import { initPassport } from "./passport";
import { router as apiRouter } from "./routes/api";
import { router as thumbnailRouter } from "./routes/thumbnail";
import { Session } from "./db/entity/Session";

async function start() {
  // Initialize database & grab session repo
  const db = await initDb();
  const sessionRepo = db.getRepository(Session);

  // Configure server
  const app = express();
  app.set("port", env.PORT);
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  app.use(helmet());
  app.use(
    session({
      secret: "OHGODCHANGEME",
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({ repository: sessionRepo }),
    }),
  );
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/client", express.static(path.join(__dirname, "client")));

  if (process.env.NODE_ENV === "production") {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
  }

  // Initialize Passport
  await initPassport(app, db);

  // API routes
  app.use("/api", apiRouter);

  // Thumbnail proxy routes
  app.use("/thumbnail", thumbnailRouter);

  // Frontend route
  app.get("*", (_, res) => {
    res.send("Sup");
  });

  // Start the server
  app.listen(env.PORT, () => {
    console.log(`REST server started on port ${env.PORT}!`);
  });
}

start();
