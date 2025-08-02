"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUserCircle } from "react-icons/fa";

const navLinks = [
  { name: "Practice", path: "/" },
  { name: "Learning", path: "/learn" },
  { name: "Certify", path: "/certify" },
  { name: "Customize", path: "/customize" },
  { name: "Ranking", path: "/rank" }
];

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

export default function Header({ isTyping = false }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated] = useState(false); // Mock authentication state
  const [activeTab, setActiveTab] = useState({ left: 0, width: 0 });

  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const pathname = usePathname();

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  const updateTabIndicator = () => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector(`[data-path="${pathname}"]`);
    if (activeLink) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setActiveTab({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    updateTabIndicator();
    window.addEventListener("resize", updateTabIndicator);
    return () => window.removeEventListener("resize", updateTabIndicator);
  }, [pathname]);

  const linksToShow = isAuthenticated ? authenticatedLinks : guestLinks;

  return (
    <header className="w-full bg-transparent text-gray-300">
      <div className="flex justify-between items-center py-4 px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="cursor-pointer" aria-label="Home">
          <span className="text-2xl font-bold text-green-400">Type</span>
          <span className="text-2xl font-semibold text-white">Writers</span>
        </Link>

        {/* Navigation */}
        {!isTyping && (
          <div className="flex items-center space-x-8">
            <nav className="flex items-center space-x-6 relative" ref={navRef}>
              {navLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  href={path}
                  data-path={path}
                  className={`relative px-2 py-1 transition-colors duration-300 ${
                    pathname === path
                      ? "text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {name}
                </Link>
              ))}
              <div
                className="absolute bottom-[-8px] h-0.5 bg-green-400 rounded-full transition-all duration-300 ease-out"
                style={{
                  left: `${activeTab.left}px`,
                  width: `${activeTab.width}px`,
                  opacity: activeTab.width > 0 ? 1 : 0,
                }}
              ></div>
            </nav>

            {/* Profile Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
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
                <div className="absolute right-2 px-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-max">
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
        )}
      </div>
    </header>
  );
}
