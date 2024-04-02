import React from "react";
import { FaGlobe, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <footer className="bg-pale-white text-dark py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Useful Pages */}
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-semibold mb-4">Useful Pages</h3>
            <div className="flex items-center space-x-4">
              <Link to="/cliniclogin" className="text-slate-400 hover:text-blue-400">
                Login
              </Link>

              <Link
                to="/register"
                className="text-slate-400 hover:text-blue-400"
              >
                Register
              </Link>
            </div>
          </div>
          {/* Connect with Elanine */}
          <div className="flex flex-col justify-center md:text-end">
            <h3 className="text-2xl font-semibold mb-4">
              Connect with Elanine
            </h3>
            <div className="md:flex md:items-center md:justify-end md:space-x-4">
              <a
                href="https://www.elanine.com"
                className="flex md:flex-row-reverse gap-2 text-slate-400 hover:text-blue-400"
              >
                Website <FaGlobe className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/elanine__/"
                className="flex md:flex-row-reverse gap-2 text-slate-400 hover:text-blue-400"
              >
                Instagram <FaInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/company/elanine-creatives"
                className="flex md:flex-row-reverse gap-2 text-slate-400 hover:text-blue-400"
              >
                Linkedin <FaLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
