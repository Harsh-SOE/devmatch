import { validateSignUpData } from "../utils/validation.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import transporter from "../utils/otpTransporter.js";
import otpStore from "../utils/otpstore.js";
import jwt from "jsonwebtoken";
import sendMailAsync from "../utils/sendMail.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/APIResponse.js";
import generateOTP from "../utils/generateOTP.js";
import ApiError from "../utils/APIErrorResponse.js";

const OTP_SECRET = process.env.OTP_SECRET || "otp_secret_key";

const handleRequestOTP = (redis) =>
  asyncHandler(async (req, res) => {
    console.log(`Generating OTP for ${req.body.emailId}`);
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });
    if (user) {
      throw new ApiError(409, new ApiError(409, "User already exists"));
    }

    if (!emailId) {
      throw new ApiError(400, "Email is required");
    }

    const otp = generateOTP(); // 6-digit OTP
    const TTL_OTP = 600;

    redis.set(emailId, otp, "EX", TTL_OTP);
    console.log(`OTP set successfully in cache`);

    const mailOptions = {
      from: "harshcppdsa23@gmail.com",
      to: emailId,
      subject: "Registration Request for Dev-Tinder application...",
      text: "Your OTP is:", // plain‑text body
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center; color: #333;">
    <h2 style="margin-top: 0;">Your One-Time Password (OTP)</h2>
    <p style="font-size: 16px;">Use the following OTP to verify your email address:</p>
    
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #007bff; background: #fff; padding: 20px; border-radius: 6px; display: inline-block; margin: 20px 0;">
    ${otp}
    </div>
    
    <p style="font-size: 14px; color: #666;">
    This OTP is valid for the next 10 minutes.<br>
    If you did not request this, please ignore this email.
    </p>
    </div>`, // HTML body
    };

    console.log(`Sending email...`);
    await sendMailAsync(mailOptions, transporter);
    console.log(`Email sent successfully...`);
    // Create token that contains the OTP and email
    const token = jwt.sign(
      { emailId, otp },
      OTP_SECRET,
      { expiresIn: "10m" } // expires in 10 minutes
    );

    res.cookie("otpToken", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).send(new ApiResponse(200, null, "OTP sent successfully"));
  });

const handleVerifyOTP = (redis) =>
  asyncHandler(async (req, res) => {
    console.log(`Verifying OTP `);
    const { otp: userOtp } = req.body;
    console.log(`User entered OTP is ${userOtp}`);
    const token = req.cookies.otpToken;

    if (!token) throw new ApiError(401, "OTP token not found");

    // Verify token and extract data
    const { emailId } = jwt.verify(token, OTP_SECRET);

    const otp = await redis.get(emailId);
    console.log(`OTP from token is ${otp}`);
    if (userOtp !== otp) throw new ApiError(400, "Invalid OTP");
    // Continue signup — now you have emailId without it in req.body
    const {
      firstName,
      lastName,
      password,
      skills,
      about,
      age,
      gender,
      photoUrl,
    } = req.body;

    req.body.email = emailId;

    validateSignUpData(req);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      skills,
      about,
      age,
      gender,
    });

    const savedUser = await user.save();
    const jwtToken = await savedUser.getJWT();

    // Clear the OTP token
    res.clearCookie("otpToken");

    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          200,
          savedUser,
          "User created and verified successfully!"
        )
      );
  });

const handleLogin = (redis) =>
  asyncHandler(async (req, res) => {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new ApiError(400, "EmailId is not present in DB");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      //Create a JWT TOKEN
      throw new ApiError(400, "Passwrod is not correct try again");
    }

    const token = await user.getJWT();

    //Add the token to cookie and send the response back to the user.
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.send(user);
  });

const handleLogout = (redis) =>
  asyncHandler(async (req, res) => {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
      expires: new Date(0),
    });

    res.send("Logout Successful");
  });

export { handleRequestOTP, handleVerifyOTP, handleLogin, handleLogout };
