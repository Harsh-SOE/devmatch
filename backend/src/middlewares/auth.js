import jwt from "jsonwebtoken";
import User from "../models/user.js";
import ApiError from "../utils/APIErrorResponse.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      //   return res.status(401).send("ERROR: Please login!");
      next(new ApiError(401, "Unauthorized access not allowed"));
      return;
    }

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
      //   return res.status(404).send("ERROR: User not found");
      next(new ApiError(404, "User not found"));
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default userAuth;
