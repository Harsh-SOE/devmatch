import asyncHandler from "../utils/asyncHandler.js";
import { validateEditProfileData } from "../utils/validation.js";
import { FASTAPI_VECTORIZE_URL } from "../constants.js";

const handleViewProfile = (redis) =>
  asyncHandler(async (req, res) => {
    console.log(`Request to view the profile recieved`);
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).send("ERROR: User data not found in request");
      }

      res.status(200).send(user);
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  });

const handleEditProfile = (redis) =>
  asyncHandler(async (req, res) => {
    console.log(`Request to update the profile recieved`);
    try {
      if (!validateEditProfileData(req)) {
        throw new Error("Invalid Edit Request");
      }

      const loggedInUser = req.user;
      // console.log(loggedInUser);

      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key])
      );

      // console.log(loggedInUser);
      await loggedInUser.save();
      const currentUser = loggedInUser.toObject();
      const {
        _id,
        firstName,
        lastName,
        emailId,
        photoUrl,
        about,
        gender,
        age,
        skills,
      } = currentUser;

      const userPayload = {
        _id: _id.toString(), // Ensure _id is a string
        firstname: firstName,
        lastname: lastName,
        emailId: emailId,
        photoUrl: photoUrl, // You might have this elsewhere
        skills: skills,
        about: about,
        gender: gender,
        age: age,
      };

      console.log(userPayload);

      // --- Call the /vectorize endpoint ---
      try {
        console.log("Calling /vectorize endpoint...");
        const vectorizeResponse = await fetch(FASTAPI_VECTORIZE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPayload),
          credentials: "include",
        });

        if (vectorizeResponse.ok) {
          const vectorizeResult = await vectorizeResponse.json();
          console.log("User vectorized successfully:", vectorizeResult);
        } else {
          console.error(
            "Failed to vectorize user:",
            vectorizeResponse.status,
            await vectorizeResponse.text()
          );
          // Decide if this failure should impact the signup success response
          return res.status(500).send("Failed to vectorize user");
        }
      } catch (error) {
        console.error("Error calling /vectorize endpoint:", error);
        // Decide if this failure should impact the signup success response
        return res.status(500).send("Service is unavaiable");
      }
      res.json({
        message: `${loggedInUser.firstName}, your profile is updated successfully`,
        data: loggedInUser,
      });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  });

export { handleViewProfile, handleEditProfile };
