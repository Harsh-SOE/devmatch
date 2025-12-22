"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BASE_URL } from "../src/utils/constants";
import { removeUserFromFeed } from "../src/utils/feedSlice";
import axios from "axios";
import { X, Heart, Star, ChevronDown, MapPin, Info } from "lucide-react";

const UserCard = ({ user, isPreview = false }) => {
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swipePosition, setSwipePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleSendRequest = async (status) => {
    console.log(`Sending a request to user with id: ${_id}`);
    if (isPreview) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(_id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startDragging = (clientX) => {
    if (isPreview || !cardRef.current) return;

    startXRef.current = clientX;
    currentXRef.current = clientX;
    setIsDragging(true);
  };

  const drag = (clientX) => {
    if (isPreview || !isDragging) return;

    currentXRef.current = clientX;
    const diff = currentXRef.current - startXRef.current;
    setSwipePosition(diff);

    // Set swipe direction for visual feedback
    if (diff > 20) {
      setSwipeDirection("right");
    } else if (diff < -20) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const stopDragging = () => {
    if (isPreview || !isDragging) return;

    setIsDragging(false);
    const threshold = window.innerWidth * 0.3;
    const finalPosition = currentXRef.current - startXRef.current;

    if (finalPosition > threshold) {
      setSwipePosition(window.innerWidth); // Move off-screen to the right
      setTimeout(() => {
        handleSendRequest("interested");
        setSwipePosition(0);
        setSwipeDirection(null);
      }, 300);
    } else if (finalPosition < -threshold) {
      setSwipePosition(-window.innerWidth); // Move off-screen to the left
      setTimeout(() => {
        handleSendRequest("ignored");
        setSwipePosition(0);
        setSwipeDirection(null);
      }, 300);
    } else {
      setSwipePosition(0); // Reset position if the threshold is not met
      setSwipeDirection(null);
    }
  };

  const handleButtonClick = (status) => {
    if (isPreview) return;

    const direction =
      status === "interested" ? window.innerWidth : -window.innerWidth;
    setSwipeDirection(status === "interested" ? "right" : "left");
    setSwipePosition(direction); // Move card off-screen
    setTimeout(() => {
      handleSendRequest(status);
      setSwipePosition(0); // Reset position after animation
      setSwipeDirection(null);
    }, 300);
  };

  const handleMouseDown = (e) => {
    if (isPreview) return;
    e.preventDefault();
    startDragging(e.clientX);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isPreview) return;
    e.preventDefault();
    drag(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (isPreview) return;
    e.preventDefault();
    stopDragging();
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e) => {
    if (isPreview) return;
    startDragging(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isPreview) return;
    drag(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isPreview) return;
    stopDragging();
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const toggleBio = (e) => {
    e.stopPropagation();
    setShowFullBio(!showFullBio);
  };

  return (
    <div
      ref={cardRef}
      className={`relative ${
        isPreview ? "w-full max-w-sm" : "w-full max-w-md"
      } h-[600px] mx-auto select-none`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute w-full h-full rounded-2xl shadow-xl overflow-hidden"
        style={{
          transform: `translateX(${swipePosition}px) rotate(${
            swipePosition / 30
          }deg) scale(${
            1 - Math.abs(swipePosition) / (2 * window.innerWidth)
          })`,
          opacity: 1 - Math.abs(swipePosition) / (2 * window.innerWidth),
          transition: isDragging
            ? "none"
            : "transform 0.3s ease-out, opacity 0.3s ease-out",
        }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={photoUrl || "/placeholder.svg?height=600&width=400"}
            alt={`${firstName} ${lastName}`}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
        </div>

        {/* Swipe Indicators */}
        {swipeDirection === "right" && (
          <div className="absolute top-10 right-10 z-10 transform rotate-12 animate-pulse">
            <div className="bg-green-500/80 text-white font-bold text-xl px-6 py-2 rounded-lg border-2 border-white">
              LIKE
            </div>
          </div>
        )}
        {swipeDirection === "left" && (
          <div className="absolute top-10 left-10 z-10 transform -rotate-12 animate-pulse">
            <div className="bg-red-500/80 text-white font-bold text-xl px-6 py-2 rounded-lg border-2 border-white">
              NOPE
            </div>
          </div>
        )}

        {/* Action Buttons - moved higher up to avoid bio overlap */}
        {!isPreview && (
          <div className="absolute bottom-36 left-0 right-0 flex justify-center gap-4 z-20">
            <button
              className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
              onClick={() => handleButtonClick("ignored")}
            >
              <X className="w-7 h-7 text-red-500" />
            </button>

            <button
              className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
              onClick={() => handleButtonClick("interested")}
            >
              <Heart className="w-7 h-7 text-pink-500" fill="#ec4899" />
            </button>

            <button className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
              <Star className="w-7 h-7 text-blue-500" />
            </button>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                {firstName} {lastName}
                {age && <span className="text-2xl">{age}</span>}
              </h2>

              {gender && (
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <span className="capitalize">{gender}</span>
                </div>
              )}
            </div>

            <button
              className="rounded-full bg-white/20 p-2 backdrop-blur-sm hover:bg-white/30 transition-colors"
              onClick={toggleBio}
            >
              {showFullBio ? (
                <ChevronDown className="w-6 h-6 text-white" />
              ) : (
                <Info className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {about && (
            <div
              className={`mt-4 bg-black/30 backdrop-blur-sm p-3 rounded-xl transition-all duration-300 ${
                showFullBio
                  ? "max-h-32 overflow-y-auto"
                  : "max-h-16 overflow-hidden"
              }`}
            >
              <p
                className={`text-sm text-white/90 ${
                  showFullBio ? "" : "line-clamp-2"
                }`}
              >
                {about}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error and Loading states */}
      {error && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <div className="bg-red-500 text-white p-4 rounded-t-xl shadow-lg m-2 flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="w-16 h-16 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default UserCard;
