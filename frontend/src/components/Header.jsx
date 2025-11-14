import { BookOpen, Settings, Star } from "lucide-react";

export default function Header({
  progress,
  stars,
  activeTab,
  setActiveTab,
  topics,
}) {
  return (
    <header className="sticky top-0 z-14 bg-gradient-to-br from-yellow-100 via-green-100 backdrop-blur-lg border-b-4 border-yellow-300 shadow-2xl">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-green-600 bg-clip-text text-transparent">
            PlayLearn
          </h1>
        </div>

        <div className="flex items-center gap-8">
          {progress > 0 && (
            <div className="hidden md:flex items-center gap-3 bg-white rounded-2xl px-4 py-2 shadow-2xl border-2 border-yellow-400">
              <div className="flex items-center gap-1">
                {[...Array(topics.length)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < stars
                        ? "fill-yellow-400 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <span className="text-sm font-bold text-green-700">
                {progress}/{topics.length} Lessons
              </span>
            </div>
          )}

          <nav className="flex flex-row rounded-2xl bg-white/90 p-1.5 border-2 border-green-400 shadow-lg">
            <button
              onClick={() => setActiveTab("learn")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${
                activeTab === "learn"
                  ? "bg-gradient-to-r from-yellow-400 to-green-500 text-white"
                  : "text-green-700 hover:bg-white/80"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Learn
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold ${
                activeTab === "admin"
                  ? "bg-gradient-to-r from-yellow-400 to-green-500 text-white"
                  : "text-green-700 hover:bg-white/80"
              }`}
            >
              <Settings className="h-4 w-4" /> Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
