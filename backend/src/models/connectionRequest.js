import mongoose from "mongoose";
import User from "./user.js";

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        Message: `{VALUE} is incorrect status`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  //check if the fromUserId is same as toUserId

  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
  next();
});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
const ConnectionRequest = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

export default ConnectionRequest;
