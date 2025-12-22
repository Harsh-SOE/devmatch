import { Router } from "express";
import {
  handleGetRequests,
  handleGetConnections,
  handleGetFeed,
} from "../controllers/user.controller.js";
import userAuth from "../middlewares/auth.js";

const createUserRouter = (redis) => {
  const router = Router();
  router.route("/user/requests").get(userAuth, handleGetRequests(redis));
  router.route("/user/connections").get(userAuth, handleGetConnections(redis));
  router.route("/feed").get(userAuth, handleGetFeed(redis));
  return router;
};

export default createUserRouter;
