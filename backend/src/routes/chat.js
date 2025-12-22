import { Router } from "express";
import userAuth from "../middlewares/auth.js";
import handleChat from "../controllers/chat.controller.js";

const createChatRouter = (redis) => {
  const router = Router();
  router.route("/chat/:targetUserId").get(userAuth, handleChat(redis));
  return router;
};

export default createChatRouter;
