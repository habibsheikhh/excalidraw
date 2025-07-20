
"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { 
  Pencil, 
  Users, 
  Cloud, 
  Zap, 
  Github, 
  Play,
  Star,
  Download
} from "lucide-react";

import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-4 h-4 border-2 border-gray-600 rotate-45 animate-pulse" />
        <div className="absolute top-20 right-20 w-6 h-6 border-2 border-gray-500 rounded-full animate-bounce" />
        <div className="absolute top-40 left-1/4 w-8 h-8 border-2 border-gray-600 transform rotate-12 animate-spin-slow" />
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-gray-700 transform rotate-45 animate-pulse" />
        <div className="absolute bottom-40 left-20 w-6 h-6 border-2 border-gray-600 transform rotate-12" />
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-gray-600 rounded-full animate-bounce" />
        <div className="absolute top-60 left-1/3 w-7 h-7 border-2 border-gray-500 rounded-full" />
        <div className="absolute bottom-60 right-1/3 w-5 h-5 border-2 border-gray-600 transform -rotate-12" />
        <div className="absolute top-32 right-1/2 w-3 h-3 border border-gray-600 rotate-45" />
        <div className="absolute bottom-32 left-1/2 w-6 h-6 border-2 border-gray-500 transform rotate-45" />
        <div className="absolute top-1/3 left-10 w-4 h-4 bg-gray-700 rounded-full" />
        <div className="absolute bottom-1/3 right-20 w-5 h-5 border border-gray-600 transform -rotate-45" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Pencil className="w-5 h-5 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">ExcaliDraw</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-gray-400 hover:text-white transition-colors">Docs</a>
            
          </div>
        </nav>
      </header>

      {/* Main Content - Centered Lower */}
      <main className="relative z-10 flex items-center justify-center h-full px-6 -mt-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
              Virtual whiteboard
              <span className="block text-gray-400">
                for sketching
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Collaborative diagramming made simple. Create beautiful hand-drawn like diagrams, 
              wireframes, and sketches for your ideas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/signup"}>
              <Button size="lg" className="bg-white hover:bg-gray-100 text-black px-8 py-6 text-lg font-semibold">
                Sign Up
              </Button>
            </Link>
            <Link href={"/signin"}>
              <Button variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-gray-400" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>Real-time Collaboration</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-gray-400" />
              <span>Auto-save</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <span>Lightning Fast</span>
            </div>
          </div>

        </div>
      </main>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}