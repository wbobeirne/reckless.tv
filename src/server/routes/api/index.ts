import { Router } from "express";
import { router as authRouter } from "./auth";
import { router as userRouter } from "./user";
import { router as livestreamRouter } from "./livestream";

export const router = Router();

router.use(authRouter);
router.use(userRouter);
router.use(livestreamRouter);
