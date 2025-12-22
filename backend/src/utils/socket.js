import { Server } from "socket.io";
import Chat from "../models/chat.js";

const initializeSocket = async (server, redis) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://improved-frontend-dev-tinder.vercel.app",
        "https://frontend-dev-ochre-phi.vercel.app",
        "https://frontend-dev-git-main-bugkiller099s-projects.vercel.app",
        "https://frontend-gmoon4fge-bugkiller099s-projects.vercel.app",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // const connectedUsers = new Map();

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      const userPayload = { sockerId: socket.id };

      await redis.set(`CHAT:${userId}`, JSON.stringify(userPayload));
      // connectedUsers.set(userId, { socketId: socket.id });

      io.emit("userOnlineStatus", { userId, status: "online" });
      console.log(`🟢 User ${userId} connected. Socket ID: ${socket.id}`);
    }

    socket.on(
      "joinChat",
      async ({ firstName, userId, targetUserId, photoUrl }) => {
        const roomId = [userId, targetUserId].sort().join("_");
        console.log(`${firstName} joining room: ${roomId}`);
        socket.join(roomId);

        const connectionPayload = {
          socketId: socket.id,
          firstName,
          userId,
          photoUrl,
          currentRoom: roomId,
        };

        await redis.set(`CHAT:${userId}`, JSON.stringify(connectionPayload));

        // Notify the target user
        const targetUser = JSON.parse(await redis.get(`CHAT:${targetUserId}`));
        // const targetUser = connectedUsers.get(targetUserId);

        if (targetUser) {
          io.to(targetUser.socketId).emit("userInfo", {
            userId,
            firstName,
            photoUrl,
          });
          socket.emit("userInfo", {
            userId: targetUser.userId,
            firstName: targetUser.firstName,
            photoUrl: targetUser.photoUrl,
          });
        }
      }
    );

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text, photoUrl }) => {
        const roomId = [userId, targetUserId].sort().join("_");
        console.log(
          `💬 ${firstName} (${userId}) → ${targetUserId} in ${roomId}: ${text}`
        );

        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
            seen: false,
            seenAt: null,
          });

          await chat.save();

          io.to(roomId).emit("receiveMessage", {
            userId,
            firstName,
            text,
            photoUrl,
            seen: false,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error("❌ Error saving message:", err);
        }
      }
    );

    socket.on("markMessagesSeen", async ({ userId, targetUserId }) => {
      try {
        const chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });
        if (!chat) return;

        let updated = false;

        chat.messages.forEach((msg) => {
          if (!msg.seen && String(msg.senderId) === String(targetUserId)) {
            msg.seen = true;
            msg.seenAt = new Date();
            updated = true;
          }
        });

        if (updated) {
          await chat.save();

          const senderSocket = JSON.parse(
            await redis.get(`CHAT:${targetUserId}`)
          );
          // const senderSocket = connectedUsers.get(targetUserId)?.socketId;

          if (senderSocket) {
            io.to(senderSocket).emit("messagesSeen", { byUserId: userId });
          }
        }
      } catch (err) {
        console.error("❌ Error marking messages as seen:", err);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);

      const keys = [];
      let cursor = "0";
      // Step 1: Find all matching keys
      do {
        const result = await redis.scan(cursor, {
          MATCH: "CHAT:*",
          COUNT: 100,
        });

        if (Array.isArray(result) && result.length === 2) {
          cursor = result[0];
          keys.push(...result[1]);
        } else if (
          result &&
          typeof result === "object" &&
          "cursor" in result &&
          "keys" in result
        ) {
          cursor = result.cursor;
          keys.push(...result.keys);
        } else {
          console.error("Unexpected result from redis.scan:", result);
          return; // Exit if scan result is unexpected
        }
      } while (cursor !== "0");

      if (keys.length > 0) {
        const values = await redis.mGet(...keys);
        console.log("Retrieved values:", values);
        const parsedValues = values.map((value) =>
          value ? JSON.parse(value) : null
        );

        for (let i = 0; i < parsedValues.length; i++) {
          const userData = parsedValues[i];
          const key = keys[i];

          if (userData && userData.socketId === socket.id) {
            const userId = key.split(":")[1]; // Extract userId from "CHAT:userId"
            console.log(`User ${userId} (${userData.firstName}) went offline`);
            await redis.del(key);
            io.emit("userOnlineStatus", { userId, status: "offline" });
            break;
          }
        }
      } else {
        console.log("No matching CHAT:* keys found.");
      }
    });
  });
};

export default initializeSocket;
