import React from "react";
import Banner from "../assets/banner.jpg";
import {
  FaUserPlus,
  FaDatabase,
  FaCalendarAlt,
  FaBox,
  FaCheckCircle,
  FaLock,
  FaShieldAlt  
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="bg-pale-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-pale-white text-dark py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            Revolutionize Your Clinic with Our Clinic Management System
          </h1>
          <p className="text-lg leading-relaxed">
            Transform your clinic's operations with our cutting-edge Clinic
            Management System. Our intuitive platform simplifies patient record
            management, appointment scheduling, inventory tracking, and more.
            Boost efficiency, enhance patient care, and streamline workflows
            effortlessly. Take your practice to new heights with our
            comprehensive solution tailored for modern healthcare needs.
          </p>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer hover:bg-gray-100">
              <FaUserPlus className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-lg font-semibold mb-4">
                Patient Registration
              </h2>
              <p className="text-gray-600 text-center">
                Seamlessly register new patients into your system, ensuring a
                smooth onboarding process.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="cursor-pointer hover:bg-gray-100 bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <FaDatabase className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-lg font-semibold mb-4">Patient Database</h2>
              <p className="text-gray-600 text-center">
                Maintain a comprehensive database of patient records for easy
                access and management.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="cursor-pointer hover:bg-gray-100 bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <FaCalendarAlt className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-lg font-semibold mb-4">Appointment System</h2>
              <p className="text-gray-600 text-center">
                Streamline appointment scheduling and management to optimize
                your clinic's workflow.
              </p>
            </div>
            {/* Feature Card 4 */}
            <div className="cursor-pointer hover:bg-gray-100 bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
              <FaBox className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-lg font-semibold mb-4">Inventory System</h2>
              <p className="text-gray-600 text-center">
                Keep track of clinic inventory effortlessly to ensure adequate
                supplies for patient care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div>
        <img src={Banner} className="object-cover h-[50vh] w-[100vw]" />
      </div>

      {/* Informational Section */}
      <section className="bg-gray-200 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">How It Works</h2>
          <p className="max-w-4xl mx-auto text-lg text-gray-800 mb-8">
            Our system is designed to streamline your clinic's operations,
            improve patient care, and boost overall efficiency. With advanced
            features and an intuitive user interface, managing your clinic has
            never been easier. Here's how it works:
          </p>
          <div className="my-12 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Trust Badge 1 */}
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              <FaUserPlus className="text-4xl text-blue-500 mb-4" />
              <p className="text-gray-800 font-semibold">User-friendly</p>
            </div>
            {/* Trust Badge 2 */}
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              <FaCheckCircle className="text-4xl text-green-500 mb-4" />
              <p className="text-gray-800 font-semibold">Reliable</p>
            </div>
            {/* Trust Badge 3 */}
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              <FaLock className="text-4xl text-purple-500 mb-4" />
              <p className="text-gray-800 font-semibold">Secure</p>
            </div>
            {/* Trust Badge 4 */}
            <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              <FaShieldAlt className="text-4xl text-yellow-500 mb-4" />
              <p className="text-gray-800 font-semibold">Protected</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col shadow-md bg-white p-6 rounded-lg text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">Registration</h3>
                <ul className="list-disc text-gray-800 pl-6">
                  <li>
                    Sign up for our Clinic Management System by providing
                    basic information about your clinic, such as name, location,
                    and contact details.
                  </li>
                  <li>
                    Gain access to our platform where you can start customizing
                    your clinic's profile and settings.
                  </li>
                </ul>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex shadow-md bg-white p-6 rounded-lg text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">Customization</h3>
                <ul className="list-disc text-gray-800 pl-6">
                  <li>
                    Customize your clinic's profile by adding specific details
                    such as specialties, operating hours, and staff information.
                  </li>
                  <li>
                    Tailor the system to match your clinic's workflow by
                    configuring appointment scheduling preferences, consultation
                    types, and billing options.
                  </li>
                </ul>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex shadow-md bg-white p-6 rounded-lg text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">Training</h3>
                <ul className="list-disc text-gray-800 pl-6">
                  <li>
                    Our dedicated team of experts will provide comprehensive
                    training sessions to ensure you and your staff are
                    proficient in using our system.
                  </li>
                  <li>
                    Training modules cover everything from basic navigation to
                    advanced features, ensuring smooth adoption and maximizing
                    efficiency.
                  </li>
                </ul>
              </div>
            </div>
            {/* Step 4 */}
            <div className="flex shadow-md bg-white p-6 rounded-lg text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">Integration</h3>
                <ul className="list-disc text-gray-800 pl-6">
                  <li>
                    Seamlessly integrate our Clinic Management System with
                    existing software solutions your clinic uses, such as
                    electronic health records (EHR) systems and accounting
                    software.
                  </li>
                  <li>
                    Our flexible integration options allow for smooth data
                    exchange between systems, minimizing duplication of efforts
                    and streamlining operations.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
