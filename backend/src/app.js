import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/database.js";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import connectToRedis from "./utils/redis.js";
import { ALLOWED_ORIGINS } from "./constants.js";
import initializeSocket from "./utils/socket.js";

const app = express();

// connect to redis:
const redis = await connectToRedis();

// middlewares
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// routes

import createAuthRouter from "./routes/auth.js";
import createProfileRouter from "./routes/profile.js";
import createRequestRouter from "./routes/requests.js";
import createUserRouter from "./routes/user.js";
import createChatRouter from "./routes/chat.js";
import errorHandler from "./utils/errorHandler.js";

app.use("/", createAuthRouter(redis));
app.use("/", createProfileRouter(redis));
app.use("/", createRequestRouter(redis));
app.use("/", createUserRouter(redis));
app.use("/", createChatRouter(redis));
app.use(errorHandler);

const server = http.createServer(app);
initializeSocket(server, redis);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    const port = process.env.PORT || 7777;
    server.listen(port, () => {
      console.log(`Server is successfully listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
