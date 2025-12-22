import { Router } from "express";
import {
  handleRequestOTP,
  handleVerifyOTP,
  handleLogin,
  handleLogout,
} from "../controllers/auth.controller.js";

const createAuthRouter = (redis) => {
  const router = Router();

  router.route("/signup/request-otp").post(handleRequestOTP(redis));
  router.route("/signup/verify-otp").post(handleVerifyOTP(redis));
  router.route("/login").post(handleLogin(redis));
  router.route("/logout").post(handleLogout(redis));

  return router;
};

export default createAuthRouter;
