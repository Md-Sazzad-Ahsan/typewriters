import React, { useState, useRef, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";

const navLinks = ["Practice","Learning","Certify","Customize", "Ranking"];

const authenticatedLinks = [
  "User Stats",
  "Public Profile",
  "Account Settings",
  "Sign Out",
];
const guestLinks = [
  "Notifications",
  "Terms & Conditions",
  "Privacy Policy",
  "Sign In",
];

export default function Header() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false); // Mock authentication state
  const dropdownRef = useRef(null);

  const handleMouseEnter = () => setDropdownOpen(true);
  const handleMouseLeave = () => setDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linksToShow = isAuthenticated ? authenticatedLinks : guestLinks;

  return (
    <header className="w-full bg-transparent text-gray-300">
      <div className="flex justify-between items-center py-4 px-8 mx-auto max-w-7xl">
        {/* Left: Logo */}
        <div className="cursor-pointer" aria-label="Home">
          <span className="text-2xl font-bold text-green-400">Type</span>
          <span className="text-2xl font-semibold text-white">Writers</span>
        </div>

        {/* Right: Navigation and Profile */}
        <div className="flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Profile Button and Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={dropdownRef}
          >
            <button
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-white font-medium text-sm transition-colors duration-300 cursor-pointer"
              aria-label="Profile"
            >
              <FaRegUserCircle className="w-4 h-4" />
              <span>Profile</span>
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-2 px-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10"
                style={{ width: "max-content" }}
              >
                <ul className="py-1">
                  {linksToShow.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="block whitespace-nowrap px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
