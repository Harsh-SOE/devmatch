import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
    },
    lastName: { type: String },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: { type: Number },
    gender: {
      type: String,

      enum: {
        values: ["male", "female", "None"],
        message: `{VALUE} is incorrect status type`,
      },
    },
    photoUrl: {
      type: String,
      default: "https://s3.amazonaws.com/37assets/svn/765-default-avatar.png",
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
      default: "This is a default about of the user",
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};
const User = model("User", userSchema);

export default User;
