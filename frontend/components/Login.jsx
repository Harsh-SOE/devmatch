"use client";

import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../src/utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../src/utils/constants";
import {
  Heart,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Phone,
} from "lucide-react";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isloginForm, setIsLoginForm] = useState(true);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  // const userExists = useSelector((state) => state.user.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  // useEffect(() => {
  //   console.log(`User: ${userExists}`);
  //   if (userExists) {
  //     navigate("/profile");
  //   }
  // }, [userExists, navigate]);

  const handleRequestOTP = async () => {
    if (!emailId) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log(
        `${BASE_URL}/signup/request-otp called with emailId: ${emailId}`
      );
      await axios.post(
        `${BASE_URL}/signup/request-otp`,
        { emailId },
        { withCredentials: true }
      );
      console.log(`OTP sent to ${emailId}`);
      setIsOTPSent(true);
      setUserEmail(emailId);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to send OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/signup/verify-otp`,
        {
          emailId: userEmail,
          otp: otp,
          firstName: firstName,
          lastName: lastName,
          password: password,
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data.data));
      navigate("/profile");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to verify OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!emailId || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      );

      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      console.log(`An error has occured....`);
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log(`creating a new user-account`);
    if (!firstName || !lastName || !emailId || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      //  Here  initiate the OTP flow instead of directly signing up
      await handleRequestOTP();
    } catch (error) {
      setError(`Failed to initiate sign up process: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isloginForm) {
      handleLogin();
    } else {
      if (!isOTPSent) {
        handleSignUp(); // Start OTP flow
      } else {
        handleVerifyOtp(); // Verify OTP
      }
    }
  };

  const [otp, setOtp] = useState("");
  const renderForm = () => {
    if (isloginForm) {
      return (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={emailId}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                placeholder="you@example.com"
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </>
      );
    } else if (isOTPSent) {
      return (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verify OTP
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              A verification code has been sent to {userEmail}.
            </p>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enter OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                  placeholder="••••••"
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                  placeholder="John"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={lastName}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Doe"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={emailId}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                placeholder="you@example.com"
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 md:w-1/2 p-8 flex flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Developer's Match</h1>
          <p className="text-xl opacity-90 mb-8">
            Connect with like-minded developers and build something amazing
            together.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm opacity-80">Active Developers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-80">Successful Matches</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-80">Projects Started</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isloginForm ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isloginForm
                ? "Enter your credentials to access your account"
                : isOTPSent
                ? "Verify your Email"
                : "Fill in your details to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderForm()}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isOTPSent ? "Verifying..." : "Loading..."}
                </>
              ) : (
                <>
                  {isloginForm
                    ? "Sign In"
                    : isOTPSent
                    ? "Verify"
                    : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {!isloginForm && !isOTPSent && (
            <div className="mt-8 text-center">
              <button
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
                onClick={() => {
                  setIsLoginForm(true);
                  setError("");
                }}
              >
                Already have an account? Sign in
              </button>
            </div>
          )}
          {isloginForm && (
            <div className="mt-8 text-center">
              <button
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
                onClick={() => {
                  setIsLoginForm(false);
                  setError("");
                }}
              >
                Don't have an account? Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
