import { useState, useEffect } from "react";

export default function PlayerOverlay({ topic, onClose, onFinished }) {
  const [mode] = useState(topic?.mode ?? "video");
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const slides = topic?.narrated?.slides ?? [];

  // --- 🧠 YouTube embed helper ---
  const getYouTubeEmbedUrl = (url, autoplay = true) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=${
          autoplay ? 1 : 0
        }&mute=0&controls=1&modestbranding=1&rel=0`
      : null;
  };

  useEffect(() => {
    if (mode !== "narrated" || slides.length === 0 || !isPlaying) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => {
        const next = i + 1;
        if (next >= slides.length) {
          clearInterval(timer);
          setTimeout(() => onFinished?.(), 600);
          return i;
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [mode, slides.length, onFinished, isPlaying]);

  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {topic.title}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="aspect-video bg-gray-100 relative">
          {mode === "video" ? (
            <VideoArea
              video={topic.media?.[0]}
              isPlaying={isPlaying}
              getYouTubeEmbedUrl={getYouTubeEmbedUrl}
            />
          ) : (
            <NarratedArea slides={slides} slideIndex={slideIndex} />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => {
                setSlideIndex(0);
                setIsPlaying(true);
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
            >
              Restart
            </button>
          </div>

          {mode === "narrated" && (
            <div className="text-xs text-gray-500">
              {slideIndex + 1} / {slides.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 🎬 Handles both YouTube & uploaded video playback */
function VideoArea({ video, isPlaying, getYouTubeEmbedUrl }) {
  if (!video)
    return (
      <div className="flex items-center justify-center">No video available</div>
    );

  const youtubeEmbed =
    video.media_type === "youtube"
      ? getYouTubeEmbedUrl(video.media_url, isPlaying)
      : null;

  return youtubeEmbed ? (
    <iframe
      src={youtubeEmbed}
      className="absolute inset-0 w-full h-full"
      allow="autoplay; encrypted-media"
      allowFullScreen
      title="Video Player"
    />
  ) : (
    <video
      src={video.uploaded_file || video.media_url}
      className="absolute inset-0 w-full h-full object-cover"
      autoPlay={isPlaying}
      controls
    />
  );
}

/* 📖 Narrated mode slides */
function NarratedArea({ slides, slideIndex }) {
  const slide = slides[slideIndex];
  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-lg text-gray-800 leading-relaxed">{slide?.text}</p>
        <div className="flex justify-center gap-1 mt-4">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === slideIndex ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
