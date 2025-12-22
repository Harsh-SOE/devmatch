import asyncHandler from "../utils/asyncHandler.js";
import ConnectionRequest from "../models/connectionRequest.js";
import { FASTAPI_RECOMMEND_URL } from "../constants.js";
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

const handleGetRequests = (redis) =>
  asyncHandler(async (req, res) => {
    try {
      const loggedInUser = req.user;
      const connectRequests = await ConnectionRequest.find({
        toUserId: loggedInUser._id,
        status: "interested",
      }).populate("fromUserId", USER_SAFE_DATA);
      res.json({ message: "Data fetched successfully", data: connectRequests });
    } catch (err) {
      req.status(400).send("ERROR: " + err.message);
    }
  });

const handleGetConnections = (redis) =>
  asyncHandler(async (req, res) => {
    try {
      const loggedInUser = req.user;

      const connectionRequests = await ConnectionRequest.find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

      const data = connectionRequests.map((row) => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString())
          return row.toUserId;
        else return row.fromUserId;
      });

      res.json({ data });
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

const handleGetFeed = (redis) =>
  asyncHandler(async (req, res) => {
    try {
      console.log(`Fetching feed for user ${req.user._id}`);
      const loggedInUser = req.user;

      // Construct the user data payload to send to the /recommend endpoint
      const recommendPayload = {
        _id: loggedInUser._id.toString(), // Assuming loggedInUser._id is the user's ID
        firstname: loggedInUser.firstName,
        lastname: loggedInUser.lastName,
        emailId: loggedInUser.emailId,
        photoUrl: loggedInUser.photoUrl || "",
        skills: loggedInUser.skills || [],
        about: loggedInUser.about || "",
        gender: loggedInUser.gender || "",
        age: loggedInUser.age || 0,
      };

      // Call the FastAPI /recommend endpoint
      const recommendResponse = await fetch(FASTAPI_RECOMMEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recommendPayload),
        // You might need to handle credentials or authorization for FastAPI as well
      });

      if (recommendResponse.ok) {
        const similarUsersData = await recommendResponse.json();
        // similarUsersData will be in the format { "similar_users": [...] }
        console.log(similarUsersData.similar_users);
        // filter out all those users that are in connection with currently logged in user:
        // 1. Fetch connection requests of the current user
        const connectionRequests = await ConnectionRequest.find({
          $or: [
            { fromUserId: loggedInUser._id },
            { toUserId: loggedInUser._id },
          ],
        }).select("fromUserId toUserId");

        // 2. Create a set of all user IDs to hide (those already connected)
        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
          hideUsersFromFeed.add(req.fromUserId.toString());
          hideUsersFromFeed.add(req.toUserId.toString());
        });

        console.log(`hideUsersFromFeed are: `);
        console.log(hideUsersFromFeed);

        // 3. Filter the similar users
        const filteredSimilarUsers = similarUsersData.similar_users.filter(
          (user) =>
            !hideUsersFromFeed.has(user._id) &&
            user._id !== loggedInUser._id.toString()
        );

        console.log(`filterSimilar Users are: `);
        console.log(filteredSimilarUsers);

        console.log(similarUsersData.similar_users);

        res.json({ data: filteredSimilarUsers });
      } else {
        const errorBody = await recommendResponse.json();
        console.error(
          "Error from /recommend:",
          recommendResponse.status,
          errorBody
        );
        res.status(recommendResponse.status).json({
          message: "Failed to fetch similar users",
          error: errorBody,
        });
      }
    } catch (error) {
      console.error("Error in /similar-feed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

export { handleGetRequests, handleGetConnections, handleGetFeed };
