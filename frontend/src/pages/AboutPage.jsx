import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar showLogin={true} showSignup={true} />
      
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center">About Resonance</h1>
          
          <div className="mb-12 bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg mb-6">
              At Resonance, we're dedicated to creating a comprehensive ecosystem for musicians and music enthusiasts. 
              Our platform brings together studio bookings, instrument shopping, artist collaboration, and community building 
              in one seamless experience.
            </p>
            <p className="text-lg">
              We believe that music has the power to transform lives, and our mission is to make musical resources 
              accessible to everyone, from beginners to professional artists.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-3">For Artists</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Showcase your releases across multiple platforms</li>
                <li>Book professional recording studios</li>
                <li>Connect with other musicians for collaboration</li>
                <li>Access quality instruments through purchase or rental</li>
                <li>Build your artist profile and grow your audience</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-3">For Music Lovers</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Discover new artists and music</li>
                <li>Purchase quality instruments and accessories</li>
                <li>Rent instruments for practice or events</li>
                <li>Book practice rooms for your musical journey</li>
                <li>Earn points and discounts through our loyalty program</li>
              </ul>
            </div>
          </div>
          
          <div className="mb-12 bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              Resonance was founded in 2023 by a group of musicians who understood the challenges of finding quality 
              studios, instruments, and collaborators. What started as a simple booking platform has evolved into 
              a comprehensive music solution.
            </p>
            <p className="text-lg">
              Today, we serve thousands of musicians across the country, providing them with the tools and resources 
              they need to create amazing music. Our community continues to grow, and we're excited about the future 
              of music creation and collaboration.
            </p>
          </div>
          
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6 text-center">Connect With Us</h2>
            <div className="text-center">
            <p className="mb-2">Email: contact@resonance.com</p>
            <p className="mb-2">Phone: +880 12345678</p>
            <p className="mb-2">Address: 123 Music Avenue, Harmony City, HC 98765</p>
            <p className="mt-4">For support inquiries, please email <span className="text-blue-400">support@resonance.com</span></p>
          </div>
            <div className="flex justify-center space-x-8">
              <a 
                href="https://instagram.com/resonance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center hover:text-pink-400 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-full flex items-center justify-center mb-2">
                  <i className="fab fa-instagram text-3xl"></i>
                </div>
                <span>Instagram</span>
              </a>
              
              <a 
                href="https://youtube.com/resonance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center hover:text-red-500 transition-colors"
              >
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-2">
                  <i className="fab fa-youtube text-3xl"></i>
                </div>
                <span>YouTube</span>
              </a>
              
              <a 
                href="https://twitter.com/resonance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center hover:text-blue-400 transition-colors"
              >
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                  <i className="fab fa-twitter text-3xl"></i>
                </div>
                <span>Twitter</span>
              </a>
            </div>
          </div>
          
          

        </div>
      </div>
      
      <footer className="bg-black bg-opacity-70 text-center p-4">
        <p>© 2025 Resonance. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default AboutPage;
