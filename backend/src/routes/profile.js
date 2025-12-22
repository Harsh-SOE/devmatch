import userAuth from "../middlewares/auth.js";
import { Router } from "express";
import {
  handleViewProfile,
  handleEditProfile,
} from "../controllers/profile.controller.js";

const createProfileRouter = (redis) => {
  const router = Router();

  router.route("/profile/view").get(userAuth, handleViewProfile(redis));
  router.route("/profile/edit").patch(userAuth, handleEditProfile(redis));
  return router;
};

export default createProfileRouter;
