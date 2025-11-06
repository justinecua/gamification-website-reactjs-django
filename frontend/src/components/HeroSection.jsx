import { ChevronRight, Tag } from "lucide-react";

export default function HeroSection({ animatedCharacters, heroImage }) {
  return (
    <section className="py-20 mx-auto max-w-7xl px-6 relative flex flex-col-reverse items-center gap-16 lg:flex-row lg:justify-between">
      <div className="text-center lg:text-left max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-200 to-green-200 rounded-full px-5 py-3 mb-6 border-2 border-yellow-400 shadow-lg">
          <Tag className="h-5 w-5 text-green-700" />
          <span className="text-sm font-bold text-green-800">
            Interactive Learning Made Super Fun!
          </span>
        </div>
        <h2 className="mb-6 text-5xl font-bold text-gray-900 leading-tight">
          Learn through{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            playing
          </span>{" "}
          &{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            stories that talk
          </span>{" "}
          back!
        </h2>
        <p className="mb-8 text-lg text-gray-800 font-medium">
          Turn every lesson into an adventure! Watch videos, listen to stories,
          and earn cool rewards!
        </p>

        <div className="flex justify-center lg:justify-start gap-3 mb-8">
          {animatedCharacters.map((char, i) => (
            <div
              key={i}
              className={`flex flex-col items-center bg-gradient-to-r ${char.color} rounded-2xl p-3 shadow-lg animate-bounce`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="text-2xl">{char.emoji}</div>
              <span className="text-xs font-bold text-white mt-1">
                {char.name}
              </span>
            </div>
          ))}
        </div>

        <button className="group rounded-2xl bg-gradient-to-r from-yellow-400 to-green-500 px-8 py-4 text-white font-bold animate-pulse">
          <span className="flex items-center gap-2 text-lg">
            Start Learning Now
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-300 to-green-300 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
        <img
          src={heroImage}
          alt="Kids having fun learning"
          className="relative w-full max-w-xl rounded-2xl shadow-2xl border-4 border-white"
        />
      </div>
    </section>
  );
}
