import React from "react";

export default function FeaturesSection() {
  const features = [
    {
      icon: "🎮",
      title: "Interactive Buttons",
      text: "Tap a letter or topic to start learning right away no complex menus, just instant fun!",
      color: "from-yellow-400 to-amber-500",
      bg: "bg-yellow-100",
      border: "border-4 border-yellow-300",
    },
    {
      icon: "🐰",
      title: "Video & Story Mode",
      text: "Each topic includes an educational video or narrated story with friendly voices",
      color: "from-green-400 to-emerald-500",
      bg: "bg-green-100",
      border: "border-4 border-green-300",
    },
    {
      icon: "🏆",
      title: "Gamified Learning",
      text: "Celebrate every milestone! Kids earn stars and get cheerful animations after finishing lessons",
      color: "from-blue-400 to-cyan-500",
      bg: "bg-blue-100",
      border: "border-4 border-blue-300",
    },
  ];

  return (
    <section className="py-20 mx-auto max-w-7xl px-6 relative">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          What Makes{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            PlayLearn
          </span>{" "}
          Different?
        </h3>
        <p className="text-lg text-gray-800 max-w-2xl mx-auto font-medium">
          A magical mix of play, storytelling, and discovery that keeps children
          learning with big smiles!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {features.map((feature, i) => (
          <div
            key={i}
            className={`group relative rounded-3xl ${feature.bg} p-8 shadow-2xl ${feature.border} transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105`}
          >
            <div className="absolute -top-6 left-8">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-2xl text-3xl animate-bounce`}
              >
                {feature.icon}
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-4 mt-8">
              {feature.title}
            </h4>
            <p className="text-gray-700 leading-relaxed font-medium text-lg">
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
