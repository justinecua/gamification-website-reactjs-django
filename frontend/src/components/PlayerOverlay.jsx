import { useState, useEffect, useRef } from "react";

export default function PlayerOverlay({ topic, onClose, onFinished }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const hasMedia = topic.media && topic.media.length > 0;
  const mediaType = hasMedia ? topic.media[0].media_type : "narrated";
  const mediaUrl =
    hasMedia && mediaType === "mp4"
      ? topic.media[0].uploaded_file
      : hasMedia
      ? topic.media[0].media_url
      : null;

  const words = topic.description?.split(" ") ?? [];

  const [selectedAnimal, setSelectedAnimal] = useState("cat");

  const animalVoices = {
    cat: "Mary",
    dog: "Mike",
    duck: "Amy",
    lion: "John",
  };

  const API_URL = import.meta.env.VITE_API_URL;

  /* ------------------------------
        FETCH TTS AUDIO
  ------------------------------ */
  async function fetchTTS(text, voice = "Mary") {
    const res = await fetch(`${API_URL}/tts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return new Audio(url);
  }

  /* ------------------------------
        GENERATE AUDIO BUT DON'T PLAY
  ------------------------------ */
  const generateAudio = async () => {
    if (!topic.description) return;

    setIsLoading(true);

    const text = topic.description;
    const voice = animalVoices[selectedAnimal];

    try {
      const newAudio = await fetchTTS(text, voice);

      newAudio.onplay = () => setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = newAudio;
    } catch (err) {
      console.error("TTS Error:", err);
    }

    setIsLoading(false);
  };

  const playDescription = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseDescription = () => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
  };

  const stopDescription = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const restartDescription = async () => {
    await generateAudio();
    playDescription();
  };

  useEffect(() => {
    if (mediaType === "narrated") {
      generateAudio();
    }
  }, [selectedAnimal, mediaType]);

  useEffect(() => {
    return () => stopDescription();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (onFinished) onFinished();
      };
    }
  }, [audioRef.current]);

  /* ------------------------------
        HELPER: convert YouTube URL to embed
  ------------------------------ */
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      {/* Floating Cloud Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn border-4 border-yellow-300 relative">
        {/* Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-full opacity-80"></div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-pink-400 rounded-full opacity-70"></div>

        {/* Header with Fun Design */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 relative">
          {/* <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-4 py-1 rounded-full border-2 border-white shadow-lg">
            <span className="text-sm font-bold text-purple-800">
              🎧 STORY TIME!
            </span>
          </div> */}
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-bold text-white text-center flex-1 truncate">
              {topic.title}
            </h2>
            <button
              onClick={() => {
                stopDescription();
                onClose();
              }}
              className="ml-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 text-white font-bold text-lg shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={`aspect-video bg-gradient-to-br from-blue-50 to-purple-50 p-8 relative border-b-4 border-yellow-200 ${
            isLoading ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-bounce mb-4">
                  <span className="text-4xl">🎵</span>
                </div>
                <p className="text-purple-600 font-bold">Getting ready...</p>
              </div>
            </div>
          )}

          {hasMedia ? (
            mediaType === "youtube" ? (
              getYouTubeEmbedUrl(mediaUrl) ? (
                <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-4 border-purple-300">
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(mediaUrl, true)}
                    title="YouTube player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">📺</span>
                  <p className="text-purple-700 font-medium">
                    Oops! Couldn't load the video
                  </p>
                </div>
              )
            ) : mediaType === "mp4" ? (
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border-4 border-blue-300">
                <video
                  className="w-full h-full"
                  src={mediaUrl}
                  controls
                  autoPlay={topic.media[0]?.autoplay ?? false}
                  onEnded={() => {
                    if (onFinished) onFinished();
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">🤔</span>
                <p className="text-purple-700 font-medium">
                  This type of media isn't supported yet!
                </p>
              </div>
            )
          ) : (
            <div className="text-center">
              {/* Story Text */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 mb-6">
                <p className="text-lg text-gray-800 leading-relaxed text-center font-medium">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {word + " "}
                    </span>
                  ))}
                </p>
              </div>

              {/* Animal Voice Selector */}
              <div className="mb-6">
                <p className="text-purple-700 font-bold mb-4 text-lg">
                  Choose your narrator! 🎤
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {Object.keys(animalVoices).map((animal) => (
                    <button
                      key={animal}
                      onClick={() => setSelectedAnimal(animal)}
                      disabled={isLoading}
                      className={`
                        px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-105
                        ${
                          selectedAnimal === animal
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg border-2 border-white"
                            : "bg-white text-gray-700 shadow-md border-2 border-transparent"
                        } 
                        ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-xl"
                        }
                      `}
                    >
                      {animal === "cat" && "🐱 Cat"}
                      {animal === "dog" && "🐶 Dog"}
                      {animal === "duck" && "🦆 Duck"}
                      {animal === "lion" && "🦁 Lion"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls for TTS only */}
        {mediaType === "narrated" && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-t-4 border-green-200">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() =>
                  isPlaying ? pauseDescription() : playDescription()
                }
                disabled={isLoading || !audioRef.current}
                className={`
                  px-6 py-3 rounded-2xl font-bold text-white text-sm shadow-lg transition-all duration-300 transform hover:scale-105
                  ${
                    isLoading || !audioRef.current
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-xl"
                  }
                `}
              >
                {isPlaying ? "⏸️ Pause" : "▶️ Play"}
              </button>

              <button
                onClick={restartDescription}
                disabled={isLoading}
                className={`
                  px-5 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-105
                  bg-gradient-to-r from-yellow-400 to-orange-400 text-white
                  ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl"
                  }
                `}
              >
                🔄 Restart
              </button>

              <button
                onClick={stopDescription}
                disabled={isLoading}
                className={`
                  px-5 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-105
                  bg-gradient-to-r from-red-400 to-pink-500 text-white
                  ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-xl"
                  }
                `}
              >
                ⏹️ Stop
              </button>
            </div>
          </div>
        )}
        {/* Finish Topic Button (always visible) */}
        <div className="px-6 py-4 border-t-4 border-green-200 flex justify-center">
          <button
            onClick={() => {
              stopDescription(); // stop audio if any
              if (onFinished) onFinished();
            }}
            className="
      px-8 py-3 bg-green-400 hover:bg-green-500 text-white font-bold rounded-2xl shadow-lg
      transition-all duration-300 transform hover:scale-105
    "
          >
            Finish Topic
          </button>
        </div>
      </div>
    </div>
  );
}
