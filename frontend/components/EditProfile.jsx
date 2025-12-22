"use client";

import { useState, useEffect } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../src/utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../src/utils/userSlice";
import {
  Camera,
  User,
  Calendar,
  Users,
  FileText,
  Save,
  Loader2,
  Tag,
} from "lucide-react";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [skills, setSkills] = useState(
    user.skills ? user.skills.join(", ") : ""
  ); // Initialize as comma-separated
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);

  // Update local state when the 'user' prop changes (e.g., after a successful update)
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhotoUrl(user.photoUrl);
      setAge(user.age || "");
      setGender(user.gender || "");
      setAbout(user.about || "");
      setSkills(user.skills ? user.skills.join(", ") : "");
    }
  }, [user]);

  const saveProfile = async () => {
    setError("");
    setIsLoading(true);
    const skillsArray = skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill !== ""); // Convert to array

    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
          skills: skillsArray, // Send the array of skills
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        Edit Your Profile
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Form Section */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Photo URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo URL
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Enter photo URL"
                />
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    min="18"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gender
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="none">Prefer Not to Say</option>
                  </select>
                </div>
              </div>

              {/* Skills Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Skills
                </label>
                <input
                  type="text"
                  value={skills}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white"
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Enter skills separated by commas (e.g., React, Node.js, Python)"
                />
              </div>

              {/* About */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  About
                </label>
                <textarea
                  value={about}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white resize-none"
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={250}
                  rows={5}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {about.length}/250 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Save Button */}
              <button
                className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70"
                onClick={saveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="lg:w-[400px] hidden lg:block">
          <div className="sticky top-20">
            {/* <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">Profile Preview</h3> */}
            <UserCard
              user={{
                _id: user._id,
                firstName,
                lastName,
                photoUrl,
                age,
                gender,
                about,
                skills: skills.split(",").map((s) => s.trim()),
              }}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span>Profile saved successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
