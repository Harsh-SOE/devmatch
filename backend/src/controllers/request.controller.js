import asyncHandler from "../utils/asyncHandler.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

const handleSendRequest = (redis) =>
  asyncHandler(async (req, res) => {
    //Sending a connection requeest
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status type: " + status });
    }

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(484).json({
        message:
          "Sending connection to invalid user, user not exists in our database",
      });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: fromUserId, toUserId: toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnectionRequest) {
      return res
        .status(400)
        .send({ message: "Connection Request already Exists!!!" });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();

    res.json({
      message: `${req.user.firstName}  is ${status} in ${toUser.firstName}`,
      data,
    });
  });

const handleAcceptOrRejectRequest = (redis) =>
  asyncHandler(async (req, res) => {
    try {
      const loggedInUser = req.user;

      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  });

export { handleSendRequest, handleAcceptOrRejectRequest };
