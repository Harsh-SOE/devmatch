"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../src/utils/constants";
import axios from "axios";
import { removeUser } from "../src/utils/userSlice";
import {
  Heart,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      console.log(`Logging user out...`);
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log(err.message);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", icon: <Heart className="w-5 h-5" />, label: "Discover" },
    {
      path: "/connections",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Matches",
    },
    {
      path: "/requests",
      icon: <Bell className="w-5 h-5" />,
      label: "Requests",
      badge: requests.length > 0 ? requests.length : null,
    },
    { path: "/profile", icon: <User className="w-5 h-5" />, label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white"
          >
            <Heart className="w-6 h-6 text-pink-600" fill="#db2777" />
            <span className="hidden sm:inline">Dev Match</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>

                  {link.badge && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-600 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-lg flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          )}

          {/* Mobile menu button */}
          {user && (
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}

          {/* User avatar (always visible) */}
          {user && (
            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName}
                </span>
                <div className="relative">
                  <img
                    src={user.photoUrl || "/placeholder.svg"}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-pink-200 dark:border-pink-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && mobileMenuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2">
          <div className="container mx-auto px-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>

                {link.badge && (
                  <span className="absolute top-2 left-6 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-600 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 rounded-lg flex items-center gap-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
