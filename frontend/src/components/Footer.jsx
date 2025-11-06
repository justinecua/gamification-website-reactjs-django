// src/components/Footer.jsx
import React from "react";

export default function Footer({ animatedCharacters }) {
  return (
    <footer className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-12 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-stars opacity-20"></div>
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Animated Characters */}
        <div className="flex justify-center gap-6 mb-6 text-3xl">
          {animatedCharacters.map((char, i) => (
            <div
              key={i}
              className="animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {char.emoji}
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <p className="text-sm text-white/90 mt-4 font-medium">
          © 2025 <span className="font-bold">PlayLearn</span>. Making learning
          magical for our little explorers!
        </p>
      </div>
    </footer>
  );
}
