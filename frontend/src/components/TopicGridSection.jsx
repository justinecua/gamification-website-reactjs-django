// src/components/TopicGridSection.jsx
import React, { useEffect, useState } from "react";
import { Video, Book } from "lucide-react";
import TopicCard from "./TopicCard";
import { fetchTopics } from "../api/topics";

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
    <section className="py-20 mx-auto max-w-7xl px-6 relative">
      {/* Header */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
          Explore Learning{" "}
          <span className="bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            Adventures
          </span>
        </h2>
        <p className="mx-auto text-lg text-gray-800 max-w-3xl leading-relaxed font-medium">
          Choose videos or talking story lessons — learning has never been this
          fun!
        </p>
      </div>

      {/* Indicators */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {contentIndicators.map(({ label, bg, border }, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-2xl ${bg} ${border} px-5 py-4 transition-all hover:shadow-xl hover:scale-105`}
          >
            <span className="text-2xl">{label.split(" – ")[0]}</span>
            <span className="text-base font-bold text-gray-800">
              {label.split(" – ")[1]}
            </span>
          </div>
        ))}
      </div>

      {/* Loading state */}
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

      {/* Topics */}
      {!loading && topics.length > 0 && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={handleOpen}
              index={index}
            />
          ))}
        </div>
      )}

      {/* No Data */}
      {!loading && topics.length === 0 && (
        <p className="text-center text-gray-600 font-medium py-10">
          No lessons found
        </p>
      )}

      {/* Progress */}
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
                You've completed {progress} adventure{progress !== 1 ? "s" : ""}
                ! 🎉
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
