// client/src/pages/HomePage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const FAQ_DATA = [
  {
    question: "How do I book a studio?",
    answer: "You can book a studio by navigating to the Studios page, selecting your preferred location, date, time, and room size, and following the booking process. You'll receive a confirmation email after booking."
  },
  {
    question: "What is the cancellation policy?",
    answer: "You can cancel bookings up to 24 hours before the scheduled time. Cancellations made less than 24 hours in advance may be subject to fees."
  },
  {
    question: "How does the points system work?",
    answer: "You earn points by booking practice/recording sessions and purchasing/renting instruments. Points categorize you into Bronze (5% discount), Silver (10% discount), Gold (15% discount), or Platinum (20% discount)."
  },
  {
    question: "How can I collaborate with other musicians?",
    answer: "Visit our Musician Collaboration Hub where you can post and comment to connect with other musicians for jam sessions."
  },
  {
    question: "Can I rent instruments?",
    answer: "Yes, we offer instrument rental options. Browse our rental catalog and select the instruments you need for your practice sessions."
  }
];

const HomePage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      <div className="flex-1 flex flex-col justify-between p-8">
        <div className="mt-16">
          <h1 className="text-5xl font-bold leading-tight">
            A <br/>ONE STOP <br/>MUSIC SOLUTION
          </h1>
          <p className="mt-4 text-xl">
            Your ultimate destination for studio bookings, instrument shopping, and musician collaboration.
          </p>
          <div className="mt-8 flex space-x-4">
            <Link to="/booking" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Book Studios
            </Link>
            <Link to="/products" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Shop Instruments
            </Link>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16 bg-black bg-opacity-70 rounded-lg p-6 w-full max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="border-b border-gray-700 pb-4">
                <button 
                  className="flex justify-between items-center w-full text-left font-semibold text-xl"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span>{expandedFaq === index ? '−' : '+'}</span>
                </button>
                {expandedFaq === index && (
                  <p className="mt-2 text-gray-300">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="self-end mr-4 mt-8">
          <Link to="/about" className="text-white no-underline hover:text-blue-300">About Us</Link>
        </div>
      </div>
      <footer className="bg-black bg-opacity-50 text-center p-4">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="https://instagram.com/resonance" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400">
            <i className="fab fa-instagram text-xl"></i> Instagram
          </a>
          <a href="https://youtube.com/resonance" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500">
            <i className="fab fa-youtube text-xl"></i> YouTube
          </a>
        </div>
        <p>© 2025 Resonance. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default HomePage;
