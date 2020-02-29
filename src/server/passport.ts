import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { Connection } from "typeorm";
import { User } from "./db/entity/User";

export async function initPassport(app: Express, db: Connection) {
  app.use(passport.initialize());
  app.use(passport.session());
  const userRepo = db.getRepository(User);

  passport.use(
    "local",
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await userRepo.findOne({ username });
        if (!user) {
          return done(null, false);
        }
        if (!user.comparePassword(password)) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        done(err);
      }
    }),
  );

  passport.serializeUser<User, string>((user, done) => {
    done(undefined, user.id)
  })

  passport.deserializeUser<User, string>(async (id, done) => {
    try {
      const user = await userRepo.findOne(id)
      done(null, user)
    } catch(err) {
      done(err)
    }
  })
}
