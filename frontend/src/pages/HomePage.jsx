// client/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar
 from '../components/Navbar';
const HomePage = () => {
  console.log("Hello world!")

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      <div className="flex-1 flex flex-col justify-between p-8">
        <div className="mt-16">
          <h1 className="text-5xl font-bold leading-tight">
            A <br/>ONE STOP <br/>MUSIC SOLUTION
          </h1>
        </div>
        <div className="self-end mr-4">
          <Link to="/about" className="text-white no-underline">About Us</Link>
        </div>
      </div>
      <footer className="bg-black bg-opacity-50 text-center p-4">
        <p>© 2025 Resonance. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;
