import { User } from "../db/entity/User";

// Extend express with our own propertes
declare module 'express-serve-static-core' {
  interface Request {
    user?: User
  }
}
