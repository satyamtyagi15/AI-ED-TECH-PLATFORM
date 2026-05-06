import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AlertBanner from "./AlertBanner";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
<div className="flex min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#03070f] to-[#0a0e1a] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float delay-2000"></div>
        {/* Stars overlay */}
        <div className="stars"></div>
        <div className="twinkling"></div>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className="px-6 pt-2 animate-fade-in-up">
          <AlertBanner />
        </div>

        <main className="flex-1 p-6 overflow-y-auto animate-fade-in-up delay-100">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
          <div className="omni-bg"></div>
<div className="omni-ring"></div>
<div className="omni-ring omni-ring-2"></div>
<div className="omni-ring omni-ring-3"></div>
        </main>

        <footer className="bg-black/40 backdrop-blur-lg border-t border-cyan-500/30 py-6 px-6 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-neon-cyan">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} EduSafe. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:shadow-neon-cyan px-2">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:shadow-neon-cyan px-2">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:shadow-neon-cyan px-2">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;