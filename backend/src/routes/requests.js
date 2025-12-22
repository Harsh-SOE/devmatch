import { Router } from "express";
import {
  handleAcceptOrRejectRequest,
  handleSendRequest,
} from "../controllers/request.controller.js";

import userAuth from "../middlewares/auth.js";

const createRequestRouter = (redis) => {
  const router = Router();
  router
    .route("/request/send/:status/:toUserId")
    .post(userAuth, handleSendRequest(redis));
  router
    .route("/request/review/:status/:requestId")
    .post(userAuth, handleAcceptOrRejectRequest(redis));
  return router;
};

export default createRequestRouter;
