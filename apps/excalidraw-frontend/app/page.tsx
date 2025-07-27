// app/page.tsx (if using App Router)
// or pages/index.js (if using Pages Router)
'use client'; // Only needed if using App Router and planning to add interactivity

import React from "react";

export default function LandingPage() {
  return (
    <main className="bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gray-800 px-6 py-4 flex justify-between items-center z-50 shadow-lg">
        <div className="text-2xl font-bold">MyLogo</div>
        <ul className="hidden md:flex space-x-6">
          <li><a href="#" className="hover:text-indigo-400">Home</a></li>
          <li><a href="#features" className="hover:text-indigo-400">Features</a></li>
          <li><a href="#about" className="hover:text-indigo-400">About</a></li>
          <li><a href="#contact" className="hover:text-indigo-400">Contact</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center px-6 pt-28">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Product</h1>
          <p className="text-lg md:text-xl mb-6 text-gray-300">We build tools that empower your business.</p>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl shadow">Get Started</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Fast", description: "Experience lightning-fast performance." },
            { title: "Secure", description: "Top-notch security for your data." },
            { title: "Responsive", description: "Looks great on all devices." },
            { title: "Support", description: "24/7 customer support." },
          ].map((feature, index) => (
            <div key={index} className="bg-gray-700 p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <img src="https://via.placeholder.com/500x300" alt="About" className="rounded-xl shadow" />
          <div>
            <h2 className="text-3xl font-bold mb-4">About Us</h2>
            <p className="text-gray-300">
              We are a team of dedicated developers and designers who believe in creating simple, elegant, and powerful digital experiences. Our mission is to make the web better.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <input type="text" placeholder="Name" className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none" />
            <input type="email" placeholder="Email" className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none" />
            <textarea placeholder="Message" rows={5} className="w-full p-4 rounded-xl bg-gray-700 text-white focus:outline-none"></textarea>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl text-white shadow">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center border-t border-gray-700">
        <p>&copy; 2025 MyCompany. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">LinkedIn</a>
          <a href="#" className="hover:text-white">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
