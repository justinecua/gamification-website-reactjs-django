// src/components/TopicGridSection.jsx
import React, { useEffect, useState } from "react";
import { Video, Book } from "lucide-react";
import TopicCard from "./TopicCard";
import { fetchTopics } from "../api/topics";
import { KIDS_GAMES } from "../data/kidsGames";

export default function TopicGridSection({ progress, handleOpen }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await fetchTopics();
        setTopics(data);
      } catch (err) {
        console.error("Failed to load topics:", err);
        setTopics([]);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  const contentIndicators = [
    {
      icon: Video,
      label: "🎬 Videos – Colorful lessons with fun animations",
      bg: "bg-yellow-100",
      border: "border-4 border-yellow-400",
    },
    {
      icon: Book,
      label: "📖 Stories – Talking animals read fun stories to you!",
      bg: "bg-green-100",
      border: "border-4 border-green-400",
    },
  ];

  return (
    <section
      id="explore-topics"
      className="py-20 mx-auto max-w-7xl px-6 relative"
    >
      {/* ===== SECTION HEADER ===== */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          Explore Learning{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            Topics
          </span>
        </h2>
        <p className="mx-auto text-lg text-gray-800 max-w-3xl font-medium">
          Choose interactive videos or talking-story lessons — learning has
          never been this fun!
        </p>
      </div>

      {/* ===== INDICATORS ===== */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {contentIndicators.map(({ label, bg, border }, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-2xl ${bg} ${border} px-5 py-4 transition-all hover:shadow-xl hover:scale-105`}
          >
            <span className="text-xl font-bold">{label.split(" – ")[0]}</span>
            <span className="text-base font-bold text-gray-800">
              {label.split(" – ")[1]}
            </span>
          </div>
        ))}
      </div>

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 animate-pulse rounded-xl"
            ></div>
          ))}
        </div>
      )}

      {/* ===== MERGED TOPIC LIST (Videos + Stories) ===== */}
      {!loading && topics.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-24">
          {topics.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={index}
              onClick={handleOpen}
            />
          ))}
        </div>
      )}

      {!loading && topics.length === 0 && (
        <p className="text-center text-gray-600 font-medium py-10">
          No lessons found
        </p>
      )}

      {/* ============================
            KIDS GAMES SECTION
      ============================ */}
      <div className="mt-24 text-center">
        <h3 className="text-3xl font-bold text-gray-900 drop-shadow-sm">
          🎮 Fun Kids Online Games
        </h3>
        <p className="text-lg text-gray-700 mt-2 mb-10">
          Safe, educational games your child can play anytime!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {KIDS_GAMES.map((game) => (
          <div
            key={game.id}
            onClick={() => window.open(game.url, "_blank")}
            className="cursor-pointer bg-white rounded-3xl shadow-lg border-4 border-blue-200 overflow-hidden hover:scale-105 transition-all duration-300"
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-5">
              <h4 className="font-bold text-xl text-gray-900">{game.title}</h4>
              <p className="text-blue-700 font-medium mt-1">Tap to play 🎉</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PROGRESS ===== */}
      {progress > 0 && (
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 rounded-2xl bg-gradient-to-r from-yellow-200 to-green-200 px-8 py-5 border-4 border-yellow-400 shadow-2xl animate-pulse">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-3xl shadow-lg">
              🏆
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-amber-900">
                Amazing Progress!
              </h3>
              <p className="text-amber-800 font-medium text-lg">
                You’ve completed {progress} Topic{progress !== 1 ? "s" : ""}! 🎉
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
