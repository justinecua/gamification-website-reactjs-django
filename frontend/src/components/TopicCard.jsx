import { useState } from "react";
import { PlayCircle, BookOpen } from "lucide-react";

export default function TopicCard({ topic, onClick }) {
  console.log(topic);
  const [isHovered, setIsHovered] = useState(false);

  const themeStyles = {
    jungle: { accent: "bg-emerald-500" },
    forest: { accent: "bg-blue-500" },
    ocean: { accent: "bg-cyan-500" },
  };
  const styles = themeStyles[topic.theme] || themeStyles.jungle;

  // ✅ Safely get first media type
  const firstMedia = topic.media?.[0] || null;
  const mediaType =
    topic.media?.length === 0 ? "narrated" : firstMedia?.media_type;

  // ✅ YouTube embed conversion
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${match[1]}`
      : null;
  };

  const youtubeEmbed =
    mediaType === "youtube" ? getYouTubeEmbedUrl(firstMedia.media_url) : null;

  // ✅ Fix thumbnail path & fallback
  const thumbnailSrc =
    topic.thumbnail?.startsWith("http") || topic.thumbnail?.startsWith("/")
      ? topic.thumbnail
      : `${import.meta.env.VITE_API_URL}${topic.thumbnail}`;

  return (
    <div
      className="relative group bg-white rounded-xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(topic)}
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
        {/* Thumbnail or Video */}
        {!isHovered ? (
          <img
            src={thumbnailSrc}
            alt={topic.title}
            onError={(e) => (e.target.src = "/placeholder.png")}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            title="Preview"
          />
        ) : firstMedia?.uploaded_file ? (
          <video
            src={firstMedia.uploaded_file}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        ) : (
          <img
            src={thumbnailSrc}
            alt={topic.title}
            className="h-full w-full object-cover"
          />
        )}

        {/* Letter Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/0 transition-all duration-500">
          <span className="text-white text-6xl font-extrabold drop-shadow-lg">
            {topic.letter || ""}
          </span>
        </div>

        {/* Play icon overlay on hover */}
        {/* {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all duration-500">
            <PlayCircle className="h-14 w-14 text-white opacity-90" />
          </div>
        )} */}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 mb-1">{topic.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {topic.description}
        </p>

        <div
          className={`inline-flex items-center gap-2 text-xs ${
            mediaType === "mp4" || mediaType === "youtube"
              ? "text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
              : "text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"
          }`}
        >
          {mediaType === "mp4" || mediaType === "youtube" ? (
            <PlayCircle className="h-3 w-3" />
          ) : (
            <BookOpen className="h-3 w-3" />
          )}
          {mediaType === "mp4" || mediaType === "youtube"
            ? "Video"
            : "Narrated"}
        </div>
      </div>
    </div>
  );
}
