import React from 'react';
import { CiMail } from "react-icons/ci";
import { FaGithub,FaBookOpen } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { PiCertificate } from "react-icons/pi";

export default function Footer() {
  return (
    <footer className="flex justify-evenly items-center pt-4 px-2 mt-8 text-sm text-gray-600">
      <nav className="flex space-x-8">
        <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors">
          <CiMail className="size-4" />
          <span>Contact</span>
        </a>
        <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors">
          <FaBookOpen className="size-4" />
          <span>Support</span>
        </a>
        <a href="https://github.com/your-github-repo" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
          <FaGithub className="size-4" />
          <span>Github</span>
        </a>
        <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors">
          <PiCertificate className="size-4" />
          <span>Certificate</span>
        </a>
        <a href="#" className="flex items-center space-x-2 hover:text-white transition-colors">
          <IoIosSettings className="size-4" />
          <span>Custom</span>
        </a>
      </nav>
    </footer>
  );
}